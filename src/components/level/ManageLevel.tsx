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
import type { Level, Organization } from "~/server/db/schema";
import { Button } from "~/components/ui/button";
import { hasPermission } from "~/server/auth/permissions";
import { deleteLevelAction } from "~/actions/level";
import LevelDialog from "./LevelDialog";
import { Pencil, Trash, Plus } from "lucide-react";

const ManageLevel = ({
  id,
  userLevels,
  userOrgs,
}: {
  id?: string;
  userLevels: Level[];
  userOrgs: Organization[];
}) => {
  const { toast } = useToast();
  const user$ = useProfile();
  const userLevels$ = useObservable<Level[]>(userLevels);
  const userOrgs$ = useObservable<Organization[]>(userOrgs);

  const deleteSet = (levelId: number | undefined) => {
    if (!levelId) return;
    deleteLevelAction(levelId)
      .then((res) => {
        if (res?.success) {
          const userLevels = userLevels$.get();
          const levelIdx = userLevels.findIndex(
            (level) => level.id === res.level?.id,
          );
          userLevels$[levelIdx]?.delete();
          toast({
            title: res.message,
            description: new Date().toISOString(),
          });
        } else {
          toast({
            title: res?.message ?? "Something went wrong",
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
    <ManageContainer heading="Manage Levels" id={id}>
      <Memo>
        {() =>
          userLevels$.get().map(
            (level) =>
              hasPermission(user$.get(), "levels", "view", level) && (
                <Card key={level.id}>
                  <CardHeader>
                    <CardTitle>{level.name}</CardTitle>
                    <CardDescription>{level.desc}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p>
                      {
                        userOrgs$
                          .get()
                          .find((org) => org.id === level.organizationId)
                          ?.uniqueName
                      }
                    </p>
                  </CardContent>
                  <CardFooter>
                    <p>{level.visibility}</p>
                    <div className="flex gap-2">
                      {hasPermission(
                        user$.get(),
                        "levels",
                        "update",
                        level,
                      ) && (
                        <LevelDialog
                          action="update"
                          level={level}
                          userLevels$={userLevels$}
                          userOrgs$={userOrgs$}
                        >
                          <Button variant={"ghost"}>
                            <Pencil width={20} />
                          </Button>
                        </LevelDialog>
                      )}
                      {hasPermission(
                        user$.get(),
                        "levels",
                        "delete",
                        level,
                      ) && (
                        <Button
                          variant={"ghost"}
                          onClick={() => deleteSet(level.id)}
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
          <LevelDialog
            action="create"
            userLevels$={userLevels$}
            userOrgs$={userOrgs$}
          >
            <Card>
              <Button className="h-full w-full">
                <Plus />
              </Button>
            </Card>
          </LevelDialog>
        )}
      </Memo>
    </ManageContainer>
  );
};

export default observer(ManageLevel);
