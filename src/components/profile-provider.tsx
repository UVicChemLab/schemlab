"use client";

import { createContext, useContext } from "react";
import { observable } from "@legendapp/state";
import { useObservable } from "@legendapp/state/react";
import { type ExtendedUser, defaultOrgRole } from "~/lib/types";

const profileState$ = observable({
  id: "",
  name: "",
  email: "",
  image: "",
  isOAuth: false,
  isTwoFactorEnabled: false,
  orgRoles: [defaultOrgRole],
  currentOrgRole: defaultOrgRole,
} as ExtendedUser);

const ProfileContext = createContext(profileState$);

export const ProfileProvider = ({
  children,
  initialValue,
}: {
  children: React.ReactNode;
  initialValue?: ExtendedUser;
}) => {
  const profile$ = useObservable<ExtendedUser>(initialValue);
  return (
    <ProfileContext.Provider value={initialValue ? profile$ : profileState$}>
      {children}
    </ProfileContext.Provider>
  );
};

export const useProfile = () => useContext(ProfileContext);
