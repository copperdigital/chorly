import { DatabaseStorage } from '../../../../server/db';

export async function onRequestPost(context: any) {
  try {
    const storage = new DatabaseStorage();
    const instanceId = Number(context.params.id);
    const body = await context.request.json();
    const { personId } = body;

    const instance = await storage.getTaskInstance(instanceId);
    if (!instance) {
      return new Response(JSON.stringify({ message: 'Task instance not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const task = await storage.getTask(instance.taskId);
    if (!task) {
      return new Response(JSON.stringify({ message: 'Task not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Complete the task
    const pointsEarned = instance.isSecondary ? Math.floor(task.points * 0.5) : task.points;
    const updatedInstance = await storage.updateTaskInstance(instanceId, {
      isCompleted: true,
      completedAt: new Date(),
      pointsEarned
    });

    // Update person's points
    const person = await storage.getPerson(personId);
    if (person) {
      await storage.updatePerson(personId, {
        totalPoints: person.totalPoints + pointsEarned
      });
    }

    return new Response(JSON.stringify(updatedInstance), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ message: 'Failed to complete task' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}