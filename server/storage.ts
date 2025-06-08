import {
  households, people, tasks, taskInstances, blackMarks, rewards, rewardClaims,
  type Household, type Person, type Task, type TaskInstance, type BlackMark, 
  type Reward, type RewardClaim, type InsertHousehold, type InsertPerson,
  type InsertTask, type InsertTaskInstance, type InsertBlackMark,
  type InsertReward, type InsertRewardClaim
} from "@shared/schema";

export interface IStorage {
  // Households
  getHousehold(id: number): Promise<Household | undefined>;
  getHouseholdByEmail(email: string): Promise<Household | undefined>;
  createHousehold(household: InsertHousehold): Promise<Household>;

  // People
  getPerson(id: number): Promise<Person | undefined>;
  getPeopleByHousehold(householdId: number): Promise<Person[]>;
  createPerson(person: InsertPerson): Promise<Person>;
  updatePerson(id: number, updates: Partial<Omit<Person, 'id'>>): Promise<Person | undefined>;

  // Tasks
  getTask(id: number): Promise<Task | undefined>;
  getTasksByHousehold(householdId: number): Promise<Task[]>;
  createTask(task: InsertTask): Promise<Task>;
  updateTask(id: number, updates: Partial<Omit<Task, 'id'>>): Promise<Task | undefined>;
  deleteTask(id: number): Promise<boolean>;

  // Task Instances
  getTaskInstance(id: number): Promise<TaskInstance | undefined>;
  getTaskInstancesByDateRange(householdId: number, startDate: Date, endDate: Date): Promise<TaskInstance[]>;
  getTodayTaskInstances(householdId: number): Promise<TaskInstance[]>;
  createTaskInstance(taskInstance: InsertTaskInstance): Promise<TaskInstance>;
  updateTaskInstance(id: number, updates: Partial<Omit<TaskInstance, 'id'>>): Promise<TaskInstance | undefined>;
  getLastCompletionDate(taskId: number): Promise<Date | null>;

  // Black Marks
  createBlackMark(blackMark: InsertBlackMark): Promise<BlackMark>;
  getBlackMarksByPerson(personId: number): Promise<BlackMark[]>;

  // Rewards
  getReward(id: number): Promise<Reward | undefined>;
  getRewardsByHousehold(householdId: number): Promise<Reward[]>;
  createReward(reward: InsertReward): Promise<Reward>;
  updateReward(id: number, updates: Partial<Omit<Reward, 'id'>>): Promise<Reward | undefined>;
  deleteReward(id: number): Promise<boolean>;

  // Reward Claims
  createRewardClaim(claim: InsertRewardClaim): Promise<RewardClaim>;
  getRewardClaimsByPerson(personId: number): Promise<RewardClaim[]>;
}

export class MemStorage implements IStorage {
  private households: Map<number, Household> = new Map();
  private people: Map<number, Person> = new Map();
  private tasks: Map<number, Task> = new Map();
  private taskInstances: Map<number, TaskInstance> = new Map();
  private blackMarks: Map<number, BlackMark> = new Map();
  private rewards: Map<number, Reward> = new Map();
  private rewardClaims: Map<number, RewardClaim> = new Map();
  private currentId = 1;

  constructor() {
    this.seedData();
  }

  private getNextId(): number {
    return this.currentId++;
  }

