/**
 * RSCServerDO - Durable Object for RuneScape Classic Server
 * 
 * This Durable Object hosts a single, shared RSC server instance that all
 * players connect to via WebSocket. It maintains the game world state in
 * memory and persists player data to KV storage.
 */

// Mocking Server for Infrastructure Deployment
class Server {
    constructor(config, env) { console.log('Mock Server (Legacy)'); }
    async init() { }
    handleConnection(socket) { }
}

// import Server from '../rsc-server/src/server.js';

export class RSCServerDO {
    constructor(state, env) {
        this.state = state;
        this.env = env;

        // Track WebSocket sessions
        this.sessions = new Map();

        // Shared RSC Server instance (initialized on first connection)
        this.server = null;

        // Session counter for unique IDs
        this.sessionCounter = 0;

        console.log('RSCServerDO initialized');
    }

    /**
     * Handle incoming fetch requests (WebSocket upgrades)
     */
    async fetch(request) {
        const upgradeHeader = request.headers.get('Upgrade');

        if (upgradeHeader !== 'websocket') {
            return new Response('Expected WebSocket connection', {
                status: 426,
                headers: { 'Upgrade': 'websocket' }
            });
        }

        // Create WebSocket pair
        const [client, server] = Object.values(new WebSocketPair());

        // Handle the session
        await this.handleSession(server);

        // Return the client WebSocket to the caller
        return new Response(null, {
            status: 101,
            webSocket: client
        });
    }

    /**
     * Handle a new WebSocket session
     */
    async handleSession(webSocket) {
        // Initialize server on first connection
        if (!this.server) {
            await this.initializeServer();
        }

        // Accept the WebSocket
        webSocket.accept();

        // Generate unique session ID
        const sessionId = `session-${++this.sessionCounter}-${Date.now()}`;

        // Store session
        this.sessions.set(sessionId, {
            socket: webSocket,
            id: sessionId,
            connected: true
        });

        console.log(`[DO] New session connected: ${sessionId} (Total: ${this.sessions.size})`);

        // Create a socket wrapper that bridges WebSocket to RSC Server
        const socketBridge = this.createSocketBridge(sessionId, webSocket);

        // Connect to the RSC server
        this.server.handleConnection(socketBridge);

        // Handle WebSocket messages
        webSocket.addEventListener('message', (event) => {
            try {
                const data = event.data;

                // Convert WebSocket message to Buffer-like format
                let buffer;
                if (typeof data === 'string') {
                    buffer = Buffer.from(data, 'utf8');
                } else if (data instanceof ArrayBuffer) {
                    buffer = Buffer.from(data);
                } else {
                    buffer = Buffer.from(data);
                }

                // Emit as 'data' event to the socket bridge
                socketBridge.emit('data', buffer);
            } catch (error) {
                console.error('[DO] Error processing message:', error);
            }
        });

        // Handle WebSocket close
        webSocket.addEventListener('close', () => {
            console.log(`[DO] Session closed: ${sessionId}`);
            this.sessions.delete(sessionId);
            socketBridge.emit('close', false);
        });

        // Handle WebSocket errors
        webSocket.addEventListener('error', (error) => {
            console.error('[DO] WebSocket error:', error);
            this.sessions.delete(sessionId);
            socketBridge.emit('error', error);
        });
    }

    /**
     * Initialize the RSC Server instance
     */
    async initializeServer() {
        console.log('[DO] Initializing RSC Server...');

        // Server configuration
        const config = {
            worldID: 1,
            members: true,
            tcpPort: null, // Not used in DO mode
            websocketPort: null, // Not used in DO mode
        };

        // Create server instance with env for KV access
        this.server = new Server(config, this.env);

        // Initialize server
        await this.server.init();

        console.log('[DO] RSC Server initialized successfully');
    }

    /**
     * Create a socket bridge that connects WebSocket to RSC Server
     * This mimics the Node.js socket interface expected by RSC Server
     */
    createSocketBridge(sessionId, webSocket) {
        const EventEmitter = require('events');

        class DurableObjectSocket extends EventEmitter {
            constructor(id, ws) {
                super();
                this.id = id;
                this.ws = ws;
                this.remoteAddress = '0.0.0.0'; // Cloudflare doesn't expose real IP
                this.destroyed = false;
            }

            write(data) {
                if (this.destroyed || this.ws.readyState !== 1) {
                    return;
                }

                try {
                    // Convert Buffer to ArrayBuffer for WebSocket
                    if (Buffer.isBuffer(data)) {
                        this.ws.send(data.buffer.slice(
                            data.byteOffset,
                            data.byteOffset + data.byteLength
                        ));
                    } else {
                        this.ws.send(data);
                    }
                } catch (error) {
                    console.error('[DO] Error writing to WebSocket:', error);
                }
            }

            connect() {
                // No-op, already connected
            }

            destroy() {
                this.destroyed = true;
                try {
                    this.ws.close();
                } catch (e) {
                    // Ignore close errors
                }
            }

            end() {
                this.destroy();
            }

            setKeepAlive() {
                // WebSocket handles this automatically
            }

            setTimeout(timeout) {
                // Store timeout for potential use
                this._timeout = timeout;
            }

            toString() {
                return `[DurableObjectSocket ${this.id}]`;
            }
        }

        return new DurableObjectSocket(sessionId, webSocket);
    }

    /**
     * Alarm handler for periodic tasks (optional)
     */
    async alarm() {
        // Could be used for periodic world saves or cleanup
        console.log('[DO] Alarm triggered');
    }
}
