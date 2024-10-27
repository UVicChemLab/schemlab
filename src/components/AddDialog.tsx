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

const attributeFormSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  description: z.string().optional(),
});

const AddDialog = ({
  property,
  createAttribute,
}: {
  property: string;
  createAttribute: (name: string, desc?: string) => Promise<void>;
}) => {
  const attributeForm = useForm<z.infer<typeof attributeFormSchema>>({
    resolver: zodResolver(attributeFormSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  const { toast } = useToast();

  function onSubmit(values: z.infer<typeof attributeFormSchema>) {
    createAttribute(values.name, values.description);
    attributeForm.reset();
    toast({
      title: capitalize(property) + " Saved Successfully",
      description: new Date().toISOString(),
    });
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="w-max">
          <Plus />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>New {capitalize(property)}</DialogTitle>
          <DialogDescription>
            Create a new {property}. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <Form {...attributeForm}>
          <form onSubmit={attributeForm.handleSubmit(onSubmit)}>
            <div className="flex flex-col gap-4">
              <FormField
                control={attributeForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="mt-4">
                    <FormLabel>{capitalize(property)}</FormLabel>
                    <FormControl>
                      <Input placeholder={property} {...field} />
                    </FormControl>
                    <FormDescription />
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={attributeForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
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
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="submit">Save</Button>
              </DialogClose>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default AddDialog;
