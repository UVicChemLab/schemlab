"use server";

import type * as z from "zod";
import type { QuestionSchema } from "~/lib/formSchemas";
import { getCurrentUser } from "./profile";
import {
  getLastQuestionInSet,
  createQuestion,
  updateQuestion,
  deleteQuestion,
} from "~/server/db/calls/crud";

function getQuestionDescription(question: string) {
  const truncatedText = question.slice(3, 20) + "...";
  return truncatedText.replace(/<\/?[^>]+(>|$)/g, "");
}

export async function createQuestionAction(
  values: z.infer<typeof QuestionSchema>,
  _?: number,
) {
  const user = await getCurrentUser();
  if (user) {
    let questionNumber: number;
    const lastQuestion = await getLastQuestionInSet(parseInt(values.set));
    if (!lastQuestion) questionNumber = 1;
    else questionNumber = lastQuestion.number + 1;
    return await createQuestion(
      questionNumber,
      values.question,
      getQuestionDescription(values.question),
      values.answer,
      parseInt(values.level),
      parseInt(values.set),
      parseInt(values.type),
      user.id,
    );
  }
}

export async function updateQuestionAction(
  values: z.infer<typeof QuestionSchema>,
  id?: number,
) {
  const user = await getCurrentUser();
  if (user && id && values.number) {
    return await updateQuestion(
      id,
      parseInt(values.number),
      values.question,
      getQuestionDescription(values.question),
      values.answer,
      parseInt(values.level),
      parseInt(values.set),
      parseInt(values.type),
    );
  }
}

export async function deleteQuestionAction(id: number) {
  return await deleteQuestion(id);
}
