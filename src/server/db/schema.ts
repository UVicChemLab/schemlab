// Example model schema from the Drizzle docs
// https://orm.drizzle.team/docs/sql-schema-declaration

import { sql } from "drizzle-orm";
import {
  index,
  integer,
  pgTableCreator,
  serial,
  smallserial,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

/**
 * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
 * database instance for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */
export const createTable = pgTableCreator((name) => `${name}`);

export const questions = createTable(
  "question",
  {
    id: serial("queston_id").primaryKey(),
    number: integer("question_number").notNull(),
    question: varchar("question", { length: 1024 }).notNull(),
    levelid: integer("level_id")
      .references(() => levels.id)
      .notNull(),
    typeid: integer("type_id")
      .references(() => types.id)
      .notNull(),
    answerid: integer("answer_id")
      .references(() => answers.id)
      .notNull(),
    setid: integer("set_id")
      .references(() => sets.id)
      .notNull(),

    createdAt: timestamp("created_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).$onUpdate(
      () => new Date(),
    ),
  },
  (example) => ({
    nameIndex: index("queston_idx").on(example.id),
  }),
);

export const sets = createTable(
  "set",
  {
    id: serial("set_id").primaryKey(),
    name: varchar("set_name", { length: 50 }).notNull().unique(),
    desc: varchar("set_desc", { length: 1024 }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).$onUpdate(
      () => new Date(),
    ),
  },
  (example) => ({
    nameIndex: index("set_idx").on(example.id),
  }),
);

export const types = createTable(
  "type",
  {
    id: serial("type_id").primaryKey(),
    name: varchar("type_name", { length: 50 }).notNull().unique(),
    desc: varchar("type_desc", { length: 1024 }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).$onUpdate(
      () => new Date(),
    ),
  },
  (example) => ({
    nameIndex: index("type_idx").on(example.id),
  }),
);

export const levels = createTable(
  "level",
  {
    id: serial("level_id").primaryKey(),
    name: varchar("level_name", { length: 50 }).notNull().unique(),
    desc: varchar("level_desc", { length: 1024 }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).$onUpdate(
      () => new Date(),
    ),
  },
  (example) => ({
    nameIndex: index("level_idx").on(example.id),
  }),
);

export const answers = createTable(
  "answer",
  {
    id: serial("answer_id").primaryKey(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).$onUpdate(
      () => new Date(),
    ),
  },
  (example) => ({
    nameIndex: index("answer_idx").on(example.id),
  }),
);
