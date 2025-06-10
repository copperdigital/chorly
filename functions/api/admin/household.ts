import { Pool } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import { households } from '../../../shared/schema';
import { eq } from 'drizzle-orm';

export async function onRequestPUT(context: any) {
  try {
    const pool = new Pool({ connectionString: context.env.DATABASE_URL });
    const db = drizzle(pool);
    
    const body = await context.request.json();
    const { id, name } = body;
    
    if (!id || !name) {
      return new Response(JSON.stringify({ message: "Household ID and name required" }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const [updatedHousehold] = await db.update(households)
      .set({ name })
      .where(eq(households.id, id))
      .returning();
    
    if (!updatedHousehold) {
      return new Response(JSON.stringify({ message: "Household not found" }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    return new Response(JSON.stringify(updatedHousehold), {
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    return new Response(JSON.stringify({ message: "Failed to update household" }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}