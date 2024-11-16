"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogClose,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from "../ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { capitalize } from "~/lib/utils";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "../../hooks/use-toast";
import { OrganizationSchema } from "~/lib/formSchemas";
import {
  createOrganizationAction,
  updateOrganizationAction,
} from "~/actions/organization";
import { type Organization } from "~/server/db/schema";
import { OrgRole } from "~/lib/types";

const OrganizationDialog = ({
  children,
  action,
  org,
  updateState,
}: {
  children: React.ReactNode;
  action: "create" | "update";
  org?: Organization;
  updateState: (orgRoles: OrgRole[], userOrgs: Organization[]) => void;
}) => {
  const organizationForm = useForm<z.infer<typeof OrganizationSchema>>({
    resolver: zodResolver(OrganizationSchema),
    defaultValues: {
      uniqueName: org?.uniqueName ?? "",
      name: org?.name ?? "",
      description: org?.desc ?? "",
      image: org?.image ?? "",
      link: org?.link ?? "",
    },
  });

  const { toast } = useToast();

  function onSubmit(values: z.infer<typeof OrganizationSchema>) {
    const orgAction =
      action === "create" ? createOrganizationAction : updateOrganizationAction;
    orgAction(values).then((res) => {
      if (res?.success) {
        toast({
          title: res.message,
          description: new Date().toISOString(),
        });
        updateState(
          res.orgRoles as OrgRole[],
          res.organizations as Organization[],
        );
      } else {
        toast({
          title: "Something went wrong",
          description: res?.message + " " + new Date().toISOString(),
        });
      }
    });
    organizationForm.reset();
  }

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{capitalize(action)} Organization</DialogTitle>
          <DialogDescription>
            Please Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <Form {...organizationForm}>
          <form onSubmit={organizationForm.handleSubmit(onSubmit)}>
            <div className="flex flex-col gap-4">
              <FormField
                control={organizationForm.control}
                name="uniqueName"
                render={({ field }) => (
                  <FormItem className="mt-4">
                    <FormLabel>Unique Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Org" {...field} />
                    </FormControl>
                    <FormDescription />
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={organizationForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="organization" {...field} />
                    </FormControl>
                    <FormDescription />
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={organizationForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex flex-row items-center justify-start gap-2">
                      Description
                      <div className="text-sm text-zinc-500 dark:text-zinc-400">
                        (optional)
                      </div>
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        className="h-40"
                        placeholder="Description"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription />
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={organizationForm.control}
                name="link"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex flex-row items-center justify-start gap-2">
                      Link
                      <div className="text-sm text-zinc-500 dark:text-zinc-400">
                        (optional)
                      </div>
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="https://example.com" {...field} />
                    </FormControl>
                    <FormDescription />
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="submit" className="mt-4">
                  Save
                </Button>
              </DialogClose>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default OrganizationDialog;
