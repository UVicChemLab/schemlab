"use client";

import React from "react";
import { type Question } from "~/server/db/schema";
import ManageContainer from "../ui/manage-container";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Separator } from "~/components/ui/separator";
import Link from "next/link";

const QuestionGrid = ({ questions }: { questions: Question[] }) => {
  return (
    <div className="flex w-full flex-col items-center justify-center py-10">
      <h2 className="mb-8 text-center text-2xl font-semibold">
        Practice Questions
      </h2>
      <Separator className="my-4 w-11/12" />
      <div className="grid grid-cols-5 gap-4 sm:grid-cols-8 md:grid-cols-10">
        {questions.map((question) => (
          <Link
            key={question.id}
            href={`/practiceQuestion?question=${question.id}`}
          >
            <Card className="bg-muted/40 hover:bg-primary hover:text-primary-foreground flex aspect-square w-16 items-center justify-center rounded-xl text-base font-semibold shadow-sm transition-colors sm:w-20 sm:text-lg md:w-24 md:text-xl">
              <span>{question.number}</span>
              {/*<CardHeader>
              <CardTitle>{question.number}</CardTitle>
              <CardDescription>{question.desc ?? ""}</CardDescription>
            </CardHeader>
            <CardContent></CardContent>
            <CardFooter></CardFooter>*/}
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default QuestionGrid;
