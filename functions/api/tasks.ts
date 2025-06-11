import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import { eq, and, desc, sql } from 'drizzle-orm';
import * as schema from '../../shared/schema';

neonConfig.webSocketConstructor = WebSocket;

function getHouseholdIdFromSession(cookies: string): number | null {
  const sessionMatch = cookies.match(/session=authenticated_(\d+)/);
  return sessionMatch ? parseInt(sessionMatch[1]) : null;
}

export async function onRequestGet(context: any) {
  const { env, request } = context;
  
  try {
    const cookies = request.headers.get('cookie') || '';
    const householdId = getHouseholdIdFromSession(cookies);
    
    if (!householdId) {
      return new Response(JSON.stringify({ message: 'Not authenticated' }), {
        status: 401,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }

    const url = new URL(request.url);
    const date = url.searchParams.get('date') || new Date().toISOString().split('T')[0];
    const memberId = url.searchParams.get('memberId');
    const view = url.searchParams.get('view') || 'day';

    const pool = new Pool({ connectionString: env.DATABASE_URL });
    const db = drizzle({ client: pool, schema });

    // Get tasks with assignees
    const tasks = await db.select({
      id: schema.tasks.id,
      name: schema.tasks.name,
      description: schema.tasks.description,
      points: schema.tasks.points,
      scheduleType: schema.tasks.scheduleType,
      scheduleValue: schema.tasks.scheduleValue,
      startDate: schema.tasks.startDate,
      endDate: schema.tasks.endDate,
      householdId: schema.tasks.householdId,
      createdAt: schema.tasks.createdAt,
      assignees: sql`COALESCE(
        json_agg(
          json_build_object(
            'id', ${schema.familyMembers.id},
            'name', ${schema.familyMembers.name},
            'color', ${schema.familyMembers.color},
            'role', ${schema.familyMembers.role}
          )
        ) FILTER (WHERE ${schema.familyMembers.id} IS NOT NULL),
        '[]'
      )`.as('assignees')
    })
    .from(schema.tasks)
    .leftJoin(schema.taskAssignments, eq(schema.tasks.id, schema.taskAssignments.taskId))
    .leftJoin(schema.familyMembers, eq(schema.taskAssignments.memberId, schema.familyMembers.id))
    .where(eq(schema.tasks.householdId, householdId))
    .groupBy(schema.tasks.id)
    .orderBy(schema.tasks.createdAt);

    // Filter tasks based on date and schedule
    const targetDate = new Date(date);
    const filteredTasks = tasks.filter(task => {
      const startDate = new Date(task.startDate);
      
      if (task.endDate && new Date(task.endDate) < targetDate) {
        return false;
      }

      if (startDate > targetDate) {
        return false;
      }

      if (task.scheduleType === 'once') {
        return startDate.toDateString() === targetDate.toDateString();
      }

      if (task.scheduleType === 'daily') {
        const daysDiff = Math.floor((targetDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
        return daysDiff >= 0 && daysDiff % (task.scheduleValue || 1) === 0;
      }

      if (task.scheduleType === 'weekly') {
        const daysDiff = Math.floor((targetDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
        return daysDiff >= 0 && daysDiff % ((task.scheduleValue || 1) * 7) === 0;
      }

      return true;
    });

    return new Response(JSON.stringify(filteredTasks), {
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });

  } catch (error) {
    console.error('Tasks error:', error);
    return new Response(JSON.stringify({ message: 'Server error' }), {
      status: 500,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
}

export async function onRequestPost(context: any) {
  const { env, request } = context;
  
  try {
    const cookies = request.headers.get('cookie') || '';
    const householdId = getHouseholdIdFromSession(cookies);
    
    if (!householdId) {
      return new Response(JSON.stringify({ message: 'Not authenticated' }), {
        status: 401,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }

    const taskData = await request.json();
    
    const pool = new Pool({ connectionString: env.DATABASE_URL });
    const db = drizzle({ client: pool, schema });

    const [task] = await db.insert(schema.tasks).values({
      ...taskData,
      householdId
    }).returning();

    return new Response(JSON.stringify(task), {
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });

  } catch (error) {
    console.error('Create task error:', error);
    return new Response(JSON.stringify({ message: 'Server error' }), {
      status: 500,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
}