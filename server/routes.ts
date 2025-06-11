import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertHouseholdSchema, insertFamilyMemberSchema, insertTaskSchema, insertTaskAssignmentSchema, insertTaskCompletionSchema, insertRewardSchema, insertRewardClaimSchema } from "@shared/schema";
import { z } from "zod";
import bcrypt from "bcryptjs";

declare module "express-session" {
  interface SessionData {
    householdId: number;
    memberId?: number;
    isAdmin?: boolean;
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Session management
  app.get("/api/session", async (req, res) => {
    const householdId = req.session?.householdId;
    const memberId = req.session?.memberId;
    
    if (!householdId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const household = await storage.getHousehold(householdId);
    const member = memberId ? await storage.getFamilyMember(memberId) : null;

    res.json({ household, member });
  });

  // Email/Password login
  app.post("/api/auth/login", async (req, res) => {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    try {
      const household = await storage.validateHouseholdPassword(email, password);
      
      if (!household) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      req.session!.householdId = household.id;
      res.json({ household });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Failed to login" });
    }
  });

  // Registration
  app.post("/api/auth/register", async (req, res) => {
    try {
      const result = insertHouseholdSchema.safeParse(req.body);
      
      if (!result.success) {
        return res.status(400).json({ 
          message: "Validation failed", 
          errors: result.error.errors 
        });
      }

      const { name, email, password, adminPin } = result.data;

      // Check if email already exists
      const existingHousehold = await storage.getHouseholdByEmail(email);
      if (existingHousehold) {
        return res.status(409).json({ message: "Email already registered" });
      }

      const household = await storage.createHousehold({ name, email, password, adminPin });
      req.session!.householdId = household.id;
      
      res.json({ household });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ message: "Failed to register household" });
    }
  });

  // Household authentication (legacy - for existing flow)
  app.post("/api/auth/household", async (req, res) => {
    const { name } = req.body;
    
    if (!name) {
      return res.status(400).json({ message: "Household name is required" });
    }

    try {
      const household = await storage.getHouseholdByName(name);
      
      if (!household) {
        return res.status(404).json({ message: "Household not found. Please use email/password login or register first." });
      }

      req.session!.householdId = household.id;
      res.json({ household });
    } catch (error) {
      res.status(500).json({ message: "Failed to authenticate household" });
    }
  });

