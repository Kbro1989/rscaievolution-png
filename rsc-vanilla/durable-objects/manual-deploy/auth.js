/**
 * Authentication Service for RSC Server
 * Handles user registration, login, and player data management via Cloudflare KV
 */

export class AuthService {
    constructor(env) {
        this.kv = env.RSC_PLAYERS_v2;
        this.authKV = this.kv;
        this.playerDataKV = this.kv;
    }

    /**
     * Create a new user account
     * @param {string} username - Player username
     * @param {string} password - Plain text password
     * @returns {Promise<{success: boolean, username: string}>}
     */
    async createUser(username, password) {
        const key = username.toLowerCase();
        const existing = await this.kv.get(key);

        if (existing) {
            throw new Error('Username already exists');
        }

        // Create default player data matching example EXACTLY
        const playerData = this.getDefaultPlayerData(username);
        playerData.password = password;

        // Save as strictly inline JSON
        await this.kv.put(key, JSON.stringify(playerData));

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
        const key = username.toLowerCase();
        const playerData = await this.kv.get(key, 'json');

        if (!playerData || playerData.password !== password) {
            throw new Error('Invalid credentials');
        }

        // Update login metadata
        playerData.loginDate = Date.now();
        await this.kv.put(key, JSON.stringify(playerData));

        console.log(`[Auth] User logged in: ${username}`);
        return { success: true, username, playerData };
    }

    /**
     * Save player data to KV
     * @param {string} username
     * @param {object} playerData - Player state to save
     */
    async savePlayerData(username, playerData) {
        await this.kv.put(
            username.toLowerCase(),
            JSON.stringify(playerData)
        );
        console.log(`[Auth] Player data saved: ${username}`);
    }

    /**
     * Get default player template (matches user example format EXACTLY)
     * @param {string} username
     * @returns {object} Default player data
     */
    getDefaultPlayerData(username) {
        return {
            username: username,
            password: null,
            group: 0,
            x: 207,
            y: 441,
            fatigue: 32,
            combatStyle: 0,
            blockChat: 0,
            blockPrivateChat: 0,
            blockTrade: 0,
            blockDuel: 0,
            cameraAuto: true,
            oneMouseButton: 0,
            soundOn: 1,
            hairColour: 9,
            topColour: 9,
            trouserColour: 11,
            skinColour: 0,
            headSprite: 7,
            bodySprite: 2,
            skulled: 0,
            friends: [],
            ignores: [],
            inventory: [{ "id": 10, "amount": 3 }],
            bank: [],
            questPoints: 0,
            questStages: {},
            skills: {
                attack: { current: 1, experience: 0, base: 1 },
                defense: { current: 1, experience: 0, base: 1 },
                strength: { current: 1, experience: 0, base: 1 },
                hits: { current: 6, experience: 2304, base: 6 },
                ranged: { current: 1, experience: 0, base: 1 },
                prayer: { current: 1, experience: 0, base: 1 },
                magic: { current: 1, experience: 0, base: 1 },
                cooking: { current: 1, experience: 0, base: 1 },
                woodcutting: { current: 1, experience: 0, base: 1 },
                fletching: { current: 1, experience: 0, base: 1 },
                fishing: { current: 1, experience: 0, base: 1 },
                firemaking: { current: 1, experience: 0, base: 1 },
                crafting: { current: 1, experience: 0, base: 1 },
                smithing: { current: 1, experience: 0, base: 1 },
                mining: { current: 1, experience: 0, base: 1 },
                herblaw: { current: 1, experience: 0, base: 1 },
                agility: { current: 1, experience: 0, base: 1 },
                thieving: { current: 1, experience: 8, base: 1 }
            },
            cache: {},
            loginIP: null,
            world: 0,
            id: Math.floor(Math.random() * 1000000),
            loginDate: Date.now()
        };
    }
}
