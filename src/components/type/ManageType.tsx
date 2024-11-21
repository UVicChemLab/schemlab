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
import type { QuestionType, Organization } from "~/server/db/schema";
import { Button } from "~/components/ui/button";
import { hasPermission } from "~/server/auth/permissions";
import { deleteTypeAction } from "~/actions/questionTypes";
import TypeDialog from "./TypeDialog";
import { Pencil, Trash, Plus } from "lucide-react";

const ManageType = ({
  id,
  userQuestionTypes,
  userOrgs,
}: {
  id?: string;
  userQuestionTypes: QuestionType[];
  userOrgs: Organization[];
}) => {
  const { toast } = useToast();
  const user$ = useProfile();
  const userQuestionTypes$ = useObservable<QuestionType[]>(userQuestionTypes);
  const userOrgs$ = useObservable<Organization[]>(userOrgs);

  const deleteSet = (typeId: number | undefined) => {
    if (!typeId) return;
    deleteTypeAction(typeId)
      .then((res) => {
        if (res?.success) {
          const userQTypes = userQuestionTypes$.get();
          const typeIdx = userQTypes.findIndex(
            (type) => type.id === res.type?.id,
          );
          userQuestionTypes$[typeIdx]?.delete();
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
    <ManageContainer heading="Manage Question Types" id={id}>
      <Memo>
        {() =>
          userQuestionTypes$.get().map(
            (qType) =>
              hasPermission(user$.get(), "types", "view", qType) && (
                <Card key={qType.id}>
                  <CardHeader>
                    <CardTitle>{qType.name}</CardTitle>
                    <CardDescription>{qType.desc}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p>
                      {
                        userOrgs$
                          .get()
                          .find((org) => org.id === qType.organizationId)
                          ?.uniqueName
                      }
                    </p>
                  </CardContent>
                  <CardFooter>
                    <p>{qType.visibility}</p>
                    <div className="flex gap-2">
                      {hasPermission(user$.get(), "types", "update", qType) && (
                        <TypeDialog
                          action="update"
                          qType={qType}
                          userQuestionTypes$={userQuestionTypes$}
                          userOrgs$={userOrgs$}
                        >
                          <Button variant={"ghost"}>
                            <Pencil width={20} />
                          </Button>
                        </TypeDialog>
                      )}
                      {hasPermission(user$.get(), "types", "delete", qType) && (
                        <Button
                          variant={"ghost"}
                          onClick={() => deleteSet(qType.id)}
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
          <TypeDialog
            action="create"
            userQuestionTypes$={userQuestionTypes$}
            userOrgs$={userOrgs$}
          >
            <Card>
              <Button className="h-full w-full">
                <Plus />
              </Button>
            </Card>
          </TypeDialog>
        )}
      </Memo>
    </ManageContainer>
  );
};

export default observer(ManageType);
