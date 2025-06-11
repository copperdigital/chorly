import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import * as schema from '../../shared/schema';

neonConfig.webSocketConstructor = WebSocket;

export async function onRequestGet(context: any) {
  const { env, request } = context;
  
  try {
    // Get session from cookie or header
    const cookies = request.headers.get('cookie') || '';
    const sessionMatch = cookies.match(/session=([^;]+)/);
    
    if (!sessionMatch) {
      return new Response(JSON.stringify({ message: 'Not authenticated' }), {
        status: 401,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }

    // Connect to database
    const pool = new Pool({ connectionString: env.DATABASE_URL });
    const db = drizzle({ client: pool, schema });

    // Get household (simplified for demo)
    const households = await db.select().from(schema.households).limit(1);
    
    if (!households[0]) {
      return new Response(JSON.stringify({ message: 'Not authenticated' }), {
        status: 401,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }

    return new Response(JSON.stringify({
      household: households[0],
      member: null
    }), {
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });

  } catch (error) {
    console.error('Session error:', error);
    return new Response(JSON.stringify({ message: 'Server error' }), {
      status: 500,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
}