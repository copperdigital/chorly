import { 
  households, familyMembers, tasks, taskAssignments, taskCompletions, rewards, rewardClaims,
  type Household, type InsertHousehold,
  type FamilyMember, type InsertFamilyMember, type FamilyMemberWithStats,
  type Task, type InsertTask, type TaskWithAssignees,
  type TaskAssignment, type InsertTaskAssignment,
  type TaskCompletion, type InsertTaskCompletion,
  type Reward, type InsertReward,
  type RewardClaim, type InsertRewardClaim,
  type LeaderboardEntry
} from "@shared/schema";
import { db } from "./db";
import { eq, and, gte, lte, sql, desc, asc } from "drizzle-orm";
import { startOfDay, endOfDay, startOfWeek, endOfWeek, format, subDays } from "date-fns";
import bcrypt from "bcryptjs";

export interface IStorage {
  // Households
  getHousehold(id: number): Promise<Household | undefined>;
  getHouseholdByName(name: string): Promise<Household | undefined>;
  getHouseholdByEmail(email: string): Promise<Household | undefined>;
  createHousehold(data: InsertHousehold): Promise<Household>;
  updateHousehold(id: number, data: Partial<InsertHousehold>): Promise<Household>;
  validateHouseholdPassword(email: string, password: string): Promise<Household | null>;

  // Family Members
  getFamilyMember(id: number): Promise<FamilyMember | undefined>;
  getFamilyMembers(householdId: number): Promise<FamilyMember[]>;
  getFamilyMembersWithStats(householdId: number): Promise<FamilyMemberWithStats[]>;
  createFamilyMember(data: InsertFamilyMember): Promise<FamilyMember>;
  updateFamilyMember(id: number, data: Partial<InsertFamilyMember>): Promise<FamilyMember>;
  deleteFamilyMember(id: number): Promise<void>;

  // Tasks
  getTask(id: number): Promise<Task | undefined>;
  getTasks(householdId: number): Promise<Task[]>;
  getTasksWithAssignees(householdId: number, date?: string, memberId?: number, view?: 'day' | 'week'): Promise<TaskWithAssignees[]>;
  getTaskWithAssignees(taskId: number): Promise<TaskWithAssignees>;
  createTask(data: InsertTask): Promise<Task>;
  updateTask(id: number, data: Partial<InsertTask>): Promise<Task>;
  deleteTask(id: number): Promise<void>;

  // Task Assignments
  getTaskAssignment(taskId: number, memberId: number): Promise<TaskAssignment | undefined>;
  createTaskAssignment(data: InsertTaskAssignment): Promise<TaskAssignment>;
  deleteTaskAssignments(taskId: number): Promise<void>;

  // Task Completions
  getTaskCompletion(taskId: number, memberId: number, dueDate: string): Promise<TaskCompletion | undefined>;
  completeTask(data: InsertTaskCompletion): Promise<TaskCompletion>;
  updateMemberStats(memberId: number): Promise<void>;

  // Leaderboard
  getLeaderboard(householdId: number): Promise<LeaderboardEntry[]>;

  // Rewards
  getReward(id: number): Promise<Reward | undefined>;
  getRewards(householdId: number): Promise<Reward[]>;
  createReward(data: InsertReward): Promise<Reward>;
  claimReward(data: InsertRewardClaim): Promise<RewardClaim>;
}

export class DatabaseStorage implements IStorage {
  // Households
  async getHousehold(id: number): Promise<Household | undefined> {
    const [household] = await db.select().from(households).where(eq(households.id, id));
    return household || undefined;
  }

  async getHouseholdByName(name: string): Promise<Household | undefined> {
    const [household] = await db.select().from(households).where(eq(households.name, name));
    return household || undefined;
  }

  async getHouseholdByEmail(email: string): Promise<Household | undefined> {
    const [household] = await db.select().from(households).where(eq(households.email, email));
    return household || undefined;
  }

  async validateHouseholdPassword(email: string, password: string): Promise<Household | null> {
    const household = await this.getHouseholdByEmail(email);
    if (!household) return null;
    
    const isValid = await bcrypt.compare(password, household.passwordHash);
    return isValid ? household : null;
  }

  async createHousehold(data: InsertHousehold): Promise<Household> {
    const hashedPin = await bcrypt.hash(data.adminPin || "1234", 10);
    const hashedPassword = await bcrypt.hash(data.password, 10);
    const [household] = await db
      .insert(households)
      .values({
        name: data.name,
        email: data.email,
        passwordHash: hashedPassword,
        adminPin: hashedPin,
      } as any)
      .returning();
    return household;
  }

