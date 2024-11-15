"use client";

import { createContext, useContext } from "react";
import { observable } from "@legendapp/state";
import { syncObservable } from "@legendapp/state/sync";
import { ObservablePersistLocalStorage } from "@legendapp/state/persist-plugins/local-storage";
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

syncObservable(profileState$, {
  persist: {
    name: "UserProfile",
    plugin: ObservablePersistLocalStorage,
  },
});

const ProfileContext = createContext(profileState$);

export const ProfileProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <ProfileContext.Provider value={profileState$}>
      {children}
    </ProfileContext.Provider>
  );
};

export const useProfile = () => useContext(ProfileContext);
