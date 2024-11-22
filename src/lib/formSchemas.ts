import * as z from "zod";
import { appName, Role, Visibility } from "~/lib/types";

export const LoginSchema = z.object({
  email: z.string().email({
    message: "Email is required",
  }),
  password: z.string().min(6, {
    message: "Password is required",
  }),
  code: z.optional(z.string()),
});

export const RegisterSchema = z.object({
  email: z.string().email({
    message: "Email is required",
  }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters" })
    .max(20, { message: "Password cannot exceed 20 characters" })
    .regex(
      /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
      {
        message:
          "Password must contain at least one uppercase letter, one lowercase letter, one digit, and one special character",
      },
    ),
  name: z.string().min(1, {
    message: "Name is required",
  }),
  organization: z.string().default(appName),
  role: z.nativeEnum(Role).default(Role.STUDENT),
});

export const ResetSchema = z.object({
  email: z.string().email({
    message: "Email is required",
  }),
});

export const NewPasswordSchema = z.object({
  password: z.string().min(6, {
    message: "Minimum 6 characters required!",
  }),
});

export const ProfileSchema = z
  .object({
    name: z.optional(z.string()),
    isTwoFactorEnabled: z.optional(z.boolean()),
    email: z.optional(z.string().email()),
    password: z.optional(z.string().min(6)),
    newPassword: z.optional(z.string().min(6)),
    organization: z.optional(z.string()),
  })
  .refine(
    (data) => {
      if (data.password && !data.newPassword) {
        return false;
      }

      return true;
    },
    {
      message: "New password is required!",
      path: ["newPassword"],
    },
  )
  .refine(
    (data) => {
      if (data.newPassword && !data.password) {
        return false;
      }

      return true;
    },
    {
      message: "Password is required!",
      path: ["password"],
    },
  );

export const OrganizationSchema = z.object({
  name: z.string().min(1, {
    message: "Name is required",
  }),
  uniqueName: z.string().min(1, {
    message: "Unique name is required",
  }),
  description: z.optional(z.string()),
  link: z.optional(z.string()),
  image: z.optional(z.string()),
});

export const SetSchema = z.object({
  id: z.number(),
  name: z.string().min(1, {
    message: "Name is required",
  }),
  desc: z.optional(z.string()),
  time: z.object({
    hours: z.number().default(0),
    minutes: z.number().default(0),
    seconds: z.number().default(0),
  }),
  visibility: z.nativeEnum(Visibility).default(Visibility.PUBLIC),
  organization: z.string().min(1, {
    message: "Organization is required",
  }),
});

export const QuestionTypeSchema = z.object({
  id: z.number(),
  name: z.string().min(1, {
    message: "Name is required",
  }),
  desc: z.optional(z.string()),
  visibility: z.nativeEnum(Visibility).default(Visibility.PUBLIC),
  organization: z.string().min(1, {
    message: "Organization is required",
  }),
});

export const LevelSchema = z.object({
  id: z.number(),
  name: z.string().min(1, {
    message: "Name is required",
  }),
  desc: z.optional(z.string()),
  visibility: z.nativeEnum(Visibility).default(Visibility.PUBLIC),
  organization: z.string().min(1, {
    message: "Organization is required",
  }),
});

export const QuestionSchema = z.object({
  number: z.optional(z.string()),
  question: z.string().min(1, {
    message: "Question is required",
  }),
  answer: z.string().min(1, {
    message: "Answer is required",
  }),
  level: z.string().min(1, {
    message: "Level is required",
  }),
  type: z.string().min(1, {
    message: "Question Type is required",
  }),
  set: z.string().min(1, {
    message: "Question Set is required",
  }),
});

export const AnswerSchema = z.object({
  answer: z.string().min(1, {
    message: "Answer is required",
  }),
});
