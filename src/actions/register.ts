"use server";

import * as z from "zod";
import bcrypt from "bcryptjs";
import { RegisterSchema } from "~/lib/formSchemas";
import { getUserByEmail } from "~/server/db/calls/auth";
import { createUser } from "~/server/db/calls/auth";
import { generateVerificationToken } from "~/lib/tokens";
import { sendVerificationEmail } from "~/lib/mail";

export const register = async (values: z.infer<typeof RegisterSchema>) => {
  const validatedFields = RegisterSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: "Invalid fields!" };
  }

  const { email, name, password, role, organization } = validatedFields.data;
  const hashedPassword = await bcrypt.hash(password, 10);

  const existingUser = await getUserByEmail(email);

  if (existingUser) {
    return { error: "Email already in use!" };
  }

  await createUser(name, email, hashedPassword, organization, role);
  const verificationToken = await generateVerificationToken(email);
  if (!verificationToken) {
    return { error: "Error creating verification token!" };
  }

  await sendVerificationEmail(
    verificationToken.identifier,
    verificationToken.token,
  );

  return { sucess: "Confirmation email sent!" };
};
