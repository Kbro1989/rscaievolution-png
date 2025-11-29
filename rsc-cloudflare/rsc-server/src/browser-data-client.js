const log = require('bole')('data-client');

const DEFAULT_PLAYER = {
    username: '',
    password: '',
    group: 0,
    x: 213,
    y: 436,
    fatigue: 0,
    combatStyle: 0,
    blockChat: 0,
    blockPrivateChat: 0,
    blockTrade: 0,
    blockDuel: 0,
    cameraAuto: 0,
    oneMouseButton: 0,
    soundOn: 1,
    hairColour: 2,
    topColour: 8,
    trouserColour: 14,
    skinColour: 0,
    headSprite: 1,
    bodySprite: 2,
    skulled: 0,
    friends: [],
    ignores: [],
    inventory: [],
    bank: [],
    questPoints: 0,
    questStages: {},
    skills: {
        attack: { current: 1, experience: 0 },
        defense: { current: 1, experience: 0 },
        strength: { current: 1, experience: 0 },
        hits: { current: 10, experience: 1154 },
        ranged: { current: 1, experience: 0 },
        prayer: { current: 1, experience: 0 },
        magic: { current: 1, experience: 0 },
        cooking: { current: 1, experience: 0 },
        woodcutting: { current: 1, experience: 0 },
        fletching: { current: 1, experience: 0 },
        fishing: { current: 1, experience: 0 },
        firemaking: { current: 1, experience: 0 },
        crafting: { current: 1, experience: 0 },
        smithing: { current: 1, experience: 0 },
        mining: { current: 1, experience: 0 },
        herblaw: { current: 1, experience: 0 },
        agility: { current: 1, experience: 0 },
        thieving: { current: 1, experience: 0 }
    },
    cache: {},
    loginIP: null,
    world: 0
};

class BrowserDataClient {
    constructor(server) {
        this.server = server;
        this.world = this.server.world;
        this.connected = true;
        // { playerID: username }
        this.playerUsernames = new Map();
        // Cache of loaded players { username: playerObj }
        this.players = new Map();
    }

    async init() {
        // No-op: we don't load all players anymore
        log.info('BrowserDataClient initialized (KV mode)');
        console.log('%c RSC KV STORAGE MODE ACTIVE ', 'background: #222; color: #bada55; font-size: 20px');
    }

    async load() {
        // No-op
    }

    async save() {
        // No-op: we save individual players now
    }

    async savePlayer(player) {
        // We need the password to save it back
        const cached = this.players.get(player.username.toLowerCase());
        if (cached) {
            player.password = cached.password;
        }

        try {
            await fetch('/api/player/save', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(player)
            });
        } catch (err) {
            console.error('Error saving player to KV:', err);
        }
    }

    async sendAndReceive(message) {
        switch (message.handler) {
            case 'playerRegister': {
                message.username = message.username.toLowerCase();

                const player = JSON.parse(JSON.stringify(DEFAULT_PLAYER));
                player.username = message.username;
                player.password = message.password;
                player.id = Math.floor(Math.random() * 1000000); // Random ID for now

                try {
                    const res = await fetch('/api/player/register', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(player)
                    });
                    const data = await res.json();
                    
                    if (data.success) {
                        this.players.set(player.username, player);
                    }
                    
                    return data;
                } catch (err) {
                    console.error('Register error:', err);
                    return { success: false, code: 3 };
                }
            }
            case 'playerLogin': {
                message.username = message.username.toLowerCase();

                // Check if already logged in locally
                const cached = this.players.get(message.username);
                if (cached && cached.world) {
                    return { success: false, code: 4 };
                }

                try {
                    const res = await fetch('/api/player/login', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ 
                            username: message.username, 
                            password: message.password 
                        })
                    });
                    const data = await res.json();

                    if (!data.success) {
                        return { success: false, code: 3 };
                    }

                    const player = data.player;
                    
                    if (player.world) {
                        // Force reset world if stuck
                        player.world = 0;
                    }

                    this.players.set(player.username, player);
                    this.playerUsernames.set(player.id, player.username);

                    player.world = 1;
                    
                    return {
                        success: true,
                        code: 0, // 0 = success
                        player: player
                    };

                } catch (err) {
                    console.error('Login error:', err);
                    return { success: false, code: 3 };
                }
            }
            case 'playerUpdate': {
                delete message.handler;

                if (!message.username && message.id) {
                    message.username = this.playerUsernames.get(message.id);
                }

                if (!message.username) {
                    console.error('playerUpdate missing username', message);
                    return { success: false };
                }

                message.loginDate = Date.now();

                const existing = this.players.get(message.username.toLowerCase());
                if (existing) {
                    if (!message.password) message.password = existing.password;
                    Object.assign(existing, message);
                    await this.savePlayer(existing);
                } else {
                    await this.savePlayer(message);
                }

                return { success: true };
            }
            case 'playerLogout': {
                const username = message.username.toLowerCase();
                const player = this.players.get(username);

                if (player) {
                    player.world = 0;
                    await this.savePlayer(player);
                    this.players.delete(username);
                }
                return { success: true };
            }
            case 'playerLoad': {
                // This is used by the server to get the player object after login
                const username = message.username.toLowerCase();
                const player = this.players.get(username);
                return { success: !!player, player };
            }
            case 'playerSave': {
                const player = message.player;
                await this.savePlayer(player);
                return { success: true };
            }
            case 'playerGetWorlds': {
                // Standalone mode - just return empty or local
                const usernameWorlds = {};
                for (const username of message.usernames) {
                    const p = this.players.get(username.toLowerCase());
                    if (p && p.world) {
                        usernameWorlds[username] = p.world;
                    }
                }
                return { usernameWorlds };
            }
            case 'playerMessage': {
                // Local message handling if needed
                return { success: true };
            }
        }
    }

    playerLogout(username) {
        // Called by server when socket closes
        const player = this.players.get(username.toLowerCase());
        if (player) {
            player.world = 0;
            this.savePlayer(player);
        }
    }

    playerMessage(from, to, message) {
        // Handle local messaging if both players are on this server (which they are)
        // This would require access to the World object to find the other player
        // For now, basic implementation
    }
}

module.exports = BrowserDataClient;
