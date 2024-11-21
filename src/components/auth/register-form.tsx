"use client";

import type * as z from "zod";
import { useEffect, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { RegisterSchema } from "~/lib/formSchemas";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "~/components/ui/form";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "~/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import CardWrapper from "~/components/auth/card-wrapper";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { FormError } from "~/components/ui/form-error";
import { FormSucess } from "~/components/ui/form-success";
import { register } from "~/actions/register";
import { Memo } from "@legendapp/state/react";
import { observable, observe } from "@legendapp/state";
import { getAllOrganizations, getAllRoles } from "~/server/db/calls/auth";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "~/lib/utils";
import { type RoleCallReturn } from "~/server/db/calls/auth";
import { type Organization } from "~/server/db/schema";
import { appName } from "~/lib/types";

const RegisterForm = () => {
  const [success, setSuccess] = useState<string | undefined>();
  const [error, setError] = useState<string | undefined>();
  const organizations$ = observable<Organization[]>([]);
  const roles$ = observable<RoleCallReturn[]>([]);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    const fetchOrganizations = async () => {
      const orgCall: Promise<Organization[]> = getAllOrganizations();
      const roleCall: Promise<RoleCallReturn[]> = getAllRoles();
      const [orgData, roleData] = await Promise.all([orgCall, roleCall]);
      observe(() => {
        organizations$.set(orgData);
        roles$.set(roleData);
      });
    };

    fetchOrganizations().catch((e) => {
      console.log("Error fetching organizations:", e);
    });
  }, [organizations$, roles$]);

  const form = useForm<z.infer<typeof RegisterSchema>>({
    resolver: zodResolver(RegisterSchema),
    defaultValues: {
      email: "",
      password: "",
      name: "",
    },
  });

  const onSubmit = (values: z.infer<typeof RegisterSchema>) => {
    setError(undefined);
    setSuccess(undefined);

    startTransition(() => {
      register(values)
        .then((data) => {
          observe(() => {
            if (data.error) setError(() => data.error);
            else if (data.sucess) setSuccess(() => data.sucess);
          });
        })
        .catch(() => setError("Something went wrong!"));
    });
  };

  return (
    <CardWrapper
      headerLabel="Create an account"
      backButtonLabel="Already have an account?"
      backButtonHref="/auth/login"
      showSocial
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4">
            {/* Name */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      disabled={isPending}
                      placeholder="John Doe"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Email */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      disabled={isPending}
                      placeholder="john.doe@example.com"
                      type="email"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Organization */}
            <FormField
              control={form.control}
              name="organization"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel className="flex flex-row items-center justify-start gap-2">
                    Organization
                    <div className="text-sm text-zinc-500 dark:text-zinc-400">
                      (optional)
                    </div>
                  </FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          role="combobox"
                          className={cn(
                            "justify-between",
                            !field.value && "text-muted-foreground",
                          )}
                          disabled={isPending}
                        >
                          {field.value || "Select Organization"}
                          <ChevronsUpDown className="opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="p-0">
                      <Command>
                        <CommandInput
                          placeholder="Search organization..."
                          className="h-9"
                        />
                        <CommandList>
                          <CommandEmpty>No Organization found.</CommandEmpty>
                          <CommandGroup>
                            <Memo>
                              {() =>
                                organizations$.get().map((organization) => (
                                  <CommandItem
                                    value={organization.uniqueName}
                                    key={organization.id}
                                    onSelect={() => {
                                      form.setValue(
                                        "organization",
                                        organization.uniqueName,
                                      );
                                    }}
                                  >
                                    {organization.uniqueName}
                                    <Check
                                      className={cn(
                                        "ml-auto",
                                        organization.uniqueName === field.value
                                          ? "opacity-100"
                                          : "opacity-0",
                                      )}
                                    />
                                  </CommandItem>
                                ))
                              }
                            </Memo>
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  <FormDescription>
                    Will Assign to {appName} as Student by default.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/************** Role *********************
            <FormField
              control={form.control}
              name={"role"}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role</FormLabel>
                  <FormControl>
                    <Select defaultValue={Role.STUDENT}>
                      <SelectTrigger>
                        <SelectValue placeholder={capitalize(Role.STUDENT)} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <Memo>
                            {() =>
                              roles$.get().map((role) => (
                                <SelectItem
                                  key={role.id}
                                  value={role.name}
                                  onSelect={() =>
                                    form.setValue("role", role.name)
                                  }
                                >
                                  {capitalize(role.name)}
                                </SelectItem>
                              ))
                            }
                          </Memo>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormDescription>
                    Will Assign Student by default
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            */}

            {/* Password */}
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      disabled={isPending}
                      placeholder="******"
                      type="password"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormError message={error} />
          <FormSucess message={success} />
          <Button disabled={isPending} type="submit" className="w-full">
            Create an account
          </Button>
        </form>
      </Form>
    </CardWrapper>
  );
};

export default RegisterForm;
