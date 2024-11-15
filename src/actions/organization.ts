"use server";

import * as z from "zod";
import { OrganizationSchema } from "~/lib/formSchemas";
import { createOrganization } from "~/server/db/calls/auth";
import { getCurrentUser } from "~/actions/profile";

export const createOrganizationAction = async (
  values: z.infer<typeof OrganizationSchema>,
) => {
  const user = await getCurrentUser();

  if (user) {
    return createOrganization(
      user.id,
      values.uniqueName,
      values.name,
      values.description,
      values.image,
      values.link,
    );
  }
};
