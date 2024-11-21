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
import { QuestionTypeSchema } from "~/lib/formSchemas";
import type { QuestionType, Organization } from "~/server/db/schema";
import { Visibility } from "~/lib/types";
import { createTypeAction, updateTypeAction } from "~/actions/questionTypes";
import { type Observable } from "@legendapp/state";
import { useProfile } from "../profile-provider";
import { observer } from "@legendapp/state/react";

const TypeDialog = ({
  children,
  action,
  qType,
  userQuestionTypes$,
  userOrgs$,
}: {
  children: React.ReactNode;
  action: "create" | "update";
  qType?: QuestionType;
  userQuestionTypes$: Observable<QuestionType[]>;
  userOrgs$: Observable<Organization[]>;
}) => {
  const user$ = useProfile();
  const { toast } = useToast();
  const qTypeForm = useForm<z.infer<typeof QuestionTypeSchema>>({
    resolver: zodResolver(QuestionTypeSchema),
    defaultValues: {
      id: qType?.id ?? 0,
      name: qType?.name ?? "",
      desc: qType?.desc ?? "",
      visibility: qType?.visibility ?? Visibility.PUBLIC,
    },
  });

  function onSubmit(values: z.infer<typeof QuestionTypeSchema>) {
    const qTypeAction =
      action === "create" ? createTypeAction : updateTypeAction;
    qTypeAction(values)
      .then((res) => {
        if (res?.success) {
          if (action !== "update") {
            if (res.type) {
              userQuestionTypes$.push(res.type);
            }
          } else {
            if (res.type) {
              const userQuestionTypes = userQuestionTypes$.get();
              const qTypeIdx = userQuestionTypes.findIndex(
                (type) => type.id === res.type?.id,
              );
              userQuestionTypes$[qTypeIdx]?.set(res.type);
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
    qTypeForm.reset();
  }

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{capitalize(action)} Question Type</DialogTitle>
          <DialogDescription>
            {"Please Click save when you're done."}
          </DialogDescription>
        </DialogHeader>
        <Form {...qTypeForm}>
          <form onSubmit={qTypeForm.handleSubmit(onSubmit)}>
            <div className="flex flex-col gap-4">
              <FormField
                control={qTypeForm.control}
                name="id"
                render={() => (
                  <FormItem hidden>
                    <FormControl></FormControl>
                  </FormItem>
                )}
              />

              {/*****Type Name****** */}
              <FormField
                control={qTypeForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="mt-4">
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Spectroscopy" {...field} />
                    </FormControl>
                    <FormDescription />
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/*****Type Description****** */}
              <FormField
                control={qTypeForm.control}
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

              {/*****Type Visibility****** */}
              <FormField
                control={qTypeForm.control}
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
                control={qTypeForm.control}
                name="organization"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Organization</FormLabel>
                    <Select
                      defaultValue={user$.currentOrgRole.organizationUniqueName.get()}
                      onValueChange={field.onChange}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={"Select an Organization"} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectGroup>
                          {userOrgs$.get().map((org) => (
                            <SelectItem key={org.id} value={org.uniqueName}>
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
