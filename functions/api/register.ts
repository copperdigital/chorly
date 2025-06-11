import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import * as schema from '../../shared/schema';

neonConfig.webSocketConstructor = WebSocket;

export async function onRequestPost(context: any) {
  const { env, request } = context;
  
  try {
    const { name, email, password, adminPin } = await request.json();
    
    const pool = new Pool({ connectionString: env.DATABASE_URL });
    const db = drizzle({ client: pool, schema });

    // Check if household exists
    const [existing] = await db.select()
      .from(schema.households)
      .where(eq(schema.households.email, email))
      .limit(1);
      
    if (existing) {
      return new Response(JSON.stringify({ message: 'Email already registered' }), {
        status: 400,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    
    const [household] = await db.insert(schema.households).values({
      name,
      email,
      passwordHash,
      adminPin: adminPin || '1234'
    }).returning();

    return new Response(JSON.stringify({
      household,
      member: null
    }), {
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Set-Cookie': `session=authenticated_${household.id}; HttpOnly; Secure; SameSite=Strict; Max-Age=604800`
      }
    });

  } catch (error) {
    console.error('Register error:', error);
    return new Response(JSON.stringify({ message: 'Server error' }), {
      status: 500,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
}