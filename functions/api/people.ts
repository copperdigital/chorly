export async function onRequestPUT(context: any) {
  try {
    const { request } = context;
    const body = await request.json();
    
    console.log('Updating person:', body);
    
    // For demo purposes, return success
    const updatedPerson = {
      ...body,
      updatedAt: new Date().toISOString()
    };
    
    return new Response(JSON.stringify({
      success: true,
      person: updatedPerson
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('Person update error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Failed to update person'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export async function onRequestPOST(context: any) {
  try {
    const { request } = context;
    const body = await request.json();
    
    console.log('Creating new person:', body);
    
    // For demo purposes, return success with new ID
    const newPerson = {
      id: Date.now(),
      ...body,
      currentStreak: 0,
      totalPoints: 0,
      isAdmin: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    return new Response(JSON.stringify({
      success: true,
      person: newPerson
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('Person creation error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Failed to create person'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}