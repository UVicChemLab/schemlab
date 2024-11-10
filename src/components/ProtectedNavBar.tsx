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
} from "./ui/navigation-menu";
import { UserButton } from "./auth/user-button";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCurrentUser } from "~/hooks/use-current-user";
import { Memo } from "@legendapp/state/react";

const NavBar = () => {
  const pathname = usePathname();
  const user = useCurrentUser();
  console.log("user", user);

  return (
    <header className="sticky top-0 w-full border-b">
      <div className="flex h-14 items-center p-8">
        <NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuItem>
              <Link href="/" legacyBehavior passHref>
                <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                  <div className={pathname === "/" ? "underline" : ""}>
                    Home
                  </div>
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>
            <Memo>
              {() =>
                user && (
                  <>
                    <NavigationMenuItem>
                      <Link href="/admin" legacyBehavior passHref>
                        <NavigationMenuLink
                          className={navigationMenuTriggerStyle()}
                        >
                          Admin
                        </NavigationMenuLink>
                      </Link>
                    </NavigationMenuItem>
                    <NavigationMenuItem>
                      <UserButton />
                    </NavigationMenuItem>
                  </>
                )
              }
            </Memo>
          </NavigationMenuList>
        </NavigationMenu>
      </div>
    </header>
  );
};

export default NavBar;
