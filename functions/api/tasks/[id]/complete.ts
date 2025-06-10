import { Pool } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import { tasks, taskInstances, people } from '../../../../shared/schema';
import { eq, and, gte, lte } from 'drizzle-orm';

export async function onRequestPost(context: any) {
  try {
    const pool = new Pool({ connectionString: context.env.DATABASE_URL });
    const db = drizzle(pool);
    
    // Extract task instance ID from URL params
    const { id } = context.params;
    const instanceId = Number(id);
    
    const body = await context.request.json();
    const { personId } = body;
    
    // Get task instance
    const [instance] = await db.select().from(taskInstances).where(eq(taskInstances.id, instanceId));
    if (!instance) {
      return new Response(JSON.stringify({ message: "Task instance not found" }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (instance.isCompleted) {
      return new Response(JSON.stringify({ message: "Task already completed" }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Get task
    const [task] = await db.select().from(tasks).where(eq(tasks.id, instance.taskId));
    if (!task) {
      return new Response(JSON.stringify({ message: "Task not found" }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Check if person can complete this task
    const canComplete = instance.assignedTo === personId || 
                       (instance.isSecondary && task.secondaryAssignees?.includes(String(personId)));
    
    if (!canComplete) {
      return new Response(JSON.stringify({ message: "Not authorized to complete this task" }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // For secondary tasks, check if primary tasks are complete
    if (instance.isSecondary) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayEnd = new Date(today);
      todayEnd.setHours(23, 59, 59, 999);
      
      const todayInstances = await db.select()
        .from(taskInstances)
        .innerJoin(tasks, eq(taskInstances.taskId, tasks.id))
        .where(
          and(
            eq(tasks.householdId, task.householdId),
            gte(taskInstances.dueDate, today),
            lte(taskInstances.dueDate, todayEnd)
          )
        );
        
      const primaryInstancesForPerson = todayInstances.filter(ti => 
        ti.task_instances.assignedTo === personId && !ti.task_instances.isSecondary
      );
      const allPrimaryComplete = primaryInstancesForPerson.every(ti => ti.task_instances.isCompleted);
      
      if (!allPrimaryComplete) {
        return new Response(JSON.stringify({ message: "Complete all primary tasks first" }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }

    // Complete the task
    const pointsEarned = instance.isSecondary ? Math.floor(task.points * 0.5) : task.points;
    const [updatedInstance] = await db.update(taskInstances)
      .set({
        isCompleted: true,
        completedAt: new Date(),
        pointsEarned
      })
      .where(eq(taskInstances.id, instanceId))
      .returning();

    // Update person's points
    const [person] = await db.select().from(people).where(eq(people.id, personId));
    if (person) {
      await db.update(people)
        .set({
          totalPoints: person.totalPoints + pointsEarned
        })
        .where(eq(people.id, personId));
    }

    return new Response(JSON.stringify({
      ...updatedInstance,
      taskTitle: task.title
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('Task completion error:', error);
    return new Response(JSON.stringify({ message: "Failed to complete task" }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}