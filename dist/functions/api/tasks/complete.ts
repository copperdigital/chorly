export async function onRequestPost(context: any) {
  try {
    const { request } = context;
    const url = new URL(request.url);
    const taskInstanceId = url.searchParams.get('taskInstanceId');
    const { personId } = await request.json();
    
    if (!taskInstanceId || !personId) {
      return new Response(JSON.stringify({ message: "Task instance ID and person ID required" }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Mock completion - in a real app this would update the database
    const completedTask = {
      id: Number(taskInstanceId),
      isCompleted: true,
      completedAt: new Date().toISOString(),
      pointsEarned: 15
    };

    return new Response(JSON.stringify({ success: true, task: completedTask }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    return new Response(JSON.stringify({ message: "Server error" }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}