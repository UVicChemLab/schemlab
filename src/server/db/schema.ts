// Example model schema from the Drizzle docs
// https://orm.drizzle.team/docs/sql-schema-declaration

import { sql } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  primaryKey,
  serial,
  text,
  timestamp,
  unique,
  varchar,
} from "drizzle-orm/pg-core";
import type { AdapterAccountType } from "next-auth/adapters";

export enum Role {
  ADMIN = "admin",
  ORGADMIN = "org_admin",
  INSTRUCTOR = "instructor",
  STUDENT = "student",
}

export enum Visibility {
  PUBLIC = "public",
  ORGANIZATION = "organization",
  PRIVATE = "private",
}

export const roleEnum = pgEnum("name", [
  Role.ADMIN,
  Role.ORGADMIN,
  Role.INSTRUCTOR,
  Role.STUDENT,
]);

export const visibilityEnum = pgEnum("visibility", [
  Visibility.PUBLIC,
  Visibility.ORGANIZATION,
  Visibility.PRIVATE,
]);

export const users = pgTable("user", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name"),
  email: text("email").unique(),
  password: text("password"),
  emailVerified: timestamp("emailVerified", { mode: "date" }),
  image: text("image"),
  isTwoFactorEnabled: boolean("isTwoFactorEnabled").notNull().default(false),
  twoFactorTokenId: text("twoFactorTokenId").references(
    () => twoFactorTokens.id,
    { onDelete: "set null" },
  ),
});

export const accounts = pgTable(
  "account",
  {
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").$type<AdapterAccountType>().notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("providerAccountId").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (account) => [
    primaryKey({
      columns: [account.provider, account.providerAccountId],
    }),
  ],
);

export const verificationTokens = pgTable(
  "verificationToken",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (verificationToken) => [
    primaryKey({
      columns: [verificationToken.identifier, verificationToken.token],
    }),
  ],
);

export const passwordResetTokens = pgTable(
  "PasswordResetToken",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (passwordResetToken) => [
    primaryKey({
      columns: [passwordResetToken.identifier, passwordResetToken.token],
    }),
  ],
);

export const twoFactorTokens = pgTable(
  "TwoFactorToken",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (twoFactorToken) => [
    unique().on(twoFactorToken.identifier, twoFactorToken.token),
  ],
);

export const authenticators = pgTable(
  "authenticator",
  {
    credentialID: text("credentialID").notNull().unique(),
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    providerAccountId: text("providerAccountId").notNull(),
    credentialPublicKey: text("credentialPublicKey").notNull(),
    counter: integer("counter").notNull(),
    credentialDeviceType: text("credentialDeviceType").notNull(),
    credentialBackedUp: boolean("credentialBackedUp").notNull(),
    transports: text("transports"),
  },
  (authenticator) => [
    primaryKey({
      columns: [authenticator.userId, authenticator.credentialID],
    }),
  ],
);

export const organizations = pgTable("organization", {
  id: serial("organization_id").primaryKey(),
  uniqueName: text("unique_name").unique().notNull(),
  name: text("name").notNull(),
  desc: text("description"),
  link: text("link"),
  image: text("image"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  createdBy: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  updatedAt: timestamp("updated_at", { withTimezone: true }).$onUpdate(
    () => new Date(),
  ),
});

export const roles = pgTable("role", {
  id: serial("role_id").primaryKey(),
  name: roleEnum().notNull(),
  desc: text("description"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).$onUpdate(
    () => new Date(),
  ),
});

export const userOrganizationRoles = pgTable(
  "user_organization_role",
  {
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    roleId: integer("role_id")
      .notNull()
      .references(() => roles.id, { onDelete: "cascade" }),
    organizationId: integer("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).$onUpdate(
      () => new Date(),
    ),
  },
  (userOrganizationRole) => [
    primaryKey({
      columns: [
        userOrganizationRole.organizationId,
        userOrganizationRole.roleId,
      ],
    }),
  ],
);

export const questions = pgTable("question", {
  id: serial("queston_id").primaryKey(),
  number: integer("question_number").notNull(),
  question: varchar("question", { length: 1024 }).notNull(),
  levelid: integer("level_id")
    .references(() => levels.id, { onDelete: "cascade" })
    .notNull(),
  typeid: integer("type_id")
    .references(() => types.id, { onDelete: "cascade" })
    .notNull(),
  answerid: integer("answer_id")
    .references(() => answers.id, { onDelete: "cascade" })
    .notNull(),
  setid: integer("set_id")
    .references(() => sets.id, { onDelete: "cascade" })
    .notNull(),
  time: jsonb("question_time").notNull().default({
    hours: 0,
    minutes: 1,
    seconds: 0,
  }),
  createdBy: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).$onUpdate(
    () => new Date(),
  ),
});

export const sets = pgTable("set", {
  id: serial("set_id").primaryKey(),
  name: varchar("set_name", { length: 50 }).notNull().unique(),
  desc: varchar("set_desc", { length: 1024 }),
  time: jsonb("set_time").notNull().default({
    hours: 0,
    minutes: 0,
    seconds: 0,
  }),
  visibility: visibilityEnum().notNull(),
  organizationId: integer("organization_id")
    .references(() => organizations.id, { onDelete: "cascade" })
    .notNull(),
  createdBy: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).$onUpdate(
    () => new Date(),
  ),
});

export const types = pgTable("type", {
  id: serial("type_id").primaryKey(),
  name: varchar("type_name", { length: 50 }).notNull().unique(),
  desc: varchar("type_desc", { length: 1024 }),
  visibility: visibilityEnum().notNull(),
  organizationId: integer("organization_id")
    .references(() => organizations.id, { onDelete: "cascade" })
    .notNull(),
  createdBy: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).$onUpdate(
    () => new Date(),
  ),
});

export const levels = pgTable("level", {
  id: serial("level_id").primaryKey(),
  name: varchar("level_name", { length: 50 }).notNull().unique(),
  desc: varchar("level_desc", { length: 1024 }),
  visibility: visibilityEnum().notNull(),
  organizationId: integer("organization_id")
    .references(() => organizations.id, { onDelete: "cascade" })
    .notNull(),
  createdBy: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).$onUpdate(
    () => new Date(),
  ),
});

export const answers = pgTable("answer", {
  id: serial("answer_id").primaryKey(),
  createdBy: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).$onUpdate(
    () => new Date(),
  ),
});
