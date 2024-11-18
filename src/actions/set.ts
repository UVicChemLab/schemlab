"use server";

import * as z from "zod";
import { SetSchema } from "~/lib/formSchemas";
import {
  getSetsByOrgUniqueName,
  createSet,
  updateSet,
  deleteSet,
} from "~/server/db/calls/crud";
import { getCurrentUser } from "./profile";
import { getOrgByUniqueName } from "~/server/db/calls/auth";

export const createSetAction = async (
  values: z.infer<typeof SetSchema>,
  id?: number,
) => {
  const user = await getCurrentUser();
  if (user) {
    const org = await getOrgByUniqueName(
      user.currentOrgRole.organizationUniqueName,
    );
    if (org)
      return createSet(
        values.name,
        org?.id,
        values.visibility,
        user.id,
        values.desc,
        values.time,
      );
  }
};

export const updateSetAction = async (values: z.infer<typeof SetSchema>) => {
  if (values.organization) {
    const org = await getOrgByUniqueName(values.organization);
    if (org)
      return updateSet(
        values.id,
        values.name,
        values.desc,
        values.time,
        values.visibility,
        org.id,
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
