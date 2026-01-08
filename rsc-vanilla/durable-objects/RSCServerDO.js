/**
 * RSC Server Durable Object
 * Handles game world state, player sessions, and authentication
 */
import { Buffer } from 'node:buffer';
import { AuthService } from './auth.js';
// import Server from '../rsc-server/src/server.js';
// Landscape data imports removed for simpler manual deployment if not using bundler
// If uploading manually, you might need to bundle these or use static assets

export class RSCServerDO {
    constructor(state, env) {
        this.state = state;
        this.env = env;

        // Authentication service
        this.auth = new AuthService(env);

        // Track WebSocket sessions with player data
        this.sessions = new Map(); // sessionId -> { socket, id, username, playerData }

        // Shared RSC Server instance (initialized on first connection)
        this.server = null;

        // Session counter for unique IDs
        this.sessionCounter = 0;

        console.log('RSCServerDO initialized with auth service');
    }

    async fetch(request) {
        // Handle WebSocket upgrades
        if (request.headers.get("Upgrade") === "websocket") {
            const pair = new WebSocketPair();
            await this.handleSession(pair[1]);
            return new Response(null, { status: 101, webSocket: pair[0] });
        }

        return new Response("RSC Server DO Active", { status: 200 });
    }

    async handleSession(webSocket) {
        webSocket.accept();
        const sessionId = `session-${++this.sessionCounter}-${Date.now()}`;

        try {
            this.sessions.set(sessionId, {
                socket: webSocket,
                id: sessionId,
                connected: true
            });

            console.log(`[DO] New session connected: ${sessionId}`);

            webSocket.addEventListener('message', async (event) => {
                try {
                    const data = event.data;

                    // Handle JSON Auth Messages
                    if (typeof data === 'string') {
                        try {
                            const jsonMsg = JSON.parse(data);
                            if (jsonMsg.type === 'register') {
                                await this.handleRegister(sessionId, jsonMsg);
                                return;
                            } else if (jsonMsg.type === 'login') {
                                await this.handleLogin(sessionId, jsonMsg);
                                return;
                            } else if (jsonMsg.type === 'logout') {
                                await this.handleLogout(sessionId);
                                return;
                            }
                        } catch (e) { /* Not JSON, treat as binary */ }
                    }

                    // Binary packets -> RSC Server logic would go here
                    // (Mocking server bridge for manual deployment simplicity)
                    // In full implementation, pass to this.server.handleConnection()
                } catch (error) {
                    console.error('[DO] Message error:', error);
                }
            });

            webSocket.addEventListener('close', () => {
                console.log(`[DO] Session closed: ${sessionId}`);
                this.sessions.delete(sessionId);
            });

        } catch (err) {
            console.error('[DO] Critical session error:', err);
            webSocket.close(1011, "Internal Error");
        }
    }

    // --- Auth Handlers ---

    async handleRegister(sessionId, { username, password }) {
        try {
            const result = await this.auth.createUser(username, password);
            const session = this.sessions.get(sessionId);
            if (session) session.socket.send(JSON.stringify({ type: 'register_success', username: result.username }));
        } catch (error) {
            const session = this.sessions.get(sessionId);
            if (session) session.socket.send(JSON.stringify({ type: 'register_error', message: error.message }));
        }
    }

    async handleLogin(sessionId, { username, password }) {
        try {
            const { playerData } = await this.auth.login(username, password);
            const session = this.sessions.get(sessionId);
            if (!session) return;

            session.username = username;
            session.playerData = playerData;
            session.lastSave = Date.now();

            this.broadcastPlayerJoined(username, sessionId);
            session.socket.send(JSON.stringify({ type: 'login_success', username, playerData }));

            if (this.sessions.size === 1) await this.startAutoSave();
        } catch (error) {
            const session = this.sessions.get(sessionId);
            if (session) session.socket.send(JSON.stringify({ type: 'login_error', message: error.message }));
        }
    }

    async handleLogout(sessionId) {
        const session = this.sessions.get(sessionId);
        if (!session || !session.username) return;

        try {
            await this.auth.savePlayerData(session.username, session.playerData);
            this.broadcastPlayerLeft(session.username, sessionId);
            session.socket.send(JSON.stringify({ type: 'logout_success' }));
            delete session.username;
            delete session.playerData;
        } catch (error) {
            console.error(`[DO] Logout error:`, error);
        }
    }

    broadcastPlayerJoined(username, excludeSessionId) {
        const msg = JSON.stringify({ type: 'player_joined', username });
        for (const [sid, s] of this.sessions) {
            if (sid !== excludeSessionId && s.username) s.socket.send(msg);
        }
    }

    broadcastPlayerLeft(username, excludeSessionId) {
        const msg = JSON.stringify({ type: 'player_left', username });
        for (const [sid, s] of this.sessions) {
            if (sid !== excludeSessionId && s.username) s.socket.send(msg);
        }
    }

    async startAutoSave() {
        const alarm = await this.state.storage.getAlarm();
        if (!alarm) await this.state.storage.setAlarm(Date.now() + 5 * 60 * 1000);
    }

    async alarm() {
        console.log('[DO] Auto-save triggered');
        const promises = [];
        for (const [sid, s] of this.sessions) {
            if (s.username && s.playerData) promises.push(this.auth.savePlayerData(s.username, s.playerData));
        }
        await Promise.all(promises);
        if (this.sessions.size > 0) await this.state.storage.setAlarm(Date.now() + 5 * 60 * 1000);
    }
}