  async updateHousehold(id: number, data: Partial<InsertHousehold>): Promise<Household> {
    const [household] = await db
      .update(households)
      .set(data)
      .where(eq(households.id, id))
      .returning();
    return household;
  }

  // Family Members
  async getFamilyMember(id: number): Promise<FamilyMember | undefined> {
    const [member] = await db.select().from(familyMembers).where(eq(familyMembers.id, id));
    return member || undefined;
  }

  async getFamilyMembers(householdId: number): Promise<FamilyMember[]> {
    return await db
      .select()
      .from(familyMembers)
      .where(and(eq(familyMembers.householdId, householdId), eq(familyMembers.isActive, true)));
  }

  async getFamilyMembersWithStats(householdId: number): Promise<FamilyMemberWithStats[]> {
    const members = await this.getFamilyMembers(householdId);
    const today = new Date();
    const todayStr = format(today, 'yyyy-MM-dd');

    const membersWithStats = await Promise.all(
      members.map(async (member) => {
        // Get today's task assignments
        const todayAssignments = await db
          .select()
          .from(taskAssignments)
          .innerJoin(tasks, eq(taskAssignments.taskId, tasks.id))
          .where(
            and(
              eq(taskAssignments.memberId, member.id),
              eq(tasks.isActive, true)
            )
          );

        // Get today's completions
        const todayCompletions = await db
          .select()
          .from(taskCompletions)
          .where(
            and(
              eq(taskCompletions.memberId, member.id),
              gte(taskCompletions.dueDate, startOfDay(today)),
              lte(taskCompletions.dueDate, endOfDay(today))
            )
          );

        const tasksAssignedToday = todayAssignments.length;
        const tasksCompletedToday = todayCompletions.length;
        const pointsEarnedToday = todayCompletions.reduce((sum, completion) => sum + completion.pointsEarned, 0);
        const progressPercentage = tasksAssignedToday > 0 ? Math.round((tasksCompletedToday / tasksAssignedToday) * 100) : 0;

        return {
          ...member,
          tasksCompletedToday,
          tasksAssignedToday,
          pointsEarnedToday,
          progressPercentage,
        };
      })
    );

    return membersWithStats;
  }

  async createFamilyMember(data: InsertFamilyMember): Promise<FamilyMember> {
    const [member] = await db
      .insert(familyMembers)
      .values(data)
      .returning();
    return member;
  }

  async updateFamilyMember(id: number, data: Partial<InsertFamilyMember>): Promise<FamilyMember> {
    const [member] = await db
      .update(familyMembers)
      .set(data)
      .where(eq(familyMembers.id, id))
      .returning();
    return member;
  }

  async deleteFamilyMember(id: number): Promise<void> {
    await db.update(familyMembers).set({ isActive: false }).where(eq(familyMembers.id, id));
  }

  // Tasks
  async getTask(id: number): Promise<Task | undefined> {
    const [task] = await db.select().from(tasks).where(eq(tasks.id, id));
    return task || undefined;
  }

  async getTasks(householdId: number): Promise<Task[]> {
    return await db
      .select()
      .from(tasks)
      .where(and(eq(tasks.householdId, householdId), eq(tasks.isActive, true)));
  }

