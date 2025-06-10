export async function onRequestPOST(context: any) {
  try {
    const { request, env } = context;
    const body = await request.json();
    
    console.log('Updating task:', body.id, body);
    
    // For demo purposes, return success
    // In a real app, this would update the database
    return new Response(JSON.stringify({
      success: true,
      task: {
        ...body,
        updatedAt: new Date().toISOString()
      }
    }), {
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      }
    });
    
  } catch (error) {
    console.error('Task update error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Failed to update task'
    }), {
      status: 500,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
}

export async function onRequestOPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'PUT, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  });
}