"use client";

import { createContext, useContext } from "react";
import { Role } from "~/server/db/schema";
import { observable } from "@legendapp/state";
import { syncObservable } from "@legendapp/state/sync";
import { ObservablePersistLocalStorage } from "@legendapp/state/persist-plugins/local-storage";
import { type ExtendedUser } from "~/server/auth/config";
import { appName } from "~/lib/utils";

export type Organization = {
  id: number;
  uniqueName: string;
  name: string;
  image: string | null;
};

function isRole(value: string | null): value is Role {
  if (!value) return false;
  return (Object.values(Role) as string[]).includes(value);
}

const roleState$ = observable({
  role: Role.STUDENT,
  organization: {
    id: 1,
    uniqueName: appName,
    name: appName.toLowerCase(),
    image: "/compound.png",
  } as Organization,
  user: {
    id: "",
    name: "",
    email: "",
    image: "",
    isOAuth: false,
    isTwoFactorEnabled: false,
    orgRoles: [
      {
        organizationId: 2,
        organizationUniqueName: appName,
        organizationImage: "/compound.png",
        organizationName: appName.toLowerCase(),
        roleName: Role.STUDENT,
      },
    ],
  } as ExtendedUser,
  setRole: (role: Role, organization: Organization) => {
    if (isRole(role)) {
      roleState$.assign({ role, organization });
    } else {
      console.error("Invalid role:", role);
    }
  },
});

syncObservable(roleState$, {
  persist: {
    name: "UserRole",
    plugin: ObservablePersistLocalStorage,
  },
});

const RoleContext = createContext(roleState$);

export const RoleProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <RoleContext.Provider value={roleState$}>{children}</RoleContext.Provider>
  );
};

export const useRole = () => useContext(RoleContext);
