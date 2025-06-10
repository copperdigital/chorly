import { Pool } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import { people } from '../../../../shared/schema';
import { eq } from 'drizzle-orm';

export async function onRequestGet(context: any) {
  try {
    const pool = new Pool({ connectionString: context.env.DATABASE_URL });
    const db = drizzle(pool);
    
    const url = new URL(context.request.url);
    const householdIdMatch = url.pathname.match(/\/api\/admin\/people\/(\d+)/);
    
    if (!householdIdMatch) {
      return new Response(JSON.stringify({ message: "Invalid URL format" }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    const householdId = Number(householdIdMatch[1]);
    const familyPeople = await db.select().from(people).where(eq(people.householdId, householdId));
    
    return new Response(JSON.stringify(familyPeople), {
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    return new Response(JSON.stringify({ message: "Failed to load people" }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}