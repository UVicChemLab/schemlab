import { DefaultSession } from "next-auth";
import { appName } from "~/lib/utils";
import { Role } from "~/server/db/schema";

export type ExtendedUser = {
  id: string;
  isOAuth: boolean;
  isTwoFactorEnabled: boolean;
  orgRoles: OrgRole[];
  currentOrgRole: OrgRole;
} & DefaultSession["user"];

export type OrgRole = {
  organizationId: number;
  organizationUniqueName: string;
  organizationName: string;
  roleName: Role;
  organizationImage: string | null;
  organizationLink: string | null;
};

export const defaultOrgRole = {
  organizationId: 4,
  organizationUniqueName: appName,
  organizationName: appName,
  organizationImage: "/compound.png",
  organizationLink: null,
  roleName: Role.STUDENT,
} as OrgRole;
