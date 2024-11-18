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
import {
  type Organization,
  type Set,
  type QuestionType,
  type Level,
  type Question,
} from "~/server/db/schema";
import { Role } from "~/lib/types";
import { getCurrentUser } from "~/actions/profile";
import { env } from "~/env";

const QuestionPage = async ({
  searchParams,
}: {
  searchParams: { [key: string]: string };
}) => {
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
    if (searchParams.question) {
      questionDets = await getQuestionById(parseInt(searchParams.question));
    }
    const sketcherPath = env.PUBLIC_URL + env.REACT_APP_API_PATH;
    return (
      <div>
        <QuestionCard
          levels={userLevels}
          sets={userSets}
          qTypes={userQuestionTypes}
          sketcherPath={sketcherPath}
          question={searchParams.question ? questionDets : undefined}
        />
      </div>
    );
  }
};

export default QuestionPage;
