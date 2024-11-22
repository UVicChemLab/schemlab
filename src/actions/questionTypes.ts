"use server";

import type * as z from "zod";
import type { QuestionTypeSchema } from "~/lib/formSchemas";
import { createType, updateType, deleteType } from "~/server/db/calls/crud";
import { getCurrentUser } from "./profile";

export const createTypeAction = async (
  values: z.infer<typeof QuestionTypeSchema>,
  _?: number,
) => {
  const user = await getCurrentUser();
  if (user) {
    return createType(
      values.name,
      parseInt(values.organization),
      values.visibility,
      user.id,
      values.desc,
    );
  }
};

export const updateTypeAction = async (
  values: z.infer<typeof QuestionTypeSchema>,
) => {
  return updateType(
    values.id,
    values.name,
    values.desc,
    values.visibility,
    parseInt(values.organization),
  );
};

export const deleteTypeAction = async (typeId: number) => {
  return deleteType(typeId);
};
