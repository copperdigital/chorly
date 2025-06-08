import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { loginSchema, profileSelectSchema, adminPinSchema, insertTaskSchema, insertPersonSchema, insertRewardSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Authentication
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = loginSchema.parse(req.body);
      const household = await storage.getHouseholdByEmail(email);
      
      if (!household || household.password !== password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const people = await storage.getPeopleByHousehold(household.id);
      
      res.json({
        household: { id: household.id, name: household.name, email: household.email },
        people: people.map(p => ({ id: p.id, nickname: p.nickname, avatar: p.avatar, isAdmin: p.isAdmin }))
      });
    } catch (error) {
      res.status(400).json({ message: "Invalid request data" });
    }
  });

  app.post("/api/auth/profile-select", async (req, res) => {
    try {
      const { personId, pin } = profileSelectSchema.parse(req.body);
      const person = await storage.getPerson(personId);
      
      if (!person || person.pin !== pin) {
        return res.status(401).json({ message: "Invalid PIN" });
      }

      const household = await storage.getHousehold(person.householdId);
      
      res.json({
        person: { 
          id: person.id, 
          nickname: person.nickname, 
          avatar: person.avatar, 
          isAdmin: person.isAdmin,
          currentStreak: person.currentStreak,
          totalPoints: person.totalPoints
        },
        household: { id: household!.id, name: household!.name }
      });
    } catch (error) {
      res.status(400).json({ message: "Invalid request data" });
    }
  });

  app.post("/api/auth/verify-admin-pin", async (req, res) => {
    try {
      const { pin } = adminPinSchema.parse(req.body);
      const { personId } = req.query;
      
      if (!personId) {
        return res.status(400).json({ message: "Person ID required" });
      }

      const person = await storage.getPerson(Number(personId));
      
      if (!person || !person.isAdmin || person.pin !== pin) {
        return res.status(401).json({ message: "Invalid admin PIN" });
      }

      res.json({ success: true });
    } catch (error) {
      res.status(400).json({ message: "Invalid request data" });
    }
  });

  // Dashboard data
  app.get("/api/dashboard", async (req, res) => {
    try {
      const { householdId, date } = req.query;
      
      if (!householdId) {
        return res.status(400).json({ message: "Household ID required" });
      }
      
      const householdIdNum = Number(householdId);
      const targetDate = date ? new Date(date as string) : new Date();
      targetDate.setHours(23, 59, 59, 999);
      
      const people = await storage.getPeopleByHousehold(householdIdNum);
      
      // Get existing task instances for the date
      const startOfDay = new Date(targetDate);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(targetDate);
      endOfDay.setHours(23, 59, 59, 999);
      
      const existingInstances = await storage.getTaskInstancesByDateRange(householdIdNum, startOfDay, endOfDay);
      
      // Get all active tasks to generate recurring instances
      const allTasks = await storage.getTasksByHousehold(householdIdNum);
      const activeTasks = allTasks.filter(task => task.isActive);
      
      // Generate recurring task instances for the target date
      const generatedInstances = [];
      for (const task of activeTasks) {
        if (task.isRecurring && task.dueDate) {
          const taskDueDate = new Date(task.dueDate);
          
          // Check if this recurring task should have an instance on the target date
          if (shouldGenerateInstance(task, taskDueDate, targetDate)) {
            // Check if instance already exists
            const existingInstance = existingInstances.find(inst => 
              inst.taskId === task.id && 
              inst.assignedTo === task.assignedTo
            );
            
            if (!existingInstance) {
              generatedInstances.push({
                id: `temp-${task.id}-${task.assignedTo}-${targetDate.getTime()}`,
                taskId: task.id,
                assignedTo: task.assignedTo,
                isSecondary: false,
                dueDate: targetDate,
                completedAt: null,
                isCompleted: false,
                pointsEarned: 0,
                isOverdue: targetDate < new Date(),
                currentPriority: task.priority || 1
              });
            }
          }
        }
      }
      
      // Combine existing and generated instances
      const allInstances = [...existingInstances, ...generatedInstances];
      
      // Get task details for instances
      const tasksMap = new Map();
      for (const instance of allInstances) {
        if (!tasksMap.has(instance.taskId)) {
          const task = await storage.getTask(instance.taskId);
          if (task) tasksMap.set(instance.taskId, task);
        }
      }

      const enrichedInstances = allInstances.map(instance => ({
        ...instance,
        task: tasksMap.get(instance.taskId)
      }));

      res.json({
        people,
        taskInstances: enrichedInstances
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to load dashboard data" });
    }
  });

  // Helper function to determine if a recurring task should generate an instance
  function shouldGenerateInstance(task: any, taskDueDate: Date, targetDate: Date): boolean {
    if (!task.isRecurring || !task.recurrenceInterval) return false;
    
    // Check if the target date is before the task's due date
    if (targetDate < taskDueDate) return false;
    
    // Check if the target date is after the task's end date (if it has one)
    if (task.endDate && targetDate > new Date(task.endDate)) return false;
    
    const daysDiff = Math.floor((targetDate.getTime() - taskDueDate.getTime()) / (1000 * 60 * 60 * 24));
    
    switch (task.recurrenceType) {
      case 'daily':
        return daysDiff >= 0 && daysDiff % task.recurrenceInterval === 0;
      case 'weekly':
        return daysDiff >= 0 && daysDiff % (task.recurrenceInterval * 7) === 0;
      case 'monthly':
        // Simplified monthly calculation - should occur on the same day of month
        const taskDay = taskDueDate.getDate();
        const targetDay = targetDate.getDate();
        return targetDate >= taskDueDate && taskDay === targetDay;
      default:
        return false;
    }
  }

  // Task completion
  app.post("/api/tasks/:instanceId/complete", async (req, res) => {
    try {
      const instanceId = Number(req.params.instanceId);
      const { personId } = req.body;
      
      const instance = await storage.getTaskInstance(instanceId);
      if (!instance) {
        return res.status(404).json({ message: "Task instance not found" });
      }

      if (instance.isCompleted) {
        return res.status(400).json({ message: "Task already completed" });
      }

      const task = await storage.getTask(instance.taskId);
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }

      // Check if person can complete this task
      const canComplete = instance.assignedTo === personId || 
                         (instance.isSecondary && task.secondaryAssignees?.includes(String(personId)));
      
      if (!canComplete) {
        return res.status(403).json({ message: "Not authorized to complete this task" });
      }

      // For secondary tasks, check if primary tasks are complete
      if (instance.isSecondary) {
        const todayInstances = await storage.getTodayTaskInstances(task.householdId);
        const primaryInstancesForPerson = todayInstances.filter(ti => 
          ti.assignedTo === personId && !ti.isSecondary
        );
        const allPrimaryComplete = primaryInstancesForPerson.every(ti => ti.isCompleted);
        
        if (!allPrimaryComplete) {
          return res.status(400).json({ message: "Complete all primary tasks first" });
        }
      }

      // Complete the task
      const pointsEarned = instance.isSecondary ? Math.floor(task.points * 0.5) : task.points;
      const updatedInstance = await storage.updateTaskInstance(instanceId, {
        isCompleted: true,
        completedAt: new Date(),
        pointsEarned
      });

      // Update person's points
      const person = await storage.getPerson(personId);
      if (person) {
        await storage.updatePerson(personId, {
          totalPoints: person.totalPoints + pointsEarned
        });
      }

      res.json(updatedInstance);
    } catch (error) {
      res.status(500).json({ message: "Failed to complete task" });
    }
  });

  // Admin routes
  app.get("/api/admin/people/:householdId", async (req, res) => {
    try {
      const householdId = Number(req.params.householdId);
      const people = await storage.getPeopleByHousehold(householdId);
      res.json(people);
    } catch (error) {
      res.status(500).json({ message: "Failed to load people" });
    }
  });

  app.post("/api/admin/people", async (req, res) => {
    try {
      const personData = insertPersonSchema.parse(req.body);
      const person = await storage.createPerson(personData);
      res.json(person);
    } catch (error) {
      res.status(400).json({ message: "Invalid person data" });
    }
  });

  app.put("/api/admin/people/:id", async (req, res) => {
    try {
      const id = Number(req.params.id);
      const updates = req.body;
      const person = await storage.updatePerson(id, updates);
      
      if (!person) {
        return res.status(404).json({ message: "Person not found" });
      }
      
      res.json(person);
    } catch (error) {
      res.status(400).json({ message: "Failed to update person" });
    }
  });

  app.get("/api/admin/tasks/:householdId", async (req, res) => {
    try {
      const householdId = Number(req.params.householdId);
      const tasks = await storage.getTasksByHousehold(householdId);
      console.log(`Fetching tasks for household ${householdId}, found ${tasks.length} tasks:`, tasks.map(t => ({ id: t.id, title: t.title, isActive: t.isActive })));
      res.json(tasks);
    } catch (error) {
      console.error("Failed to load tasks:", error);
      res.status(500).json({ message: "Failed to load tasks" });
    }
  });

  app.post("/api/admin/tasks", async (req, res) => {
    try {
      console.log("Received task data:", req.body);
      const taskData = insertTaskSchema.parse(req.body);
      console.log("Parsed task data:", taskData);
      const task = await storage.createTask(taskData);
      res.json(task);
    } catch (error) {
      console.error("Task creation error:", error);
      res.status(400).json({ 
        message: "Invalid task data", 
        error: error instanceof Error ? error.message : String(error) 
      });
    }
  });

  app.put("/api/admin/tasks/:id", async (req, res) => {
    try {
      const id = Number(req.params.id);
      console.log("Updating task:", id, "with data:", req.body);
      
      // Parse and validate the update data
      const updates = {
        title: req.body.title,
        description: req.body.description,
        estimatedMinutes: Number(req.body.estimatedMinutes),
        points: Number(req.body.points),
        assignedTo: Number(req.body.assignedTo),
        isRecurring: Boolean(req.body.isRecurring),
        recurrenceType: req.body.isRecurring ? req.body.recurrenceType : null,
        recurrenceInterval: req.body.isRecurring ? Number(req.body.recurrenceInterval) : null,
        customDays: req.body.isRecurring && req.body.recurrenceType === "custom" ? Number(req.body.customDays) : null,
        dueDate: req.body.dueDate ? new Date(req.body.dueDate) : null,
        startDate: req.body.startDate ? new Date(req.body.startDate) : null,
        endDate: req.body.endDate ? new Date(req.body.endDate) : null,
        secondaryAssignees: req.body.secondaryAssignees || [],
        isActive: req.body.isActive !== undefined ? Boolean(req.body.isActive) : true,
        dueDateType: req.body.dueDateType || "by_date",
        priority: req.body.priority ? Number(req.body.priority) : 1,
      };
      
      console.log("Processed updates:", updates);
      const task = await storage.updateTask(id, updates);
      
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }
      
      console.log("Updated task result:", task);
      res.json(task);
    } catch (error) {
      console.error("Task update error:", error);
      res.status(400).json({ 
        message: "Failed to update task", 
        error: error instanceof Error ? error.message : String(error) 
      });
    }
  });

  app.delete("/api/admin/tasks/:id", async (req, res) => {
    try {
      const id = Number(req.params.id);
      const deleted = await storage.deleteTask(id);
      
      if (!deleted) {
        return res.status(404).json({ message: "Task not found" });
      }
      
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete task" });
    }
  });

  app.get("/api/admin/rewards/:householdId", async (req, res) => {
    try {
      const householdId = Number(req.params.householdId);
      const rewards = await storage.getRewardsByHousehold(householdId);
      res.json(rewards);
    } catch (error) {
      res.status(500).json({ message: "Failed to load rewards" });
    }
  });

  app.post("/api/admin/rewards", async (req, res) => {
    try {
      const rewardData = insertRewardSchema.parse(req.body);
      const reward = await storage.createReward(rewardData);
      res.json(reward);
    } catch (error) {
      res.status(400).json({ message: "Invalid reward data" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
