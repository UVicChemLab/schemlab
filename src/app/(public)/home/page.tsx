import { redirect } from "next/navigation";
import { auth } from "~/server/auth";
export default async function HomePage() {
  const session = await auth();
  if (session && session.user) redirect("/schemlab");
  return <main className="p-[2rem]">Public Home</main>;
}
