"use server";

import * as z from "zod";
import bcrypt from "bcryptjs";

import { ProfileSchema } from "~/lib/formSchemas";
import {
  getUserByEmail,
  getUserById,
  updateUser,
} from "~/server/db/calls/auth";
import { currentUser } from "~/lib/utils";
import { generateVerificationToken } from "~/lib/tokens";
import { sendVerificationEmail } from "~/lib/mail";

export const profile = async (values: z.infer<typeof ProfileSchema>) => {
  const user = await currentUser();

  if (!user) {
    return { error: "Unauthorized!" };
  }

  const dbUser = await getUserById(user.id);

  if (!dbUser) {
    return { error: "Unauthorized!" };
  }

  if (user.isOAuth) {
    values.email = undefined;
    values.password = undefined;
    values.newPassword = undefined;
    values.isTwoFactorEnabled = undefined;
  }

  if (values.email && values.email !== user.email) {
    const existingUser = await getUserByEmail(values.email);

    if (existingUser && existingUser.id !== user.id) {
      return { error: "Email already in use!" };
    }

    const verificationToken = await generateVerificationToken(values.email);

    if (!verificationToken) {
      return { error: "Failed to generate verification token!" };
    }

    await sendVerificationEmail(
      verificationToken.identifier,
      verificationToken.token,
    );

    return { success: "Verification email sent!" };
  }

  if (values.password && values.newPassword && dbUser.password) {
    const passwordsMatch = await bcrypt.compare(
      values.password,
      dbUser.password,
    );

    if (!passwordsMatch) {
      return { error: "Incorrect password!" };
    }

    const hashedPassword = await bcrypt.hash(values.newPassword, 10);

    values.password = hashedPassword;
    values.newPassword = undefined;
  }

  await updateUser(
    user.id,
    values.name,
    values.email,
    values.password,
    values.isTwoFactorEnabled,
  );

  return { success: "Profile Updated!" };
};