  private seedData() {
    // Create a sample household
    const household: Household = {
      id: this.getNextId(),
      name: "Suttie Family",
      email: "family@suttie.com",
      password: "password123"
    };
    this.households.set(household.id, household);

    // Create family members
    const dad: Person = {
      id: this.getNextId(),
      householdId: household.id,
      nickname: "Dad",
      pin: "1234",
      isAdmin: true,
      currentStreak: 8,
      totalPoints: 245,
      avatar: "primary"
    };
    this.people.set(dad.id, dad);

    const mum: Person = {
      id: this.getNextId(),
      householdId: household.id,
      nickname: "Mum",
      pin: "5678",
      isAdmin: true,
      currentStreak: 15,
      totalPoints: 398,
      avatar: "secondary"
    };
    this.people.set(mum.id, mum);

    const seb: Person = {
      id: this.getNextId(),
      householdId: household.id,
      nickname: "Seb",
      pin: "9876",
      isAdmin: false,
      currentStreak: 12,
      totalPoints: 289,
      avatar: "accent"
    };
    this.people.set(seb.id, seb);

    const tessa: Person = {
      id: this.getNextId(),
      householdId: household.id,
      nickname: "Tessa",
      pin: "5432",
      isAdmin: false,
      currentStreak: 3,
      totalPoints: 156,
      avatar: "pink"
    };
    this.people.set(tessa.id, tessa);

    // Create sample tasks
    const makeBedTask: Task = {
      id: this.getNextId(),
      householdId: household.id,
      title: "Make bed",
      description: "Tidy up bedroom",
      estimatedMinutes: 5,
      points: 15,
      isRecurring: true,
      recurrenceType: "daily",
      recurrenceInterval: 1,
      customDays: null,
      dueDate: null,
      startDate: null,
      endDate: null,
      assignedTo: seb.id,
      secondaryAssignees: [],
      isActive: true,
      dueDateType: "on_date",
      priority: 2
    };
    this.tasks.set(makeBedTask.id, makeBedTask);

    const feedPetsTask: Task = {
      id: this.getNextId(),
      householdId: household.id,
      title: "Feed pets",
      description: "Give food and fresh water",
      estimatedMinutes: 3,
      points: 10,
      isRecurring: true,
      recurrenceType: "daily",
      recurrenceInterval: 1,
      customDays: null,
      startDate: null,
      endDate: null,
      assignedTo: seb.id,
      secondaryAssignees: [],
      isActive: true,
      dueDateType: "on_date",
      priority: 2
    };
    this.tasks.set(feedPetsTask.id, feedPetsTask);

    const cleanBathroomTask: Task = {
      id: this.getNextId(),
      householdId: household.id,
      title: "Clean bathroom sink",
      description: "Wipe down sink and mirror",
      estimatedMinutes: 8,
      points: 20,
      isRecurring: true,
      recurrenceType: "daily",
      recurrenceInterval: 1,
      customDays: null,
      startDate: null,
      endDate: null,
      assignedTo: seb.id,
      secondaryAssignees: [],
      isActive: true,
      dueDateType: "on_date",
      priority: 2
    };
    this.tasks.set(cleanBathroomTask.id, cleanBathroomTask);

    // Create task instances for today
    const today = new Date();
    today.setHours(23, 59, 59, 999);

    const makeBedInstance: TaskInstance = {
      id: this.getNextId(),
      taskId: makeBedTask.id,
      assignedTo: seb.id,
      isSecondary: false,
      dueDate: today,
      completedAt: new Date(),
      isCompleted: true,
      pointsEarned: 15
    };
    this.taskInstances.set(makeBedInstance.id, makeBedInstance);

    const feedPetsInstance: TaskInstance = {
      id: this.getNextId(),
      taskId: feedPetsTask.id,
      assignedTo: seb.id,
      isSecondary: false,
      dueDate: today,
      completedAt: new Date(),
      isCompleted: true,
      pointsEarned: 10
    };
    this.taskInstances.set(feedPetsInstance.id, feedPetsInstance);

    const cleanBathroomInstance: TaskInstance = {
      id: this.getNextId(),
      taskId: cleanBathroomTask.id,
      assignedTo: seb.id,
      isSecondary: false,
      dueDate: today,
      completedAt: null,
      isCompleted: false,
      pointsEarned: 0
    };
    this.taskInstances.set(cleanBathroomInstance.id, cleanBathroomInstance);

    // Add more tasks for variety
    const dishwasherTask: Task = {
      id: this.getNextId(),
      householdId: household.id,
      title: "Load dishwasher",
      description: "Load dirty dishes and start cycle",
      estimatedMinutes: 5,
      points: 10,
      isRecurring: true,
      recurrenceType: "daily",
      recurrenceInterval: 1,
      customDays: null,
      startDate: null,
      endDate: null,
      assignedTo: tessa.id,
      secondaryAssignees: [],
      isActive: true
    };
    this.tasks.set(dishwasherTask.id, dishwasherTask);

    const kitchenCountersTask: Task = {
      id: this.getNextId(),
      householdId: household.id,
      title: "Wipe kitchen counters",
      description: "Clean and sanitize countertops",
      estimatedMinutes: 10,
      points: 15,
      isRecurring: true,
      recurrenceType: "daily",
      recurrenceInterval: 1,
      customDays: null,
      startDate: null,
      endDate: null,
      assignedTo: mum.id,
      secondaryAssignees: [],
      isActive: true
    };
    this.tasks.set(kitchenCountersTask.id, kitchenCountersTask);

    const trashTask: Task = {
      id: this.getNextId(),
      householdId: household.id,
      title: "Take out trash",
      description: "Empty bins and take to curb",
      estimatedMinutes: 8,
      points: 12,
      isRecurring: true,
      recurrenceType: "daily",
      recurrenceInterval: 1,
      customDays: null,
      startDate: null,
      endDate: null,
      assignedTo: dad.id,
      secondaryAssignees: [],
      isActive: true
    };
    this.tasks.set(trashTask.id, trashTask);

    const vacuumTask: Task = {
      id: this.getNextId(),
      householdId: household.id,
      title: "Vacuum living room",
      description: "Vacuum carpet and under furniture",
      estimatedMinutes: 15,
      points: 25,
      isRecurring: true,
      recurrenceType: "daily",
      recurrenceInterval: 1,
      customDays: null,
      startDate: null,
      endDate: null,
      assignedTo: seb.id,
      secondaryAssignees: [],
      isActive: true
    };
    this.tasks.set(vacuumTask.id, vacuumTask);

    const laundryTask: Task = {
      id: this.getNextId(),
      householdId: household.id,
      title: "Fold laundry",
      description: "Fold and put away clean clothes",
      estimatedMinutes: 20,
      points: 30,
      isRecurring: true,
      recurrenceType: "daily",
      recurrenceInterval: 1,
      customDays: null,
      startDate: null,
      endDate: null,
      assignedTo: mum.id,
      secondaryAssignees: [],
      isActive: true
    };
    this.tasks.set(laundryTask.id, laundryTask);

    // Create more task instances
    const dishwasherInstance: TaskInstance = {
      id: this.getNextId(),
      taskId: dishwasherTask.id,
      assignedTo: tessa.id,
      isSecondary: false,
      dueDate: today,
      completedAt: null,
      isCompleted: false,
      pointsEarned: 0
    };
    this.taskInstances.set(dishwasherInstance.id, dishwasherInstance);

    const kitchenCountersInstance: TaskInstance = {
      id: this.getNextId(),
      taskId: kitchenCountersTask.id,
      assignedTo: mum.id,
      isSecondary: false,
      dueDate: today,
      completedAt: new Date(),
      isCompleted: true,
      pointsEarned: 15
    };
    this.taskInstances.set(kitchenCountersInstance.id, kitchenCountersInstance);

    const trashInstance: TaskInstance = {
      id: this.getNextId(),
      taskId: trashTask.id,
      assignedTo: dad.id,
      isSecondary: false,
      dueDate: today,
      completedAt: null,
      isCompleted: false,
      pointsEarned: 0
    };
    this.taskInstances.set(trashInstance.id, trashInstance);

    const vacuumInstance: TaskInstance = {
      id: this.getNextId(),
      taskId: vacuumTask.id,
      assignedTo: seb.id,
      isSecondary: false,
      dueDate: today,
      completedAt: null,
      isCompleted: false,
      pointsEarned: 0
    };
    this.taskInstances.set(vacuumInstance.id, vacuumInstance);

    const laundryInstance: TaskInstance = {
      id: this.getNextId(),
      taskId: laundryTask.id,
      assignedTo: mum.id,
      isSecondary: false,
      dueDate: today,
      completedAt: null,
      isCompleted: false,
      pointsEarned: 0
    };
    this.taskInstances.set(laundryInstance.id, laundryInstance);
  }

