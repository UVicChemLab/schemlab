import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { auth } from "~/server/auth";
import { Session } from "next-auth";
import { getUserById, getAccountByUserId } from "~/server/db/calls/auth";
import { type ExtendedUser } from "~/server/auth/config";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export const currentUser = async () => {
  const session = await auth();

  return session?.user;
};
