"use server";

import { signOut } from "~/server/auth";
import { redirect } from "next/navigation";

export const logout = async () => {
  // some server stuff
  await signOut();
  redirect("/home");
};
