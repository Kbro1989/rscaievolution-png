/**
 * Authentication Service for RSC Server
 * Handles user registration, login, and player data management via Cloudflare KV
 */

export class AuthService {
    constructor(env) {
        // Production uses a single KV namespace "KV_BINDING"
        this.authKV = env.KV_BINDING;
        this.playerDataKV = env.KV_BINDING;
    }

    /**
     * Create a new user account
     * @param {string} username - Player username
     * @param {string} password - Plain text password (TODO: hash in production)
     * @returns {Promise<{success: boolean, username: string}>}
     */
    async createUser(username, password) {
        const userKey = `user:${username.toLowerCase()}`;
        const existing = await this.authKV.get(userKey);

        if (existing) {
            throw new Error('Username already exists');
        }

        // Create auth record
        await this.authKV.put(userKey, JSON.stringify({
            password, // TODO: bcrypt/scrypt in production
            created: Date.now(),
            lastLogin: null
        }));

        // Create default player data using correct template
        const playerData = this.getDefaultPlayerData(username);
        await this.playerDataKV.put(
            `player:${username.toLowerCase()}`,
            JSON.stringify(playerData)
        );

        console.log(`[Auth] User created: ${username}`);
        return { success: true, username };
    }

    /**
     * Authenticate user and load player data
     * @param {string} username
     * @param {string} password
     * @returns {Promise<{success: boolean, username: string, playerData: object}>}
     */
    async login(username, password) {
        const userKey = `user:${username.toLowerCase()}`;
        const authData = await this.authKV.get(userKey, 'json');

        if (!authData || authData.password !== password) {
            throw new Error('Invalid credentials');
        }

        // Update last login timestamp
        authData.lastLogin = Date.now();
        await this.authKV.put(userKey, JSON.stringify(authData));

        // Load player data
        const playerData = await this.playerDataKV.get(
            `player:${username.toLowerCase()}`,
            'json'
        );

        if (!playerData) {
            throw new Error('Player data not found');
        }

        console.log(`[Auth] User logged in: ${username}`);
        return { success: true, username, playerData };
    }

    /**
     * Save player data to KV
     * @param {string} username
     * @param {object} playerData - Player state to save
     */
    async savePlayerData(username, playerData) {
        await this.playerDataKV.put(
            `player:${username.toLowerCase()}`,
            JSON.stringify(playerData)
        );
        console.log(`[Auth] Player data saved: ${username}`);
    }

    /**
     * Get default player template (matches create-test-user.js format)
     * @param {string} username
     * @returns {object} Default player data
     */
    getDefaultPlayerData(username) {
        return {
            username,
            password: null, // Stored separately in AUTH_KV
            group: 1, // 1 = Members, 0 = F2P

            // Position (Lumbridge)
            x: 213,
            y: 436,

            // Combat & Settings
            fatigue: 0,
            combatStyle: 0,
            autocastSpellId: -1,

            // Privacy settings (0/1 not boolean)
            blockChat: 0,
            blockPrivateChat: 0,
            blockTrade: 0,
            blockDuel: 0,

            // Game settings (0/1 not boolean)
            cameraAuto: 0,
            oneMouseButton: 0,
            soundOn: 1,

            // Appearance (root level, not nested)
            hairColour: 2,
            topColour: 8,
            trouserColour: 14,
            skinColour: 0,
            headSprite: 1,
            bodySprite: 2,

            // Status
            skulled: 0,

            // Social
            friends: [],
            ignores: [],

            // Item storage
            inventory: [],
            bank: [],

            // Questing
            questPoints: 0,
            questStages: {},

            // ⚠️ CRITICAL: Skills use "current" not "base"!
            skills: {
                attack: { current: 1, experience: 0 },
                defense: { current: 1, experience: 0 },
                strength: { current: 1, experience: 0 },
                hits: { current: 10, experience: 1154 }, // Level 10 HP
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

            // Server metadata
            cache: {},
            loginIP: null,
            loginDate: Date.now(),
            world: 0,
            id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            rank: 0,
            muteEndDate: 0
        };
    }
}
