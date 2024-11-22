"use client";

import React from "react";
import type { Question } from "~/server/db/schema";
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
import { useToast } from "~/hooks/use-toast";
import { Button } from "../ui/button";
import type { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AnswerSchema } from "~/lib/formSchemas";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import parse from "html-react-parser";
import { useObservable, observer, Memo } from "@legendapp/state/react";
import { observe } from "@legendapp/state";
import Confetti from "react-confetti";

const Sketcher = dynamic(() => import("~/components/sketcher/editor"), {
  ssr: false,
  loading: () => <p>Loading...</p>,
});

const PracticeCard = ({
  question,
  indigoServiceApiPath,
  indigoServicePublicUrl,
}: {
  question: Question;
  indigoServiceApiPath: string;
  indigoServicePublicUrl: string;
}) => {
  const answerForm = useForm<z.infer<typeof AnswerSchema>>({
    resolver: zodResolver(AnswerSchema),
    defaultValues: {
      answer: "",
    },
  });
  const wrongCount$ = useObservable<number>(0);
  const { toast } = useToast();
  const router = useRouter();

  function onSubmit(values: z.infer<typeof AnswerSchema>) {
    if (values.answer === question.answer) {
      toast({
        title: "Correct Answer!",
        description: "You got it right!",
        action: <Confetti numberOfPieces={150} opacity={0.7} />,
      });
    } else if (wrongCount$.get() >= 4) {
      // eslint-disable-next-line
      window.ketcher.editor.clear();
      // eslint-disable-next-line
      window.ketcher.setMolecule(question.answer);
      toast({
        variant: "destructive",
        title: "You have reached the maximum number of attempts!",
        description: "Check the solution in the Editor",
      });
    } else {
      toast({
        title: "Wrong Answer!",
        description: "Try Again!",
      });
    }
    answerForm.reset();
  }

  return (
    <Card className="right-20 top-10 m-20">
      <CardHeader>
        <CardTitle className="text-3xl">{`Question ${question.number}`}</CardTitle>
        <CardDescription>Answer the following question</CardDescription>
      </CardHeader>
      <CardContent>
        {parse(question.question ?? "")}
        <Memo>
          {() => (
            <Form {...answerForm}>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (e.type === "submit") {
                    const submitEvent = e.nativeEvent as unknown as SubmitEvent;
                    const submitButton =
                      submitEvent.submitter as HTMLButtonElement;
                    if (submitButton?.name === "saveAnswerForm") {
                      // eslint-disable-next-line
                      window.ketcher // eslint-disable-next-line
                        .getSmiles() // eslint-disable-next-line
                        .then((smiles: string) => {
                          if (!smiles || smiles === "") {
                            answerForm.setValue("answer", "");
                            answerForm.setError(
                              "answer",
                              {
                                message: "Answer is required",
                              },
                              { shouldFocus: true },
                            );
                          } else {
                            answerForm.setValue("answer", smiles);
                            wrongCount$.set((prev) => prev + 1);
                            answerForm
                              .handleSubmit(onSubmit)()
                              .catch(() => {
                                console.log("error");
                              });
                          }
                        }) // eslint-disable-next-line
                        .catch(() => {
                          answerForm.setValue("answer", "");
                          answerForm.setError(
                            "answer",
                            {
                              message: "Answer is required",
                            },
                            { shouldFocus: true },
                          );
                        });
                    }
                  }
                }}
              >
                {/************Answer******** */}
                <FormField
                  control={answerForm.control}
                  name="answer"
                  render={() => (
                    <FormItem className="m-4 mt-8">
                      <FormLabel>Answer</FormLabel>
                      <FormControl>
                        <div className="w-12/13 m-10 flex h-[60svh] items-center justify-center rounded-md border-2">
                          <Sketcher
                            initialContent={""}
                            indigoServiceApiPath={indigoServiceApiPath}
                            indigoServicePublicUrl={indigoServicePublicUrl}
                          />
                        </div>
                      </FormControl>
                      <FormDescription>Type your answer here</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <CardFooter className="flex justify-end gap-4">
                  <Button
                    variant="outline"
                    onClick={() => router.push("/home")}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    name="saveAnswerForm"
                    hidden={wrongCount$.get() >= 4}
                  >
                    Submit
                  </Button>
                </CardFooter>
              </form>
            </Form>
          )}
        </Memo>
      </CardContent>
    </Card>
  );
};

export default observer(PracticeCard);
