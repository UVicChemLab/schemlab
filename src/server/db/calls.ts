"use server";

import { db } from "~/server/db";
import { between, max, min, sql, avg, count } from "drizzle-orm";
import { questions, levels, types, sets, answers } from "~/server/db/schema";

export const getSets = async () => {
  return await db.select({ name: sets.name }).from(sets);
};

export const createSet = async (name: string, desc?: string) => {
  await db.insert(sets).values({ name, desc });
};
export const getLevels = async () => {
  return await db.select({ name: levels.name }).from(levels);
};

export const createLevel = async (name: string, desc?: string) => {
  await db.insert(levels).values({ name, desc });
};

export const getTypes = async () => {
  return await db.select({ name: types.name }).from(types);
};

export const createType = async (name: string, desc?: string) => {
  await db.insert(types).values({ name, desc });
};
