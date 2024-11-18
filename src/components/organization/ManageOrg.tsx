"use client";

import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { useProfile } from "~/components/profile-provider";
import { type Organization } from "~/server/db/schema";
import { Pencil, Trash, Plus } from "lucide-react";
import { hasPermission } from "~/server/auth/permissions";
import OrganizationDialog from "~/components/organization/OrganizationDialog";
import { Button } from "~/components/ui/button";
import { deleteOrganizationAction } from "~/actions/organization";
import { useToast } from "~/hooks/use-toast";
import { observer, Memo, useObservable } from "@legendapp/state/react";
import ManageContainer from "../ui/manage-container";

const ManageOrg = ({
  id,
  userOrgs,
}: {
  id?: string;
  userOrgs: Organization[];
}) => {
  const { toast } = useToast();
  const user$ = useProfile();
  const userOrganizations$ = useObservable<Organization[]>(userOrgs);

  const deleteOrg = (orgId: number | undefined) => {
    if (!orgId) return;
    deleteOrganizationAction(orgId).then((res) => {
      if (res?.success) {
        const userOrgs = userOrganizations$.get();
        const orgIdx = userOrgs.findIndex(
          (org) => org.id === res.organization?.id,
        );
        userOrganizations$[orgIdx]?.delete();
        const orgRoles = user$.orgRoles.get();
        const orgRoleIdx = orgRoles.findIndex(
          (orgRole) =>
            orgRole.organizationUniqueName === res.organization?.uniqueName,
        );
        user$.orgRoles[orgRoleIdx]?.delete();
        toast({
          title: res.message,
          description: new Date().toISOString(),
        });
      } else {
        toast({
          title: res?.message || "Something went wrong",
          description: new Date().toISOString(),
        });
      }
    });
  };

  return (
    <ManageContainer heading="Manage Organizations" id={id}>
      <Memo>
        {() =>
          userOrganizations$.get().map(
            (org) =>
              hasPermission(user$.peek(), "organizations", "view", org) && (
                <Card key={org.id}>
                  <CardHeader>
                    <CardTitle>{org.uniqueName}</CardTitle>
                    <CardDescription>{org.name}</CardDescription>
                  </CardHeader>
                  <CardContent>{org.desc}</CardContent>
                  <CardFooter>
                    {org.updatedAt?.getDate()}
                    <div className="flex gap-2">
                      {hasPermission(
                        user$.get(),
                        "organizations",
                        "update",
                        org,
                      ) && (
                        <OrganizationDialog
                          action="update"
                          org={org}
                          user$={user$}
                          userOrganizations$={userOrganizations$}
                        >
                          <Button variant={"ghost"}>
                            <Pencil width={20} />
                          </Button>
                        </OrganizationDialog>
                      )}
                      {hasPermission(
                        user$.get(),
                        "organizations",
                        "delete",
                        org,
                      ) && (
                        <Button
                          variant={"ghost"}
                          onClick={() => deleteOrg(org.id)}
                        >
                          <Trash width={20} />
                        </Button>
                      )}
                    </div>
                  </CardFooter>
                </Card>
              ),
          )
        }
      </Memo>
      <Memo>
        {() => (
          <OrganizationDialog
            action="create"
            user$={user$}
            userOrganizations$={userOrganizations$}
          >
            <Card>
              <Button className="h-full w-full">
                <Plus />
              </Button>
            </Card>
          </OrganizationDialog>
        )}
      </Memo>
    </ManageContainer>
  );
};

export default observer(ManageOrg);