  // Member selection
  app.post("/api/auth/member", async (req, res) => {
    const { memberId } = req.body;
    const householdId = req.session?.householdId;

    if (!householdId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    if (memberId) {
      const member = await storage.getFamilyMember(memberId);
      if (!member || member.householdId !== householdId) {
        return res.status(404).json({ message: "Member not found" });
      }
      req.session!.memberId = memberId;
    } else {
      delete req.session!.memberId;
    }

    res.json({ success: true });
  });

  // Admin authentication
  app.post("/api/auth/admin", async (req, res) => {
    const { pin } = req.body;
    const householdId = req.session?.householdId;

    if (!householdId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const household = await storage.getHousehold(householdId);
    if (!household) {
      return res.status(404).json({ message: "Household not found" });
    }

    const isValid = await bcrypt.compare(pin, household.adminPin);
    if (!isValid) {
      return res.status(401).json({ message: "Invalid admin PIN" });
    }

    req.session!.isAdmin = true;
    res.json({ success: true });
  });

  // Update household
  app.patch("/api/household", async (req, res) => {
    const householdId = req.session?.householdId;
    const isAdmin = req.session?.isAdmin;

    if (!householdId || !isAdmin) {
      return res.status(401).json({ message: "Admin access required" });
    }

    try {
      const data = insertHouseholdSchema.partial().parse(req.body);
      
      if (data.adminPin) {
        data.adminPin = await bcrypt.hash(data.adminPin, 10);
      }

      const household = await storage.updateHousehold(householdId, data);
      res.json(household);
    } catch (error) {
      res.status(400).json({ message: "Invalid data" });
    }
  });

  // Family members
  app.get("/api/family-members", async (req, res) => {
    const householdId = req.session?.householdId;

    if (!householdId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const members = await storage.getFamilyMembersWithStats(householdId);
    res.json(members);
  });

  app.post("/api/family-members", async (req, res) => {
    const householdId = req.session?.householdId;
    const isAdmin = req.session?.isAdmin;

    if (!householdId || !isAdmin) {
      return res.status(401).json({ message: "Admin access required" });
    }

    try {
      const data = insertFamilyMemberSchema.parse({ ...req.body, householdId });
      const member = await storage.createFamilyMember(data);
      res.json(member);
    } catch (error) {
      res.status(400).json({ message: "Invalid data" });
    }
  });

  app.patch("/api/family-members/:id", async (req, res) => {
    const householdId = req.session?.householdId;
    const isAdmin = req.session?.isAdmin;
    const memberId = parseInt(req.params.id);

    if (!householdId || !isAdmin) {
      return res.status(401).json({ message: "Admin access required" });
    }

    try {
      const data = insertFamilyMemberSchema.partial().parse(req.body);
      const member = await storage.updateFamilyMember(memberId, data);
      
      if (!member || member.householdId !== householdId) {
        return res.status(404).json({ message: "Member not found" });
      }

      res.json(member);
    } catch (error) {
      res.status(400).json({ message: "Invalid data" });
    }
  });

  app.delete("/api/family-members/:id", async (req, res) => {
    const householdId = req.session?.householdId;
    const isAdmin = req.session?.isAdmin;
    const memberId = parseInt(req.params.id);

    if (!householdId || !isAdmin) {
      return res.status(401).json({ message: "Admin access required" });
    }

    const member = await storage.getFamilyMember(memberId);
    if (!member || member.householdId !== householdId) {
      return res.status(404).json({ message: "Member not found" });
    }

    await storage.deleteFamilyMember(memberId);
    res.json({ success: true });
  });

  // Tasks
  app.get("/api/tasks", async (req, res) => {
    const householdId = req.session?.householdId;
    const { date, memberId, view } = req.query;

    if (!householdId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    console.log(`API request - Date: ${date}, MemberId: ${memberId}, View: ${view}`);

    const tasks = await storage.getTasksWithAssignees(
      householdId,
      date as string,
      memberId ? parseInt(memberId as string) : undefined,
      view as 'day' | 'week'
    );
    
    console.log(`API response - Found ${tasks.length} tasks for date ${date}`);
    res.json(tasks);
  });

  // Test endpoint to verify June 11 tasks
  app.get("/api/test-june11", async (req, res) => {
    const householdId = req.session?.householdId;

    if (!householdId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const tasks = await storage.getTasksWithAssignees(householdId, "2025-06-11", undefined, 'day');
    res.json({ date: "2025-06-11", taskCount: tasks.length, tasks });
  });

  // Get all tasks with assignees (for admin panel)
  app.get("/api/tasks/all", async (req: Request, res: Response) => {
    if (!req.session.householdId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const allTasks = await storage.getTasks(req.session.householdId);
      const tasksWithAssignees = await Promise.all(
        allTasks.map(async (task) => {
          return await storage.getTaskWithAssignees(task.id);
        })
      );
      res.json(tasksWithAssignees);
    } catch (error) {
      console.error("Error fetching all tasks:", error);
      res.status(500).json({ message: "Failed to fetch all tasks" });
    }
  });

  app.post("/api/tasks", async (req, res) => {
    const householdId = req.session?.householdId;
    const isAdmin = req.session?.isAdmin;

    if (!householdId || !isAdmin) {
      return res.status(401).json({ message: "Admin access required" });
    }

    try {
      console.log("Create task request:", req.body);
      const { assigneeIds, ...taskData } = req.body;
      
      // Clean up the data for validation
      const cleanData = {
        ...taskData,
        householdId,
        points: taskData.points || 0,
        estimatedMinutes: taskData.estimatedMinutes || 0,
        startDate: taskData.startDate ? new Date(taskData.startDate) : new Date(),
        endDate: taskData.endDate ? new Date(taskData.endDate) : null,
      };
      
      console.log("Clean data for validation:", cleanData);
      const data = insertTaskSchema.parse(cleanData);
      console.log("Validated data:", data);
      
      const task = await storage.createTask(data);
      
      // Create assignments
      if (assigneeIds && assigneeIds.length > 0) {
        for (const memberId of assigneeIds) {
          await storage.createTaskAssignment({ taskId: task.id, memberId });
        }
      }

      const taskWithAssignees = await storage.getTaskWithAssignees(task.id);
      res.json(taskWithAssignees);
    } catch (error: any) {
      console.error("Task creation error:", error);
      res.status(400).json({ message: "Invalid data", error: error.message });
    }
  });

  app.patch("/api/tasks/:id", async (req, res) => {
    const householdId = req.session?.householdId;
    const isAdmin = req.session?.isAdmin;
    const taskId = parseInt(req.params.id);

    if (!householdId || !isAdmin) {
      return res.status(401).json({ message: "Admin access required" });
    }

    try {
      console.log("Update task request:", req.body);
      const { assigneeIds, ...taskData } = req.body;
      
      // Clean up the data for validation
      const cleanData = {
        ...taskData,
        points: taskData.points || 0,
        estimatedMinutes: taskData.estimatedMinutes || 0,
        startDate: taskData.startDate ? new Date(taskData.startDate) : undefined,
        endDate: taskData.endDate ? new Date(taskData.endDate) : null,
      };
      
      console.log("Clean data for validation:", cleanData);
      const data = insertTaskSchema.partial().parse(cleanData);
      console.log("Validated data:", data);
      
      const task = await storage.updateTask(taskId, data);
      
      if (!task || task.householdId !== householdId) {
        return res.status(404).json({ message: "Task not found" });
      }

      // Update assignments if provided
      if (assigneeIds !== undefined) {
        console.log("Processing assigneeIds:", assigneeIds);
        await storage.deleteTaskAssignments(taskId);
        for (const memberId of assigneeIds) {
          console.log("Creating assignment for member:", memberId);
          await storage.createTaskAssignment({ taskId, memberId });
        }
      } else {
        console.log("No assigneeIds provided in request");
      }

      const taskWithAssignees = await storage.getTaskWithAssignees(taskId);
      res.json(taskWithAssignees);
    } catch (error: any) {
      console.error("Task update error:", error);
      res.status(400).json({ message: "Invalid data", error: error.message });
    }
  });

  app.delete("/api/tasks/:id", async (req, res) => {
    const householdId = req.session?.householdId;
    const isAdmin = req.session?.isAdmin;
    const taskId = parseInt(req.params.id);

    if (!householdId || !isAdmin) {
      return res.status(401).json({ message: "Admin access required" });
    }

    const task = await storage.getTask(taskId);
    if (!task || task.householdId !== householdId) {
      return res.status(404).json({ message: "Task not found" });
    }

    await storage.deleteTask(taskId);
    res.json({ success: true });
  });

  // Task completion
  app.post("/api/tasks/:id/complete", async (req, res) => {
    const householdId = req.session?.householdId;
    const memberId = req.session?.memberId;
    const taskId = parseInt(req.params.id);
    const { dueDate } = req.body;

    if (!householdId || !memberId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    try {
      const task = await storage.getTask(taskId);
      if (!task || task.householdId !== householdId) {
        return res.status(404).json({ message: "Task not found" });
      }

      // Check if member is assigned to this task
      const assignment = await storage.getTaskAssignment(taskId, memberId);
      if (!assignment) {
        return res.status(403).json({ message: "Task not assigned to you" });
      }

      // Check if already completed for this due date
      const existingCompletion = await storage.getTaskCompletion(taskId, memberId, dueDate);
      if (existingCompletion) {
        return res.status(400).json({ message: "Task already completed" });
      }

      const completion = await storage.completeTask({
        taskId,
        memberId,
        pointsEarned: task.points,
        dueDate: new Date(dueDate)
      });

      // Update member stats
      await storage.updateMemberStats(memberId);

      res.json(completion);
    } catch (error) {
      res.status(400).json({ message: "Failed to complete task" });
    }
  });

  // Leaderboard
  app.get("/api/leaderboard", async (req, res) => {
    const householdId = req.session?.householdId;

    if (!householdId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const leaderboard = await storage.getLeaderboard(householdId);
    res.json(leaderboard);
  });

  // Rewards
  app.get("/api/rewards", async (req, res) => {
    const householdId = req.session?.householdId;

    if (!householdId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const rewards = await storage.getRewards(householdId);
    res.json(rewards);
  });

  app.post("/api/rewards", async (req, res) => {
    const householdId = req.session?.householdId;
    const isAdmin = req.session?.isAdmin;

    if (!householdId || !isAdmin) {
      return res.status(401).json({ message: "Admin access required" });
    }

    try {
      const data = insertRewardSchema.parse({ ...req.body, householdId });
      const reward = await storage.createReward(data);
      res.json(reward);
    } catch (error) {
      res.status(400).json({ message: "Invalid data" });
    }
  });

  app.post("/api/rewards/:id/claim", async (req, res) => {
    const householdId = req.session?.householdId;
    const memberId = req.session?.memberId;
    const rewardId = parseInt(req.params.id);

    if (!householdId || !memberId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    try {
      const reward = await storage.getReward(rewardId);
      if (!reward || reward.householdId !== householdId) {
        return res.status(404).json({ message: "Reward not found" });
      }

      const member = await storage.getFamilyMember(memberId);
      if (!member || member.totalPoints < reward.pointsCost) {
        return res.status(400).json({ message: "Insufficient points" });
      }

      const claim = await storage.claimReward({
        rewardId,
        memberId,
        pointsSpent: reward.pointsCost
      });

      // Deduct points from member - update total points separately
      const updatedMember = await storage.getFamilyMember(memberId);
      if (updatedMember) {
        await storage.updateFamilyMember(memberId, {
          name: updatedMember.name,
          role: updatedMember.role,
          color: updatedMember.color,
          householdId: updatedMember.householdId,
          age: updatedMember.age,
          totalPoints: member.totalPoints - reward.pointsCost
        });
      }

      res.json(claim);
    } catch (error) {
      res.status(400).json({ message: "Failed to claim reward" });
    }
  });

  // Logout
  app.post("/api/auth/logout", (req, res) => {
    req.session?.destroy(() => {
      res.json({ success: true });
    });
  });

  const httpServer = createServer(app);
  return httpServer;
}
