"use server";

import * as z from "zod";
import { OrganizationSchema } from "~/lib/formSchemas";
import {
  createOrganization,
  getOrgByUniqueName,
  updateOrganization,
  deleteOrganization,
} from "~/server/db/calls/auth";
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

export const updateOrganizationAction = async (
  values: z.infer<typeof OrganizationSchema>,
) => {
  const organization = await getOrgByUniqueName(values.uniqueName);

  if (organization) {
    return updateOrganization(
      organization.id,
      values.uniqueName,
      values.name,
      values.description,
      values.image,
      values.link,
    );
  }
};

export const deleteOrganizationAction = async (orgId: number) => {
  return deleteOrganization(orgId);
};
