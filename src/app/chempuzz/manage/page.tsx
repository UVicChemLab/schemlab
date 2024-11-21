import ManageOrg from "~/components/organization/ManageOrg";
import {
  getAllUserOrganizations,
  getAllOrganizations,
} from "~/server/db/calls/auth";
import {
  getAllSetsForUser,
  getAllSets,
  getAllTypesForUser,
  getAllTypes,
  getAllLevelsForUser,
  getAllLevels,
  getAllQuestionsForUser,
  getAllQuestions,
} from "~/server/db/calls/crud";
import ManageSet from "~/components/set/ManageSet";
import ManageType from "~/components/type/ManageType";
import ManageLevel from "~/components/level/ManageLevel";
import ManageQuestion from "~/components/question/ManageQuestion";
import { getCurrentUser } from "~/actions/profile";
import {
  type Organization,
  type Set,
  type QuestionType,
  type Level,
  type Question,
} from "~/server/db/schema";
import { Role } from "~/lib/types";

const ManageOrgPage = async () => {
  const user = await getCurrentUser();
  if (user) {
    let userOrgs: Organization[] = [];
    let userSets: Set[] = [];
    let userQuestionTypes: QuestionType[] = [];
    let userLevels: Level[] = [];
    let userQuestions: Question[] = [];
    if (user.currentOrgRole.roleName === Role.ADMIN) {
      userOrgs = await getAllOrganizations();
      userSets = await getAllSets();
      userQuestionTypes = await getAllTypes();
      userLevels = await getAllLevels();
      userQuestions = await getAllQuestions();
    } else {
      userOrgs = await getAllUserOrganizations(user.id);
      userSets = await getAllSetsForUser(user.id);
      userQuestionTypes = await getAllTypesForUser(user.id);
      userLevels = await getAllLevelsForUser(user.id);
      userQuestions = await getAllQuestionsForUser(user.id);
    }
    return (
      <div>
        <ManageOrg id={"manage-orgs"} userOrgs={userOrgs} />
        <ManageSet id={"manage-sets"} userSets={userSets} userOrgs={userOrgs} />
        <ManageType
          id={"manage-qtypes"}
          userQuestionTypes={userQuestionTypes}
          userOrgs={userOrgs}
        />
        <ManageLevel
          id={"manage-levels"}
          userLevels={userLevels}
          userOrgs={userOrgs}
        />
        <ManageQuestion id={"manage-questions"} userQuestions={userQuestions} />
      </div>
    );
  }
};

export default ManageOrgPage;
