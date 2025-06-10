export async function onRequestPUT(context: any) {
  try {
    const { request, params } = context;
    const taskId = params.id;
    const body = await request.json();
    
    console.log('Updating task:', taskId, body);
    
    // For demo purposes, return success
    // In a real app, this would update the database
    return new Response(JSON.stringify({
      success: true,
      task: {
        id: taskId,
        ...body,
        updatedAt: new Date().toISOString()
      }
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('Task update error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Failed to update task'
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
    
    console.log('Creating task:', body);
    
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