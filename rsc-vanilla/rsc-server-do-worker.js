/**
 * RSC Game Server - PartyServer Implementation
 * Using Cloudflare's official multiplayer library
 */

import { routePartykitRequest, Server } from "partyserver";
import { AuthService } from "./durable-objects/auth.js";

// Connection state - track each player
export class GameWorld extends Server {
    constructor(state, env) {
        super(state, env);
        this.auth = new AuthService(env);
    }

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
                    case 'register':
                        await this.handleRegister(conn, data);
                        break;
                    case 'login':
                        await this.handleLogin(conn, data);
                        break;
                    case 'logout':
                        await this.handleLogout(conn);
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

    async handleRegister(conn, data) {
        const { username, password } = data;
        try {
            const result = await this.auth.createUser(username, password);
            conn.send(JSON.stringify({ type: 'register_success', username: result.username }));
        } catch (error) {
            conn.send(JSON.stringify({ type: 'register_error', message: error.message }));
        }
    }

    async handleLogin(conn, data) {
        const { username, password } = data;
        console.log(`Login attempt: ${username}`);

        try {
            const { playerData } = await this.auth.login(username, password);
            conn.username = username;
            conn.playerData = playerData;

            // Notify all other players
            this.broadcast(JSON.stringify({
                type: 'player_joined',
                username,
                connectionId: conn.id
            }), [conn.id]);

            // Send login success
            conn.send(JSON.stringify({
                type: 'login_success',
                username,
                playerData
            }));
        } catch (error) {
            conn.send(JSON.stringify({ type: 'login_error', message: error.message }));
        }
    }

    async handleLogout(conn) {
        if (conn.username && conn.playerData) {
            await this.auth.savePlayerData(conn.username, conn.playerData);
            this.broadcast(JSON.stringify({
                type: 'player_left',
                username: conn.username,
                connectionId: conn.id
            }), [conn.id]);
            conn.send(JSON.stringify({ type: 'logout_success' }));
            delete conn.username;
            delete conn.playerData;
        }
    }

    async onClose(conn) {
        console.log(`Player disconnected: ${conn.id}`);
        if (conn.username && conn.playerData) {
            await this.auth.savePlayerData(conn.username, conn.playerData);
            this.broadcast(JSON.stringify({
                type: 'player_left',
                username: conn.username,
                connectionId: conn.id
            }), [conn.id]);
        }
    }

    async onError(conn, error) {
        console.error('Connection error:', error);
    }
}

// Main Worker export
export default {
    async fetch(request, env) {
        // Route all requests through PartyServer
        return (
            await routePartykitRequest(request, { ...env }) ||
            new Response('RSC Game Server - Use WebSocket', { status: 404 })
        );
    }
};
