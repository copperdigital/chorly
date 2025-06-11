import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import { eq, sql } from 'drizzle-orm';
import * as schema from '../../../shared/schema';

neonConfig.webSocketConstructor = WebSocket;

function getHouseholdIdFromSession(cookies: string): number | null {
  const sessionMatch = cookies.match(/session=authenticated_(\d+)/);
  return sessionMatch ? parseInt(sessionMatch[1]) : null;
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

    const { taskId, memberId, dueDate } = await request.json();
    
    const pool = new Pool({ connectionString: env.DATABASE_URL });
    const db = drizzle({ client: pool, schema });

    // Get task details for points
    const [task] = await db.select()
      .from(schema.tasks)
      .where(eq(schema.tasks.id, taskId))
      .limit(1);

    if (!task) {
      return new Response(JSON.stringify({ message: 'Task not found' }), {
        status: 404,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }

    // Create completion record
    const [completion] = await db.insert(schema.taskCompletions).values({
      taskId,
      memberId,
      pointsEarned: task.points,
      dueDate: new Date(dueDate)
    }).returning();

    // Update member's total points
    await db.update(schema.familyMembers)
      .set({
        totalPoints: sql`${schema.familyMembers.totalPoints} + ${task.points}`,
        currentStreak: sql`${schema.familyMembers.currentStreak} + 1`
      })
      .where(eq(schema.familyMembers.id, memberId));

    return new Response(JSON.stringify(completion), {
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });

  } catch (error) {
    console.error('Complete task error:', error);
    return new Response(JSON.stringify({ message: 'Server error' }), {
      status: 500,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
}