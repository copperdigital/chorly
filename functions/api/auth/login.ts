import { DatabaseStorage } from '../../../server/db';
import { loginSchema } from '../../../shared/schema';

export async function onRequestPost(context: any) {
  try {
    const storage = new DatabaseStorage();
    const body = await context.request.json();
    
    const validation = loginSchema.safeParse(body);
    if (!validation.success) {
      return new Response(JSON.stringify({ message: 'Invalid input' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const { email, password } = validation.data;
    
    // For demo purposes, accepting any email/password combo
    // In production, you'd validate against actual credentials
    const household = await storage.getHouseholdByEmail(email);
    
    if (!household) {
      return new Response(JSON.stringify({ message: 'Invalid credentials' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const people = await storage.getPeopleByHousehold(household.id);
    
    return new Response(JSON.stringify({
      household,
      people
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ message: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}