"use server";

import { db } from "~/server/db";
import { eq, and } from "drizzle-orm";
import {
  verificationTokens,
  passwordResetTokens,
  twoFactorTokens,
} from "~/server/db/schema";
import { Role } from "~/server/db/schema";

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
