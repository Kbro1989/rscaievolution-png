/**
 * RSC Server Durable Object Worker
 * Simplified architecture - Server runs in DO directly
 */

// We'll inline the server logic here for now to avoid complex bundling
export class GameWorld {
    constructor(state, env) {
        this.state = state;
        this.env = env;
        this.connections = new Map();

        console.log('GameWorld DO constructed');
    }

    async fetch(request) {
        const url = new URL(request.url);

        // WebSocket upgrade for game connections
        if (request.headers.get('Upgrade') === 'websocket') {
            return this.handleWebSocketUpgrade(request);
        }

        // HTTP endpoints
        if (url.pathname === '/status') {
            return new Response(JSON.stringify({
                players: this.connections.size,
                message: 'RSC Game World Active'
            }), {
                headers: { 'Content-Type': 'application/json' }
            });
        }

        return new Response('RSC Game World - Connect via WebSocket', { status: 200 });
    }

    async handleWebSocketUpgrade(request) {
        const pair = new WebSocketPair();
        const [client, server] = Object.values(pair);

        // Accept WebSocket in Durable Object
        this.state.acceptWebSocket(server);

        console.log('WebSocket connection accepted');

        return new Response(null, {
            status: 101,
            webSocket: client
        });
    }

    async webSocketMessage(ws, message) {
        console.log('WebSocket message received:', message.byteLength, 'bytes');

        // Echo back for now (will add RSC protocol later)
        ws.send(message);
    }

    async webSocketClose(ws, code, reason) {
        console.log('WebSocket closed:', code, reason);
        this.connections.delete(ws);
    }

    async webSocketError(ws, error) {
        console.error('WebSocket error:', error);
    }

    // Tick loop
    async alarm() {
        console.log('Tick');
        await this.state.storage.setAlarm(Date.now() + 640);
    }
}

// Default fetch handler
export default {
    async fetch(request, env, ctx) {
        return new Response('RSC Durable Object Worker - Use DO bindings', { status: 200 });
    }
};
