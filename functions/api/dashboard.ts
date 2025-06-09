// Cloudflare Pages Function for dashboard API
export async function onRequestGet(context: any) {
  const { env } = context;
  
  // Simple response for now - can be enhanced with database connection
  return new Response(JSON.stringify({ 
    people: [],
    taskInstances: []
  }), {
    status: 200,
    headers: { 
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    }
  });
}