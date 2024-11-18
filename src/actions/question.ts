"use server";

import * as z from "zod";
import { QuestionSchema } from "~/lib/formSchemas";
import { getCurrentUser } from "./profile";
import {
  getLastQuestionInSet,
  createQuestion,
  updateQuestion,
  deleteQuestion,
} from "~/server/db/calls/crud";

export async function createQuestionAction(
  values: z.infer<typeof QuestionSchema>,
  id?: number,
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
  if (user && id) {
    return await updateQuestion(
      id,
      values.number,
      values.question,
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