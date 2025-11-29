import { PlayerState } from '../../types';

const API_BASE = '/api/player';

export const kvClient = {
    /**
     * Save player data to Cloudflare KV
     */
    async savePlayer(player: PlayerState): Promise<boolean> {
        try {
            const response = await fetch(`${API_BASE}/save`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(player),
            });

            if (!response.ok) {
                console.error('Failed to save player data:', await response.text());
                return false;
            }

            return true;
        } catch (error) {
            console.error('Error saving player data:', error);
            return false;
        }
    },

    /**
     * Load player data from Cloudflare KV by username
     */
    async loadPlayer(username: string): Promise<PlayerState | null> {
        try {
            const response = await fetch(`${API_BASE}/load?username=${encodeURIComponent(username)}`);

            if (response.status === 404) {
                return null;
            }

            if (!response.ok) {
                console.error('Failed to load player data:', await response.text());
                return null;
            }

            return await response.json();
        } catch (error) {
            console.error('Error loading player data:', error);
            return null;
        }
    },

    /**
     * Login and retrieve player data
     */
    async login(username: string, password: string): Promise<{ success: boolean; player?: PlayerState; code?: number; error?: string }> {
        try {
            const response = await fetch(`${API_BASE}/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
            });

            return await response.json();
        } catch (error) {
            console.error('Error logging in:', error);
            return { success: false, error: 'Network error' };
        }
    }
};
