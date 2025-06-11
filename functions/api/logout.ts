export async function onRequestPost(context: any) {
  return new Response(JSON.stringify({ success: true }), {
    headers: { 
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Set-Cookie': 'session=; HttpOnly; Secure; SameSite=Strict; Max-Age=0'
    }
  });
}