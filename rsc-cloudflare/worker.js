/**
 * Main Cloudflare Worker Entry Point
 * Routes requests to GameWorld Durable Object
 */

import { GameWorld } from './rsc-server/src/game-world-durable-object';

export default {
    async fetch(request, env, ctx) {
        const url = new URL(request.url);

        // Health check
        if (url.pathname === '/health') {
            return new Response('OK', { status: 200 });
        }

        // Route all game traffic to the main game world Durable Object
        const id = env.GAME_WORLD.idFromName('main-world');
        const stub = env.GAME_WORLD.get(id);

        return stub.fetch(request);
    }
};

// Export Durable Object class
export { GameWorld };