  async getTasksWithAssignees(householdId: number, date?: string, memberId?: number, view?: 'day' | 'week'): Promise<TaskWithAssignees[]> {
    const targetDate = date ? new Date(date) : new Date();
    
    let tasksQuery = db
      .select()
      .from(tasks)
      .where(and(eq(tasks.householdId, householdId), eq(tasks.isActive, true)));

    const allTasks = await tasksQuery;
    const allRelevantTasks: TaskWithAssignees[] = [];
    
    // Determine date range based on view
    const dates = view === 'week' ? this.getWeekDates(targetDate) : [targetDate];
    
    for (const checkDate of dates) {
      console.log(`Checking tasks for date: ${checkDate.toISOString()}`);
      
      // Filter tasks based on scheduling for each date
      const relevantTasks = allTasks.filter(task => {
        const taskStartDate = new Date(task.startDate);
        const taskEndDate = task.endDate ? new Date(task.endDate) : null;
        
        console.log(`Task: ${task.name}, Start: ${taskStartDate.toISOString()}, End: ${taskEndDate?.toISOString() || 'none'}`);
        
        // Normalize dates to compare just the date part (ignore time)
        const checkDateOnly = new Date(checkDate.getFullYear(), checkDate.getMonth(), checkDate.getDate());
        const startDateOnly = new Date(taskStartDate.getFullYear(), taskStartDate.getMonth(), taskStartDate.getDate());
        const endDateOnly = taskEndDate ? new Date(taskEndDate.getFullYear(), taskEndDate.getMonth(), taskEndDate.getDate()) : null;
        
        console.log(`Normalized - Check: ${checkDateOnly.toISOString()}, Start: ${startDateOnly.toISOString()}`);
        
        // Task must not have ended before the check date
        if (endDateOnly && endDateOnly < checkDateOnly) {
          console.log(`Task ${task.name} filtered out: ended before check date`);
          return false;
        }
        
        // For tasks starting in the future, only show on or after start date
        if (startDateOnly > checkDateOnly) {
          console.log(`Task ${task.name} filtered out: starts in future`);
          return false;
        }
        
        // For exact date matches, always show the task
        if (startDateOnly.getTime() === checkDateOnly.getTime()) {
          console.log(`Task ${task.name} exact date match - showing`);
          return true;
        }
        
        // Check if task should occur on the check date based on schedule
        const daysSinceStart = Math.floor((checkDateOnly.getTime() - startDateOnly.getTime()) / (1000 * 60 * 60 * 24));
        console.log(`Days since start for ${task.name}: ${daysSinceStart}`);
        
        // Handle negative days (shouldn't happen with above filter, but safety check)
        if (daysSinceStart < 0) {
          console.log(`Task ${task.name} filtered out: negative days since start`);
          return false;
        }
        
        let shouldShow = false;
        switch (task.scheduleType) {
          case 'daily':
            shouldShow = daysSinceStart >= 0; // Occurs every day starting from start date
            break;
          case 'weekly':
            shouldShow = daysSinceStart % 7 === 0; // Occurs every 7 days
            break;
          case 'monthly':
            shouldShow = daysSinceStart % 30 === 0; // Occurs every 30 days (simplified)
            break;
          case 'custom':
            if (task.scheduleValue && task.scheduleValue > 0) {
              shouldShow = daysSinceStart % task.scheduleValue === 0;
            } else {
              shouldShow = daysSinceStart === 0; // Only on start date if no custom value
            }
            break;
          default:
            shouldShow = daysSinceStart === 0; // Only on start date
        }
        
        console.log(`Task ${task.name} should show: ${shouldShow} (schedule: ${task.scheduleType}, value: ${task.scheduleValue})`);
        return shouldShow;
      });
      
      const tasksForDate = await this.processTasksForDate(relevantTasks, checkDate, memberId);
      allRelevantTasks.push(...tasksForDate);
    }
    
    return allRelevantTasks;
  }
  
  private getWeekDates(date: Date): Date[] {
    const week = [];
    const startOfWeek = new Date(date);
    startOfWeek.setDate(date.getDate() - date.getDay()); // Sunday
    
    for (let i = 0; i < 7; i++) {
      const weekDate = new Date(startOfWeek);
      weekDate.setDate(startOfWeek.getDate() + i);
      week.push(weekDate);
    }
    
    return week;
  }
  