  // Households
  async getHousehold(id: number): Promise<Household | undefined> {
    return this.households.get(id);
  }

  async getHouseholdByEmail(email: string): Promise<Household | undefined> {
    return Array.from(this.households.values()).find(h => h.email === email);
  }

  async createHousehold(household: InsertHousehold): Promise<Household> {
    const id = this.getNextId();
    const newHousehold: Household = { ...household, id };
    this.households.set(id, newHousehold);
    return newHousehold;
  }

  // People
  async getPerson(id: number): Promise<Person | undefined> {
    return this.people.get(id);
  }

  async getPeopleByHousehold(householdId: number): Promise<Person[]> {
    return Array.from(this.people.values()).filter(p => p.householdId === householdId);
  }

  async createPerson(person: InsertPerson): Promise<Person> {
    const id = this.getNextId();
    const newPerson: Person = { 
      id,
      householdId: person.householdId,
      nickname: person.nickname,
      pin: person.pin,
      isAdmin: person.isAdmin ?? false,
      currentStreak: person.currentStreak ?? 0,
      totalPoints: person.totalPoints ?? 0,
      avatar: person.avatar ?? "blue"
    };
    this.people.set(id, newPerson);
    return newPerson;
  }

  async updatePerson(id: number, updates: Partial<Omit<Person, 'id'>>): Promise<Person | undefined> {
    const person = this.people.get(id);
    if (!person) return undefined;
    const updated = { ...person, ...updates };
    this.people.set(id, updated);
    return updated;
  }

