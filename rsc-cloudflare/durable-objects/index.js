/**
 * Durable Object Worker Entry Point
 * 
 * This is the main entry point for the Durable Object Worker.
 * It exports the RSCServerDO class and provides a default fetch handler.
 */

import { RSCServerDO } from './RSCServerDO.js';

// Export the Durable Object class
export { RSCServerDO };

// Default fetch handler for the Worker (not the Durable Object)
// This is called when the Worker itself receives a request
export default {
    async fetch(request, env, ctx) {
        return new Response('RSC Server Durable Object Worker is running', {
            status: 200,
            headers: { 'Content-Type': 'text/plain' }
        });
    }
};
