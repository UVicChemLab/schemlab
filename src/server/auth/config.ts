import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { type DefaultSession, type NextAuthConfig } from "next-auth";
import Resend from "next-auth/providers/resend";
import { db } from "~/server/db";
import { accounts, users, verificationTokens } from "~/server/db/schema";
import type { Provider } from "next-auth/providers";
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
import { JWT } from "next-auth/jwt";
import Github from "next-auth/providers/github";
import Google from "next-auth/providers/google";

/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */
export type ExtendedUser = {
  id: string;
  isOAuth: boolean;
  isTwoFactorEnabled: boolean;
  orgRoles?: { organizationName: string | null; roleName: string | null }[];
} & DefaultSession["user"];

declare module "next-auth" {
  interface Session extends DefaultSession {
    user: ExtendedUser;
  }
}

declare module "next-auth/jwt" {
  /** Returned by the `jwt` callback and `auth`, when using JWT sessions */
  interface JWT {
    id: string;
    isOAuth: boolean;
    isTwoFactorEnabled: boolean;
    orgRoles?: { organizationName: string | null; roleName: string | null }[];
  }
}

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

export const providerMap = providers
  .map((provider) => {
    if (typeof provider === "function") {
      const providerData = provider();
      return { id: providerData.id, name: providerData.name };
    } else {
      return { id: provider.id, name: provider.name };
    }
  })
  .filter((provider) => provider.id !== "credentials");

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
    async jwt({ token, user }) {
      if (user.id) {
        token.id = user.id;
        const existingUser = await getUserById(user.id);
        if (!existingUser) return token;
        const existingAccount = await getAccountByUserId(existingUser.id);
        token.isOAuth = !!existingAccount;
        token.name = existingUser.name;
        token.email = existingUser.email;
        token.isTwoFactorEnabled = existingUser.isTwoFactorEnabled;
        const orgRoles = await getUserOrganizationRoles(existingUser.id);
        if (!orgRoles || orgRoles.length === 0) return token;
        token.orgRoles = orgRoles;
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.isTwoFactorEnabled = token.isTwoFactorEnabled;
        session.user.name = token.name;
        session.user.isOAuth = token.isOAuth;

        if (token.id) {
          session.user.id = token.id;
        }

        if (token.orgRoles && token.orgRoles.length > 0) {
          session.user.orgRoles = token.orgRoles;
        }

        if (token.email) {
          session.user.email = token.email;
        }
      }

      return session;
    },
  },
  pages: {
    signIn: "/auth/login",
    error: "/auth/error",
  },
  session: { strategy: "jwt" },
} satisfies NextAuthConfig;
