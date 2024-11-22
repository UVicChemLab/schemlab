import { redirect } from "next/navigation";
import { auth } from "~/server/auth";
import { getAllQuestions } from "~/server/db/calls/crud";
import QuestionGrid from "~/components/question/QuestionGrid";

export default async function HomePage() {
  const session = await auth();
  if (session && session.user) redirect("/chempuzz/home");
  const userQuestions = await getAllQuestions();
  return (
    <main className="p-[2rem]">
      <QuestionGrid questions={userQuestions} />
    </main>
  );
}