  // Tasks
  async getTask(id: number): Promise<Task | undefined> {
    return this.tasks.get(id);
  }

  async getTasksByHousehold(householdId: number): Promise<Task[]> {
    return Array.from(this.tasks.values()).filter(t => t.householdId === householdId && t.isActive);
  }

  async createTask(task: InsertTask): Promise<Task> {
    const id = this.getNextId();
    const newTask: Task = { 
      id,
      householdId: task.householdId,
      title: task.title,
      description: task.description ?? null,
      estimatedMinutes: task.estimatedMinutes ?? 5,
      points: task.points ?? 10,
      isRecurring: task.isRecurring ?? false,
      recurrenceType: task.recurrenceType ?? null,
      recurrenceInterval: task.recurrenceInterval ?? null,
      customDays: task.customDays ?? null,
      startDate: task.startDate ?? null,
      endDate: task.endDate ?? null,
      assignedTo: task.assignedTo,
      secondaryAssignees: task.secondaryAssignees ?? [],
      isActive: task.isActive ?? true
    };
    this.tasks.set(id, newTask);
    return newTask;
  }

  async updateTask(id: number, updates: Partial<Omit<Task, 'id'>>): Promise<Task | undefined> {
    const task = this.tasks.get(id);
    if (!task) return undefined;
    const updated = { ...task, ...updates };
    this.tasks.set(id, updated);
    return updated;
  }

  async deleteTask(id: number): Promise<boolean> {
    return this.tasks.delete(id);
  }

  // Task Instances
  async getTaskInstance(id: number): Promise<TaskInstance | undefined> {
    return this.taskInstances.get(id);
  }

  async getTaskInstancesByDateRange(householdId: number, startDate: Date, endDate: Date): Promise<TaskInstance[]> {
    const householdTasks = Array.from(this.tasks.values()).filter(t => t.householdId === householdId);
    const householdTaskIds = new Set(householdTasks.map(t => t.id));
    
    return Array.from(this.taskInstances.values()).filter(ti => 
      householdTaskIds.has(ti.taskId) && 
      ti.dueDate >= startDate && 
      ti.dueDate <= endDate
    );
  }

