import { Pool } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import { taskInstances, people } from '../../../shared/schema';
import { eq } from 'drizzle-orm';

export async function onRequestPost(context: any) {
  const { request, env } = context;
  
  try {
    const { instanceId, personId } = await request.json();
    
    if (!instanceId || !personId) {
      return new Response(JSON.stringify({ error: 'Instance ID and Person ID required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const pool = new Pool({ connectionString: env.DATABASE_URL });
    const db = drizzle(pool);

    // Get the task instance
    const [instance] = await db.select().from(taskInstances).where(eq(taskInstances.id, instanceId));
    
    if (!instance) {
      return new Response(JSON.stringify({ error: 'Task instance not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Mark as completed
    await db
      .update(taskInstances)
      .set({
        isCompleted: true,
        completedAt: new Date(),
        pointsEarned: instance.pointsEarned || 15
      })
      .where(eq(taskInstances.id, instanceId));

    // Update person's total points
    const [person] = await db.select().from(people).where(eq(people.id, personId));
    if (person) {
      await db
        .update(people)
        .set({
          totalPoints: (person.totalPoints || 0) + (instance.pointsEarned || 15),
          currentStreak: (person.currentStreak || 0) + 1
        })
        .where(eq(people.id, personId));
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