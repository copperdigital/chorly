import { Pool } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import { households, people } from '../../../shared/schema';

export async function onRequestPost(context: any) {
  const { request, env } = context;
  
  try {
    const { email, password, name } = await request.json();
    
    if (!email || !password || !name) {
      return new Response(JSON.stringify({ success: false, error: 'Email, password, and name required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const pool = new Pool({ connectionString: env.DATABASE_URL });
    const db = drizzle(pool);

    // Create household
    const [household] = await db.insert(households).values({
      name,
      email,
      password
    }).returning();

    // Create default admin user
    const [adminPerson] = await db.insert(people).values({
      householdId: household.id,
      nickname: 'Admin',
      pin: '0000',
      isAdmin: true,
      avatar: 'blue',
      currentStreak: 0,
      totalPoints: 0
    }).returning();

    return new Response(JSON.stringify({
      success: true,
      household: {
        id: household.id,
        name: household.name,
        email: household.email
      },
      people: [{
        id: adminPerson.id,
        nickname: adminPerson.nickname,
        avatar: adminPerson.avatar,
        isAdmin: adminPerson.isAdmin,
        currentStreak: adminPerson.currentStreak,
        totalPoints: adminPerson.totalPoints
      }]
    }), {
      status: 201,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    return new Response(JSON.stringify({ success: false, error: 'Registration failed' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}