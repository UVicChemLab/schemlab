"use client";
import { useProfile } from "~/components/profile-provider";
import { CircleLoader } from "react-spinners";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { DEFAULT_LOGIN_REDIRECT } from "~/lib/routes";

const SchemlabPage = () => {
  const user$ = useProfile();
  const router = useRouter();
  useEffect(() => {
    router.push(
      `${DEFAULT_LOGIN_REDIRECT}/${user$.currentOrgRole.organizationUniqueName.get()}/home`,
    );
  }, [router]);
  if (!user$)
    return (
      <div className="flex h-screen items-center justify-center">
        <CircleLoader color="blue" />
      </div>
    );
};
export default SchemlabPage;
