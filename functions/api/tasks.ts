import { Pool } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import { tasks } from '../../shared/schema';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

const insertTaskSchema = z.object({
  householdId: z.number(),
  title: z.string().min(1),
  description: z.string().optional(),
  points: z.number().min(0),
  assignedTo: z.number(),
  secondaryAssignees: z.array(z.string()).optional(),
  dueDate: z.string().transform(str => new Date(str)),
  endDate: z.string().transform(str => new Date(str)).optional(),
  recurrenceType: z.enum(['none', 'daily', 'weekly', 'monthly']).default('none'),
  recurrenceInterval: z.number().min(1).default(1),
  isActive: z.boolean().default(true)
});

export async function onRequestPOST(context: any) {
  try {
    const pool = new Pool({ connectionString: context.env.DATABASE_URL });
    const db = drizzle(pool);
    
    const body = await context.request.json();
    console.log("Received task data:", body);
    
    const taskData = insertTaskSchema.parse(body);
    console.log("Parsed task data:", taskData);
    
    const [task] = await db.insert(tasks).values(taskData).returning();
    
    return new Response(JSON.stringify(task), {
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error("Task creation error:", error);
    return new Response(JSON.stringify({ 
      message: "Invalid task data", 
      error: error instanceof Error ? error.message : String(error) 
    }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}