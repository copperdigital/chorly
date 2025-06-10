import { Pool } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import { tasks } from '../../../../shared/schema';
import { eq } from 'drizzle-orm';

export async function onRequestGet(context: any) {
  try {
    const pool = new Pool({ connectionString: context.env.DATABASE_URL });
    const db = drizzle(pool);
    
    const url = new URL(context.request.url);
    const householdIdMatch = url.pathname.match(/\/api\/admin\/tasks\/(\d+)/);
    
    if (!householdIdMatch) {
      return new Response(JSON.stringify({ message: "Invalid URL format" }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    const householdId = Number(householdIdMatch[1]);
    const householdTasks = await db.select().from(tasks).where(eq(tasks.householdId, householdId));
    
    return new Response(JSON.stringify(householdTasks), {
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error("Failed to load tasks:", error);
    return new Response(JSON.stringify({ message: "Failed to load tasks" }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}