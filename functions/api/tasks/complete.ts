import { Pool } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import { taskInstances, people } from '../../../shared/schema';
import { eq } from 'drizzle-orm';

export async function onRequestPost(context: any) {
  const { request, env } = context;
  
  try {
    const { taskInstanceId } = await request.json();
    
    if (!taskInstanceId) {
      return new Response(JSON.stringify({ error: 'Task instance ID required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const pool = new Pool({ connectionString: env.DATABASE_URL });
    const db = drizzle(pool);

    // Get the task instance
    const [instance] = await db.select().from(taskInstances).where(eq(taskInstances.id, parseInt(taskInstanceId)));
    
    if (!instance) {
      return new Response(JSON.stringify({ error: 'Task instance not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Calculate points from associated task
    const pointsToAward = 15; // Default points

    // Mark as completed
    await db
      .update(taskInstances)
      .set({
        isCompleted: true,
        completedAt: new Date(),
        pointsEarned: pointsToAward
      })
      .where(eq(taskInstances.id, parseInt(taskInstanceId)));

    // Update person's total points
    const [person] = await db.select().from(people).where(eq(people.id, instance.assignedTo));
    if (person) {
      await db
        .update(people)
        .set({
          totalPoints: (person.totalPoints || 0) + pointsToAward,
          currentStreak: (person.currentStreak || 0) + 1
        })
        .where(eq(people.id, instance.assignedTo));
    }

    return new Response(JSON.stringify({
      success: true,
      pointsEarned: instance.pointsEarned || 15,
      taskTitle: 'Task completed'
    }), {
      status: 200,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });

  } catch (error) {
    console.error('Complete task error:', error);
    return new Response(JSON.stringify({ error: 'Failed to complete task' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}