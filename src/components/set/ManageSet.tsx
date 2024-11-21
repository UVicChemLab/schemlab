"use client";

import React from "react";
import ManageContainer from "../ui/manage-container";
import { useToast } from "~/hooks/use-toast";
import { useProfile } from "~/components/profile-provider";
import { observer, Memo, useObservable } from "@legendapp/state/react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import type { Set, Organization } from "~/server/db/schema";
import { Button } from "~/components/ui/button";
import { hasPermission } from "~/server/auth/permissions";
import { deleteSetAction } from "~/actions/set";
import SetDialog from "./SetDialog";
import { Pencil, Trash, Plus } from "lucide-react";

const ManageSet = ({
  id,
  userSets,
  userOrgs,
}: {
  id?: string;
  userSets: Set[];
  userOrgs: Organization[];
}) => {
  const { toast } = useToast();
  const user$ = useProfile();
  const userSets$ = useObservable<Set[]>(userSets);
  const userOrgs$ = useObservable<Organization[]>(userOrgs);

  const deleteSet = (setId: number | undefined) => {
    if (!setId) return;
    deleteSetAction(setId)
      .then((res) => {
        if (res?.success) {
          const userSets = userSets$.get();
          const setIdx = userSets.findIndex((set) => set.id === res.set?.id);
          userSets$[setIdx]?.delete();
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
      })
      .catch(() => {
        toast({
          title: "Something went wrong",
          description: new Date().toISOString(),
        });
      });
  };

  return (
    <ManageContainer heading="Manage Question Sets" id={id}>
      <Memo>
        {() =>
          userSets$.get().map(
            (set) =>
              hasPermission(user$.get(), "sets", "view", set) && (
                <Card key={set.id}>
                  <CardHeader>
                    <CardTitle>{set.name}</CardTitle>
                    <CardDescription>{set.desc}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p>{set.time?.minutes ?? "0"}</p>
                    <p>
                      {
                        userOrgs$
                          .get()
                          .find((org) => org.id === set.organizationId)
                          ?.uniqueName
                      }
                    </p>
                  </CardContent>
                  <CardFooter>
                    <p>{set.visibility}</p>
                    <div className="flex gap-2">
                      {hasPermission(user$.get(), "sets", "update", set) && (
                        <SetDialog
                          action="update"
                          set={set}
                          userSets$={userSets$}
                          userOrgs$={userOrgs$}
                        >
                          <Button variant={"ghost"}>
                            <Pencil width={20} />
                          </Button>
                        </SetDialog>
                      )}
                      {hasPermission(user$.get(), "sets", "delete", set) && (
                        <Button
                          variant={"ghost"}
                          onClick={() => deleteSet(set.id)}
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
          <SetDialog
            action="create"
            userSets$={userSets$}
            userOrgs$={userOrgs$}
          >
            <Card>
              <Button className="h-full w-full">
                <Plus />
              </Button>
            </Card>
          </SetDialog>
        )}
      </Memo>
    </ManageContainer>
  );
};

export default observer(ManageSet);
