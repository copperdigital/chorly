import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { 
  households, 
  people, 
  tasks, 
  taskInstances, 
  blackMarks, 
  rewards, 
  rewardClaims,
  type Household,
  type Person,
  type Task,
  type TaskInstance,
  type BlackMark,
  type Reward,
  type RewardClaim,
  type InsertHousehold,
  type InsertPerson,
  type InsertTask,
  type InsertTaskInstance,
  type InsertBlackMark,
  type InsertReward,
  type InsertRewardClaim
} from "../shared/schema";
import { eq, and, gte, lte, desc } from "drizzle-orm";
import type { IStorage } from "./storage";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is required");
}

const sql = neon(process.env.DATABASE_URL);
export const db = drizzle(sql);

export class DatabaseStorage implements IStorage {
  // Households
  async getHousehold(id: number): Promise<Household | undefined> {
    const result = await db.select().from(households).where(eq(households.id, id)).limit(1);
    return result[0];
  }

  async getHouseholdByEmail(email: string): Promise<Household | undefined> {
    const result = await db.select().from(households).where(eq(households.email, email)).limit(1);
    return result[0];
  }

  async createHousehold(household: InsertHousehold): Promise<Household> {
    const result = await db.insert(households).values(household).returning();
    return result[0];
  }

  // People
  async getPerson(id: number): Promise<Person | undefined> {
    const result = await db.select().from(people).where(eq(people.id, id)).limit(1);
    return result[0];
  }

  async getPeopleByHousehold(householdId: number): Promise<Person[]> {
    return await db.select().from(people).where(eq(people.householdId, householdId));
  }

  async createPerson(person: InsertPerson): Promise<Person> {
    const result = await db.insert(people).values(person).returning();
    return result[0];
  }

  async updatePerson(id: number, updates: Partial<Omit<Person, 'id'>>): Promise<Person | undefined> {
    const result = await db.update(people).set(updates).where(eq(people.id, id)).returning();
    return result[0];
  }

  // Tasks
  async getTask(id: number): Promise<Task | undefined> {
    const result = await db.select().from(tasks).where(eq(tasks.id, id)).limit(1);
    return result[0];
  }

  async getTasksByHousehold(householdId: number): Promise<Task[]> {
    return await db.select().from(tasks).where(
      and(eq(tasks.householdId, householdId), eq(tasks.isActive, true))
    );
  }

  async createTask(task: InsertTask): Promise<Task> {
    const result = await db.insert(tasks).values(task).returning();
    return result[0];
  }

  async updateTask(id: number, updates: Partial<Omit<Task, 'id'>>): Promise<Task | undefined> {
    const result = await db.update(tasks).set(updates).where(eq(tasks.id, id)).returning();
    return result[0];
  }

  async deleteTask(id: number): Promise<boolean> {
    const result = await db.delete(tasks).where(eq(tasks.id, id));
    return result.rowCount > 0;
  }

  // Task Instances
  async getTaskInstance(id: number): Promise<TaskInstance | undefined> {
    const result = await db.select().from(taskInstances).where(eq(taskInstances.id, id)).limit(1);
    return result[0];
  }

  async getTaskInstancesByDateRange(householdId: number, startDate: Date, endDate: Date): Promise<TaskInstance[]> {
    // Use a join to get task instances for this household within the date range
    const result = await db.select({
      id: taskInstances.id,
      taskId: taskInstances.taskId,
      assignedTo: taskInstances.assignedTo,
      isSecondary: taskInstances.isSecondary,
      dueDate: taskInstances.dueDate,
      completedAt: taskInstances.completedAt,
      isCompleted: taskInstances.isCompleted,
      pointsEarned: taskInstances.pointsEarned,
      isOverdue: taskInstances.isOverdue,
      currentPriority: taskInstances.currentPriority
    })
    .from(taskInstances)
    .innerJoin(tasks, eq(taskInstances.taskId, tasks.id))
    .where(
      and(
        eq(tasks.householdId, householdId),
        gte(taskInstances.dueDate, startDate),
        lte(taskInstances.dueDate, endDate)
      )
    );

    return result;
  }

  async getTodayTaskInstances(householdId: number): Promise<TaskInstance[]> {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999);
    
    return this.getTaskInstancesByDateRange(householdId, startOfDay, endOfDay);
  }

  async createTaskInstance(taskInstance: InsertTaskInstance): Promise<TaskInstance> {
    const result = await db.insert(taskInstances).values(taskInstance).returning();
    return result[0];
  }

  async updateTaskInstance(id: number, updates: Partial<Omit<TaskInstance, 'id'>>): Promise<TaskInstance | undefined> {
    const result = await db.update(taskInstances).set(updates).where(eq(taskInstances.id, id)).returning();
    return result[0];
  }

  async getLastCompletionDate(taskId: number): Promise<Date | null> {
    const result = await db.select()
      .from(taskInstances)
      .where(and(eq(taskInstances.taskId, taskId), eq(taskInstances.isCompleted, true)))
      .orderBy(desc(taskInstances.completedAt))
      .limit(1);
    
    return result[0]?.completedAt || null;
  }

  // Black Marks
  async createBlackMark(blackMark: InsertBlackMark): Promise<BlackMark> {
    const result = await db.insert(blackMarks).values(blackMark).returning();
    return result[0];
  }

  async getBlackMarksByPerson(personId: number): Promise<BlackMark[]> {
    return await db.select().from(blackMarks).where(eq(blackMarks.personId, personId));
  }

  // Rewards
  async getReward(id: number): Promise<Reward | undefined> {
    const result = await db.select().from(rewards).where(eq(rewards.id, id)).limit(1);
    return result[0];
  }

  async getRewardsByHousehold(householdId: number): Promise<Reward[]> {
    return await db.select().from(rewards).where(eq(rewards.householdId, householdId));
  }

  async createReward(reward: InsertReward): Promise<Reward> {
    const result = await db.insert(rewards).values(reward).returning();
    return result[0];
  }

  async updateReward(id: number, updates: Partial<Omit<Reward, 'id'>>): Promise<Reward | undefined> {
    const result = await db.update(rewards).set(updates).where(eq(rewards.id, id)).returning();
    return result[0];
  }

  async deleteReward(id: number): Promise<boolean> {
    const result = await db.delete(rewards).where(eq(rewards.id, id));
    return result.rowCount > 0;
  }

  // Reward Claims
  async createRewardClaim(claim: InsertRewardClaim): Promise<RewardClaim> {
    const result = await db.insert(rewardClaims).values(claim).returning();
    return result[0];
  }

  async getRewardClaimsByPerson(personId: number): Promise<RewardClaim[]> {
    return await db.select().from(rewardClaims).where(eq(rewardClaims.personId, personId));
  }
}