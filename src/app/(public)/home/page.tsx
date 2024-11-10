import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "~/components/ui/button";
import { auth } from "~/server/auth";
export default async function HomePage() {
  const session = await auth();
  if (session?.user) redirect("/schemlab");
  return <main className="p-[2rem]">Public Home</main>;
}
