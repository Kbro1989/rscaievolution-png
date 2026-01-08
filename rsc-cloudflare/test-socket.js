const WebSocket = require('ws');

const ws = new WebSocket('wss://rscaievolution-png.kristain33rs.workers.dev');

ws.on('open', function open() {
    console.log('Connected to server');
});

ws.on('message', function incoming(data) {
    console.log('Received:', data);
    console.log('Size:', data.length);
    // Session ID should be 8 bytes
    if (data.length === 8) {
        console.log('Received Session ID');
    }
});

ws.on('close', function close(code, reason) {
    console.log(`Disconnected: ${code} - ${reason}`);
});

ws.on('error', function error(err) {
    console.error('Error:', err);
});
