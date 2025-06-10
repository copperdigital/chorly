import { Pool } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import { rewards } from '../../../../shared/schema';
import { eq } from 'drizzle-orm';

export async function onRequestGet(context: any) {
  try {
    const pool = new Pool({ connectionString: context.env.DATABASE_URL });
    const db = drizzle(pool);
    
    const url = new URL(context.request.url);
    const householdIdMatch = url.pathname.match(/\/api\/admin\/rewards\/(\d+)/);
    
    if (!householdIdMatch) {
      return new Response(JSON.stringify({ message: "Invalid URL format" }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    const householdId = Number(householdIdMatch[1]);
    const householdRewards = await db.select().from(rewards).where(eq(rewards.householdId, householdId));
    
    return new Response(JSON.stringify(householdRewards), {
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    return new Response(JSON.stringify({ message: "Failed to load rewards" }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}