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
