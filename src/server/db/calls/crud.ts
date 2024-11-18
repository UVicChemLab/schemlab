"use server";

import { db } from "~/server/db";
import {
  type Set,
  type QuestionType,
  type Level,
  type SetSelect,
  type Question,
  organizations,
  questions,
  levels,
  types,
  sets,
  answers,
} from "~/server/db/schema";
import { between, max, min, sql, avg, count, eq, desc } from "drizzle-orm";
import { Visibility, type QuestionTime } from "~/lib/types";

/***********Question******* */

export const getQuestionById = async (id: number) => {
  return (await db.query.questions.findFirst({
    where: (questions, { eq }) => eq(questions.id, id),
  })) as Question;
};

export const getAllQuestions = async () => {
  return (await db.query.questions.findMany()) as Question[];
};

export const getAllQuestionsForUser = async (userId: string) => {
  return (await db
    .select({
      id: questions.id,
      number: questions.number,
      question: questions.question,
      answer: questions.answer,
      levelid: questions.levelid,
      setid: questions.setid,
      typeid: questions.typeid,
    })
    .from(questions)
    .where(eq(questions.createdBy, userId))) as Question[];
};

export const getLastQuestionInSet = async (setid: number) => {
  return (await db.query.questions.findFirst({
    where: (questions, { eq }) => eq(questions.setid, setid),
    orderBy: (questions, { desc }) => desc(questions.number),
  })) as Question;
};

export const createQuestion = async (
  number: number,
  question: string,
  answer: string,
  levelid: number,
  setid: number,
  typeid: number,
  userId: string,
  time?: QuestionTime,
) => {
  try {
    const res = await db
      .insert(questions)
      .values({
        number,
        question,
        answer,
        levelid,
        setid,
        typeid,
        createdBy: userId,
        time,
      })
      .returning();
    if (res[0]) {
      return {
        success: true,
        message: `Question ${number} Created Successfully`,
        question: res[0] as Question,
      };
    } else {
      const qExist = await db.query.questions.findFirst({
        where: (questions, { eq, and }) =>
          and(eq(questions.setid, setid), eq(questions.number, number)),
      });

      if (qExist) {
        return {
          success: false,
          message: `Question ${number} already exist`,
        };
      } else {
        return {
          success: false,
          message: `Error Creating Question ${number}!`,
        };
      }
    }
  } catch (error) {
    const qExist = await db.query.questions.findFirst({
      where: (questions, { eq, and }) =>
        and(eq(questions.setid, setid), eq(questions.number, number)),
    });

    if (qExist) {
      return {
        success: false,
        message: `Question ${number} already exist`,
      };
    } else {
      return {
        success: false,
        message: `Error Creating Question ${number}!`,
      };
    }
  }
};

export const updateQuestion = async (
  id: number,
  number: number,
  question: string,
  answer: string,
  levelid: number,
  setid: number,
  typeid: number,
  time?: QuestionTime,
) => {
  try {
    const res = await db
      .update(questions)
      .set({ number, question, answer, levelid, setid, typeid, time })
      .where(eq(questions.id, id))
      .returning();

    if (res[0]) {
      return {
        success: true,
        message: `Question ${number} Updated Successfully`,
        set: res[0] as Question,
      };
    } else {
      return {
        success: false,
        message: `Error Updating Question ${number}!`,
      };
    }
  } catch (error) {
    return {
      success: false,
      message: `Error Updating Question ${number}! ` + error,
    };
  }
};

export const deleteQuestion = async (id: number) => {
  try {
    const res = await db
      .delete(questions)
      .where(eq(questions.id, id))
      .returning();
    if (res[0]) {
      return {
        success: true,
        message: `Question ${res[0].number} Deleted Successfully`,
        set: res[0] as Question,
      };
    } else {
      return {
        success: false,
        message: `Question with id: ${id} not found!`,
      };
    }
  } catch (error) {
    return {
      success: false,
      message: `Error Deleting Question with id: ${id}! ` + error,
    };
  }
};

/************Set******* */
export const getAllSets = async () => {
  return (await db.query.sets.findMany()) as SetSelect[];
};

export const getAllSetsForUser = async (userId: string) => {
  return (await db
    .select({
      id: sets.id,
      name: sets.name,
      desc: sets.desc,
      time: sets.time,
      visibility: sets.visibility,
      createdBy: sets.createdBy,
      organizationId: sets.organizationId,
    })
    .from(sets)
    .where(eq(sets.createdBy, userId))) as SetSelect[];
};

