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
import { Memo } from "@legendapp/state/react";
import { observable } from "@legendapp/state";
import { type Organization } from "~/server/db/schema";
import { getAllUserOrganizations } from "~/server/db/calls/auth";
import { Pencil, Trash, Plus } from "lucide-react";
import { hasPermission } from "~/server/auth/permissions";
import OrganizationDialog from "~/components/organization/OrganizationDialog";
import { Button } from "~/components/ui/button";
import { deleteOrganizationAction } from "~/actions/organization";
import { useToast } from "~/hooks/use-toast";
import { type OrgRole } from "~/lib/types";
import { batch } from "@legendapp/state";
import { observer, useEffectOnce } from "@legendapp/state/react";
import { Separator } from "~/components/ui/separator";
import { Roboto } from "next/font/google";
import { cn } from "~/lib/utils";

const font = Roboto({
  subsets: ["latin"],
  weight: ["400"],
});

const ManageOrg = () => {
  const { toast } = useToast();
  const user$ = useProfile();
  const userOrganizations$ = observable<Organization[]>([]);
  const updateState = (orgRoles: OrgRole[], userOrgs: Organization[]) => {
    batch(() => {
      user$.orgRoles.set(orgRoles);
      userOrganizations$.set(userOrgs);
    });
  };

  const deleteOrg = (orgId: number | undefined) => {
    if (!orgId) return;
    deleteOrganizationAction(orgId).then((res) => {
      if (res?.success) {
        updateState(
          res.orgRoles as OrgRole[],
          res.organizations as Organization[],
        );
        toast({
          title: res.message,
          description: new Date().toISOString(),
        });
      } else {
        toast({
          title: "Something went wrong",
          description: res?.message + " " + new Date().toISOString(),
        });
      }
    });
  };

  useEffectOnce(() => {
    const fetchUserOrgs = async () => {
      const userOrgsData = await getAllUserOrganizations(user$.id.get());
      userOrganizations$.set(userOrgsData);
    };
    fetchUserOrgs();
  }, []);

  return (
    <div className="flex flex-col items-center">
      <h1 className={cn("mt-4 text-3xl", font.className)}>
        Manage Organizations
      </h1>
      <Separator className="my-4 w-11/12" />
      <div className="3xl:grid-cols-5 m-10 grid w-full gap-4 px-10 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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
                            updateState={updateState}
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
            <OrganizationDialog action="create" updateState={updateState}>
              <Card>
                <Button className="h-full w-full">
                  <Plus />
                </Button>
              </Card>
            </OrganizationDialog>
          )}
        </Memo>
      </div>
    </div>
  );
};

export default observer(ManageOrg);
