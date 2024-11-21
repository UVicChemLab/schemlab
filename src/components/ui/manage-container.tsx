"use client";

import * as React from "react";
import { cn } from "~/lib/utils";
import { Roboto } from "next/font/google";
import { Separator } from "./separator";

const font = Roboto({
  subsets: ["latin"],
  weight: ["400"],
});

const ManageContainer = ({
  id,
  children,
  heading,
}: {
  id?: string;
  children: React.ReactNode;
  heading?: string;
}) => {
  return (
    <div className="flex flex-col items-center" id={id}>
      <h1 className={cn("mt-4 text-3xl", font.className)}>{heading}</h1>
      <Separator className="my-4 w-11/12" />
      <div className="3xl:grid-cols-5 m-10 grid w-full gap-4 px-10 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {children}
      </div>
    </div>
  );
};

export default ManageContainer;
