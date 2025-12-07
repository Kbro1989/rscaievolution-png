
const WebSocket = require('partysocket').WebSocket || global.WebSocket;

if (!WebSocket) {
    console.error('No WebSocket implementation found. Run with Node 22+ or install ws/partysocket.');
    process.exit(1);
}

const url = 'ws://localhost:8787';

console.log(`Connecting to ${url}...`);

const ws = new WebSocket(url);

ws.onopen = () => {
    console.log('Connected to Server!');
    // Send a login packet
    ws.send(JSON.stringify({ 
        type: 'login', 
        username: 'testuser', 
        password: 'password' 
    }));
};

ws.onmessage = (event) => {
    console.log('Received message:', event.data);
    ws.close();
    process.exit(0);
};

ws.onerror = (error) => {
    console.error('WebSocket Error:', error.message || error);
    process.exit(1);
};

ws.onclose = () => {
    console.log('Connection closed');
};
