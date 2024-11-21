"use server";

import type * as z from "zod";
import { ResetSchema } from "~/lib/formSchemas";
import { getUserByEmail } from "~/server/db/calls/auth";
import { sendPasswordResetEmail } from "~/lib/mail";
import { generatePasswordResetToken } from "~/lib/tokens";

export const reset = async (values: z.infer<typeof ResetSchema>) => {
  const validatedFields = ResetSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: "Invalid email!" };
  }

  const { email } = validatedFields.data;

  const existingUser = await getUserByEmail(email);

  if (!existingUser) {
    return { error: "Email not found!" };
  }

  const passwordResetToken = await generatePasswordResetToken(email);

  if (!passwordResetToken) {
    return { error: "Error creating password reset token!" };
  }

  await sendPasswordResetEmail(
    passwordResetToken.identifier,
    passwordResetToken.token,
  );

  return { success: "Reset email sent!" };
};
