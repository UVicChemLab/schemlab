"use server";

import * as z from "zod";
import { LevelSchema } from "~/lib/formSchemas";
import {
  getSetsByOrgUniqueName,
  createLevel,
  updateLevel,
  deleteLevel,
} from "~/server/db/calls/crud";
import { getCurrentUser } from "./profile";
import { getOrgByUniqueName } from "~/server/db/calls/auth";

export const createLevelAction = async (
  values: z.infer<typeof LevelSchema>,
  id?: number,
) => {
  const user = await getCurrentUser();
  if (user) {
    const org = await getOrgByUniqueName(
      user.currentOrgRole.organizationUniqueName,
    );
    if (org)
      return createLevel(
        values.name,
        org.id,
        values.visibility,
        user.id,
        values.desc,
      );
  }
};

export const updateLevelAction = async (
  values: z.infer<typeof LevelSchema>,
) => {
  if (values.organization) {
    const org = await getOrgByUniqueName(values.organization);
    if (org)
      return updateLevel(
        values.id,
        values.name,
        values.desc,
        values.visibility,
        org.id,
      );
  }
  return updateLevel(values.id, values.name, values.desc, values.visibility);
};

export const deleteLevelAction = async (levelId: number) => {
  return deleteLevel(levelId);
};
