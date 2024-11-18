"use client";

import React from "react";
import { useToast } from "~/hooks/use-toast";
import { useProfile } from "~/components/profile-provider";
import { observer, Memo, useObservable } from "@legendapp/state/react";
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
import QuestionCard from "./QuestionCard";
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
                    <CardDescription>{question.question}</CardDescription>
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
                        <Button variant={"ghost"}>
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
