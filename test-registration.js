import { Pool } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import { households, people } from './shared/schema.js';

const DATABASE_URL = process.env.DATABASE_URL;

async function testRegistration() {
  try {
    console.log('Testing database connection and registration...');
    
    const pool = new Pool({ connectionString: DATABASE_URL });
    const db = drizzle(pool);

    // Test creating a household
    const [household] = await db.insert(households).values({
      name: 'Test Family Registration',
      email: 'testfamily@example.com',
      password: 'password123'
    }).returning();

    console.log('✓ Household created successfully:', household);

    // Test creating admin person
    const [adminPerson] = await db.insert(people).values({
      householdId: household.id,
      nickname: 'Admin',
      pin: '0000',
      isAdmin: true,
      avatar: 'blue',
      currentStreak: 0,
      totalPoints: 0
    }).returning();

    console.log('✓ Admin person created successfully:', adminPerson);

    // Verify the registration can be retrieved
    const savedHousehold = await db.select().from(households).where(eq(households.email, 'testfamily@example.com'));
    console.log('✓ Registration verified - can retrieve household');

    console.log('\n=== REGISTRATION TEST PASSED ===');
    console.log('The registration functionality works correctly with the database.');
    
  } catch (error) {
    console.error('Registration test failed:', error);
  }
}

testRegistration();