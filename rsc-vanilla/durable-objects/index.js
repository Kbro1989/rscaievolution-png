/**
 * Worker Entry Point
 */
import { RSCServerDO } from './RSCServerDO.js';

// Export the Durable Object class
export { RSCServerDO };

export default {
    async fetch(request, env, ctx) {
        // Connect to the default world instance
        // Ensure your Binding name in Dashboard settings matches 'RSCServerDO'
        const id = env.RSCServerDO.idFromName('default-world');
        const stub = env.RSCServerDO.get(id);

        return stub.fetch(request);
    }
};
