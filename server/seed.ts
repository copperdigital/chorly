import { db } from "./db";
import { households, people, tasks, taskInstances } from "../shared/schema";

export async function seedDatabase() {
  try {
    // Check if data already exists
    const existingHouseholds = await db.select().from(households).limit(1);
    if (existingHouseholds.length > 0) {
      console.log("Database already seeded, skipping...");
      return;
    }

    console.log("Seeding database...");

    // Create household
    const [household] = await db.insert(households).values({
      name: "The Suttie Family",
      email: "family@suttie.com",
      password: "0000"
    }).returning();

    console.log("Created household:", household.name);

    // Create family members
    const [dad] = await db.insert(people).values({
      householdId: household.id,
      nickname: "Dad",
      pin: "1234",
      isAdmin: true,
      currentStreak: 8,
      totalPoints: 245,
      avatar: "primary"
    }).returning();

    const [mum] = await db.insert(people).values({
      householdId: household.id,
      nickname: "Mum", 
      pin: "5678",
      isAdmin: true,
      currentStreak: 15,
      totalPoints: 398,
      avatar: "secondary"
    }).returning();

    const [seb] = await db.insert(people).values({
      householdId: household.id,
      nickname: "Seb",
      pin: "9876", 
      isAdmin: false,
      currentStreak: 12,
      totalPoints: 289,
      avatar: "accent"
    }).returning();

    const [tessa] = await db.insert(people).values({
      householdId: household.id,
      nickname: "Tessa",
      pin: "5432",
      isAdmin: false, 
      currentStreak: 3,
      totalPoints: 156,
      avatar: "pink"
    }).returning();

    console.log("Created family members");

    // Create tasks
    const taskData = [
      {
        householdId: household.id,
        title: "Make bed",
        description: "Tidy up bedroom",
        estimatedMinutes: 5,
        points: 15,
        assignedTo: seb.id,
        isRecurring: true,
        recurrenceType: "daily",
        recurrenceInterval: 1,
        dueDateType: "on_date",
        priority: 2,
        isActive: true
      },
      {
        householdId: household.id,
        title: "Feed pets", 
        description: "Give food and fresh water",
        estimatedMinutes: 3,
        points: 10,
        assignedTo: seb.id,
        isRecurring: true,
        recurrenceType: "daily", 
        recurrenceInterval: 1,
        dueDateType: "on_date",
        priority: 2,
        isActive: true
      },
      {
        householdId: household.id,
        title: "Clean bathroom sink",
        description: "Wipe down sink and mirror", 
        estimatedMinutes: 8,
        points: 20,
        assignedTo: seb.id,
        isRecurring: true,
        recurrenceType: "daily",
        recurrenceInterval: 1,
        dueDateType: "on_date",
        priority: 2,
        isActive: true
      },
      {
        householdId: household.id,
        title: "Load dishwasher",
        description: "Load dirty dishes and start cycle",
        estimatedMinutes: 5,
        points: 10,
        assignedTo: tessa.id,
        isRecurring: true,
        recurrenceType: "daily",
        recurrenceInterval: 1,
        isActive: true
      },
      {
        householdId: household.id,
        title: "Wipe kitchen counters", 
        description: "Clean and sanitize countertops",
        estimatedMinutes: 10,
        points: 15,
        assignedTo: mum.id,
        isRecurring: true,
        recurrenceType: "daily",
        recurrenceInterval: 1,
        isActive: true
      },
      {
        householdId: household.id,
        title: "Take out Green Bin",
        description: "Empty bins and take to curb",
        estimatedMinutes: 8,
        points: 12,
        assignedTo: dad.id,
        isRecurring: true,
        recurrenceType: "custom",
        recurrenceInterval: 1,
        customDays: 14,
        dueDate: new Date("2025-06-11T00:00:00.000Z"),
        dueDateType: "by_date",
        priority: 1,
        isActive: true
      },
      {
        householdId: household.id,
        title: "Vacuum living room",
        description: "Vacuum carpet and under furniture",
        estimatedMinutes: 15,
        points: 25,
        assignedTo: seb.id,
        isRecurring: true,
        recurrenceType: "daily",
        recurrenceInterval: 1,
        isActive: true
      },
      {
        householdId: household.id,
        title: "Fold laundry",
        description: "Fold and put away clean clothes",
        estimatedMinutes: 20, 
        points: 30,
        assignedTo: mum.id,
        isRecurring: true,
        recurrenceType: "daily",
        recurrenceInterval: 1,
        isActive: true
      }
    ];

    await db.insert(tasks).values(taskData);
    console.log("Created tasks");

    // Create some task instances for today
    const today = new Date();
    today.setHours(23, 59, 59, 999);

    const allTasks = await db.select().from(tasks).where({ householdId: household.id });
    
    const instanceData = [];
    for (const task of allTasks) {
      // Create instances for daily tasks
      if (task.recurrenceType === "daily") {
        instanceData.push({
          taskId: task.id,
          assignedTo: task.assignedTo,
          isSecondary: false,
          dueDate: today,
          isCompleted: Math.random() > 0.7, // Some completed randomly
          pointsEarned: Math.random() > 0.7 ? task.points : 0,
          completedAt: Math.random() > 0.7 ? today : null,
          isOverdue: false,
          currentPriority: task.priority || 1
        });
      }
    }

    if (instanceData.length > 0) {
      await db.insert(taskInstances).values(instanceData);
      console.log("Created task instances");
    }

    console.log("Database seeding completed successfully!");
  } catch (error) {
    console.error("Error seeding database:", error);
    throw error;
  }
}