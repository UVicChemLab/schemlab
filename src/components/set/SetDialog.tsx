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
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { capitalize } from "~/lib/utils";
import type { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "../../hooks/use-toast";
import { SetSchema } from "~/lib/formSchemas";
import { type Organization, type Set } from "~/server/db/schema";
import { Visibility } from "~/lib/types";
import { createSetAction, updateSetAction } from "~/actions/set";
import { type Observable } from "@legendapp/state";
import { observer } from "@legendapp/state/react";

const SetDialog = ({
  children,
  action,
  set,
  userSets$,
  userOrgs$,
}: {
  children: React.ReactNode;
  action: "create" | "update";
  set?: Set;
  userSets$: Observable<Set[]>;
  userOrgs$: Observable<Organization[]>;
}) => {
  const { toast } = useToast();
  const setForm = useForm<z.infer<typeof SetSchema>>({
    resolver: zodResolver(SetSchema),
    defaultValues: {
      id: set?.id ?? 0,
      name: set?.name ?? "",
      desc: set?.desc ?? "",
      time: set?.time ?? { hours: 0, minutes: 0, seconds: 0 },
      visibility: set?.visibility ?? Visibility.PUBLIC,
      organization:
        userOrgs$.peek().find((org) => org.id === set?.organizationId)
          ?.uniqueName ?? "",
    },
  });

  function onSubmit(values: z.infer<typeof SetSchema>) {
    const setAction = action === "create" ? createSetAction : updateSetAction;
    setAction(values)
      .then((res) => {
        if (res?.success) {
          if (action !== "update") {
            if (res.set) {
              userSets$.push(res.set);
            }
          } else {
            if (res.set) {
              const userSets = userSets$.get();
              const setIdx = userSets.findIndex(
                (set) => set.id === res.set?.id,
              );
              userSets$[setIdx]?.set(res.set);
            }
          }
          toast({
            title: res.message,
            description: new Date().toISOString(),
          });
        } else {
          toast({
            title: res?.message ?? "Something went wrong",
            description: new Date().toISOString(),
          });
        }
      })
      .catch(() => {
        toast({
          title: "Something went wrong",
          description: new Date().toISOString(),
        });
      });
    setForm.reset();
  }

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{capitalize(action)} Question Set</DialogTitle>
          <DialogDescription>
            {"Please Click save when you're done."}
          </DialogDescription>
        </DialogHeader>
        <Form {...setForm}>
          <form onSubmit={setForm.handleSubmit(onSubmit)}>
            <div className="flex flex-col gap-4">
              <FormField
                control={setForm.control}
                name="id"
                render={() => (
                  <FormItem hidden>
                    <FormControl></FormControl>
                  </FormItem>
                )}
              />

              {/*****Set Name****** */}
              <FormField
                control={setForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="mt-4">
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Set 1" {...field} />
                    </FormControl>
                    <FormDescription />
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/*****Set Description****** */}
              <FormField
                control={setForm.control}
                name="desc"
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

              {/*****Set Visibility****** */}
              <FormField
                control={setForm.control}
                name="visibility"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Visibility</FormLabel>
                    <Select
                      defaultValue={Visibility.PUBLIC}
                      onValueChange={field.onChange}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={"Select a visibility"} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectGroup>
                          {Object.values(Visibility).map((visibility) => (
                            <SelectItem
                              key={`visibility-${visibility}`}
                              value={visibility as Visibility}
                            >
                              {capitalize(visibility)}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                    <FormDescription />
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/***********Organization******** */}
              <FormField
                control={setForm.control}
                name="organization"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Organization</FormLabel>
                    <Select onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={"Select an Organization"} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectGroup>
                          {userOrgs$.get().map((org) => (
                            <SelectItem
                              key={org.id}
                              value={org.id?.toString() ?? ""}
                            >
                              {org.uniqueName}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
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

export default observer(SetDialog);
