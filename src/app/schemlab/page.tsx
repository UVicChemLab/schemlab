"use client";
import { useCurrentUser } from "~/hooks/use-current-user";
import { useRole } from "~/components/role-provider";
import { redirect } from "next/navigation";
export default function SchemlabPage() {
  const user = useCurrentUser();
  console.log("inside schemlab", user);
  const { organization } = useRole();
  redirect(`/schemlab/${organization.get()}/home`);
}
