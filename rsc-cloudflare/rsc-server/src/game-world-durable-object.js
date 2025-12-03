/**
 * GameWorld Durable Object - Cloudflare wrapper for RSC World
 * Preserves all authentic game logic while adapting infrastructure
 */

const World = require('./model/world');
const Player = require('./model/player');

export class GameWorld {
    constructor(state, env) {
        this.state = state;
        this.env = env;

        // WebSocket connections mapped to players
        this.connections = new Map(); // WebSocket -> Player

        // Initialize game world (all authentic game logic)
        this.world = null;
        this.initializeWorld();
    }

    async initializeWorld() {
        // Create authentic RSC world with all game logic
        this.world = new World({
            config: {
                worldID: 1,
                members: this.env.MEMBERS === 'true'
            },
            // Cloudflare-adapted data client
            dataClient: {
                sendAndReceive: async (message) => {
                    return await this.handleDataRequest(message);
                }
            },
            outgoingMessages: []
        });

        // Load game data
        await this.world.loadData();

        // Start tick loop using Durable Object alarm
        this.startTickLoop();

        console.log('GameWorld initialized');
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
                players: this.world.players.length,
                npcs: this.world.npcs.length,
                ticks: this.world.ticks
            }), {
                headers: { 'Content-Type': 'application/json' }
            });
        }

        return new Response('RSC Game World', { status: 200 });
    }

    async handleWebSocketUpgrade(request) {
        const pair = new WebSocketPair();
        const [client, server] = Object.values(pair);

        // Accept WebSocket in Durable Object
        this.state.acceptWebSocket(server);

        return new Response(null, {
            status: 101,
            webSocket: client
        });
    }

    async webSocketMessage(ws, message) {
        const player = this.connections.get(ws);

        if (!player) {
            // Handle login
            await this.handleLogin(ws, message);
            return;
        }

        // Handle game packets
        await this.handlePlayerMessage(player, message);
    }

    async handleLogin(ws, message) {
        try {
            const data = JSON.parse(message);

            if (data.type !== 'login') {
                ws.send(JSON.stringify({ error: 'Expected login' }));
                ws.close();
                return;
            }

            // Load player data from KV
            const playerData = await this.loadPlayerData(data.username);

            if (!playerData) {
                // New player
                playerData = this.createNewPlayer(data.username);
            }

            // Create Player instance with WebSocket
            const player = new Player(this.world, new WebSocketAdapter(ws), playerData);

            // Register player
            this.connections.set(ws, player);
            player.login();

            console.log(`Player ${data.username} logged in`);

        } catch (err) {
            console.error('Login error:', err);
            ws.send(JSON.stringify({ error: 'Login failed' }));
            ws.close();
        }
    }

    async handlePlayerMessage(player, message) {
        try {
            const data = JSON.parse(message);

            // Route to appropriate handler based on message type
            // This matches the existing server message handlers
            switch (data.type) {
                case 'walk':
                    player.walkQueue.push(...data.steps);
                    break;
                case 'command':
                    await this.world.handleCommand(player, data);
                    break;
                // ... other message types
            }

        } catch (err) {
            console.error('Message handling error:', err);
        }
    }

    async webSocketClose(ws, code, reason) {
        const player = this.connections.get(ws);

        if (player) {
            console.log(`Player ${player.username} disconnected`);

            // Save player before logout
            await this.savePlayerData(player);

            // Remove from world
            this.world.removeEntity('players', player);
            this.connections.delete(ws);
        }
    }

    async webSocketError(ws, error) {
        console.error('WebSocket error:', error);
        const player = this.connections.get(ws);
        if (player) {
            await this.webSocketClose(ws, 1006, 'Error');
        }
    }

    // Tick loop using Durable Object alarms
    startTickLoop() {
        // Set alarm for next tick (640ms)
        this.state.storage.setAlarm(Date.now() + 640);
    }

    async alarm() {
        // Run game tick (all authentic logic)
        await this.world.tick();

        // Schedule next tick
        this.state.storage.setAlarm(Date.now() + 640);
    }

    // KV Integration
    async loadPlayerData(username) {
        const key = `player:${username.toLowerCase()}`;
        const data = await this.env.PLAYERS_KV.get(key, 'json');
        return data;
    }

    async savePlayerData(player) {
        const key = `player:${player.username.toLowerCase()}`;

        const data = {
            username: player.username,
            x: player.x,
            y: player.y,
            skills: player.skills,
            inventory: player.inventory.items,
            bank: player.bank.items,
            questStages: player.questStages,
            combatStyle: player.combatStyle,
            // ... all save properties
        };

        await this.env.PLAYERS_KV.put(key, JSON.stringify(data));
    }

    createNewPlayer(username) {
        return {
            username,
            x: 120, // Lumbridge spawn
            y: 504,
            skills: {
                attack: { base: 1, current: 1, experience: 0 },
                defense: { base: 1, current: 1, experience: 0 },
                strength: { base: 1, current: 1, experience: 0 },
                hits: { base: 10, current: 10, experience: 1154 },
                ranged: { base: 1, current: 1, experience: 0 },
                prayer: { base: 1, current: 1, experience: 0 },
                magic: { base: 1, current: 1, experience: 0 },
                cooking: { base: 1, current: 1, experience: 0 },
                woodcutting: { base: 1, current: 1, experience: 0 },
                fletching: { base: 1, current: 1, experience: 0 },
                fishing: { base: 1, current: 1, experience: 0 },
                firemaking: { base: 1, current: 1, experience: 0 },
                crafting: { base: 1, current: 1, experience: 0 },
                smithing: { base: 1, current: 1, experience: 0 },
                mining: { base: 1, current: 1, experience: 0 },
                herblaw: { base: 1, current: 1, experience: 0 },
                agility: { base: 1, current: 1, experience: 0 },
                thieving: { base: 1, current: 1, experience: 0 }
            },
            questStages: {},
            inventory: [],
            bank: [],
            friends: [],
            ignores: [],
            loginDate: Date.now(),
            loginIP: '0.0.0.0'
        };
    }

    async handleDataRequest(message) {
        // Handle KV requests from within game logic
        if (message.handler === 'playerUpdate') {
            // This is a save request
            const player = this.world.players.getAll().find(p => p.id === message.id);
            if (player) {
                await this.savePlayerData(player);
            }
            return { success: true };
        }

        return { success: false };
    }
}

/**
 * WebSocket Adapter - Makes WebSocket look like Socket to Player class
 */
class WebSocketAdapter {
    constructor(ws) {
        this.ws = ws;
    }

    send(data) {
        if (this.ws.readyState === 1) { // OPEN
            this.ws.send(JSON.stringify(data));
        }
    }

    close() {
        this.ws.close();
    }
}

module.exports = { GameWorld };
