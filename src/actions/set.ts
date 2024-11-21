"use server";

import type * as z from "zod";
import type { SetSchema } from "~/lib/formSchemas";
import { createSet, updateSet, deleteSet } from "~/server/db/calls/crud";
import { getCurrentUser } from "./profile";

// Create a new set
export const createSetAction = async (
  values: z.infer<typeof SetSchema>,
  _?: number,
) => {
  const user = await getCurrentUser();
  if (user) {
    return createSet(
      values.name,
      parseInt(values.organization),
      values.visibility,
      user.id,
      values.desc,
      values.time,
    );
  }
};

export const updateSetAction = async (values: z.infer<typeof SetSchema>) => {
  if (values.organization) {
    return updateSet(
      values.id,
      values.name,
      values.desc,
      values.time,
      values.visibility,
      parseInt(values.organization),
    );
  }
  return updateSet(
    values.id,
    values.name,
    values.desc,
    values.time,
    values.visibility,
  );
};

export const deleteSetAction = async (setId: number) => {
  return deleteSet(setId);
};
