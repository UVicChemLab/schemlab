"use client";
import { useProfile } from "~/components/profile-provider";
import { CircleLoader } from "react-spinners";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUser } from "~/actions/profile";

const SchemlabPage = () => {
  const { organization } = useProfile();
  const router = useRouter();

  useEffect(() => {
    router.push(`/schemlab/${organization.uniqueName.get()}/home`);
  }, [organization, router]);

  if (!organization)
    return (
      <div className="flex h-screen items-center justify-center">
        <CircleLoader color="blue" />
      </div>
    );
};

export default SchemlabPage;
