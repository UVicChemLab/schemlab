"use server";

import { db } from "~/server/db";
import { eq, and } from "drizzle-orm";
import {
  users,
  accounts,
  verificationTokens,
  passwordResetTokens,
  twoFactorTokens,
  roles,
  organizations,
  userOrganizationRoles,
} from "~/server/db/schema";
import { Role } from "~/server/db/schema";

export const getUserByEmail = async (email: string) => {
  return await db.query.users.findFirst({
    where: (users, { eq }) => eq(users.email, email),
  });
};
export const getUserById = async (id: string) => {
  return await db.query.users.findFirst({
    where: (users, { eq }) => eq(users.id, id),
  });
};

export const createUser = async (
  name: string,
  email: string,
  password: string,
) => {
  const user = await db
    .insert(users)
    .values({ name, email, password })
    .returning();
  if (!user[0]) return;
  const role = await db.query.roles.findFirst({
    where: (roles, { eq }) => eq(roles.name, Role.STUDENT),
  });
  const organization = await db.query.organizations.findFirst({
    where: (organizations, { eq }) => eq(organizations.name, "schemlab"),
  });
  if (!role || !organization) return;
  await db.insert(userOrganizationRoles).values({
    userId: user[0]?.id,
    organizationId: organization?.id,
    roleId: role?.id,
  });
};

export const updateUser = async (
  id: string,
  name?: string,
  email?: string,
  password?: string,
  isTwoFactorEnabled?: boolean,
) => {
  return await db
    .update(users)
    .set({
      name,
      email,
      password,
      isTwoFactorEnabled,
    })
    .where(eq(users.id, id));
};

export const setUserEmailVerified = async (id: string, email: string) => {
  return await db
    .update(users)
    .set({ emailVerified: new Date(), email })
    .where(eq(users.id, id));
};

export const changePassword = async (id: string, password: string) => {
  return await db.update(users).set({ password }).where(eq(users.id, id));
};

export const getAccountByUserId = async (userId: string) => {
  return await db.query.accounts.findFirst({
    where: (accounts, { eq }) => eq(accounts.userId, userId),
  });
};

export const setOAuthEmailVerified = async (userId: string) => {
  return await db
    .update(users)
    .set({ emailVerified: new Date() })
    .where(eq(users.id, userId));
};

export const addTwoFactorTokenReference = async (
  userid: string,
  twoFactorTokenId: string,
) => {
  return await db
    .update(users)
    .set({ twoFactorTokenId })
    .where(eq(users.id, userid));
};

export const getVerificationTokenByEmail = async (email: string) => {
  return await db.query.verificationTokens.findFirst({
    where: (verificationTokens, { eq }) =>
      eq(verificationTokens.identifier, email),
  });
};

export const getVerificationTokenByToken = async (token: string) => {
  return await db.query.verificationTokens.findFirst({
    where: (verificationTokens, { eq }) => eq(verificationTokens.token, token),
  });
};

export const deleteVerificationToken = async (email: string, token: string) => {
  return await db
    .delete(verificationTokens)
    .where(
      and(
        eq(verificationTokens.identifier, email),
        eq(verificationTokens.token, token),
      ),
    );
};

export const createVerificationToken = async (
  identifier: string,
  token: string,
  expires: Date,
) => {
  return await db
    .insert(verificationTokens)
    .values({ identifier, token, expires })
    .returning();
};

export const getPasswordResetTokenByToken = async (token: string) => {
  return await db.query.passwordResetTokens.findFirst({
    where: (passwordResetTokens, { eq }) =>
      eq(passwordResetTokens.token, token),
  });
};

export const getPasswordResetTokenByEmail = async (email: string) => {
  return await db.query.passwordResetTokens.findFirst({
    where: (passwordResetTokens, { eq }) =>
      eq(passwordResetTokens.identifier, email),
  });
};

export const deletePasswordResetToken = async (
  email: string,
  token: string,
) => {
  return await db
    .delete(passwordResetTokens)
    .where(
      and(
        eq(passwordResetTokens.identifier, email),
        eq(passwordResetTokens.token, token),
      ),
    );
};

export const createPasswordResetToken = async (
  identifier: string,
  token: string,
  expires: Date,
) => {
  return await db
    .insert(passwordResetTokens)
    .values({ identifier, token, expires })
    .returning();
};

export const getTwoFactorTokenByToken = async (token: string) => {
  return await db.query.twoFactorTokens.findFirst({
    where: (twoFactorTokens, { eq }) => eq(twoFactorTokens.token, token),
  });
};

export const getTwoFactorTokenByEmail = async (email: string) => {
  return await db.query.twoFactorTokens.findFirst({
    where: (twoFactorTokens, { eq }) => eq(twoFactorTokens.identifier, email),
  });
};

export const getTwoFactorTokenById = async (id: string) => {
  return await db.query.twoFactorTokens.findFirst({
    where: (twoFactorTokens, { eq }) => eq(twoFactorTokens.id, id),
  });
};

export const deleteTwoFactorToken = async (id: string) => {
  return await db.delete(twoFactorTokens).where(eq(twoFactorTokens.id, id));
};

export const createTwoFactorToken = async (
  identifier: string,
  token: string,
  expires: Date,
) => {
  return await db
    .insert(twoFactorTokens)
    .values({ identifier, token, expires })
    .returning();
};

export const getRoles = async () => {
  return await db.query.roles.findMany();
};

export const getUserOrganizationRoles = async (userId: string) => {
  return await db
    .select({
      organizationName: organizations.name,
      roleName: roles.name,
    })
    .from(userOrganizationRoles)
    .leftJoin(
      organizations,
      eq(organizations.id, userOrganizationRoles.organizationId),
    )
    .leftJoin(roles, eq(roles.id, userOrganizationRoles.roleId))
    .where(eq(userOrganizationRoles.userId, userId));
};
