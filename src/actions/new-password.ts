"use server";

import * as z from "zod";
import bcrypt from "bcryptjs";

import { getUserByEmail, changePassword } from "~/server/db/calls/auth";
import {
  getPasswordResetTokenByToken,
  deletePasswordResetToken,
} from "~/server/db/calls/tokens";
import { NewPasswordSchema } from "~/lib/formSchemas";

export const newPassword = async (
  values: z.infer<typeof NewPasswordSchema>,
  token?: string | null,
) => {
  if (!token) {
    return { error: "Missing token!" };
  }

  const validatedFields = NewPasswordSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: "Invalid fields!" };
  }

  const { password } = validatedFields.data;

  const existingToken = await getPasswordResetTokenByToken(token);

  if (!existingToken) {
    return { error: "Invalid token!" };
  }

  const hasExpired = new Date(existingToken.expires) < new Date();

  if (hasExpired) {
    return { error: "Token has expired!" };
  }

  const existingUser = await getUserByEmail(existingToken.identifier);

  if (!existingUser) {
    return { error: "Email does not exist!" };
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  if (!hashedPassword) {
    return { error: "Error hashing password!" };
  }

  await changePassword(existingUser.id, hashedPassword);

  deletePasswordResetToken(existingToken.identifier, existingToken.token);

  return { success: "Password updated!" };
};
