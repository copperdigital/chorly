export async function onRequestPOST(context: any) {
  try {
    const { request } = context;
    const body = await request.json();
    
    console.log('Creating new task:', body);
    
    // For demo purposes, return success with new ID
    const newTask = {
      id: Date.now(),
      ...body,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    return new Response(JSON.stringify({
      success: true,
      task: newTask
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('Task creation error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Failed to create task'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}