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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { useToast } from "~/hooks/use-toast";
import { Button } from "../ui/button";
import type { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AnswerSchema } from "~/lib/formSchemas";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import parse from "html-react-parser";
import {
  useObservable,
  observer,
  Memo,
  useEffectOnce,
} from "@legendapp/state/react";
import Confetti from "react-confetti";
import Image from "next/image";
import type { Ketcher } from "ketcher-core";

const Sketcher = dynamic(() => import("~/components/sketcher/editor"), {
  ssr: false,
  loading: () => <p>Loading...</p>,
});

const PracticeCard = ({ question }: { question: Question }) => {
  const answerForm = useForm<z.infer<typeof AnswerSchema>>({
    resolver: zodResolver(AnswerSchema),
    defaultValues: {
      answer: "",
    },
  });
  const wrongCount$ = useObservable<number>(0);
  const currentImage$ = useObservable("");
  const ketcher$ = useObservable<Ketcher | null>(null);
  const { toast } = useToast();
  const router = useRouter();

  useEffectOnce(() => {
    const images = document.querySelectorAll(".enlargeable-image");

    const handleImageClick = (event: Event) => {
      if (event.target instanceof HTMLImageElement) {
        currentImage$.set(event.target.src);
      }
    };

    images.forEach((img) => img.addEventListener("click", handleImageClick));

    return () => {
      images.forEach((img) =>
        img.removeEventListener("click", handleImageClick),
      );
    };
  });

  function onSubmit(values: z.infer<typeof AnswerSchema>) {
    if (values.answer === question.answer) {
      toast({
        title: "Correct Answer!",
        description: "You got it right!",
        action: <Confetti numberOfPieces={150} opacity={0.7} />,
      });
    } else if (wrongCount$.get() >= 4) {
      ketcher$.get()?.editor.clear();
      ketcher$.get()?.setMolecule(question.answer ?? "");
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
            <Dialog
              open={!!currentImage$.peek()}
              onOpenChange={(open) => !open && currentImage$.set("")}
            >
              <DialogTrigger asChild>
                <div />
              </DialogTrigger>
              <DialogContent className="w-full max-w-screen-2xl p-4">
                <DialogHeader>
                  <DialogTitle>Enlarged Image</DialogTitle>
                </DialogHeader>
                {currentImage$.get() && (
                  <Image
                    src={currentImage$.get()}
                    alt="Enlarged"
                    width={1000}
                    height={1000}
                    className="h-auto w-full"
                    style={{ objectFit: "contain" }}
                  />
                )}
              </DialogContent>
            </Dialog>
          )}
        </Memo>
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
                      ketcher$
                        .get()
                        ?.getSmiles()
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
                        })
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
                          <Sketcher initialContent={""} ketcher$={ketcher$} />
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
