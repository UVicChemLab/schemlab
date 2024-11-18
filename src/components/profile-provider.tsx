"use client";

import { createContext, useContext } from "react";
import { observable, type Observable } from "@legendapp/state";
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
  let profile: Observable<ExtendedUser>;
  if (initialValue) profile = useObservable<ExtendedUser>(initialValue);
  else profile = profileState$;
  return (
    <ProfileContext.Provider value={profile}>
      {children}
    </ProfileContext.Provider>
  );
};

export const useProfile = () => useContext(ProfileContext);
