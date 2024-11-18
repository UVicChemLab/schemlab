"use client";

import React, { useEffect } from "react";
import type { Question, Level, Set, QuestionType } from "~/server/db/schema";
import { type Observable } from "@legendapp/state";
import { QuestionSchema } from "~/lib/formSchemas";
import {
  observer,
  Memo,
  useObservable,
  useEffectOnce,
} from "@legendapp/state/react";
import { useToast } from "../../hooks/use-toast";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import TextEditor from "~/components/text-editor/TextEditor";
import dynamic from "next/dynamic";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "~/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { capitalize } from "~/lib/utils";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { createQuestionAction, updateQuestionAction } from "~/actions/question";

const Sketcher = dynamic(() => import("~/components/sketcher/editor"), {
  ssr: false,
});

const QuestionCard = ({
  question,
  levels,
  sets,
  qTypes,
  sketcherPath,
}: {
  question?: Question;
  levels: Level[];
  sets: Set[];
  qTypes: QuestionType[];
  sketcherPath: string;
}) => {
  const { toast } = useToast();
  const userSets$ = useObservable<Set[]>(sets);
  const userQTypes$ = useObservable<QuestionType[]>(qTypes);
  const userLevels$ = useObservable<Level[]>(levels);
  const router = useRouter();
  const searchParams = useSearchParams();
  const action = searchParams.get("action");
  const params = new URLSearchParams(searchParams.toString());
  params.set("api_path", sketcherPath);

  useEffectOnce(() => {
    router.push(`?${params.toString()}`);
    router.refresh();
  });

  const questionForm = useForm<z.infer<typeof QuestionSchema>>({
    resolver: zodResolver(QuestionSchema),
    defaultValues: {
      number: question?.number || 1,
      question: question?.question || "",
      answer: question?.answer || "",
      level: question?.levelid.toString() || "",
      type: question?.levelid.toString() || "",
      set: question?.setid.toString() || "",
    },
  });

  function onSubmit(values: z.infer<typeof QuestionSchema>) {
    const questionAction =
      action === "update" ? updateQuestionAction : createQuestionAction;
    questionAction(values, question?.id).then((res) => {
      if (res?.success) {
        toast({
          title: res.message,
          description: new Date().toISOString(),
        });
      } else {
        toast({
          title: res?.message || "Something went wrong",
          description: new Date().toISOString(),
        });
      }
    });
    questionForm.reset();
  }

  return (
    <Card className="right-20 top-10 m-20">
      <CardHeader>
        <CardTitle className="text-3xl">Question</CardTitle>
        <CardDescription>
          {capitalize("create")} your question here
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...questionForm}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (e.type === "submit") {
                const submitEvent = e.nativeEvent as unknown as SubmitEvent;
                const submitButton = submitEvent.submitter as HTMLButtonElement;
                if (submitButton?.name === "saveQuestionForm") {
                  window.ketcher.getSmiles().then((smiles: string) => {
                    if (!smiles || smiles === "") {
                      questionForm.setValue("answer", "");
                      questionForm.setError(
                        "answer",
                        {
                          message: "Answer is required",
                        },
                        { shouldFocus: true },
                      );
                    } else questionForm.setValue("answer", smiles);
                    questionForm.handleSubmit(onSubmit)();
                  });
                }
              }
            }}
          >
            <div className="m-4 flex items-center justify-between">
              {/********Question Number***** */}
              <FormField
                control={questionForm.control}
                name="number"
                render={({ field }) => (
                  <FormItem className="mt-4">
                    <FormLabel>Question Number</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="1" {...field} />
                    </FormControl>
                    <FormDescription />
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex flex-row items-center justify-end gap-10">
                {/********QuestionSet******** **/}
                <FormField
                  control={questionForm.control}
                  name="set"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Question Set</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={question?.setid.toString() || ""}
                      >
                        <FormControl>
                          <SelectTrigger className="w-[180px]">
                            <SelectValue
                              placeholder={"Select a Question Set"}
                            />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {userSets$.get().map((set) => (
                            <SelectItem
                              key={set.id}
                              value={set.id?.toString() || ""}
                            >
                              {capitalize(set.name)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription />
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/********QuestionType******** */}
                <FormField
                  control={questionForm.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Question Type</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={question?.typeid.toString() || ""}
                      >
                        <FormControl>
                          <SelectTrigger className="w-[180px]">
                            <SelectValue
                              placeholder={"Select a Question Type"}
                            />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectGroup>
                            {userQTypes$.get().map((type) => (
                              <SelectItem
                                key={type.id}
                                value={type.id?.toString() || ""}
                              >
                                {capitalize(type.name)}
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

                {/********QuestionLevel******** */}
                <FormField
                  control={questionForm.control}
                  name="level"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Question Level</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={question?.levelid.toString() || ""}
                      >
                        <FormControl>
                          <SelectTrigger className="w-[180px]">
                            <SelectValue
                              placeholder={"Select a Question Level"}
                            />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectGroup>
                            {userLevels$.get().map((level) => (
                              <SelectItem
                                key={level.id}
                                value={level.id?.toString() || ""}
                              >
                                {capitalize(level.name)}
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
            </div>

            {/************Question******** */}
            <FormField
              control={questionForm.control}
              name="question"
              render={({ field }) => (
                <FormItem className="m-4 mt-8">
                  <FormLabel>Question</FormLabel>
                  <FormControl>
                    <TextEditor
                      initialContent={question?.question || ""}
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <FormDescription>Type your question here</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/************Answer******** */}
            <FormField
              control={questionForm.control}
              name="answer"
              render={() => (
                <FormItem className="m-4 mt-8">
                  <FormLabel>Answer</FormLabel>
                  <FormControl>
                    <div className="w-12/13 m-10 flex h-[60svh] items-center justify-center rounded-md border-2">
                      <Sketcher initialContent={question?.answer || ""} />
                    </div>
                  </FormControl>
                  <FormDescription>Type your answer here</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <CardFooter className="flex justify-end gap-4">
              <Button variant="outline">Cancel</Button>
              <Button type="submit" name="saveQuestionForm">
                Submit
              </Button>
            </CardFooter>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default QuestionCard;
