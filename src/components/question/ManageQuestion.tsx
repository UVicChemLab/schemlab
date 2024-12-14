"use client";

import React from "react";
import { useToast } from "~/hooks/use-toast";
import { useProfile } from "~/components/profile-provider";
import { Memo, useObservable } from "@legendapp/state/react";
import { type Question } from "~/server/db/schema";
import ManageContainer from "../ui/manage-container";
import { hasPermission } from "~/server/auth/permissions";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Pencil, Trash, Plus } from "lucide-react";
import Link from "next/link";
import { DEFAULT_LOGIN_REDIRECT } from "~/lib/routes";
import { deleteQuestionAction } from "~/actions/question";

const ManageQuestion = ({
  id,
  userQuestions,
}: {
  id: string;
  userQuestions: Question[];
}) => {
  const { toast } = useToast();
  const user$ = useProfile();
  const userQuestions$ = useObservable<Question[]>(userQuestions);

  const deleteQuestion = async (questionId: number | undefined) => {
    if (!questionId) return;
    deleteQuestionAction(questionId)
      .then((res) => {
        if (res?.success) {
          const userQuestions = userQuestions$.get();
          const questionIdx = userQuestions.findIndex(
            (question) => question.id === res.question?.id,
          );
          userQuestions$[questionIdx]?.delete();
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
    <ManageContainer heading="Manage Questions" id={id}>
      <Memo>
        {() =>
          userQuestions$.get().map(
            (question) =>
              hasPermission(user$.get(), "questions", "view", question) && (
                <Card key={question.id}>
                  <CardHeader>
                    <CardTitle>{question.number}</CardTitle>
                    <CardDescription>{question.desc ?? ""}</CardDescription>
                  </CardHeader>
                  <CardContent></CardContent>
                  <CardFooter>
                    <div className="flex gap-2">
                      {hasPermission(
                        user$.get(),
                        "questions",
                        "update",
                        question,
                      ) && (
                        <Link
                          href={`${DEFAULT_LOGIN_REDIRECT}/question?action=update&question=${question.id}`}
                        >
                          <Button variant={"ghost"}>
                            <Pencil width={20} />
                          </Button>
                        </Link>
                      )}
                      {hasPermission(
                        user$.get(),
                        "questions",
                        "delete",
                        question,
                      ) && (
                        <Button
                          variant={"ghost"}
                          onClick={() => deleteQuestion(question.id)}
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
          <Card>
            <Link href={`${DEFAULT_LOGIN_REDIRECT}/question?action=create`}>
              <Button className="h-full w-full">
                <Plus />
              </Button>
            </Link>
          </Card>
        )}
      </Memo>
    </ManageContainer>
  );
};

export default ManageQuestion;
