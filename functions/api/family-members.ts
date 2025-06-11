import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import { eq } from 'drizzle-orm';
import * as schema from '../../shared/schema';

neonConfig.webSocketConstructor = WebSocket;

function getHouseholdIdFromSession(cookies: string): number | null {
  const sessionMatch = cookies.match(/session=authenticated_(\d+)/);
  return sessionMatch ? parseInt(sessionMatch[1]) : null;
}

export async function onRequestGet(context: any) {
  const { env, request } = context;
  
  try {
    const cookies = request.headers.get('cookie') || '';
    const householdId = getHouseholdIdFromSession(cookies);
    
    if (!householdId) {
      return new Response(JSON.stringify({ message: 'Not authenticated' }), {
        status: 401,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }

    const pool = new Pool({ connectionString: env.DATABASE_URL });
    const db = drizzle({ client: pool, schema });

    const members = await db.select()
      .from(schema.familyMembers)
      .where(eq(schema.familyMembers.householdId, householdId));

    return new Response(JSON.stringify(members), {
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });

  } catch (error) {
    console.error('Family members error:', error);
    return new Response(JSON.stringify({ message: 'Server error' }), {
      status: 500,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
}

export async function onRequestPost(context: any) {
  const { env, request } = context;
  
  try {
    const cookies = request.headers.get('cookie') || '';
    const householdId = getHouseholdIdFromSession(cookies);
    
    if (!householdId) {
      return new Response(JSON.stringify({ message: 'Not authenticated' }), {
        status: 401,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }

    const memberData = await request.json();
    
    const pool = new Pool({ connectionString: env.DATABASE_URL });
    const db = drizzle({ client: pool, schema });

    const [member] = await db.insert(schema.familyMembers).values({
      ...memberData,
      householdId
    }).returning();

    return new Response(JSON.stringify(member), {
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });

  } catch (error) {
    console.error('Create member error:', error);
    return new Response(JSON.stringify({ message: 'Server error' }), {
      status: 500,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
}