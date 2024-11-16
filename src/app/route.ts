import { redirect } from "next/navigation";
import { auth } from "~/server/auth";
import { DEFAULT_LOGIN_REDIRECT } from "~/lib/routes";

export async function GET() {
  const session = await auth();
  if (session?.user) {
    redirect(DEFAULT_LOGIN_REDIRECT);
  }
  redirect("/home");
}