export const getSetsByOrgUniqueName = async (orgUniqueName: string) => {
  return (await db
    .select({
      id: sets.id,
      name: sets.name,
      desc: sets.desc,
      time: sets.time,
      visibility: sets.visibility,
      createdBy: sets.createdBy,
    })
    .from(sets)
    .innerJoin(organizations, eq(organizations.id, sets.organizationId))
    .where(eq(organizations.uniqueName, orgUniqueName))) as SetSelect[];
};

export const getSetsByOrgId = async (orgId: number) => {
  return (await db.query.sets.findMany({
    where: (sets, { eq }) => eq(sets.organizationId, orgId),
  })) as SetSelect[];
};

export const createSet = async (
  name: string,
  organizationId: number,
  visibility: Visibility,
  userId: string,
  desc?: string,
  time?: QuestionTime,
) => {
  try {
    const res = await db
      .insert(sets)
      .values({
        name,
        desc,
        time,
        organizationId,
        visibility,
        createdBy: userId,
      })
      .returning();

    if (res[0]) {
      return {
        success: true,
        message: `Question Set ${name} Created Successfully`,
        set: res[0] as Set,
      };
    } else {
      const setExist = await db.query.sets.findFirst({
        where: (sets, { eq, and }) =>
          and(eq(sets.organizationId, organizationId), eq(sets.name, name)),
      });

      if (setExist) {
        return {
          success: false,
          message: `Question Set ${name} already exist`,
        };
      } else {
        return {
          success: false,
          message: `Error Creating Question Set ${name}!`,
        };
      }
    }
  } catch (error) {
    const setExist = await db.query.sets.findFirst({
      where: (sets, { eq, and }) =>
        and(eq(sets.organizationId, organizationId), eq(sets.name, name)),
    });

    if (setExist) {
      return {
        success: false,
        message: `Question Set ${name} already exist ` + error,
      };
    } else {
      return {
        success: false,
        message: `Error Creating Question Set ${name}! ` + error,
      };
    }
  }
};

export const updateSet = async (
  id: number,
  name: string,
  desc?: string,
  time?: QuestionTime,
  visibility?: Visibility,
  organizationId?: number,
) => {
  try {
    const res = await db
      .update(sets)
      .set({ name, desc, time, visibility, organizationId })
      .where(eq(sets.id, id))
      .returning();

    if (res[0]) {
      return {
        success: true,
        message: `Question Set ${name} Updated Successfully`,
        set: res[0] as Set,
      };
    } else {
      return {
        success: false,
        message: `Error Updating Question Set ${name}!`,
      };
    }
  } catch (error) {
    return {
      success: false,
      message: `Error Updating Question Set ${name}! ` + error,
    };
  }
};

export const deleteSet = async (id: number) => {
  try {
    const res = await db.delete(sets).where(eq(sets.id, id)).returning();
    if (res[0]) {
      return {
        success: true,
        message: `Question Set ${res[0].name} Deleted Successfully`,
        set: res[0] as Set,
      };
    } else {
      return {
        success: false,
        message: `Question Set with id: ${id} not found!`,
      };
    }
  } catch (error) {
    return {
      success: false,
      message: `Error Deleting Question Set with id: ${id}! ` + error,
    };
  }
};

/***********Type************ */

export const getAllTypes = async () => {
  return (await db.query.types.findMany()) as QuestionType[];
};

export const getAllTypesForUser = async (userId: string) => {
  return (await db
    .select({
      id: types.id,
      name: types.name,
      desc: types.desc,
      visibility: types.visibility,
      createdBy: types.createdBy,
      organizationId: types.organizationId,
    })
    .from(types)
    .where(eq(types.createdBy, userId))) as QuestionType[];
};

export const createType = async (
  name: string,
  organizationId: number,
  visibility: Visibility,
  userId: string,
  desc?: string,
) => {
  try {
    const res = await db
      .insert(types)
      .values({
        name,
        desc,
        organizationId,
        visibility,
        createdBy: userId,
      })
      .returning();

    if (res[0]) {
      return {
        success: true,
        message: `Question Type ${name} Created Successfully`,
        type: res[0] as QuestionType,
      };
    } else {
      const typeExist = await db.query.types.findFirst({
        where: (types, { eq, and }) =>
          and(eq(types.organizationId, organizationId), eq(types.name, name)),
      });

      if (typeExist) {
        return {
          success: false,
          message: `Question Type ${name} already exist`,
        };
      } else {
        return {
          success: false,
          message: `Error Creating Question Type ${name}!`,
        };
      }
    }
  } catch (error) {
    const typeExist = await db.query.types.findFirst({
      where: (types, { eq, and }) =>
        and(eq(types.organizationId, organizationId), eq(types.name, name)),
    });

    if (typeExist) {
      return {
        success: false,
        message: `Question Type ${name} already exist` + error,
      };
    } else {
      return {
        success: false,
        message: `Error Creating Question Type ${name}!` + error,
      };
    }
  }
};

