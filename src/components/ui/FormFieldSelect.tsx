"use client";

import React from "react";
import { type UseFormReturn } from "react-hook-form";
import { questionFormSchema } from "../AddQuestion";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
} from "./form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./select";
import AddDialog from "../AddDialog";
import { z } from "zod";
import { capitalize } from "~/lib/utils";

const FormFieldSelect = ({
  form,
  name,
  selectFields,
  createAttribute,
}: {
  form: UseFormReturn<z.infer<typeof questionFormSchema>>;
  name: "level" | "type" | "set";
  selectFields: {
    name: string;
  }[];
  createAttribute: (name: string, desc?: string) => Promise<void>;
}) => {
  return (
    <div className="m-5 flex flex-row items-center justify-end gap-4">
      <FormField
        control={form.control}
        name={name}
        render={() => (
          <FormItem>
            <FormLabel>{capitalize(name)}</FormLabel>
            <FormControl>
              <Select>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder={selectFields[0]?.name} />
                </SelectTrigger>
                <SelectContent>
                  {selectFields.map((item) => (
                    <SelectItem key={item.name} value={item.name}>
                      {item.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormControl>
            <FormDescription>Choose {capitalize(name)}</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
      <AddDialog property={name} createAttribute={createAttribute} />
    </div>
  );
};

export default FormFieldSelect;
