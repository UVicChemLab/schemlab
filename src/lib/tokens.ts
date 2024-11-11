import crypto from "crypto";
import { v4 as uuidv4 } from "uuid";
import {
  getVerificationTokenByEmail,
  deleteVerificationToken,
  createVerificationToken,
  getPasswordResetTokenByEmail,
  deletePasswordResetToken,
  createPasswordResetToken,
  getTwoFactorTokenByEmail,
  deleteTwoFactorToken,
  createTwoFactorToken,
} from "~/server/db/calls/tokens";

export const generateVerificationToken = async (email: string) => {
  const token = uuidv4();
  const expires = new Date(new Date().getTime() + 3600 * 1000);

  const existingToken = await getVerificationTokenByEmail(email);

  if (existingToken) {
    await deleteVerificationToken(
      existingToken.identifier,
      existingToken.token,
    );
  }

  const verificationToken = await createVerificationToken(
    email,
    token,
    expires,
  );

  return verificationToken[0];
};

export const generatePasswordResetToken = async (email: string) => {
  const token = uuidv4();
  const expires = new Date(new Date().getTime() + 3600 * 1000);

  const existingToken = await getPasswordResetTokenByEmail(email);

  if (existingToken) {
    await deletePasswordResetToken(
      existingToken.identifier,
      existingToken.token,
    );
  }

  const passwordResetToken = await createPasswordResetToken(
    email,
    token,
    expires,
  );

  return passwordResetToken[0];
};

export const generateTwoFactorToken = async (email: string) => {
  const token = crypto.randomInt(100_000, 1_000_000).toString();
  const expires = new Date(new Date().getTime() + 5 * 60 * 1000);
  const existingToken = await getTwoFactorTokenByEmail(email);

  if (existingToken) {
    await deleteTwoFactorToken(existingToken.id);
  }

  const twoFactorToken = await createTwoFactorToken(email, token, expires);

  return twoFactorToken[0];
};
