function getHouseholdIdFromSession(cookies: string): number | null {
  const sessionMatch = cookies.match(/session=authenticated_(\d+)/);
  return sessionMatch ? parseInt(sessionMatch[1]) : null;
}

export async function onRequestPost(context: any) {
  const { request } = context;
  
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

    const { memberId } = await request.json();

    return new Response(JSON.stringify({ success: true }), {
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Set-Cookie': `session=authenticated_${householdId}_member_${memberId}; HttpOnly; Secure; SameSite=Strict; Max-Age=604800`
      }
    });

  } catch (error) {
    console.error('Member auth error:', error);
    return new Response(JSON.stringify({ message: 'Server error' }), {
      status: 500,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
}