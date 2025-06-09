import { DatabaseStorage } from '../../server/db';

export async function onRequestGet(context: any) {
  try {
    const storage = new DatabaseStorage();
    const url = new URL(context.request.url);
    const dateParam = url.searchParams.get('date');
    
    // Default to today if no date provided
    const targetDate = dateParam ? new Date(dateParam) : new Date();
    
    // Get all people for the household (assuming household 1 for now)
    const people = await storage.getPeopleByHousehold(1);
    
    // Get existing task instances for the target date
    const startDate = new Date(targetDate);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(targetDate);
    endDate.setHours(23, 59, 59, 999);
    
    const existingInstances = await storage.getTaskInstancesByDateRange(1, startDate, endDate);
    
    // Get all active tasks to generate recurring instances
    const allTasks = await storage.getTasksByHousehold(1);
    const activeTasks = allTasks.filter(task => task.isActive);
    
    // Generate task instances for the target date
    const generatedInstances = [];
    for (const task of activeTasks) {
      const existingInstance = existingInstances.find(inst => 
        inst.taskId === task.id && inst.assignedTo === task.assignedTo
      );
      
      if (!existingInstance) {
        let shouldGenerate = false;
        
        if (task.isRecurring) {
          shouldGenerate = true; // Generate for every day for recurring tasks
        } else {
          // For non-recurring tasks, check if they're due on the target date
          if (task.dueDate) {
            const taskDueDate = new Date(task.dueDate);
            shouldGenerate = taskDueDate >= startDate && taskDueDate <= endDate;
          }
        }
        
        if (shouldGenerate) {
          const newInstance = await storage.createTaskInstance({
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
          generatedInstances.push(newInstance);
        }
      }
    }
    
    // Get all instances for the target date (existing + generated)
    const allInstances = await storage.getTaskInstancesByDateRange(1, startDate, endDate);
    
    // Create a map of tasks for quick lookup
    const tasksMap = new Map();
    for (const instance of allInstances) {
      if (!tasksMap.has(instance.taskId)) {
        const task = await storage.getTask(instance.taskId);
        if (task) tasksMap.set(instance.taskId, task);
      }
    }

    const enrichedInstances = allInstances
      .filter(instance => {
        const instanceDate = new Date(instance.dueDate);
        return instanceDate >= startDate && instanceDate <= endDate;
      })
      .map(instance => ({
        ...instance,
        task: tasksMap.get(instance.taskId)
      }));

    return new Response(JSON.stringify({
      people,
      taskInstances: enrichedInstances
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Dashboard API error:', error);
    return new Response(JSON.stringify({ message: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}