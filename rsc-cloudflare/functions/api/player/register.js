export async function onRequestPost(context) {
    try {
        const { request, env } = context;
        const player = await request.json();
        const username = player.username.toLowerCase();

        const existing = await env.KV.get(username);

        if (existing) {
            return new Response(JSON.stringify({ success: false, code: 3 }), { status: 200 });
        }

        // Force sound on
        player.soundOn = 1;

        await env.KV.put(username, JSON.stringify(player));

        return new Response(JSON.stringify({ success: true, code: 2 }), { status: 200 });
    } catch (e) {
        return new Response(JSON.stringify({ success: false, error: e.message }), { status: 500 });
    }
}
