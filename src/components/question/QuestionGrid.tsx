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
import Link from "next/link";

const QuestionGrid = ({ questions }: { questions: Question[] }) => {
  return (
    <ManageContainer heading="Practice Questions">
      {questions.map((question) => (
        <Link
          key={question.id}
          href={`/practiceQuestion?question=${question.id}`}
        >
          <Card>
            <CardHeader>
              <CardTitle>{question.number}</CardTitle>
              <CardDescription>{question.desc ?? ""}</CardDescription>
            </CardHeader>
            <CardContent></CardContent>
            <CardFooter></CardFooter>
          </Card>
        </Link>
      ))}
    </ManageContainer>
  );
};

export default QuestionGrid;
