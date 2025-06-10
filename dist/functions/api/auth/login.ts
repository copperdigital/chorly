export async function onRequestPost(context: any) {
  try {
    const { request, env } = context;
    const { email, password } = await request.json();
    
    if (!email || !password) {
      return new Response(JSON.stringify({ success: false, error: 'Email and password required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // For demo purposes, using hardcoded credentials
    // In production, this would connect to your database
    if (email === 'family@example.com' && password === 'password123') {
      const mockResponse = {
        success: true,
        user: { id: 1, email: 'family@example.com' },
        household: {
          id: 1,
          name: 'Suttie Family',
          email: 'family@example.com'
        },
        people: [
          { id: 1, nickname: 'Dad', avatar: 'blue', isAdmin: true, currentStreak: 5, totalPoints: 150 },
          { id: 2, nickname: 'Mum', avatar: 'pink', isAdmin: false, currentStreak: 3, totalPoints: 120 },
          { id: 3, nickname: 'Seb', avatar: 'green', isAdmin: false, currentStreak: 2, totalPoints: 80 },
          { id: 4, nickname: 'Tessa', avatar: 'purple', isAdmin: false, currentStreak: 4, totalPoints: 100 }
        ]
      };
      
      return new Response(JSON.stringify(mockResponse), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ success: false, error: 'Invalid credentials' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: 'Server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}