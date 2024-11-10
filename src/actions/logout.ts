"use server";

import { signOut } from "~/server/auth";

export const logout = async () => {
  // some server stuff
  await signOut();
};
