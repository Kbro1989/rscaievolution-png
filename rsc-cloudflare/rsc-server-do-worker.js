/**
 * RSC Game Server - PartyServer Implementation
 * Using Cloudflare's official multiplayer library
 */

import { routePartykitRequest, Server } from "partyserver";

// Connection state - track each player
export class GameWorld extends Server {
    async onConnect(conn, ctx) {
        console.log(`Player connected: ${conn.id}`);

        // Send welcome message
        conn.send(JSON.stringify({
            type: 'welcome',
            connectionId: conn.id,
            message: 'Connected to RSC Game Server'
        }));
    }

    async onMessage(conn, message) {
        try {
            // Handle binary RSC packets OR JSON
            if (typeof message === 'string') {
                const data = JSON.parse(message);
                console.log('Received JSON:', data.type);

                // Handle different message types
                switch (data.type) {
                    case 'login':
                        await this.handleLogin(conn, data);
                        break;
                    case 'save':
                        await this.handleSave(conn, data);
                        break;
                    default:
                        console.log('Unknown message type:', data.type);
                }
            } else {
                // Binary RSC packet
                console.log('Received binary packet:', message.byteLength, 'bytes');
                // Echo back for now
                conn.send(message);
            }
        } catch (err) {
            console.error('Message handling error:', err);
        }
    }

    async handleLogin(conn, data) {
        const { username, password } = data;
        console.log(`Login attempt: ${username}`);

        if (!this.env.KV) {
            console.error('KV binding missing in DO environment');
            // Fail safe or dev mode stub?
        }

        const playerKey = username.toLowerCase();
        const playerJson = await this.env.KV.get(playerKey);
        let player;

        if (playerJson) {
            player = JSON.parse(playerJson);
            // Verify password (simple plaintext check as per RSC legacy)
            if (player.password !== password) {
                conn.send(JSON.stringify({ type: 'login_failure', message: 'Invalid Credentials' }));
                return;
            }
        } else {
            // New Player - Register
            // Basic default player structure
            player = {
                username,
                password,
                x: 213, y: 436, // Edgeville
                rights: 0,
                ironMan: 0,
                metrics: { xp: 0, playtime: 0 },
                appearance: { head: 1, body: 2, legs: 3 }, // Stub
                inventory: [],
                skills: {} // Needs full skill map
            };
            await this.env.KV.put(playerKey, JSON.stringify(player));
            console.log(`Registered new player: ${username}`);
        }

        // Notify all other players
        this.broadcast(JSON.stringify({
            type: 'player_joined',
            username,
            connectionId: conn.id
        }), [conn.id]);

        // Send login success with FULL player data so client can sync
        conn.send(JSON.stringify({
            type: 'login_success',
            username,
            player: player // Client needs this to load stats/inv
        }));
    }

    async onClose(conn) {
        console.log(`Player disconnected: ${conn.id}`);
        // If we had the player object in memory mapped to connection, we would save it here.
        // For now, assume client sends periodic saves or manual '::save' which triggers a 'save' message type.
    }

    // New message handler for saving
    async handleSave(conn, data) {
        if (data.player && data.player.username) {
            const key = data.player.username.toLowerCase();
            // Security check: ensure conn.username matches data.player.username
            await this.env.KV.put(key, JSON.stringify(data.player));
            conn.send(JSON.stringify({ type: 'message', text: 'Game saved.' }));
        }
    }

    async onError(conn, error) {
        console.error('Connection error:', error);
    }
}

// Main Worker export
export default {
    async fetch(request, env) {
        const url = new URL(request.url);

        // Dev tool to inject player data
        if (url.pathname === '/admin/restore-dev' && request.method === 'POST') {
            try {
                const data = await request.json();
                if (data.username && env.KV) {
                    await env.KV.put(data.username.toLowerCase(), JSON.stringify(data));
                    return new Response(`Restored data for ${data.username}`, { status: 200 });
                }
            } catch (e) {
                return new Response(e.message, { status: 500 });
            }
        }

        // Route all requests through PartyServer
        return (
            await routePartykitRequest(request, { ...env }) ||
            new Response('RSC Game Server - Use WebSocket', { status: 404 })
        );
    }
};
