"use client";
import { useProfile } from "~/components/profile-provider";
import { BarLoader } from "react-spinners";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { DEFAULT_LOGIN_REDIRECT } from "~/lib/routes";

const SchemlabPage = () => {
  const user$ = useProfile();
  const router = useRouter();
  useEffect(() => {
    router.push(`${DEFAULT_LOGIN_REDIRECT}/home`);
  }, [router]);
  if (!user$)
    return (
      <div className="flex h-screen items-center justify-center">
        <BarLoader color="blue" />
      </div>
    );
};
export default SchemlabPage;
