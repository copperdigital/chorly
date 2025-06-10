import { Pool } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import { tasks } from '../../../../../shared/schema';
import { eq } from 'drizzle-orm';

export async function onRequestPUT(context: any) {
  try {
    const pool = new Pool({ connectionString: context.env.DATABASE_URL });
    const db = drizzle(pool);
    
    const url = new URL(context.request.url);
    const idMatch = url.pathname.match(/\/api\/admin\/tasks\/edit\/(\d+)/);
    
    if (!idMatch) {
      return new Response(JSON.stringify({ message: "Invalid URL format" }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    const id = Number(idMatch[1]);
    const body = await context.request.json();
    
    console.log("Updating task:", id, "with data:", body);
    
    // Parse and validate the update data
    const updates = {
      title: body.title,
      description: body.description,
      estimatedMinutes: Number(body.estimatedMinutes),
      points: Number(body.points),
      assignedTo: Number(body.assignedTo),
      isRecurring: Boolean(body.isRecurring),
      recurrenceType: body.isRecurring ? body.recurrenceType : null,
      recurrenceInterval: body.isRecurring ? Number(body.recurrenceInterval) : null,
      customDays: body.isRecurring && body.recurrenceType === "custom" ? Number(body.customDays) : null,
      dueDate: body.dueDate ? new Date(body.dueDate) : null,
      startDate: body.startDate ? new Date(body.startDate) : null,
      endDate: body.endDate ? new Date(body.endDate) : null,
      secondaryAssignees: body.secondaryAssignees || [],
      isActive: body.isActive !== undefined ? Boolean(body.isActive) : true,
      dueDateType: body.dueDateType || "by_date",
      priority: body.priority ? Number(body.priority) : 1,
    };
    
    console.log("Processed updates:", updates);
    
    const [updatedTask] = await db.update(tasks)
      .set(updates)
      .where(eq(tasks.id, id))
      .returning();
    
    if (!updatedTask) {
      return new Response(JSON.stringify({ message: "Task not found" }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    console.log("Updated task result:", updatedTask);
    return new Response(JSON.stringify(updatedTask), {
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error("Task update error:", error);
    return new Response(JSON.stringify({ 
      message: "Failed to update task", 
      error: error instanceof Error ? error.message : String(error) 
    }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export async function onRequestDELETE(context: any) {
  try {
    const pool = new Pool({ connectionString: context.env.DATABASE_URL });
    const db = drizzle(pool);
    
    const url = new URL(context.request.url);
    const idMatch = url.pathname.match(/\/api\/admin\/tasks\/edit\/(\d+)/);
    
    if (!idMatch) {
      return new Response(JSON.stringify({ message: "Invalid URL format" }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    const id = Number(idMatch[1]);
    
    const [deletedTask] = await db.delete(tasks).where(eq(tasks.id, id)).returning();
    
    if (!deletedTask) {
      return new Response(JSON.stringify({ message: "Task not found" }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    return new Response(JSON.stringify({ message: "Failed to delete task" }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}