import { routePartykitRequest, Server } from "partyserver";

// Main Game Server (Global State, Regional Shard)
export class RSCServerDO extends Server {
    async onConnect(conn, ctx) {
        console.log(`[RSCServerDO] Player connected: ${conn.id}`);
        conn.send(JSON.stringify({
            type: 'welcome',
            connectionId: conn.id,
            message: 'Connected to RSC Game Server (DO)'
        }));
    }

    async onMessage(conn, message) {
        try {
            if (typeof message === 'string') {
                const data = JSON.parse(message);
                switch (data.type) {
                    case 'login':
                        await this.handleLogin(conn, data);
                        break;
                    case 'save':
                        await this.handleSave(conn, data);
                        break;
                    default:
                    // console.log('Unknown message type:', data.type);
                }
            }
        } catch (err) {
            console.error('Message handling error:', err);
        }
    }

    async handleLogin(conn, data) {
        const { username, password } = data;
        const playerKey = username.toLowerCase();

        // 1. Try KV (Fast Cache)
        let playerJson = await this.env.KV.get(playerKey);
        let player;

        // 2. Fallback to D1 (Authoritative) - optional for now, phase 2 logic
        if (!playerJson && this.env.DB) {
            // const stmt = this.env.DB.prepare('SELECT data FROM players WHERE username = ?').bind(username);
            // const row = await stmt.first();
            // if (row) playerJson = row.data;
        }

        if (playerJson) {
            player = JSON.parse(playerJson);
            if (player.password !== password) {
                conn.send(JSON.stringify({ type: 'login_failure', message: 'Invalid Credentials' }));
                return;
            }
        } else {
            // Register New
            player = {
                username,
                password,
                x: 213, y: 436,
                rights: 0,
                // Fix: Level 10 HP Start
                skills: { hits: { current: 10, experience: 1200 } }
            };
            await this.env.KV.put(playerKey, JSON.stringify(player));
        }

        // Notify others
        this.broadcast(JSON.stringify({ type: 'player_joined', username, connectionId: conn.id }), [conn.id]);

        // Send Success
        conn.send(JSON.stringify({ type: 'login_success', username, player }));
    }

    async handleSave(conn, data) {
        if (data.player && data.player.username) {
            const key = data.player.username.toLowerCase();
            await this.env.KV.put(key, JSON.stringify(data.player));

            // Queue for D1 Persistence (Async)
            if (this.env.PLAYER_QUEUE) {
                await this.env.PLAYER_QUEUE.send({
                    type: "commit",
                    id: key,
                    body: { data: JSON.stringify(data.player) }
                });
            }
            conn.send(JSON.stringify({ type: 'message', text: 'Game saved (KV+D1 Queued).' }));
        }
    }
}

// Per-Player Session (Phase 2 Identity)
export class PlayerDO {
    constructor(state, env) {
        this.state = state;
        this.env = env;
        this.playerId = null;
        this.playerData = null;
    }

    async fetch(request) {
        // Handle WebSocket Upgrade
        if (request.headers.get("Upgrade") === "websocket") {
            const pair = new WebSocketPair();
            await this.handleSession(pair[1]);
            return new Response(null, { status: 101, webSocket: pair[0] });
        }
        return new Response("PlayerDO Active");
    }

    async handleSession(webSocket) {
        webSocket.accept();
        webSocket.addEventListener("message", async (msg) => {
            // Handle player input
        });
        webSocket.addEventListener("close", async () => {
            await this.flushAndClose();
        });
    }

    async flushAndClose() {
        if (!this.playerData || !this.playerId) return;

        console.log(`[PlayerDO] Flushing data for ${this.playerId}`);

        // 1. Snapshot to KV (Fast availability)
        await this.env.KV.put(this.playerId, JSON.stringify(this.playerData));

        // 2. Queue commit to D1 (Durability)
        if (this.env.PLAYER_QUEUE) {
            await this.env.PLAYER_QUEUE.send({
                type: "commit",
                id: this.playerId,
                body: { data: JSON.stringify(this.playerData) }
            });
        }
    }
}

export default {
    async fetch(request, env) {
        const url = new URL(request.url);

        // Dev Restore Endpoint
        if (url.pathname === '/admin/restore-dev' && request.method === 'POST') {
            const data = await request.json();
            await env.KV.put(data.username.toLowerCase(), JSON.stringify(data));
            return new Response(`Restored ${data.username}`, { status: 200 });
        }

        // 1. PlayerDO Routing (Direct Session)
        // Pattern: /player/:username
        if (url.pathname.startsWith('/player/')) {
            const pathParts = url.pathname.split('/');
            const username = pathParts[2]; // /player/destiny -> destiny
            if (username && env.PlayerDO) {
                const id = env.PlayerDO.idFromName(username.toLowerCase());
                const stub = env.PlayerDO.get(id);
                return stub.fetch(request);
            }
        }

        // 2. Default: Route to PartyServer (GameWorld/RSCServerDO)
        return routePartykitRequest(request, env);
    },

    // Queue Consumer (D1 Writer)
    async queue(batch, env) {
        for (const msg of batch.messages) {
            try {
                const { id, body } = msg;
                const player = JSON.parse(body.data);

                await env.DB
                    .prepare(`
            INSERT INTO players (username, password, data, last_login)
            VALUES (?, ?, ?, ?)
            ON CONFLICT(username) DO UPDATE SET
                password = excluded.password,
                data = excluded.data,
                last_login = excluded.last_login
        `)
                    .bind(
                        player.username.toLowerCase(),
                        player.password,
                        JSON.stringify(player),
                        Date.now()
                    )
                    .run();

                msg.ack();
            } catch (err) {
                console.error(`[Queue] Failed to save player ${msg.id}:`, err);
                msg.retry();
            }
        }
    }
};
