import React from "react";
import QuestionCard from "~/components/question/QuestionCard";
import {
  getAllSetsForUser,
  getAllSets,
  getAllTypesForUser,
  getAllTypes,
  getAllLevelsForUser,
  getAllLevels,
  getQuestionById,
} from "~/server/db/calls/crud";
import type { Set, QuestionType, Level, Question } from "~/server/db/schema";
import { ExtendedUser, Role } from "~/lib/types";
import { getCurrentUser } from "~/actions/profile";
import { env } from "~/env";

type Params = Promise<{ question: string }>;

export async function generateMetadata({ params }: { params: Params }) {
  const { question } = await params;
}

const QuestionPage = async ({ searchParams }: { searchParams: Params }) => {
  const { question } = await searchParams;
  const user = await getCurrentUser();
  if (user) {
    let userSets: Set[] = [];
    let userQuestionTypes: QuestionType[] = [];
    let userLevels: Level[] = [];
    let questionDets: Question | undefined;
    if (user.currentOrgRole.roleName === Role.ADMIN) {
      userSets = await getAllSets();
      userQuestionTypes = await getAllTypes();
      userLevels = await getAllLevels();
    } else {
      userSets = await getAllSetsForUser(user.id);
      userQuestionTypes = await getAllTypesForUser(user.id);
      userLevels = await getAllLevelsForUser(user.id);
    }
    if (question) {
      questionDets = await getQuestionById(parseInt(question));
      return (
        <div>
          <QuestionCard
            levels={userLevels}
            sets={userSets}
            qTypes={userQuestionTypes}
            question={questionDets}
          />
        </div>
      );
    }
    return (
      <div>
        <QuestionCard
          levels={userLevels}
          sets={userSets}
          qTypes={userQuestionTypes}
        />
      </div>
    );
  }
};

export default QuestionPage;
