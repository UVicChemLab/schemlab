"use client";

import React from "react";
import TextEditor from "./text-editor/TextEditor";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
} from "./ui/form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import FormFieldSelect from "./ui/FormFieldSelect";
import { useState, useEffect } from "react";
import {
  getLevels,
  getSets,
  getTypes,
  createLevel,
  createSet,
  createType,
} from "~/server/db/calls";
import dynamic from "next/dynamic";

const Sketcher = dynamic(() => import("./sketcher/editor"), {
  ssr: false,
});

export const questionFormSchema = z.object({
  questionNumber: z
    .number({
      required_error: "Question Number is required",
      invalid_type_error: "Question Number must be a number",
    })
    .int()
    .positive({
      message: "Question Number must be a positive number",
    }),
  level: z.string(),
  type: z.string(),
  set: z.string(),
  question: z.string().optional() /*.min(2, {
    message: "Question must be at least 2 characters",
  }),*/,
});

const AddQuestion = () => {
  const [levels, setLevels] = useState<{ name: string }[]>([]);
  const [types, setTypes] = useState<{ name: string }[]>([]);
  const [sets, setSets] = useState<{ name: string }[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const levelCall: Promise<{ name: string }[]> = getLevels();
      const typeCall: Promise<{ name: string }[]> = getTypes();
      const setCall: Promise<{ name: string }[]> = getSets();

      const [levelData, typeData, setData] = await Promise.all([
        levelCall,
        typeCall,
        setCall,
      ]);

      setLevels(() => levelData);
      setTypes(() => typeData);
      setSets(() => setData);
    };

    fetchData();
  }, []);

  const questionForm = useForm<z.infer<typeof questionFormSchema>>({
    resolver: zodResolver(questionFormSchema),
    defaultValues: {
      questionNumber: 1,
      level: "",
      type: "",
      set: "",
      question: "Type Here",
    },
  });

  function onSubmit(values: z.infer<typeof questionFormSchema>) {
    // Do something with the form values.
    // ✅ This will be type-safe and validated.
    console.log(values);
    console.log("From sketcher", window.ketcher.getSmiles());
  }

  return (
    <Card className="right-20 top-10 m-20">
      <CardHeader>
        <CardTitle className="text-3xl">Question</CardTitle>
        <CardDescription>Add your question here</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...questionForm}>
          <form
            onSubmit={questionForm.handleSubmit(onSubmit)}
            className="space-y-8"
          >
            <div className="flex items-center justify-between">
              <FormField
                control={questionForm.control}
                name="questionNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Question Number</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="1" {...field} />
                    </FormControl>
                    <FormDescription>
                      Give your Question a Number
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex flex-row items-center justify-end gap-10">
                <FormFieldSelect
                  form={questionForm}
                  name="level"
                  selectFields={levels}
                  createAttribute={createLevel}
                />
                <FormFieldSelect
                  form={questionForm}
                  name="type"
                  selectFields={types}
                  createAttribute={createType}
                />
                <FormFieldSelect
                  form={questionForm}
                  name="set"
                  selectFields={sets}
                  createAttribute={createSet}
                />
              </div>
            </div>
            <FormField
              control={questionForm.control}
              name="question"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Question</FormLabel>
                  <FormControl>
                    <TextEditor />
                  </FormControl>
                  <FormDescription>Type your question here</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="w-12/13 m-10 flex h-[60svh] items-center justify-center rounded-md border-2">
              <Sketcher />
            </div>
            <CardFooter className="flex justify-end gap-4">
              <Button variant="outline">Cancel</Button>
              <Button type="submit">Submit</Button>
            </CardFooter>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default AddQuestion;
