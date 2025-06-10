import { Pool } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import { households, people, tasks, taskInstances } from '../../shared/schema';
import { eq, and, gte, lte } from 'drizzle-orm';

export async function onRequestGet(context: any) {
  const { request, env } = context;
  
  try {
    const url = new URL(request.url);
    const householdId = parseInt(url.searchParams.get('householdId') || '0');
    const dateParam = url.searchParams.get('date');
    
    if (!householdId) {
      return new Response(JSON.stringify({ error: 'Household ID required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const pool = new Pool({ connectionString: env.DATABASE_URL });
    const db = drizzle(pool);

    // Get people in household
    const householdPeople = await db.select().from(people).where(eq(people.householdId, householdId));

    // Get task instances for the date
    const targetDate = dateParam ? new Date(dateParam) : new Date();
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    const instances = await db
      .select({
        taskInstance: taskInstances,
        task: tasks
      })
      .from(taskInstances)
      .leftJoin(tasks, eq(taskInstances.taskId, tasks.id))
      .where(
        and(
          eq(tasks.householdId, householdId),
          gte(taskInstances.dueDate, startOfDay),
          lte(taskInstances.dueDate, endOfDay)
        )
      );

    const formattedInstances = instances.map(({ taskInstance, task }) => ({
      id: taskInstance.id,
      isCompleted: taskInstance.isCompleted,
      isSecondary: taskInstance.isSecondary,
      pointsEarned: taskInstance.pointsEarned,
      assignedTo: taskInstance.assignedTo,
      task: task ? {
        id: task.id,
        title: task.title,
        description: task.description,
        estimatedMinutes: task.estimatedMinutes,
        points: task.points,
        isRecurring: task.isRecurring
      } : null
    }));

    return new Response(JSON.stringify({
      people: householdPeople,
      taskInstances: formattedInstances
    }), {
      status: 200,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });

  } catch (error) {
    console.error('Dashboard error:', error);
    return new Response(JSON.stringify({ 
      people: [], 
      taskInstances: [],
      error: 'Failed to load dashboard data'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}