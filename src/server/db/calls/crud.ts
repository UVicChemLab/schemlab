"use server";

import { db } from "~/server/db";
import {
  type Set,
  type QuestionType,
  type Level,
  type SetSelect,
  organizations,
  questions,
  levels,
  types,
  sets,
  answers,
} from "~/server/db/schema";
import { between, max, min, sql, avg, count, eq } from "drizzle-orm";
import { Visibility, type QuestionTime } from "~/lib/types";
import { create } from "domain";

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
