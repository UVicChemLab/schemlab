import {
  type RolesWithPermissions,
  type ExtendedUser,
  type Permissions,
} from "~/lib/types";

const ROLES = {
  admin: {
    organizations: {
      view: true,
      create: true,
      update: true,
      delete: true,
      join: true,
    },
    sets: {
      view: true,
      create: true,
      update: true,
      delete: true,
    },
    types: {
      view: true,
      create: true,
      update: true,
      delete: true,
    },
    levels: {
      view: true,
      create: true,
      update: true,
      delete: true,
    },
    questions: {
      view: true,
      create: true,
      update: true,
      delete: true,
    },
  },
  orgAdmin: {
    organizations: {
      view: (user, org) =>
        user.orgRoles.some(
          (orgRole) => orgRole.organizationUniqueName === org.uniqueName,
        ),
      create: true,
      update: (user, org) => user.id === org.createdBy,
      delete: (user, org) => user.id === org.createdBy,
      join: true,
    },
    sets: {
      view: true,
      create: true,
      update: (user, set) => user.id === set.createdBy,
      delete: (user, set) => user.id === set.createdBy,
    },
    types: {
      view: true,
      create: true,
      update: (user, type) => user.id === type.createdBy,
      delete: (user, type) => user.id === type.createdBy,
    },
    levels: {
      view: true,
      create: true,
      update: (user, level) => user.id === level.createdBy,
      delete: (user, level) => user.id === level.createdBy,
    },
    questions: {
      view: true,
      create: true,
      update: true,
      delete: true,
    },
  },
  instructor: {
    organizations: {
      view: (user, org) =>
        user.orgRoles.some(
          (orgRole) => orgRole.organizationUniqueName === org.uniqueName,
        ),
      create: true,
      join: true,
    },
    sets: {
      view: true,
      create: true,
      update: (user, set) => user.id === set.createdBy,
      delete: (user, set) => user.id === set.createdBy,
    },
    types: {
      view: true,
      create: true,
      update: (user, type) => user.id === type.createdBy,
      delete: (user, type) => user.id === type.createdBy,
    },
    levels: {
      view: true,
      create: true,
      update: (user, level) => user.id === level.createdBy,
      delete: (user, level) => user.id === level.createdBy,
    },
    questions: {
      view: true,
      create: true,
      update: true,
      delete: true,
    },
  },
  student: {
    organizations: {
      view: (user, org) =>
        user.orgRoles.some(
          (orgRole) => orgRole.organizationUniqueName === org.uniqueName,
        ),
      create: true,
      join: true,
    },
    sets: {
      view: true,
      create: true,
      update: (user, set) => user.id === set.createdBy,
      delete: (user, set) => user.id === set.createdBy,
    },
    types: {
      view: true,
      create: true,
      update: (user, type) => user.id === type.createdBy,
      delete: (user, type) => user.id === type.createdBy,
    },
    levels: {
      view: true,
      create: true,
      update: (user, level) => user.id === level.createdBy,
      delete: (user, level) => user.id === level.createdBy,
    },
    questions: {
      view: true,
      create: true,
      update: true,
      delete: true,
    },
  },
} as const satisfies RolesWithPermissions;

export function hasPermission<Resource extends keyof Permissions>(
  user: ExtendedUser,
  resource: Resource,
  action: Permissions[Resource]["action"],
  data?: Permissions[Resource]["dataType"],
) {
  return user.orgRoles.some((orgRole) => {
    const permission = (ROLES as RolesWithPermissions)[orgRole.roleName][
      resource
    ]?.[action];
    if (permission == null) return false;

    if (typeof permission === "boolean") return permission;
    return data != null && permission(user, data);
  });
}
