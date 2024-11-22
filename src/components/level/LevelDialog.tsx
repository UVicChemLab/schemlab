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
import { LevelSchema } from "~/lib/formSchemas";
import { type Level, type Organization } from "~/server/db/schema";
import { Visibility } from "~/lib/types";
import { createLevelAction, updateLevelAction } from "~/actions/level";
import { type Observable } from "@legendapp/state";
import { observer } from "@legendapp/state/react";

const TypeDialog = ({
  children,
  action,
  level,
  userLevels$,
  userOrgs$,
}: {
  children: React.ReactNode;
  action: "create" | "update";
  level?: Level;
  userLevels$: Observable<Level[]>;
  userOrgs$: Observable<Organization[]>;
}) => {
  const { toast } = useToast();
  const levelForm = useForm<z.infer<typeof LevelSchema>>({
    resolver: zodResolver(LevelSchema),
    defaultValues: {
      id: level?.id ?? 0,
      name: level?.name ?? "",
      desc: level?.desc ?? "",
      visibility: level?.visibility ?? Visibility.PUBLIC,
      organization:
        userOrgs$
          .peek()
          .find((org) => org.id === level?.organizationId)
          ?.id?.toString() ?? "",
    },
  });

  function onSubmit(values: z.infer<typeof LevelSchema>) {
    const levelAction =
      action === "create" ? createLevelAction : updateLevelAction;
    levelAction(values)
      .then((res) => {
        if (res?.success) {
          if (action !== "update") {
            if (res.level) {
              userLevels$.push(res.level);
            }
          } else {
            if (res.level) {
              const userLevels = userLevels$.get();
              const levelIdx = userLevels.findIndex(
                (level) => level.id === res.level?.id,
              );
              userLevels$[levelIdx]?.set(res.level);
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
    levelForm.reset();
  }

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{capitalize(action)} Level</DialogTitle>
          <DialogDescription>
            {"Please Click save when you're done."}
          </DialogDescription>
        </DialogHeader>
        <Form {...levelForm}>
          <form onSubmit={levelForm.handleSubmit(onSubmit)}>
            <div className="flex flex-col gap-4">
              <FormField
                control={levelForm.control}
                name="id"
                render={() => (
                  <FormItem hidden>
                    <FormControl></FormControl>
                  </FormItem>
                )}
              />

              {/*****Level Name****** */}
              <FormField
                control={levelForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="mt-4">
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Easy" {...field} />
                    </FormControl>
                    <FormDescription />
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/*****Level Description****** */}
              <FormField
                control={levelForm.control}
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

              {/*****Level Visibility****** */}
              <FormField
                control={levelForm.control}
                name="visibility"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Visibility</FormLabel>
                    <Select onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue
                            placeholder={
                              level?.visibility ?? "Select a visibility"
                            }
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectGroup>
                          {Object.values(Visibility).map((visibility) => (
                            <SelectItem
                              key={`visibility-${visibility}`}
                              value={visibility}
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
                control={levelForm.control}
                name="organization"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Organization</FormLabel>
                    <Select onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue
                            placeholder={
                              userOrgs$
                                .peek()
                                .find((org) => org.id === level?.organizationId)
                                ?.uniqueName.toString() ??
                              "Select an Organization"
                            }
                          />
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

export default observer(TypeDialog);
