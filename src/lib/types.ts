import { DefaultSession } from "next-auth";
import { type Organization } from "~/server/db/schema";

export const appName = "SChemLab";

export enum Role {
  ADMIN = "admin",
  ORGADMIN = "orgAdmin",
  INSTRUCTOR = "instructor",
  STUDENT = "student",
}

export enum Visibility {
  PUBLIC = "public",
  ORGANIZATION = "organization",
  PRIVATE = "private",
}

export type ExtendedUser = {
  id: string;
  isOAuth: boolean;
  isTwoFactorEnabled: boolean;
  orgRoles: OrgRole[];
  currentOrgRole: OrgRole;
} & DefaultSession["user"];

export type OrgRole = {
  organizationUniqueName: string;
  roleName: Role;
};

export const defaultOrgRole = {
  organizationUniqueName: appName,
  roleName: Role.STUDENT,
} as OrgRole;

export type RolesWithPermissions = {
  [R in Role]: Partial<{
    [Key in keyof Permissions]: Partial<{
      [Action in Permissions[Key]["action"]]: PermissionCheck<Key>;
    }>;
  }>;
};

export type Permissions = {
  organizations: {
    dataType: Organization;
    action: "view" | "create" | "update" | "delete" | "join";
  };
};

type PermissionCheck<Key extends keyof Permissions> =
  | boolean
  | ((user: ExtendedUser, data: Permissions[Key]["dataType"]) => boolean);
