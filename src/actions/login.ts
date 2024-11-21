"use server";

import type * as z from "zod";
import bcrypt from "bcryptjs";
import { AuthError } from "next-auth";
import { signIn } from "~/server/auth";
import { LoginSchema } from "~/lib/formSchemas";
import { getUserByEmail } from "~/server/db/calls/auth";
import {
  getTwoFactorTokenByEmail,
  deleteTwoFactorToken,
  createTwoFactorToken,
} from "~/server/db/calls/tokens";
import { DEFAULT_LOGIN_REDIRECT } from "~/lib/routes";
import {
  generateVerificationToken,
  generateTwoFactorToken,
} from "~/lib/tokens";
import { sendVerificationEmail, sendTwoFactorTokenEmail } from "~/lib/mail";
import { redirect } from "next/navigation";
import { isRedirectError } from "next/dist/client/components/redirect";

export const login = async (
  values: z.infer<typeof LoginSchema>,
  callbackUrl?: string | null,
) => {
  const validatedFields = LoginSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: "Invalid fields!" };
  }

  const { email, password, code } = validatedFields.data;

  const existingUser = await getUserByEmail(email);

  if (!existingUser?.email || !existingUser?.password) {
    return { error: "No Account on this email!" };
  }

  if (!existingUser.emailVerified) {
    const verificationToken = await generateVerificationToken(
      existingUser.email,
    );

    if (!verificationToken) {
      return { error: "Error creating verification token!" };
    }

    await sendVerificationEmail(
      verificationToken.identifier,
      verificationToken.token,
    );

    return { success: "Confirmation email Sent!" };
  }

  const passwordMatch = await bcrypt.compare(password, existingUser.password);

  if (!passwordMatch) {
    return { error: "Invalid Credentials!" };
  }

  if (existingUser.isTwoFactorEnabled && existingUser.email) {
    if (code) {
      const twoFactorToken = await getTwoFactorTokenByEmail(existingUser.email);

      if (!twoFactorToken) {
        return { error: "Invalid code!" };
      }

      if (twoFactorToken.token !== code) {
        return { error: "Invalid code!" };
      }

      const hasExpired = new Date(twoFactorToken.expires) < new Date();

      if (hasExpired) {
        return { error: "Code expired!" };
      }

      if (existingUser.twoFactorTokenId) {
        await deleteTwoFactorToken(twoFactorToken.id);
      }

      await createTwoFactorToken(
        existingUser.email,
        twoFactorToken.token,
        twoFactorToken.expires,
      );
    } else {
      const twoFactorToken = await generateTwoFactorToken(existingUser.email);
      if (!twoFactorToken) {
        return { error: "Error creating two factor token!" };
      }

      await sendTwoFactorTokenEmail(
        twoFactorToken.identifier,
        twoFactorToken.token,
      );

      return { twoFactor: true };
    }
  }

  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: callbackUrl ?? DEFAULT_LOGIN_REDIRECT,
    });

    return { success: "Login Sucess!" };
  } catch (e) {
    if (e instanceof AuthError) {
      if (isRedirectError(e)) {
        throw e;
      }
      const { type, cause } = e;
      switch (type) {
        case "CredentialsSignin":
          return { error: "Invalid credentials!" };
        case "CallbackRouteError":
          return { error: cause?.err?.message };
        default:
          return { error: e.message };
      }
    }
    throw e;
  } finally {
    redirect(callbackUrl ?? DEFAULT_LOGIN_REDIRECT);
  }
};
