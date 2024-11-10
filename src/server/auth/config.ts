import "next-auth";
import "next-auth/jwt";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { DefaultSession, type NextAuthConfig } from "next-auth";
import Resend from "next-auth/providers/resend";
import { db } from "~/server/db";
import { accounts, users, verificationTokens } from "~/server/db/schema";
import { type Provider } from "next-auth/providers";
import Credentials from "next-auth/providers/credentials";
import { LoginSchema } from "~/lib/formSchemas";
import {
  getUserByEmail,
  getUserById,
  getAccountByUserId,
  setOAuthEmailVerified,
  getTwoFactorTokenById,
  deleteTwoFactorToken,
  getUserOrganizationRoles,
} from "../db/calls/auth";
import bcrypt from "bcryptjs";
import { DefaultJWT, JWT } from "next-auth/jwt";
//import { JWT } from "@auth/core/jwt";
import Github from "next-auth/providers/github";
import Google from "next-auth/providers/google";

const providers: Provider[] = [
  Resend,
  Github,
  Google,
  Credentials({
    async authorize(credentials) {
      const validatedFields = LoginSchema.safeParse(credentials);

      if (validatedFields.success) {
        const { email, password } = validatedFields.data;
        const user = await getUserByEmail(email);

        if (!user || !user.password) return null;

        const passwordsMatch = await bcrypt.compare(password, user.password);

        if (passwordsMatch) return user;
      }

      return null;
    },
  }),
];

/**
 * Options for NextAuth.js used to configure adapters, providers, callbacks, etc.
 *
 * @see https://next-auth.js.org/configuration/options
 */
export const authConfig = {
  providers: providers,
  adapter: DrizzleAdapter(db, {
    usersTable: users,
    accountsTable: accounts,
    verificationTokensTable: verificationTokens,
  }),
  events: {
    async linkAccount({ user }) {
      if (user.id) {
        await setOAuthEmailVerified(user.id);
      }
    },
  },
  callbacks: {
    async signIn({ user, account }) {
      // Allow OAuth without email verification
      if (account?.provider !== "credentials") return true;

      if (!user.id) return false;
      const existingUser = await getUserById(user.id);

      // Prevent sign in without email verification
      if (!existingUser?.emailVerified) return false;

      if (existingUser.isTwoFactorEnabled) {
        const twoFactorToken = await getTwoFactorTokenById(existingUser.id);

        if (!twoFactorToken) return false;

        // Delete two factor confirmation for next sign in
        await deleteTwoFactorToken(twoFactorToken.id);
      }

      return true;
    },
    async session({ session, token }) {
      if (token?.accessToken) session.accessToken = token.accessToken;
      if (token?.id) session.user.id = token.id;
      if (token?.isTwoFactorEnabled)
        session.user.isTwoFactorEnabled = token.isTwoFactorEnabled;
      if (token?.isOAuth) session.user.isOAuth = token.isOAuth;
      if (token?.orgRoles) session.user.orgRoles = token.orgRoles;
      return session;
    },
    async jwt({ token, trigger, session, account, user }) {
      if (trigger === "update") token.name = session.user.name;
      if (account?.provider === "keycloak") {
        return { ...token, accessToken: account.access_token };
      }
      if (user?.id) {
        token.id = user.id;
        const existingUser = await getUserById(user.id);
        const existingAccount = await getAccountByUserId(user.id);
        if (existingUser?.isTwoFactorEnabled)
          token.isTwoFactorEnabled = existingUser.isTwoFactorEnabled;
        token.isOAuth = !!existingAccount;
        const orgRoles = await getUserOrganizationRoles(user.id);
        if (orgRoles) token.orgRoles = orgRoles;
      }
      return token;
    },
  },
  pages: {
    signIn: "/auth/login",
    error: "/auth/error",
  },
  session: { strategy: "jwt" },
} satisfies NextAuthConfig;

declare module "next-auth" {
  interface Session extends DefaultSession {
    accessToken?: string;
    user: ExtendedUser;
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    accessToken?: string;
    id?: string;
    isTwoFactorEnabled?: boolean;
    isOAuth?: boolean;
    orgRoles?: { organizationName: string | null; roleName: string | null }[];
  }
}

export type ExtendedUser = {
  id?: string;
  isOAuth?: boolean;
  isTwoFactorEnabled?: boolean;
  orgRoles?: { organizationName: string | null; roleName: string | null }[];
} & DefaultSession["user"];
