"use server";

import { db } from "~/server/db";
import { questions, levels, types, sets, answers } from "~/server/db/schema";
import { between, max, min, sql, avg, count, eq } from "drizzle-orm";
import { Role, Visibility } from "~/server/db/schema";

export const getSets = async () => {
  return await db.select({ name: sets.name }).from(sets);
};

export const createSet = async (name: string, desc?: string) => {
  await db.insert(sets).values({ name, desc });
};
export const getLevels = async () => {
  return await db.select({ name: levels.name }).from(levels);
};

export const createLevel = async (
  name: string,
  desc: string,
  organizationId: number,
  visibility: Visibility,
  userId: string,
) => {
  await db
    .insert(levels)
    .values({ name, desc, organizationId, visibility, createdBy: userId });
};

export const getTypes = async () => {
  return await db.select({ name: types.name }).from(types);
};

export const createType = async (name: string, desc?: string) => {
  await db.insert(types).values({ name, desc });
};