export const updateType = async (
  id: number,
  name: string,
  desc?: string,
  visibility?: Visibility,
  organizationId?: number,
) => {
  try {
    const res = await db
      .update(types)
      .set({ name, desc, visibility, organizationId })
      .where(eq(types.id, id))
      .returning();

    if (res[0]) {
      return {
        success: true,
        message: `Question Type ${name} Updated Successfully`,
        type: res[0] as QuestionType,
      };
    } else {
      return {
        success: false,
        message: `Error Updating Question Type ${name}!`,
      };
    }
  } catch (error) {
    return {
      success: false,
      message: `Error Updating Question Type ${name}!` + error,
    };
  }
};

export const deleteType = async (id: number) => {
  try {
    const res = await db.delete(types).where(eq(types.id, id)).returning();
    if (res[0]) {
      return {
        success: true,
        message: `Question type ${res[0].name} Deleted Successfully`,
        type: res[0] as QuestionType,
      };
    } else {
      return {
        success: false,
        message: `Question Type with id: ${id} not found!`,
      };
    }
  } catch (error) {
    return {
      success: false,
      message: `Error Deleting Question Type with id: ${id}! ` + error,
    };
  }
};

/***********Level************ */

export const getAllLevels = async () => {
  return (await db.query.levels.findMany()) as Level[];
};

export const getAllLevelsForUser = async (userId: string) => {
  return (await db
    .select({
      id: levels.id,
      name: levels.name,
      desc: levels.desc,
      visibility: levels.visibility,
      createdBy: levels.createdBy,
      organizationId: levels.organizationId,
    })
    .from(levels)
    .where(eq(levels.createdBy, userId))) as Level[];
};

export const createLevel = async (
  name: string,
  organizationId: number,
  visibility: Visibility,
  userId: string,
  desc?: string,
) => {
  try {
    const res = await db
      .insert(levels)
      .values({
        name,
        desc,
        organizationId,
        visibility,
        createdBy: userId,
      })
      .returning();

    if (res[0]) {
      return {
        success: true,
        message: `Level ${name} Created Successfully`,
        level: res[0] as Level,
      };
    } else {
      const levelExist = await db.query.levels.findFirst({
        where: (levels, { eq, and }) =>
          and(eq(levels.organizationId, organizationId), eq(levels.name, name)),
      });

      if (levelExist) {
        return {
          success: false,
          message: `Level ${name} already exist`,
        };
      } else {
        return {
          success: false,
          message: `Error Creating Level ${name}!`,
        };
      }
    }
  } catch (error) {
    const levelExist = await db.query.levels.findFirst({
      where: (levels, { eq, and }) =>
        and(eq(levels.organizationId, organizationId), eq(levels.name, name)),
    });

    if (levelExist) {
      return {
        success: false,
        message: `Level ${name} already exist` + error,
      };
    } else {
      return {
        success: false,
        message: `Error Creating Level ${name}!` + error,
      };
    }
  }
};

export const updateLevel = async (
  id: number,
  name: string,
  desc?: string,
  visibility?: Visibility,
  organizationId?: number,
) => {
  try {
    const res = await db
      .update(levels)
      .set({ name, desc, visibility, organizationId })
      .where(eq(levels.id, id))
      .returning();

    if (res[0]) {
      return {
        success: true,
        message: `Level ${name} Updated Successfully`,
        level: res[0] as Level,
      };
    } else {
      return {
        success: false,
        message: `Error Updating Level ${name}!`,
      };
    }
  } catch (error) {
    return {
      success: false,
      message: `Error Updating Level ${name}!` + error,
    };
  }
};

export const deleteLevel = async (id: number) => {
  try {
    const res = await db.delete(levels).where(eq(levels.id, id)).returning();
    if (res[0]) {
      return {
        success: true,
        message: `Level ${res[0].name} Deleted Successfully`,
        level: res[0] as Level,
      };
    } else {
      return {
        success: false,
        message: `Level with id: ${id} not found!`,
      };
    }
  } catch (error) {
    return {
      success: false,
      message: `Error Deleting Level with id: ${id}! ` + error,
    };
  }
};
