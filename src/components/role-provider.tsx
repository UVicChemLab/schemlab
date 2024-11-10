"use client";

import { createContext, useContext } from "react";
import { Role } from "~/server/db/schema";
import { observable } from "@legendapp/state";

const roleState$ = observable({
  role: Role.STUDENT,
  organization: "schemlab",
  setRole: (role: Role, organization: string) => {
    roleState$.assign({ role, organization });
  },
});

const RoleContext = createContext(roleState$);

export const RoleProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <RoleContext.Provider value={roleState$}>{children}</RoleContext.Provider>
  );
};

export const useRole = () => useContext(RoleContext);
