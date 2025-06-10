import { Pool } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import { rewards } from '../../../shared/schema';
import { z } from 'zod';

const insertRewardSchema = z.object({
  householdId: z.number(),
  title: z.string().min(1),
  description: z.string().optional(),
  pointsCost: z.number().min(0),
  isActive: z.boolean().default(true)
});

export async function onRequestPOST(context: any) {
  try {
    const pool = new Pool({ connectionString: context.env.DATABASE_URL });
    const db = drizzle(pool);
    
    const body = await context.request.json();
    const rewardData = insertRewardSchema.parse(body);
    
    const [reward] = await db.insert(rewards).values(rewardData).returning();
    
    return new Response(JSON.stringify(reward), {
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    return new Response(JSON.stringify({ message: "Invalid reward data" }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}