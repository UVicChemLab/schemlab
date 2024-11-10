"use server";

import {
  getUserByEmail,
  getVerificationTokenByToken,
  deleteVerificationToken,
  setUserEmailVerified,
} from "~/server/db/calls/auth";

export const newVerification = async (token: string) => {
  const existingToken = await getVerificationTokenByToken(token);

  if (!existingToken) {
    return { error: "Token does not exist!" };
  }

  const hasExpired = new Date(existingToken.expires) < new Date();

  if (hasExpired) {
    return { error: "Token has expired!" };
  }

  const existingUser = await getUserByEmail(existingToken.identifier);

  if (!existingUser) {
    return { error: "Email does not exist" };
  }

  await setUserEmailVerified(existingUser.id, existingToken.identifier);

  await deleteVerificationToken(existingToken.identifier, existingToken.token);

  return { success: "Email verified!" };
};
