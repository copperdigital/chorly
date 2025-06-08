import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const households = pgTable("households", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
});

export const people = pgTable("people", {
  id: serial("id").primaryKey(),
  householdId: integer("household_id").notNull(),
  nickname: text("nickname").notNull(),
  pin: text("pin").notNull(), // 4-digit PIN
  isAdmin: boolean("is_admin").notNull().default(false),
  currentStreak: integer("current_streak").notNull().default(0),
  totalPoints: integer("total_points").notNull().default(0),
  avatar: text("avatar").notNull().default("default"), // avatar identifier
});

export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  householdId: integer("household_id").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  estimatedMinutes: integer("estimated_minutes").notNull().default(5),
  points: integer("points").notNull().default(10),
  isRecurring: boolean("is_recurring").notNull().default(false),
  recurrenceType: text("recurrence_type"), // 'daily', 'weekly', 'monthly', 'yearly', 'custom'
  recurrenceInterval: integer("recurrence_interval").default(1), // for custom intervals
  customDays: integer("custom_days"), // for "every X days" when recurrenceType is "custom"
  dueDate: timestamp("due_date"), // default due date for this task
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  assignedTo: integer("assigned_to").notNull(), // primary person
  secondaryAssignees: text("secondary_assignees").array().default([]), // array of person IDs as strings
  isActive: boolean("is_active").notNull().default(true),
  dueDateType: text("due_date_type").notNull().default("on_date"), // "on_date" or "by_date"
  priority: integer("priority").notNull().default(1), // 1=low, 2=medium, 3=high
});

export const taskInstances = pgTable("task_instances", {
  id: serial("id").primaryKey(),
  taskId: integer("task_id").notNull(),
  assignedTo: integer("assigned_to").notNull(),
  isSecondary: boolean("is_secondary").notNull().default(false),
  dueDate: timestamp("due_date").notNull(),
  completedAt: timestamp("completed_at"),
  isCompleted: boolean("is_completed").notNull().default(false),
  pointsEarned: integer("points_earned").default(0),
  isOverdue: boolean("is_overdue").notNull().default(false),
  currentPriority: integer("current_priority").notNull().default(1), // calculated priority based on due date
});

export const blackMarks = pgTable("black_marks", {
  id: serial("id").primaryKey(),
  personId: integer("person_id").notNull(),
  taskInstanceId: integer("task_instance_id").notNull(),
  missedDate: timestamp("missed_date").notNull(),
});

export const rewards = pgTable("rewards", {
  id: serial("id").primaryKey(),
  householdId: integer("household_id").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  pointsCost: integer("points_cost").notNull(),
  isAvailable: boolean("is_available").notNull().default(true),
});

export const rewardClaims = pgTable("reward_claims", {
  id: serial("id").primaryKey(),
  rewardId: integer("reward_id").notNull(),
  personId: integer("person_id").notNull(),
  claimedAt: timestamp("claimed_at").notNull(),
  pointsSpent: integer("points_spent").notNull(),
});

// Insert schemas
export const insertHouseholdSchema = createInsertSchema(households).omit({ id: true });
export const insertPersonSchema = createInsertSchema(people).omit({ id: true });
export const insertTaskSchema = createInsertSchema(tasks).omit({ id: true });
export const insertTaskInstanceSchema = createInsertSchema(taskInstances).omit({ id: true });
export const insertBlackMarkSchema = createInsertSchema(blackMarks).omit({ id: true });
export const insertRewardSchema = createInsertSchema(rewards).omit({ id: true });
export const insertRewardClaimSchema = createInsertSchema(rewardClaims).omit({ id: true });

// Types
export type Household = typeof households.$inferSelect;
export type Person = typeof people.$inferSelect;
export type Task = typeof tasks.$inferSelect;
export type TaskInstance = typeof taskInstances.$inferSelect;
export type BlackMark = typeof blackMarks.$inferSelect;
export type Reward = typeof rewards.$inferSelect;
export type RewardClaim = typeof rewardClaims.$inferSelect;

export type InsertHousehold = z.infer<typeof insertHouseholdSchema>;
export type InsertPerson = z.infer<typeof insertPersonSchema>;
export type InsertTask = z.infer<typeof insertTaskSchema>;
export type InsertTaskInstance = z.infer<typeof insertTaskInstanceSchema>;
export type InsertBlackMark = z.infer<typeof insertBlackMarkSchema>;
export type InsertReward = z.infer<typeof insertRewardSchema>;
export type InsertRewardClaim = z.infer<typeof insertRewardClaimSchema>;

// Auth schemas
export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const profileSelectSchema = z.object({
  personId: z.number(),
  pin: z.string().length(4),
});

export const adminPinSchema = z.object({
  pin: z.string().length(4),
});
