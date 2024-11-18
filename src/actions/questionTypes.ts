"use server";

import * as z from "zod";
import { QuestionTypeSchema } from "~/lib/formSchemas";
import {
  getSetsByOrgUniqueName,
  createType,
  updateType,
  deleteType,
} from "~/server/db/calls/crud";
import { getCurrentUser } from "./profile";
import { getOrgByUniqueName } from "~/server/db/calls/auth";

export const createTypeAction = async (
  values: z.infer<typeof QuestionTypeSchema>,
  id?: number,
) => {
  const user = await getCurrentUser();
  if (user) {
    const org = await getOrgByUniqueName(
      user.currentOrgRole.organizationUniqueName,
    );
    if (org)
      return createType(
        values.name,
        org.id,
        values.visibility,
        user.id,
        values.desc,
      );
  }
};

export const updateTypeAction = async (
  values: z.infer<typeof QuestionTypeSchema>,
) => {
  if (values.organization) {
    const org = await getOrgByUniqueName(values.organization);
    if (org)
      return updateType(
        values.id,
        values.name,
        values.desc,
        values.visibility,
        org.id,
      );
  }
  return updateType(values.id, values.name, values.desc, values.visibility);
};

export const deleteTypeAction = async (typeId: number) => {
  return deleteType(typeId);
};
