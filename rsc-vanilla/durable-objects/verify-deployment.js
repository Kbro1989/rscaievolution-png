const WebSocket = require('ws');

// Endpoint configuration
const WORKER_URL = 'wss://rscaievolution-png.kristain33rs.workers.dev';
const TEST_USER = `testuser_${Date.now()}`; // Unique user per run
const TEST_PASS = 'password123';

console.log(`Connecting to ${WORKER_URL}...`);
console.log(`Test User: ${TEST_USER}`);

const ws = new WebSocket(WORKER_URL);

ws.on('open', () => {
    console.log('✅ Connected to WebSocket');

    // Step 1: Register
    console.log('\n[1] Registering...');
    ws.send(JSON.stringify({
        type: 'register',
        username: TEST_USER,
        password: TEST_PASS
    }));
});

ws.on('message', (data) => {
    const msg = JSON.parse(data.toString());
    console.log(`Received: ${data}`);

    if (msg.type === 'register_success') {
        console.log('✅ Registration Successful!');

        // Step 2: Login
        console.log('\n[2] Logging in...');
        ws.send(JSON.stringify({
            type: 'login',
            username: TEST_USER,
            password: TEST_PASS
        }));
    }
    else if (msg.type === 'login_success') {
        console.log('✅ Login Successful!');

        // Verify Player Data
        const playerData = msg.playerData;

        // Check template structure (key validation)
        if (playerData.skills && playerData.skills.hits && playerData.skills.hits.current >= 10) {
            console.log('✅ Player Template Valid (Skills structure correct)');
        } else {
            console.error('❌ Player Template Invalid:', playerData.skills);
        }

        if (playerData.x === 213 && playerData.y === 436) {
            console.log('✅ Position Valid (Lumbridge: 213, 436)');
        }

        // Step 3: Test Save/Logout
        console.log('\n[3] Testing Logout & Save...');
        ws.send(JSON.stringify({
            type: 'logout'
        }));
    }
    else if (msg.type === 'logout_success') {
        console.log('✅ Logout Successful!');
        console.log('\n🎉 ALL TESTS PASSED!');
        ws.close();
        process.exit(0);
    }
    else if (msg.type.endsWith('_error')) {
        console.error('❌ Error:', msg.message);
        ws.close();
        process.exit(1);
    }
});

ws.on('error', (err) => {
    console.error('❌ Connection Error:', err.message);
    process.exit(1);
});
