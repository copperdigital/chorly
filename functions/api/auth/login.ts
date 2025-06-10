import { Pool } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import { households, people } from '../../../shared/schema';
import { eq } from 'drizzle-orm';

export async function onRequestPost(context: any) {
  const { request, env } = context;
  
  try {
    const { email, password } = await request.json();
    
    if (!email || !password) {
      return new Response(JSON.stringify({ success: false, error: 'Email and password required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const pool = new Pool({ connectionString: env.DATABASE_URL });
    const db = drizzle(pool);

    // Find household by email
    const [household] = await db.select().from(households).where(eq(households.email, email));
    
    if (!household || household.password !== password) {
      return new Response(JSON.stringify({ success: false, error: 'Invalid credentials' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Get all people in this household
    const householdPeople = await db.select().from(people).where(eq(people.householdId, household.id));

    return new Response(JSON.stringify({
      success: true,
      household: {
        id: household.id,
        name: household.name,
        email: household.email
      },
      people: householdPeople.map(person => ({
        id: person.id,
        nickname: person.nickname,
        avatar: person.avatar,
        isAdmin: person.isAdmin,
        currentStreak: person.currentStreak,
        totalPoints: person.totalPoints
      }))
    }), {
      status: 200,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    return new Response(JSON.stringify({ success: false, error: 'Login failed' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}