  private async processTasksForDate(tasks: Task[], targetDate: Date, memberId?: number): Promise<TaskWithAssignees[]> {
    const tasksWithAssignees = await Promise.all(
      tasks.map(async (task: Task) => {
        // Get assignees
        const assigneesData = await db
          .select()
          .from(taskAssignments)
          .innerJoin(familyMembers, eq(taskAssignments.memberId, familyMembers.id))
          .where(eq(taskAssignments.taskId, task.id));

        const assignees = assigneesData.map(row => row.family_members);

        // Filter by member if specified
        if (memberId && !assignees.some(a => a.id === memberId)) {
          return null;
        }

        // Check if completed today
        const completionData = await db
          .select()
          .from(taskCompletions)
          .innerJoin(familyMembers, eq(taskCompletions.memberId, familyMembers.id))
          .where(
            and(
              eq(taskCompletions.taskId, task.id),
              gte(taskCompletions.dueDate, startOfDay(targetDate)),
              lte(taskCompletions.dueDate, endOfDay(targetDate))
            )
          )
          .limit(1);

        const isCompleted = completionData.length > 0;
        const completedBy = isCompleted ? completionData[0].family_members : undefined;
        const completedAt = isCompleted ? completionData[0].task_completions.completedAt : undefined;

        // Check if overdue based on schedule
        let isOverdue = false;
        let daysOverdue = 0;
        
        if (!isCompleted && task.scheduleType === 'daily') {
          // For daily tasks, check if they should have been completed yesterday
          const yesterday = new Date(targetDate);
          yesterday.setDate(yesterday.getDate() - 1);
          
          // Check if task was active yesterday (started before or on yesterday)
          const taskStartDate = new Date(task.startDate);
          const taskStartDateOnly = new Date(taskStartDate.getFullYear(), taskStartDate.getMonth(), taskStartDate.getDate());
          const yesterdayOnly = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate());
          
          if (taskStartDateOnly <= yesterdayOnly) {
            // Check if completed yesterday
            const yesterdayCompletion = await db
              .select()
              .from(taskCompletions)
              .where(
                and(
                  eq(taskCompletions.taskId, task.id),
                  gte(taskCompletions.dueDate, startOfDay(yesterday)),
                  lte(taskCompletions.dueDate, endOfDay(yesterday))
                )
              )
              .limit(1);
            
            if (yesterdayCompletion.length === 0) {
              isOverdue = true;
              daysOverdue = 1;
            }
          }
        } else if (!isCompleted && task.scheduleType === 'custom' && task.scheduleValue) {
          // For custom recurring tasks, check if they're overdue based on their schedule
          const taskStartDate = new Date(task.startDate);
          const daysSinceStart = Math.floor((targetDate.getTime() - taskStartDate.getTime()) / (1000 * 60 * 60 * 24));
          
          if (daysSinceStart > 0) {
            // Find the most recent expected completion date
            const intervalDays = task.scheduleValue;
            const completionsSinceStart = Math.floor(daysSinceStart / intervalDays);
            
            if (completionsSinceStart > 0) {
              const lastExpectedDate = new Date(taskStartDate);
              lastExpectedDate.setDate(lastExpectedDate.getDate() + (completionsSinceStart * intervalDays));
              
              // Check if completed on the last expected date
              const lastExpectedCompletion = await db
                .select()
                .from(taskCompletions)
                .where(
                  and(
                    eq(taskCompletions.taskId, task.id),
                    gte(taskCompletions.dueDate, startOfDay(lastExpectedDate)),
                    lte(taskCompletions.dueDate, endOfDay(lastExpectedDate))
                  )
                )
                .limit(1);
              
              if (lastExpectedCompletion.length === 0 && lastExpectedDate < targetDate) {
                isOverdue = true;
                daysOverdue = Math.floor((targetDate.getTime() - lastExpectedDate.getTime()) / (1000 * 60 * 60 * 24));
              }
            }
          }
        }

        return {
          ...task,
          assignees,
          isCompleted,
          completedBy,
          completedAt,
          isOverdue,
          daysOverdue,
        };
      })
    );

