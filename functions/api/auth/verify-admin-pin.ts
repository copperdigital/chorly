import { Pool } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import { people } from '../../../shared/schema';
import { eq } from 'drizzle-orm';

export async function onRequestPost(context: any) {
  try {
    const pool = new Pool({ connectionString: context.env.DATABASE_URL });
    const db = drizzle(pool);
    
    const body = await context.request.json();
    const { pin, personId } = body;
    
    if (!personId) {
      return new Response(JSON.stringify({ message: "Person ID required" }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const [person] = await db.select().from(people).where(eq(people.id, Number(personId)));
    
    if (!person || !person.isAdmin || person.pin !== pin) {
      return new Response(JSON.stringify({ message: "Invalid admin PIN" }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    return new Response(JSON.stringify({ message: "Invalid request data" }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}