"use client";

import { useTransition } from "react";
import { useSession } from "next-auth/react";
import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ProfileSchema } from "~/lib/formSchemas";
import { profile } from "~/actions/profile";
import { Switch } from "~/components/ui/switch";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { Button } from "~/components/ui/button";
import { Card, CardHeader, CardContent } from "~/components/ui/card";
import {
  Form,
  FormField,
  FormControl,
  FormItem,
  FormLabel,
  FormDescription,
  FormMessage,
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
import { Input } from "~/components/ui/input";
import { FormError } from "~/components/ui/form-error";
import { FormSucess } from "~/components/ui/form-success";
import { Memo, useEffectOnce, observer } from "@legendapp/state/react";
import { useProfile } from "~/components/profile-provider";
import { Badge } from "~/components/ui/badge";
import { observable } from "@legendapp/state";
import { cn } from "~/lib/utils";
import { getAllOrganizations } from "~/server/db/calls/auth";
import { Check, ChevronsUpDown } from "lucide-react";
import { type Organization } from "~/server/db/schema";

const ProfilePage = () => {
  const [isPending, startTransition] = useTransition();
  const error$ = observable<string | undefined>();
  const success$ = observable<string | undefined>();
  const { update } = useSession();
  const user$ = useProfile();
  const organizations$ = observable<Organization[]>([]);

  useEffectOnce(() => {
    const fetchOrganizations = async () => {
      const orgsData: Organization[] = await getAllOrganizations();
      if (orgsData) {
        organizations$.set(orgsData);
      }
    };

    fetchOrganizations();
  }, []);

  const form = useForm<z.infer<typeof ProfileSchema>>({
    resolver: zodResolver(ProfileSchema),
    defaultValues: {
      name: user$.name.get() || "",
      email: user$.email.get() || "",
      password: "",
      newPassword: "",
      isTwoFactorEnabled: user$.isTwoFactorEnabled.get() || false,
    },
  });

  const onSubmit = (values: z.infer<typeof ProfileSchema>) => {
    startTransition(() => {
      profile(values)
        .then((data) => {
          if (data?.error) {
            error$.set(data.error);
          }

          if (data?.success) {
            update();
            success$.set(data.success);
          }
        })
        .catch(() => error$.set("Something went wrong!"));
    });
  };

  return (
    <Card className="itelms-center mx-auto my-10 w-[600px]">
      <CardHeader>
        <p className="text-center text-2xl font-semibold">🧑🏻‍🔬 Profile</p>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
            <div className="space-y-4">
              {/**User Name */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="John Doe"
                        disabled={isPending}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/***********Provider Only******** */}
              {user$.isOAuth.get() && (
                <FormField
                  control={form.control}
                  name="email"
                  render={() => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="john.doe@example.com"
                          type="email"
                          disabled={true}
                          value={user$.email.get() || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {/******Credentials Only******** */}
              {/**User Email */}
              {user$.isOAuth.get() === false && (
                <>
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="john.doe@example.com"
                            type="email"
                            disabled={isPending}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/**User Password */}
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="123456"
                            type="password"
                            disabled={isPending}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/**User New Password */}
                  <FormField
                    control={form.control}
                    name="newPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>New Password</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="123456"
                            type="password"
                            disabled={isPending}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/**Two Factor Auth Enabled? */}
                  <FormField
                    control={form.control}
                    name="isTwoFactorEnabled"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                        <div className="space-y-0.5">
                          <FormLabel>Two Factor Authentication</FormLabel>
                          <FormDescription>
                            Enable two factor authentication for your account
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            disabled={isPending}
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              )}

              {/*Join Organization*/}
              <Memo>
                {() => (
                  <FormField
                    control={form.control}
                    name="organization"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel className="my-2">
                          Join an Organization or Create Your Own
                        </FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                role="combobox"
                                className={cn(
                                  "w-full justify-between",
                                  !field.value && "text-muted-foreground",
                                )}
                              >
                                {field.value
                                  ? organizations$
                                      .get()
                                      .find(
                                        (organization) =>
                                          organization.uniqueName ===
                                          field.value,
                                      )?.uniqueName
                                  : "Select Organization"}
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
                                <CommandEmpty>
                                  No Organization found.
                                </CommandEmpty>
                                <CommandGroup>
                                  <Memo>
                                    {() =>
                                      organizations$
                                        .get()
                                        .map((organization) => (
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
                                                organization.uniqueName ===
                                                  field.value
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
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </Memo>
            </div>
            <FormError message={error$.get()} />
            <FormSucess message={success$.get()} />
            <Button type="submit" disabled={isPending} className="w-full">
              Save
            </Button>
          </form>
        </Form>

        {/**User Organizations and Roles */}
        <Table className="my-10">
          <TableCaption>Your Organizations and Roles</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Organization</TableHead>
              <TableHead>Role</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <Memo>
              {() =>
                user$.orgRoles.get()?.map((orgRole) => (
                  <TableRow key={orgRole.organizationUniqueName}>
                    <TableCell className="font-medium">
                      {orgRole.organizationUniqueName}
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge variant={"default"}>{orgRole.roleName}</Badge>
                    </TableCell>
                  </TableRow>
                ))
              }
            </Memo>
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default observer(ProfilePage);
