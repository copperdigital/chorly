// Cloudflare Pages Function for authentication
export async function onRequestPost(context: any) {
  const { request } = context;
  
  try {
    const body = await request.json();
    
    // Simple authentication response
    return new Response(JSON.stringify({ 
      success: true,
      household: { id: 1, name: "Demo Family" },
      people: [
        { id: 1, nickname: "Dad", avatar: "👨", isAdmin: true },
        { id: 2, nickname: "Mum", avatar: "👩", isAdmin: true },
        { id: 3, nickname: "Seb", avatar: "👦", isAdmin: false },
        { id: 4, nickname: "Tessa", avatar: "👧", isAdmin: false }
      ]
    }), {
      status: 200,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: "Invalid request" }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}