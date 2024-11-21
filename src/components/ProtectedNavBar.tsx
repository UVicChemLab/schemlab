"use client";
import React, { useTransition } from "react";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
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
import { type ExtendedUser } from "~/lib/types";
import { usePathname } from "next/navigation";
import { capitalize } from "~/lib/utils";
import { useSession } from "next-auth/react";
import { appName } from "~/lib/types";
import type { Organization } from "~/server/db/schema";
import { Memo, observer, useObservable } from "@legendapp/state/react";
import { useProfile } from "~/components/profile-provider";
import { DEFAULT_LOGIN_REDIRECT } from "~/lib/routes";
import { Button } from "./ui/button";

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

const ProtectedNavBar = function ({ userOrgs }: { userOrgs: Organization[] }) {
  const pathname = usePathname();
  const user$ = useProfile();
  const userOrgs$ = useObservable<Organization[]>(userOrgs);
  const { update } = useSession();
  const [isPending, startTransition] = useTransition();

  const selectOrg = (selectedOrg: string) => {
    const orgRole = findOrgRole(selectedOrg, user$.get());
    if (orgRole) {
      user$.currentOrgRole.set(orgRole);
      startTransition(() => {
        update({
          user: user$.get(),
        }).catch((e) => {
          console.error(e);
        });
      });
    }
  };

  return (
    <header className="sticky top-0 z-10 mb-10 w-full border-b">
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
                      ?.image.get() ?? "/compound.png"
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
              <NavigationMenuTrigger>
                {capitalize(user$.currentOrgRole.roleName.get())}
              </NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul className="flex flex-col items-center justify-center">
                  <li className="w-full border-b">
                    <Link
                      href={`${DEFAULT_LOGIN_REDIRECT}/manage#manage-orgs`}
                      legacyBehavior
                      passHref
                    >
                      <Button className="w-full" variant="ghost">
                        Manage Organizations
                      </Button>
                    </Link>
                  </li>
                  <li className="w-full border-b">
                    <Link
                      href={`${DEFAULT_LOGIN_REDIRECT}/manage#manage-sets`}
                      legacyBehavior
                      passHref
                    >
                      <Button className="w-full" variant="ghost">
                        Manage Sets
                      </Button>
                    </Link>
                  </li>
                  <li className="w-full border-b">
                    <Link
                      href={`${DEFAULT_LOGIN_REDIRECT}/manage#manage-qtypes`}
                      legacyBehavior
                      passHref
                    >
                      <Button className="w-full" variant="ghost">
                        Manage Question Types
                      </Button>
                    </Link>
                  </li>
                  <li className="w-full border-b">
                    <Link
                      href={`${DEFAULT_LOGIN_REDIRECT}/manage#manage-levels`}
                      legacyBehavior
                      passHref
                    >
                      <Button className="w-full" variant="ghost">
                        Manage Levels
                      </Button>
                    </Link>
                  </li>
                  <li className="w-full border-b">
                    <Link
                      href={`${DEFAULT_LOGIN_REDIRECT}/manage#manage-questions`}
                      legacyBehavior
                      passHref
                    >
                      <Button className="w-full" variant="ghost">
                        Manage Questions
                      </Button>
                    </Link>
                  </li>
                </ul>
              </NavigationMenuContent>
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
                disabled={isPending}
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
