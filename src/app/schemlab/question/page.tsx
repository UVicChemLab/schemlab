import React from "react";
import QuestionCard from "~/components/question/QuestionCard";
import {
  getAllSetsForUser,
  getAllSets,
  getAllTypesForUser,
  getAllTypes,
  getAllLevelsForUser,
  getAllLevels,
} from "~/server/db/calls/crud";
import {
  type Organization,
  type Set,
  type QuestionType,
  type Level,
} from "~/server/db/schema";
import { Role } from "~/lib/types";
import { getCurrentUser } from "~/actions/profile";
import { env } from "~/env";

const QuestionPage = async () => {
  const user = await getCurrentUser();
  if (user) {
    let userSets: Set[] = [];
    let userQuestionTypes: QuestionType[] = [];
    let userLevels: Level[] = [];
    if (user.currentOrgRole.roleName === Role.ADMIN) {
      userSets = await getAllSets();
      userQuestionTypes = await getAllTypes();
      userLevels = await getAllLevels();
    } else {
      userSets = await getAllSetsForUser(user.id);
      userQuestionTypes = await getAllTypesForUser(user.id);
      userLevels = await getAllLevelsForUser(user.id);
    }
    const sketcherPath = env.PUBLIC_URL + env.REACT_APP_API_PATH;
    return (
      <div>
        <QuestionCard
          levels={userLevels}
          sets={userSets}
          qTypes={userQuestionTypes}
          sketcherPath={sketcherPath}
        />
      </div>
    );
  }
};

export default QuestionPage;
