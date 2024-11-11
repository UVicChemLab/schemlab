"use client";
import React from "react";
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
import { usePathname } from "next/navigation";
import { useCurrentUser } from "~/hooks/use-current-user";
import Image from "next/image";
import { Merriweather } from "next/font/google";
import { appName, cn } from "~/lib/utils";
import { useRole } from "~/components/role-provider";
import { Memo, observer } from "@legendapp/state/react";
import { type Organization } from "~/components/role-provider";
import { type ExtendedUser } from "~/server/auth/config";
import { Role } from "~/server/db/schema";
import { useRouter } from "next/navigation";
import { capitalize } from "~/lib/utils";
import { getCurrentUser } from "~/actions/profile";
import { useEffect } from "react";
import { createOAuthUserOrganizationRole } from "~/server/db/calls/auth";
import { observe } from "@legendapp/state";

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

const selectOrg = (
  selectedOrg: string,
  user: ExtendedUser,
  setRole: (role: Role, organization: Organization) => void,
) => {
  const orgRole = findOrgRole(selectedOrg, user);
  if (orgRole) {
    const organization = {
      id: orgRole.organizationId,
      uniqueName: orgRole.organizationUniqueName,
      name: orgRole.organizationName,
      image: orgRole.organizationImage,
    } as Organization;

    if (orgRole.roleName) setRole(orgRole.roleName as Role, organization);
    else console.error("Invalid roleName:", orgRole.roleName);
  }
};

const ProtectedNavBar = function () {
  const pathname = usePathname();
  const { user, role, organization, setRole } = useRole();
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      const oAuthCheckCall: Promise<void> = createOAuthUserOrganizationRole();
      const userCall: Promise<ExtendedUser | null> = getCurrentUser();
      const [_, userData] = await Promise.all([oAuthCheckCall, userCall]);
      if (!userData) {
        router.refresh();
      } else {
        user.set(userData);
        const orgRole = findOrgRole(organization.uniqueName.get(), user.get());
        if (orgRole && orgRole.roleName) {
          setRole(orgRole.roleName as Role, organization.get());
        }
      }
    };
    fetchUser();
  }, [router, user]);

  if (!user) return null;

  return (
    <header className="sticky top-0 w-full border-b">
      <div className="m-2 flex items-center justify-between px-16">
        <div className="flex items-center justify-start gap-4">
          <Memo>
            {() => (
              <>
                <Image
                  src={organization.image.get() || "/compound.png"}
                  width={50}
                  height={50}
                  alt="Compound"
                />
                <h1 className={cn("text-3xl font-semibold", font.className)}>
                  {organization.name.get()}
                </h1>
              </>
            )}
          </Memo>
        </div>
        <NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuItem>
              <Link href="/schemlab" legacyBehavior passHref>
                <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                  <Memo>
                    {() => (
                      <div
                        className={
                          pathname ===
                          `/schemlab/${organization.uniqueName.get()}/home`
                            ? "underline"
                            : ""
                        }
                      >
                        Home
                      </div>
                    )}
                  </Memo>
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <Memo>
                {() => (
                  <Link
                    href={`/schemlab/${role.get()}`}
                    legacyBehavior
                    passHref
                  >
                    <NavigationMenuLink
                      className={navigationMenuTriggerStyle()}
                    >
                      {capitalize(role.get())}
                    </NavigationMenuLink>
                  </Link>
                )}
              </Memo>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
        <div className="flex items-center justify-end gap-2">
          <Memo>
            {() => (
              <Select
                defaultValue={organization.uniqueName.get()}
                onValueChange={(value) => selectOrg(value, user.get(), setRole)}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select an organization">
                    {organization.uniqueName.get()}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Organizations</SelectLabel>
                    {user &&
                      user.orgRoles.get() &&
                      user.orgRoles.map((orgRole) => (
                        <SelectItem
                          key={`org-${orgRole.organizationUniqueName.get()}`}
                          value={
                            orgRole.organizationUniqueName.get() || appName
                          }
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
