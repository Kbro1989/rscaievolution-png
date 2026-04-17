/**
 * Authentication Service for RSC Server (Cloudflare Worker/DO)
 * Handles user registration, login, and player data management via Cloudflare KV
 */

import { DEFAULT_PLAYER } from '../rsc-server/src/constants/player-template';

export class AuthService {
    constructor(env) {
        // Use RSC_PLAYERS_v2 or KV_BINDING as defined in wrangler.toml
        this.kv = env.RSC_PLAYERS_v2 || env.KV_BINDING || env.KV;
        if (!this.kv) {
            console.error('[Auth] KV_BINDING not found in env!');
        }
    }

    /**
     * Create a new user account
     * @param {string} username - Player username
     * @param {string} password - Plain text password
     * @returns {Promise<{success: boolean, username: string}>}
     */
    async createUser(username, password) {
        if (!this.kv) throw new Error('Database connection failed');

        const key = `player:${username.toLowerCase()}`;
        const existing = await this.kv.get(key);

        if (existing) {
            throw new Error('Username already exists');
        }

        // Create default player data
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
        if (!this.kv) throw new Error('Database connection failed');

        const key = `player:${username.toLowerCase()}`;
        const dataStr = await this.kv.get(key);

        if (!dataStr) {
            throw new Error('Invalid credentials');
        }

        let playerData;
        try {
            playerData = JSON.parse(dataStr);
        } catch (e) {
            throw new Error('Corrupt player data');
        }

        if (playerData.password !== password) {
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
        if (!this.kv) return;

        const key = `player:${username.toLowerCase()}`;
        await this.kv.put(key, JSON.stringify(playerData));
        // console.log(`[Auth] Player data saved: ${username}`);
    }

    /**
     * Get default player template (matches user example format EXACTLY)
     * @param {string} username
     * @returns {object} Default player data
     */
    getDefaultPlayerData(username) {
        return {
            ...DEFAULT_PLAYER,
            username: username,
            id: Math.floor(Math.random() * 1000000),
            loginDate: Date.now()
        };
    }
}
