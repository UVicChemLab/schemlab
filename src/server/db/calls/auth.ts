"use server";

import { db } from "~/server/db";
import { eq, and, count } from "drizzle-orm";
import {
  users,
  accounts,
  roles,
  organizations,
  userOrganizationRoles,
} from "~/server/db/schema";
import { Role } from "~/server/db/schema";
import { appName } from "~/lib/utils";

/*****************User*********** */
export const getUserByEmail = async (email: string) => {
  return await db.query.users.findFirst({
    where: (users, { eq }) => eq(users.email, email),
  });
};
export const getUserById = async (id: string) => {
  return await db.query.users.findFirst({
    where: (users, { eq }) => eq(users.id, id),
  });
};
export const createUser = async (
  name: string,
  email: string,
  password: string,
  organization?: string,
  role?: Role,
) => {
  const user = await db
    .insert(users)
    .values({ name, email, password })
    .returning();
  if (!user[0]) return;

  await createUserOrganizationRole(user[0].id, organization, role);
};

export const updateUser = async (
  id: string,
  name?: string,
  email?: string,
  password?: string,
  isTwoFactorEnabled?: boolean,
) => {
  return await db
    .update(users)
    .set({
      name,
      email,
      password,
      isTwoFactorEnabled,
    })
    .where(eq(users.id, id));
};

export const setUserEmailVerified = async (id: string, email: string) => {
  return await db
    .update(users)
    .set({ emailVerified: new Date(), email })
    .where(eq(users.id, id));
};

export const changePassword = async (id: string, password: string) => {
  return await db.update(users).set({ password }).where(eq(users.id, id));
};

export const setOAuthEmailVerified = async (userId: string) => {
  return await db
    .update(users)
    .set({ emailVerified: new Date() })
    .where(eq(users.id, userId));
};

export const addTwoFactorTokenReference = async (
  userid: string,
  twoFactorTokenId: string,
) => {
  return await db
    .update(users)
    .set({ twoFactorTokenId })
    .where(eq(users.id, userid));
};

export const getUserCount = async () => {
  const res = await db.query.users.findMany();
  return res.length;
};

/*****************Account*********** */

export const getAccountByUserId = async (userId: string) => {
  return await db.query.accounts.findFirst({
    where: (accounts, { eq }) => eq(accounts.userId, userId),
  });
};

/*****************Role*********** */

export type RoleCallReturn = {
  id: number;
  name: Role;
};

export const getAllRoles = async () => {
  return await db.query.roles.findMany({
    columns: {
      id: true,
      name: true,
    },
  });
};

export const getRoleById = async (roleId: number) => {
  return await db.query.roles.findFirst({
    columns: {
      id: true,
      name: true,
    },
    where: (roles, { eq }) => eq(roles.id, roleId),
  });
};

/*****************Organization*********** */
export const getAllOrganizations = async () => {
  return await db.query.organizations.findMany({
    columns: {
      id: true,
      uniqueName: true,
      name: true,
      image: true,
    },
  });
};

export const getOrgById = async (orgId: number) => {
  return await db.query.organizations.findFirst({
    columns: {
      id: true,
      uniqueName: true,
      name: true,
      image: true,
    },
    where: (organizations, { eq }) => eq(organizations.id, orgId),
  });
};

/******************UserOrganizationRole*********** */
export const getUserOrganizationRoles = async (userId: string) => {
  return await db
    .select({
      organizationId: organizations.id,
      organizationUniqueName: organizations.uniqueName,
      organizationImage: organizations.image,
      organizationName: organizations.name,
      roleName: roles.name,
    })
    .from(userOrganizationRoles)
    .innerJoin(
      organizations,
      eq(organizations.id, userOrganizationRoles.organizationId),
    )
    .innerJoin(roles, eq(roles.id, userOrganizationRoles.roleId))
    .where(eq(userOrganizationRoles.userId, userId));
};

export const createUserOrganizationRole = async (
  userId: string,
  organizationUniqueName?: string,
  roleName?: Role,
) => {
  const organizationId = await db
    .select({ id: organizations.id })
    .from(organizations)
    .where(eq(organizations.uniqueName, organizationUniqueName || appName));
  const roleId = await db
    .select({ id: roles.id })
    .from(roles)
    .where(eq(roles.name, roleName || Role.STUDENT));

  if (organizationId[0]?.id && roleId[0]?.id) {
    const org_id = organizationId[0].id;
    const role_id = roleId[0].id;
    const checkExisting = await db.query.userOrganizationRoles.findFirst({
      where: (userOrganizationRoles, { and, eq }) =>
        and(
          eq(userOrganizationRoles.userId, userId),
          eq(userOrganizationRoles.organizationId, org_id),
          eq(userOrganizationRoles.roleId, role_id),
        ),
    });
    if (!checkExisting) {
      return await db
        .insert(userOrganizationRoles)
        .values({
          userId,
          organizationId: org_id,
          roleId: role_id,
        })
        .returning();
    } else {
      return [
        {
          roleId: role_id,
          organizationId: org_id,
        },
      ];
    }
  }
};