    return tasksWithAssignees.filter(task => task !== null) as TaskWithAssignees[];
  }

  async getTaskWithAssignees(taskId: number): Promise<TaskWithAssignees> {
    const task = await this.getTask(taskId);
    if (!task) throw new Error('Task not found');

    const assigneesData = await db
      .select()
      .from(taskAssignments)
      .innerJoin(familyMembers, eq(taskAssignments.memberId, familyMembers.id))
      .where(eq(taskAssignments.taskId, taskId));

    const assignees = assigneesData.map(row => row.family_members);

    return {
      ...task,
      assignees,
      isCompleted: false,
      isOverdue: false,
      daysOverdue: 0,
    };
  }

  async createTask(data: InsertTask): Promise<Task> {
    const [task] = await db
      .insert(tasks)
      .values(data)
      .returning();
    return task;
  }

  async updateTask(id: number, data: Partial<InsertTask>): Promise<Task> {
    const [task] = await db
      .update(tasks)
      .set(data)
      .where(eq(tasks.id, id))
      .returning();
    return task;
  }

  async deleteTask(id: number): Promise<void> {
    await db.update(tasks).set({ isActive: false }).where(eq(tasks.id, id));
  }

  // Task Assignments
  async getTaskAssignment(taskId: number, memberId: number): Promise<TaskAssignment | undefined> {
    const [assignment] = await db
      .select()
      .from(taskAssignments)
      .where(and(eq(taskAssignments.taskId, taskId), eq(taskAssignments.memberId, memberId)));
    return assignment || undefined;
  }

  async createTaskAssignment(data: InsertTaskAssignment): Promise<TaskAssignment> {
    const [assignment] = await db
      .insert(taskAssignments)
      .values(data)
      .returning();
    return assignment;
  }

  async deleteTaskAssignments(taskId: number): Promise<void> {
    await db.delete(taskAssignments).where(eq(taskAssignments.taskId, taskId));
  }

  // Task Completions
  async getTaskCompletion(taskId: number, memberId: number, dueDate: string): Promise<TaskCompletion | undefined> {
    const targetDate = new Date(dueDate);
    const [completion] = await db
      .select()
      .from(taskCompletions)
      .where(
        and(
          eq(taskCompletions.taskId, taskId),
          eq(taskCompletions.memberId, memberId),
          gte(taskCompletions.dueDate, startOfDay(targetDate)),
          lte(taskCompletions.dueDate, endOfDay(targetDate))
        )
      );
    return completion || undefined;
  }

  async completeTask(data: InsertTaskCompletion): Promise<TaskCompletion> {
    const [completion] = await db
      .insert(taskCompletions)
      .values(data)
      .returning();
    return completion;
  }

  async updateMemberStats(memberId: number): Promise<void> {
    // Update total points
    const totalPointsResult = await db
      .select({ total: sql<number>`sum(${taskCompletions.pointsEarned})` })
      .from(taskCompletions)
      .where(eq(taskCompletions.memberId, memberId));

    const totalPoints = totalPointsResult[0]?.total || 0;

    // Update streak (simplified - daily completions)
    const recentCompletions = await db
      .select()
      .from(taskCompletions)
      .where(eq(taskCompletions.memberId, memberId))
      .orderBy(desc(taskCompletions.completedAt))
      .limit(30);

    let currentStreak = 0;
    let checkDate = new Date();
    
    for (let i = 0; i < 30; i++) {
      const dayCompletions = recentCompletions.filter(c => 
        format(c.completedAt, 'yyyy-MM-dd') === format(checkDate, 'yyyy-MM-dd')
      );
      
      if (dayCompletions.length > 0) {
        currentStreak++;
        checkDate = subDays(checkDate, 1);
      } else {
        break;
      }
    }

    await db
      .update(familyMembers)
      .set({ 
        totalPoints: Math.floor(totalPoints),
        currentStreak 
      })
      .where(eq(familyMembers.id, memberId));
  }

  // Leaderboard
  async getLeaderboard(householdId: number): Promise<LeaderboardEntry[]> {
    const weekStart = startOfWeek(new Date());
    const weekEnd = endOfWeek(new Date());

    const members = await this.getFamilyMembers(householdId);
    
    const leaderboardEntries = await Promise.all(
      members.map(async (member) => {
        const weeklyCompletions = await db
          .select({ points: sql<number>`sum(${taskCompletions.pointsEarned})` })
          .from(taskCompletions)
          .where(
            and(
              eq(taskCompletions.memberId, member.id),
              gte(taskCompletions.completedAt, weekStart),
              lte(taskCompletions.completedAt, weekEnd)
            )
          );

        const weeklyPoints = weeklyCompletions[0]?.points || 0;

        return {
          member,
          weeklyPoints: Math.floor(weeklyPoints),
          weeklyIncrease: Math.floor(weeklyPoints), // Simplified for now
          rank: 0, // Will be set after sorting
        };
      })
    );

    // Sort by weekly points and assign ranks
    leaderboardEntries.sort((a, b) => b.weeklyPoints - a.weeklyPoints);
    leaderboardEntries.forEach((entry, index) => {
      entry.rank = index + 1;
    });

    return leaderboardEntries;
  }

  // Rewards
  async getReward(id: number): Promise<Reward | undefined> {
    const [reward] = await db.select().from(rewards).where(eq(rewards.id, id));
    return reward || undefined;
  }

  async getRewards(householdId: number): Promise<Reward[]> {
    return await db
      .select()
      .from(rewards)
      .where(and(eq(rewards.householdId, householdId), eq(rewards.isActive, true)));
  }

  async createReward(data: InsertReward): Promise<Reward> {
    const [reward] = await db
      .insert(rewards)
      .values(data)
      .returning();
    return reward;
  }

  async claimReward(data: InsertRewardClaim): Promise<RewardClaim> {
    const [claim] = await db
      .insert(rewardClaims)
      .values(data)
      .returning();
    return claim;
  }
}

export const storage = new DatabaseStorage();