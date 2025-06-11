import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import * as schema from '../../shared/schema';

neonConfig.webSocketConstructor = WebSocket;

export async function onRequestPost(context: any) {
  const { env, request } = context;
  
  try {
    const { email, password } = await request.json();
    
    const pool = new Pool({ connectionString: env.DATABASE_URL });
    const db = drizzle({ client: pool, schema });

    const [household] = await db.select()
      .from(schema.households)
      .where(eq(schema.households.email, email))
      .limit(1);
    
    if (!household || !await bcrypt.compare(password, household.passwordHash)) {
      return new Response(JSON.stringify({ message: 'Invalid credentials' }), {
        status: 401,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }

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
    console.error('Login error:', error);
    return new Response(JSON.stringify({ message: 'Server error' }), {
      status: 500,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
}