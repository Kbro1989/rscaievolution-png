# Integration Guide: Adding Auth to Existing Worker

## Current Setup

**Worker**: `rscaievolution-png`  
**Endpoint**: https://rscaievolution-png.kristain33rs.workers.dev/  
**DO Namespace**: `rscaievolution-png_RSCServerDO`

## Integration Steps

### 1. Add Auth Service to Worker

Go to your worker in the dashboard and add this file:

**File: `auth.js`** (copy from `durable-objects/auth.js`)

```javascript
// Full auth.js code - see durable-objects/auth.js
export class AuthService {
    constructor(env) {
        this.authKV = env.AUTH_KV || env.KV;
        this.playerDataKV = env.PLAYER_DATA_KV || env.KV;
    }
    // ... rest of auth.js code
}
```

### 2. Update RSCServerDO.js

Add to your existing RSCServerDO class:

```javascript
import { AuthService } from './auth.js';

// In constructor:
this.auth = new AuthService(env);

// Add these methods:
async handleRegister(sessionId, { username, password }) { /* ... */ }
async handleLogin(sessionId, { username, password }) { /* ... */ }
async handleLogout(sessionId) { /* ... */ }
```

### 3. Add KV Bindings

In Worker Settings → Variables:
- Binding: `AUTH_KV` → KV: `88142cf6969b4547ab17f2d97f6249a1`
- Binding: `PLAYER_DATA_KV` → KV: `88142cf6969b4547ab17f2d97f6249a1`

### 4. Update WebSocket Handler

Add JSON message interception in `handleSession()`:

```javascript
if (typeof data === 'string') {
    try {
        const jsonMsg = JSON.parse(data);
        
        if (jsonMsg.type === 'register') {
            await this.handleRegister(sessionId, jsonMsg);
            return;
        } else if (jsonMsg.type === 'login') {
            await this.handleLogin(sessionId, jsonMsg);
            return;
        } else if (jsonMsg.type === 'logout') {
            await this.handleLogout(sessionId);
            return;
        }
    } catch (e) { /* not JSON, continue */ }
}
```

## Quick Test

Once deployed, test with WebSocket:

```javascript
const ws = new WebSocket('wss://rscaievolution-png.kristain33rs.workers.dev');

ws.onopen = () => {
    // Register
    ws.send(JSON.stringify({
        type: 'register',
        username: 'testplayer',
        password: 'test123'
    }));
};

ws.onmessage = (event) => {
    console.log('Response:', JSON.parse(event.data));
};
```

Expected response:
```json
{
  "type": "register_success",
  "username": "testplayer"
}
```

Then verify in KV:
- Key: `user:testplayer` should exist
- Key: `player:testplayer` should have full player template