  async getTodayTaskInstances(householdId: number): Promise<TaskInstance[]> {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999);
    
    return this.getTaskInstancesByDateRange(householdId, startOfDay, endOfDay);
  }

  async createTaskInstance(taskInstance: InsertTaskInstance): Promise<TaskInstance> {
    const id = this.getNextId();
    const newTaskInstance: TaskInstance = { 
      id,
      taskId: taskInstance.taskId,
      assignedTo: taskInstance.assignedTo,
      isSecondary: taskInstance.isSecondary ?? false,
      dueDate: taskInstance.dueDate,
      completedAt: taskInstance.completedAt ?? null,
      isCompleted: taskInstance.isCompleted ?? false,
      pointsEarned: taskInstance.pointsEarned ?? null
    };
    this.taskInstances.set(id, newTaskInstance);
    return newTaskInstance;
  }

  async updateTaskInstance(id: number, updates: Partial<Omit<TaskInstance, 'id'>>): Promise<TaskInstance | undefined> {
    const taskInstance = this.taskInstances.get(id);
    if (!taskInstance) return undefined;
    const updated = { ...taskInstance, ...updates };
    this.taskInstances.set(id, updated);
    return updated;
  }

  async getLastCompletionDate(taskId: number): Promise<Date | null> {
    const completedInstances = Array.from(this.taskInstances.values())
      .filter(instance => instance.taskId === taskId && instance.isCompleted && instance.completedAt)
      .sort((a, b) => new Date(b.completedAt!).getTime() - new Date(a.completedAt!).getTime());
    
    return completedInstances.length > 0 ? new Date(completedInstances[0].completedAt!) : null;
  }

  // Black Marks
  async createBlackMark(blackMark: InsertBlackMark): Promise<BlackMark> {
    const id = this.getNextId();
    const newBlackMark: BlackMark = { ...blackMark, id };
    this.blackMarks.set(id, newBlackMark);
    return newBlackMark;
  }

  async getBlackMarksByPerson(personId: number): Promise<BlackMark[]> {
    return Array.from(this.blackMarks.values()).filter(bm => bm.personId === personId);
  }

  // Rewards
  async getReward(id: number): Promise<Reward | undefined> {
    return this.rewards.get(id);
  }

  async getRewardsByHousehold(householdId: number): Promise<Reward[]> {
    return Array.from(this.rewards.values()).filter(r => r.householdId === householdId && r.isAvailable);
  }

  async createReward(reward: InsertReward): Promise<Reward> {
    const id = this.getNextId();
    const newReward: Reward = { 
      id,
      householdId: reward.householdId,
      title: reward.title,
      description: reward.description ?? null,
      pointsCost: reward.pointsCost,
      isAvailable: reward.isAvailable ?? true
    };
    this.rewards.set(id, newReward);
    return newReward;
  }

  async updateReward(id: number, updates: Partial<Omit<Reward, 'id'>>): Promise<Reward | undefined> {
    const reward = this.rewards.get(id);
    if (!reward) return undefined;
    const updated = { ...reward, ...updates };
    this.rewards.set(id, updated);
    return updated;
  }

  async deleteReward(id: number): Promise<boolean> {
    return this.rewards.delete(id);
  }

  // Reward Claims
  async createRewardClaim(claim: InsertRewardClaim): Promise<RewardClaim> {
    const id = this.getNextId();
    const newClaim: RewardClaim = { ...claim, id };
    this.rewardClaims.set(id, newClaim);
    return newClaim;
  }

  async getRewardClaimsByPerson(personId: number): Promise<RewardClaim[]> {
    return Array.from(this.rewardClaims.values()).filter(rc => rc.personId === personId);
  }
}

export const storage = new MemStorage();
