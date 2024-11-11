"use client";
import { signOut } from "next-auth/react";
// import { logout } from "~/actions/logout";
import { Button } from "~/components/ui/button";
interface LogoutButtonProps {
  children?: React.ReactNode;
}

export const LogoutButton = ({ children }: LogoutButtonProps) => {
  const onClick = () => {
    signOut({ callbackUrl: "/home" });
  };

  return (
    <Button
      onClick={onClick}
      className="w-full cursor-pointer"
      variant={"ghost"}
    >
      {children}
    </Button>
  );
};
