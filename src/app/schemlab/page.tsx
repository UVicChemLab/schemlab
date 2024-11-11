"use client";
import { useRole } from "~/components/role-provider";
import { CircleLoader } from "react-spinners";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUser } from "~/actions/profile";

const SchemlabPage = () => {
  const { organization } = useRole();
  const router = useRouter();
  router.push(`/schemlab/${organization.uniqueName.get()}/home`);

  if (!organization)
    return (
      <div className="flex h-screen items-center justify-center">
        <CircleLoader color="blue" />
      </div>
    );
};

export default SchemlabPage;
