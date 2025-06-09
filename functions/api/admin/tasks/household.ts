import { DatabaseStorage } from '../../../../server/db';

export async function onRequestGet(context: any) {
  try {
    const storage = new DatabaseStorage();
    const householdId = Number(context.params.householdId);
    
    const tasks = await storage.getTasksByHousehold(householdId);
    
    return new Response(JSON.stringify(tasks), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ message: 'Failed to load tasks' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export async function onRequestPost(context: any) {
  try {
    const storage = new DatabaseStorage();
    const householdId = Number(context.params.householdId);
    const body = await context.request.json();
    
    const task = await storage.createTask({
      ...body,
      householdId
    });
    
    return new Response(JSON.stringify(task), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ message: 'Failed to create task' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}