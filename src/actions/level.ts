"use server";

import type * as z from "zod";
import type { LevelSchema } from "~/lib/formSchemas";
import { createLevel, updateLevel, deleteLevel } from "~/server/db/calls/crud";
import { getCurrentUser } from "./profile";

export const createLevelAction = async (
  values: z.infer<typeof LevelSchema>,
  _?: number,
) => {
  const user = await getCurrentUser();
  if (user) {
    return createLevel(
      values.name,
      parseInt(values.organization),
      values.visibility,
      user.id,
      values.desc,
    );
  }
};

export const updateLevelAction = async (
  values: z.infer<typeof LevelSchema>,
) => {
  return updateLevel(
    values.id,
    values.name,
    values.desc,
    values.visibility,
    parseInt(values.organization),
  );
};

export const deleteLevelAction = async (levelId: number) => {
  return deleteLevel(levelId);
};
