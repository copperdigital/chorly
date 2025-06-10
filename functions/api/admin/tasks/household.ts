import { Pool } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import { tasks, taskInstances } from '../../../../shared/schema';
import { eq } from 'drizzle-orm';

export async function onRequestGet(context: any) {
  const { request, env } = context;
  
  try {
    const url = new URL(request.url);
    const householdId = parseInt(url.searchParams.get('householdId') || '0');
    
    if (!householdId) {
      return new Response(JSON.stringify({ error: 'Household ID required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const pool = new Pool({ connectionString: env.DATABASE_URL });
    const db = drizzle(pool);

    const householdTasks = await db.select().from(tasks).where(eq(tasks.householdId, householdId));

    return new Response(JSON.stringify({ tasks: householdTasks }), {
      status: 200,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });

  } catch (error) {
    console.error('Get tasks error:', error);
    return new Response(JSON.stringify({ error: 'Failed to get tasks' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export async function onRequestPost(context: any) {
  const { request, env } = context;
  
  try {
    const taskData = await request.json();
    
    const pool = new Pool({ connectionString: env.DATABASE_URL });
    const db = drizzle(pool);

    const [newTask] = await db.insert(tasks).values({
      householdId: taskData.householdId,
      title: taskData.title,
      description: taskData.description,
      estimatedMinutes: taskData.estimatedMinutes,
      points: taskData.points,
      isRecurring: taskData.isRecurring,
      recurrenceType: taskData.recurrenceType,
      recurrenceInterval: taskData.recurrenceInterval,
      customDays: taskData.customDays,
      dueDate: new Date(taskData.dueDate),
      dueDateType: taskData.dueDateType || 'fixed',
      isActive: true,
      priority: taskData.priority || 1
    }).returning();

    return new Response(JSON.stringify({ success: true, task: newTask }), {
      status: 201,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });

  } catch (error) {
    console.error('Create task error:', error);
    return new Response(JSON.stringify({ error: 'Failed to create task' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}