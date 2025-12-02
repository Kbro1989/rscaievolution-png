export async function onRequestPost(context) {
    try {
        const { request, env } = context;
        const body = await request.json();
        const { username, password } = body;

        if (!username || !password) {
            return new Response(JSON.stringify({ success: false, code: 3 }), { status: 400 });
        }

        const playerJson = await env.KV.get(username.toLowerCase());

        if (!playerJson) {
            return new Response(JSON.stringify({ success: false, code: 3 }), { status: 200 });
        }

        const player = JSON.parse(playerJson);

        if (player.password !== password) {
            return new Response(JSON.stringify({ success: false, code: 3 }), { status: 200 });
        }

        // Force sound on for everyone (just in case)
        player.soundOn = 1;

        return new Response(JSON.stringify({ success: true, player }), { status: 200 });
    } catch (e) {
        return new Response(JSON.stringify({ success: false, error: e.message }), { status: 500 });
    }
}
