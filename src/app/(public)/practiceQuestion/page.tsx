import React from "react";
import PracticeCard from "~/components/question/PracticeCard";
import { type Question } from "~/server/db/schema";
import { getQuestionById } from "~/server/db/calls/crud";

type Params = Promise<{ question: string }>;

export async function generateMetadata({ params }: { params: Params }) {
  const { question } = await params;
}

const PracticeQuestionPage = async ({
  searchParams,
}: {
  searchParams: Params;
}) => {
  const { question } = await searchParams;
  const questionDets: Question = await getQuestionById(parseInt(question));
  return (
    <div>
      <PracticeCard
        question={questionDets}
        indigoServiceApiPath={"/v2"}
        indigoServicePublicUrl={"https://indigo.chemistrypuzzles.ca"}
      />
    </div>
  );
};

export default PracticeQuestionPage;
