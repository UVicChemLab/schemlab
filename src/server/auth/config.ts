import "next-auth";
import "next-auth/jwt";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import type { DefaultSession, NextAuthConfig } from "next-auth";
import Resend from "next-auth/providers/resend";
import { db } from "~/server/db";
import { accounts, users, verificationTokens } from "~/server/db/schema";
import { type Provider } from "next-auth/providers";
import Credentials from "next-auth/providers/credentials";
import { LoginSchema } from "~/lib/formSchemas";
import {
  getUserByEmail,
  getUserById,
  setOAuthEmailVerified,
  getUserOrganizationRoles,
  createUserOrganizationRole,
} from "../db/calls/auth";
import {
  getTwoFactorTokenById,
  deleteTwoFactorToken,
} from "../db/calls/tokens";
import bcrypt from "bcryptjs";
import type { DefaultJWT } from "next-auth/jwt";
import Github from "next-auth/providers/github";
import Google from "next-auth/providers/google";
import { type ExtendedUser, type OrgRole, defaultOrgRole } from "~/lib/types";

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

        if (!user?.password) return null;

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
      // Allow OAuth without custom email verification
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
      session.user.id = token.id;
      session.user.isTwoFactorEnabled = token.isTwoFactorEnabled;
      session.user.isOAuth = token.isOAuth;
      session.user.orgRoles = token.orgRoles;
      session.user.currentOrgRole = token.currentOrgRole;
      return session;
    },
    async jwt({ token, trigger, session, account, user }) {
      if (trigger === "update") {
        // eslint-disable-next-line
        token.name = session.user.name; // eslint-disable-next-line
        token.email = session.user.email; // eslint-disable-next-line
        token.isTwoFactorEnabled = session.user.isTwoFactorEnabled; // eslint-disable-next-line
        token.isOAuth = session.user.isOAuth; // eslint-disable-next-line
        token.orgRoles = session.user.orgRoles; // eslint-disable-next-line
        token.currentOrgRole = session.user.currentOrgRole;
      } else if (user?.id) {
        token.id = user.id;
        if (account?.provider === "credentials") {
          token.isOAuth = false;
        } else {
          token.isOAuth = !!account;
        }
        if (trigger === "signUp") {
          token.isTwoFactorEnabled = false;
          await createUserOrganizationRole(user.id);
          token.orgRoles = [defaultOrgRole];
        } else if (trigger === "signIn") {
          const existingUser = await getUserById(user.id);
          if (existingUser)
            token.isTwoFactorEnabled = existingUser.isTwoFactorEnabled;
          else token.isTwoFactorEnabled = false;
          const orgRoles: OrgRole[] = await getUserOrganizationRoles(user.id);
          if (orgRoles) {
            token.orgRoles = orgRoles;
            token.currentOrgRole = orgRoles[0] ?? defaultOrgRole;
          }
        }
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
    id: string;
    isTwoFactorEnabled: boolean;
    isOAuth: boolean;
    orgRoles: OrgRole[];
    currentRole: string;
    currentOrgRole: OrgRole;
  }
}
