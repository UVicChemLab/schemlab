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
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { cn } from "~/lib/utils";
import { Merriweather } from "next/font/google";
const font = Merriweather({
  subsets: ["latin"],
  weight: ["400"],
});
import { appName } from "~/lib/types";

const NavBar = () => {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 w-full border-b">
      <div className="m-2 flex items-center justify-between px-16">
        <div className="flex items-center justify-start gap-4">
          <Image src={"/compound.png"} width={50} height={50} alt="Logo" />
          <h1 className={cn("text-3xl font-semibold", font.className)}>
            {appName}
          </h1>
        </div>
        <NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuItem>
              <Link href="/" legacyBehavior passHref>
                <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                  <div className={pathname === "/home" ? "underline" : ""}>
                    Home
                  </div>
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <Link href="/auth/login" legacyBehavior passHref>
                <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                  Sign In
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
      </div>
    </header>
  );
};

export default NavBar;
