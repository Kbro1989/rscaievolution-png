import { command, run, string, positional } from 'cmd-ts';
import WebSocket from 'ws';

/**
 * OpenRSC CLI Bridge
 * Allows the AI environment to send commands to the live game server.
 */
const app = command({
    name: 'openrsc-cli',
    args: {
        serverUrl: positional({
            type: string,
            displayName: 'serverUrl',
            description: 'The WebSocket URL of the OpenRSC server (e.g., ws://localhost:43595)',
        }),
        cmdString: positional({
            type: string,
            displayName: 'command',
            description: 'The in-game command to execute (e.g., "::sovereigneye")',
        }),
    },
    handler: ({ serverUrl, cmdString }) => {
        console.log(`Connecting to ${serverUrl}...`);
        const ws = new WebSocket(serverUrl);

        ws.on('open', () => {
            console.log(`Connected. Sending command: ${cmdString}`);

            // Simple text frame for CommandHandler
            // Note: The server might expect a specific packet format, 
            // but the WebSocketFrameHandler suggests it can handle TEXT frames.
            ws.send(cmdString);

            // Give time for processing then close
            setTimeout(() => {
                ws.close();
                process.exit(0);
            }, 1000);
        });

        ws.on('error', (err) => {
            console.error('Connection Error:', err.message);
            process.exit(1);
        });
    },
});

run(app, process.argv.slice(2));
