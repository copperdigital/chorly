export async function onRequestPost(context: any) {
  try {
    const { request } = context;
    const { pin, personId } = await request.json();
    
    if (!personId) {
      return new Response(JSON.stringify({ message: "Person ID required" }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Mock person data - Dad has PIN 1234
    const people = [
      { id: 1, isAdmin: true, pin: '1234' },
      { id: 2, isAdmin: false, pin: '5678' },
      { id: 3, isAdmin: false, pin: '9999' },
      { id: 4, isAdmin: false, pin: '1111' }
    ];
    
    const person = people.find(p => p.id === Number(personId));
    
    if (!person || !person.isAdmin || person.pin !== pin) {
      return new Response(JSON.stringify({ message: "Invalid admin PIN" }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    return new Response(JSON.stringify({ message: "Invalid request data" }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}