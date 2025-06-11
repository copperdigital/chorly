import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const households = pgTable("households", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").unique().notNull(),
  passwordHash: text("password_hash").notNull(),
  adminPin: text("admin_pin").notNull().default("1234"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const familyMembers = pgTable("family_members", {
  id: serial("id").primaryKey(),
  householdId: integer("household_id").references(() => households.id).notNull(),
  name: text("name").notNull(),
  role: text("role").notNull(), // 'parent' | 'child'
  color: text("color").notNull(), // hex color code
  age: integer("age"),
  currentStreak: integer("current_streak").default(0).notNull(),
  totalPoints: integer("total_points").default(0).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  householdId: integer("household_id").references(() => households.id).notNull(),
  name: text("name").notNull(),
  description: text("description"),
  points: integer("points").notNull(),
  estimatedMinutes: integer("estimated_minutes").notNull(),
  scheduleType: text("schedule_type").notNull(), // 'daily' | 'weekly' | 'monthly' | 'custom'
  scheduleValue: integer("schedule_value"), // for custom: every X days

  startDate: timestamp("start_date").defaultNow().notNull(), // When task starts (for recurring tasks)
  endDate: timestamp("end_date"),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const taskAssignments = pgTable("task_assignments", {
  id: serial("id").primaryKey(),
  taskId: integer("task_id").references(() => tasks.id).notNull(),
  memberId: integer("member_id").references(() => familyMembers.id).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const taskCompletions = pgTable("task_completions", {
  id: serial("id").primaryKey(),
  taskId: integer("task_id").references(() => tasks.id).notNull(),
  memberId: integer("member_id").references(() => familyMembers.id).notNull(),
  completedAt: timestamp("completed_at").defaultNow().notNull(),
  pointsEarned: integer("points_earned").notNull(),
  dueDate: timestamp("due_date").notNull(),
});

export const achievements = pgTable("achievements", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  icon: text("icon").notNull(),
  condition: jsonb("condition").notNull(), // JSON describing achievement condition
  points: integer("points").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
});

export const memberAchievements = pgTable("member_achievements", {
  id: serial("id").primaryKey(),
  memberId: integer("member_id").references(() => familyMembers.id).notNull(),
  achievementId: integer("achievement_id").references(() => achievements.id).notNull(),
  earnedAt: timestamp("earned_at").defaultNow().notNull(),
});

export const rewards = pgTable("rewards", {
  id: serial("id").primaryKey(),
  householdId: integer("household_id").references(() => households.id).notNull(),
  name: text("name").notNull(),
  description: text("description"),
  pointsCost: integer("points_cost").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const rewardClaims = pgTable("reward_claims", {
  id: serial("id").primaryKey(),
  rewardId: integer("reward_id").references(() => rewards.id).notNull(),
  memberId: integer("member_id").references(() => familyMembers.id).notNull(),
  pointsSpent: integer("points_spent").notNull(),
  claimedAt: timestamp("claimed_at").defaultNow().notNull(),
  status: text("status").default("pending").notNull(), // 'pending' | 'approved' | 'completed'
});

// Insert schemas
export const insertHouseholdSchema = createInsertSchema(households).omit({
  id: true,
  createdAt: true,
}).extend({
  password: z.string().min(6, "Password must be at least 6 characters"),
}).omit({
  passwordHash: true,
});

export const insertFamilyMemberSchema = createInsertSchema(familyMembers).omit({
  id: true,
  isActive: true,
  createdAt: true,
});

export const insertTaskSchema = createInsertSchema(tasks).omit({
  id: true,
  isActive: true,
  createdAt: true,
});

export const insertTaskAssignmentSchema = createInsertSchema(taskAssignments).omit({
  id: true,
  createdAt: true,
});

export const insertTaskCompletionSchema = createInsertSchema(taskCompletions).omit({
  id: true,
  completedAt: true,
});

export const insertRewardSchema = createInsertSchema(rewards).omit({
  id: true,
  isActive: true,
  createdAt: true,
});

export const insertRewardClaimSchema = createInsertSchema(rewardClaims).omit({
  id: true,
  claimedAt: true,
  status: true,
});

// Types
export type Household = typeof households.$inferSelect;
export type InsertHousehold = z.infer<typeof insertHouseholdSchema>;

export type FamilyMember = typeof familyMembers.$inferSelect;
export type InsertFamilyMember = z.infer<typeof insertFamilyMemberSchema>;

export type Task = typeof tasks.$inferSelect;
export type InsertTask = z.infer<typeof insertTaskSchema>;

export type TaskAssignment = typeof taskAssignments.$inferSelect;
export type InsertTaskAssignment = z.infer<typeof insertTaskAssignmentSchema>;

export type TaskCompletion = typeof taskCompletions.$inferSelect;
export type InsertTaskCompletion = z.infer<typeof insertTaskCompletionSchema>;

export type Achievement = typeof achievements.$inferSelect;
export type MemberAchievement = typeof memberAchievements.$inferSelect;

export type Reward = typeof rewards.$inferSelect;
export type InsertReward = z.infer<typeof insertRewardSchema>;

export type RewardClaim = typeof rewardClaims.$inferSelect;
export type InsertRewardClaim = z.infer<typeof insertRewardClaimSchema>;

// Extended types for UI
export type FamilyMemberWithStats = FamilyMember & {
  tasksCompletedToday: number;
  tasksAssignedToday: number;
  pointsEarnedToday: number;
  progressPercentage: number;
};

export type TaskWithAssignees = Task & {
  assignees: FamilyMember[];
  isCompleted?: boolean;
  completedBy?: FamilyMember;
  completedAt?: Date;
  isOverdue?: boolean;
  daysOverdue?: number;
};

export type LeaderboardEntry = {
  member: FamilyMember;
  weeklyPoints: number;
  weeklyIncrease: number;
  rank: number;
};
