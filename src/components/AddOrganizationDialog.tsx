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
} from "./ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Plus } from "lucide-react";
import { capitalize } from "~/lib/utils";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "../hooks/use-toast";
import { OrganizationSchema } from "~/lib/formSchemas";
import { createOrganizationAction } from "~/actions/organization";
import { useProfile } from "~/components/profile-provider";
import { observe } from "@legendapp/state";

const AddOrganizationDialog = () => {
  const organizationForm = useForm<z.infer<typeof OrganizationSchema>>({
    resolver: zodResolver(OrganizationSchema),
    defaultValues: {
      uniqueName: "",
      name: "",
      description: "",
    },
  });

  const { user } = useProfile();

  const { toast } = useToast();

  function onSubmit(values: z.infer<typeof OrganizationSchema>) {
    createOrganizationAction(values).then((res) => {
      if (res?.success) {
        toast({
          title: "Organization Saved Successfully",
          description: new Date().toISOString(),
        });
        if (res.organization) {
          observe(() => {
            user.orgRoles.set([...user.orgRoles.get(), res.organization]);
          });
        }
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
      <DialogTrigger asChild>
        <Button className="w-max">
          <Plus />
        </Button>
      </DialogTrigger>
      <DialogContent className="">
        <DialogHeader>
          <DialogTitle>New Organization</DialogTitle>
          <DialogDescription>
            Create a new organization. Click save when you're done.
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

export default AddOrganizationDialog;
