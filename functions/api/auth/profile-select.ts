import { Pool } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import { households, people } from '../../../shared/schema';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

const profileSelectSchema = z.object({
  personId: z.number(),
  pin: z.string()
});

export async function onRequestPost(context: any) {
  try {
    const pool = new Pool({ connectionString: context.env.DATABASE_URL });
    const db = drizzle(pool);
    
    const body = await context.request.json();
    const { personId, pin } = profileSelectSchema.parse(body);
    
    // Get person
    const [person] = await db.select().from(people).where(eq(people.id, personId));
    
    if (!person || person.pin !== pin) {
      return new Response(JSON.stringify({ message: "Invalid PIN" }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Get household
    const [household] = await db.select().from(households).where(eq(households.id, person.householdId));
    
    return new Response(JSON.stringify({
      person: { 
        id: person.id, 
        nickname: person.nickname, 
        avatar: person.avatar, 
        isAdmin: person.isAdmin,
        currentStreak: person.currentStreak,
        totalPoints: person.totalPoints
      },
      household: { id: household!.id, name: household!.name }
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    return new Response(JSON.stringify({ message: "Invalid request data" }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}