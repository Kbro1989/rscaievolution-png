/**
 * Main Cloudflare Worker Entry Point
 * Routes requests to GameWorld Durable Object
 */

import { GameWorld } from './rsc-server/src/game-world-durable-object';
import CloudflareFeatureManager from './rsc-server/src/cloud-features';

export default {
    async fetch(request, env, ctx) {
        const url = new URL(request.url);
        const featureManager = new CloudflareFeatureManager(env);

        // Health check
        if (url.pathname === '/health') {
            return new Response('OK', { status: 200 });
        }

        // Sponsor Dashboard Endpoint
        if (url.pathname === '/dashboard/sponsor') {
            const playerId = url.searchParams.get('playerId');
            if (!playerId) return new Response('Missing playerId', { status: 400 });

            const tier = await featureManager.getSponsorTier(playerId);
            const features = {
                r2: await featureManager.isFeatureEnabled('r2', playerId),
                images: await featureManager.isFeatureEnabled('images', playerId),
                unlimitedWorkers: await featureManager.isFeatureEnabled('unlimitedWorkers', playerId)
            };

            return new Response(JSON.stringify({ tier, features }), {
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Emergency Mode Check (Middleware-like)
        if (await featureManager.isFeatureEnabled('emergency', 0)) { // 0 as dummy ID for global check
            return new Response('Service Temporarily Unavailable (Emergency Mode)', { status: 503 });
        }

        // Route all game traffic to the main game world Durable Object
        const id = env.GAME_WORLD.idFromName('main-world');
        const stub = env.GAME_WORLD.get(id);

        return stub.fetch(request);
    },

    async scheduled(event, env, ctx) {
        const featureManager = new CloudflareFeatureManager(env);
        // Replace with your actual Account ID and API Token from env
        await featureManager.checkEmergencyMode(env.CF_ACCOUNT_ID, env.CF_API_TOKEN);
    }
};

// Export Durable Object class
export { GameWorld };
