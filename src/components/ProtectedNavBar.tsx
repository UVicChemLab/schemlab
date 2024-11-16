"use client";
import React, { useTransition } from "react";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuIndicator,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  NavigationMenuViewport,
  navigationMenuTriggerStyle,
} from "~/components/ui/navigation-menu";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { UserButton } from "./auth/user-button";
import Link from "next/link";
import Image from "next/image";
import { Merriweather } from "next/font/google";
import { cn } from "~/lib/utils";
import { useProfile } from "~/components/profile-provider";
import { type ExtendedUser } from "~/lib/types";
import { useRouter, usePathname } from "next/navigation";
import { capitalize } from "~/lib/utils";
import { getCurrentUser } from "~/actions/profile";
import { useSession } from "next-auth/react";
import { appName } from "~/lib/types";
import { Organization } from "~/server/db/schema";
import { getAllUserOrganizations } from "~/server/db/calls/auth";
import { Memo, observer, useEffectOnce } from "@legendapp/state/react";
import { observable } from "@legendapp/state";
import { DEFAULT_LOGIN_REDIRECT } from "~/lib/routes";

const font = Merriweather({
  subsets: ["latin"],
  weight: ["400"],
});

const findOrgRole = (org: string, user: ExtendedUser) => {
  const orgRole = user.orgRoles?.find(
    (orgRole) => orgRole.organizationUniqueName === org,
  );
  return orgRole;
};

const ProtectedNavBar = function () {
  const pathname = usePathname();
  const router = useRouter();
  const user$ = useProfile();
  const userOrgs$ = observable<Organization[]>([]);
  const { update } = useSession();
  const [isPending, startTransition] = useTransition();

  const selectOrg = (selectedOrg: string) => {
    const orgRole = findOrgRole(selectedOrg, user$.get());
    if (orgRole) {
      user$.currentOrgRole.set(orgRole);
      startTransition(() => {
        update({
          user: user$.get(),
        }).then(() => {});
      });
    }
  };

  useEffectOnce(() => {
    const fetchUser = async () => {
      const userData = await getCurrentUser();
      if (!userData) {
        router.refresh();
      } else {
        user$.set(userData);
        const userOrgsData = await getAllUserOrganizations(userData.id);
        if (userOrgsData) {
          userOrgs$.set(userOrgsData);
        }
      }
    };
    fetchUser();
  }, []);

  if (!user$.get()) return null;

  return (
    <header className="sticky top-0 w-full border-b">
      <div className="m-2 flex items-center justify-between px-16">
        <div className="flex items-center justify-start gap-4">
          <Memo>
            {() => (
              <>
                <Image
                  src={
                    userOrgs$
                      .find(
                        (org) =>
                          org.uniqueName.get() ===
                          user$.currentOrgRole.organizationUniqueName.get(),
                      )
                      ?.image.get() || "/compound.png"
                  }
                  width={50}
                  height={50}
                  alt="Compound"
                />
                <h1 className={cn("text-3xl font-semibold", font.className)}>
                  {userOrgs$
                    .find(
                      (org) =>
                        org.uniqueName.get() ===
                        user$.currentOrgRole.organizationUniqueName.get(),
                    )
                    ?.name.get()}
                </h1>
              </>
            )}
          </Memo>
        </div>
        <NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuItem>
              <Link
                href={`${DEFAULT_LOGIN_REDIRECT}/home`}
                legacyBehavior
                passHref
              >
                <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                  <div
                    className={
                      pathname === `${DEFAULT_LOGIN_REDIRECT}/home`
                        ? "underline"
                        : "border-l"
                    }
                  >
                    Home
                  </div>
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <Link
                href={`${DEFAULT_LOGIN_REDIRECT}/manage`}
                legacyBehavior
                passHref
              >
                <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                  {capitalize(user$.currentOrgRole.roleName.get())}
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
        <div className="flex items-center justify-end gap-2">
          <Memo>
            {() => (
              <Select
                defaultValue={user$.currentOrgRole.organizationUniqueName.get()}
                onValueChange={(value) => selectOrg(value)}
                value={user$.currentOrgRole.organizationUniqueName.get()}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select an organization">
                    {user$.currentOrgRole.organizationUniqueName.get()}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Organizations</SelectLabel>
                    {user$.orgRoles.map((orgRole, index) => (
                      <SelectItem
                        key={`org-${index}-${orgRole.organizationUniqueName.get()}`}
                        value={orgRole.organizationUniqueName.get() || appName}
                      >
                        {orgRole.organizationUniqueName.get()}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            )}
          </Memo>
          <UserButton />
        </div>
      </div>
    </header>
  );
};

export default observer(ProtectedNavBar);
