import { Pool } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import { people } from '../../shared/schema';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

const insertPersonSchema = z.object({
  householdId: z.number(),
  nickname: z.string().min(1),
  pin: z.string().min(4).max(4),
  isAdmin: z.boolean().default(false),
  avatar: z.string(),
  currentStreak: z.number().default(0),
  totalPoints: z.number().default(0)
});

export async function onRequestPUT(context: any) {
  try {
    const pool = new Pool({ connectionString: context.env.DATABASE_URL });
    const db = drizzle(pool);
    
    const url = new URL(context.request.url);
    const idMatch = url.pathname.match(/\/api\/admin\/people\/(\d+)/);
    
    if (!idMatch) {
      return new Response(JSON.stringify({ message: "Invalid URL format" }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    const id = Number(idMatch[1]);
    const body = await context.request.json();
    
    const [updatedPerson] = await db.update(people)
      .set(body)
      .where(eq(people.id, id))
      .returning();
    
    if (!updatedPerson) {
      return new Response(JSON.stringify({ message: "Person not found" }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    return new Response(JSON.stringify(updatedPerson), {
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    return new Response(JSON.stringify({ message: "Failed to update person" }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export async function onRequestPOST(context: any) {
  try {
    const pool = new Pool({ connectionString: context.env.DATABASE_URL });
    const db = drizzle(pool);
    
    const body = await context.request.json();
    const personData = insertPersonSchema.parse(body);
    
    const [person] = await db.insert(people).values(personData).returning();
    
    return new Response(JSON.stringify(person), {
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    return new Response(JSON.stringify({ message: "Invalid person data" }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}