import { getAllQuestions } from "~/server/db/calls/crud";
import QuestionGrid from "~/components/question/QuestionGrid";

export default async function OrgHomePage() {
  const userQuestions = await getAllQuestions();
  return (
    <main className="p-[2rem]">
      <QuestionGrid questions={userQuestions} />
    </main>
  );
}
