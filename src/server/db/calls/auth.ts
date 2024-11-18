"use server";

import { db } from "~/server/db";
import { eq, and, count, desc } from "drizzle-orm";
import {
  users,
  accounts,
  roles,
  organizations,
  userOrganizationRoles,
  Organization,
} from "~/server/db/schema";
import { Role, appName, type OrgRole } from "~/lib/types";

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

export const getRoleByName = async (name: Role) => {
  return await db.query.roles.findFirst({
    columns: {
      id: true,
      name: true,
    },
    where: (roles, { eq }) => eq(roles.name, name),
  });
};

/*****************Organization*********** */
export const getAllOrganizations = async () => {
  return await db.query.organizations.findMany();
};
export const getAllUserOrganizations = async (userId: string) => {
  return (await db
    .select({
      id: organizations.id,
      uniqueName: organizations.uniqueName,
      name: organizations.name,
      desc: organizations.desc,
      image: organizations.image,
      link: organizations.link,
      createdBy: organizations.createdBy,
      createdAt: organizations.createdAt,
      updatedAt: organizations.updatedAt,
    })
    .from(organizations)
    .innerJoin(
      userOrganizationRoles,
      eq(organizations.id, userOrganizationRoles.organizationId),
    )
    .where(eq(userOrganizationRoles.userId, userId))) as Organization[];
};

export const getOrgByUniqueName = async (uniqueName: string) => {
  return await db.query.organizations.findFirst({
    columns: {
      id: true,
      uniqueName: true,
      name: true,
      image: true,
      link: true,
    },
    where: (organizations, { eq }) => eq(organizations.uniqueName, uniqueName),
  });
};
export const getOrgById = async (orgId: number) => {
  return await db.query.organizations.findFirst({
    columns: {
      id: true,
      uniqueName: true,
      name: true,
      image: true,
      link: true,
    },
    where: (organizations, { eq }) => eq(organizations.id, orgId),
  });
};

export const createOrganization = async (
  userId: string,
  uniqueName: string,
  name: string,
  desc?: string,
  image?: string,
  link?: string,
) => {
  try {
    const organization = await db
      .insert(organizations)
      .values({ uniqueName, name, desc, image, link, createdBy: userId })
      .returning();

    const role = await db.query.roles.findFirst({
      where: (roles, { eq }) => eq(roles.name, Role.ORGADMIN),
    });
    if (organization[0] && role) {
      await db.insert(userOrganizationRoles).values({
        userId,
        organizationId: organization[0].id,
        roleId: role.id,
      });

      return {
        success: true,
        message: `Organization ${uniqueName} Created Successfully`,
        organization: organization[0] as Organization,
      };
    } else {
      const organization = await getOrgByUniqueName(uniqueName);
      if (organization) {
        await deleteOrganization(organization.id);
        return {
          success: false,
          message: `Organization with uniqueName ${uniqueName} already exists`,
        };
      } else {
        return {
          success: false,
          message: `Error Creating Organization ${uniqueName}`,
        };
      }
    }
  } catch (e) {
    const organization = await getOrgByUniqueName(uniqueName);
    if (organization) {
      await deleteOrganization(organization.id);
      return {
        success: false,
        message:
          `Organization with uniqueName ${uniqueName} already exists ` + e,
      };
    } else {
      return {
        success: false,
        message: `Error Creating Organization ${uniqueName} ` + e,
      };
    }
  }
};

export const updateOrganization = async (
  id: number,
  uniqueName: string,
  name: string,
  desc?: string,
  image?: string,
  link?: string,
) => {
  try {
    const res = await db
      .update(organizations)
      .set({ uniqueName, name, desc, image, link })
      .where(eq(organizations.id, id))
      .returning();

    if (res[0]) {
      return {
        success: true,
        message: `Organization ${uniqueName} Updated Successfully`,
        organization: res[0] as Organization,
      };
    } else {
      return {
        success: false,
        message: `Cannot Update Organization ${uniqueName}`,
      };
    }
  } catch (e) {
    return {
      success: false,
      message: `Organization with uniqueName ${uniqueName} already exists ` + e,
    };
  }
};

export const deleteOrganization = async (id: number) => {
  try {
    const res = await db
      .delete(organizations)
      .where(eq(organizations.id, id))
      .returning();

    if (res[0]) {
      return {
        success: true,
        message: `Organization ${res[0]?.uniqueName || id} deleted successfully`,
        organization: res[0] as Organization,
      };
    } else {
      return {
        success: false,
        message: `Organization with id: ${id} not found`,
      };
    }
  } catch (error) {
    return {
      success: false,
      message: `Erro Deleting Organization with id: ${id} ` + error,
    };
  }
};

/******************UserOrganizationRole*********** */
export const getUserOrganizationRoles = async (userId: string) => {
  return await db
    .select({
      organizationUniqueName: organizations.uniqueName,
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

const getAllAdmins = async () => {
  return await db
    .select({ userId: userOrganizationRoles.userId, roleId: roles.id })
    .from(userOrganizationRoles)
    .innerJoin(roles, eq(roles.id, userOrganizationRoles.roleId))
    .where(eq(roles.name, Role.ADMIN));
};
