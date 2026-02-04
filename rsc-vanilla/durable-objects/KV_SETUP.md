# KV Namespace Setup Guide

## Current Status

The Durable Object worker (`rsc-server-do`) needs two additional KV namespaces for authentication:

1. **AUTH_KV** - Stores user credentials (username + password)
2. **PLAYER_DATA_KV** - Stores player save data (inventory, skills, position, etc.)

## Option 1: Create via Cloudflare Dashboard

1. Go to: https://dash.cloudflare.com/6872653edcee9c787c1b783173793/workers-and-pages/kv
2. Click "Create a namespace"
3. Name: `rsc-auth-kv` → Copy the namespace ID
4. Click "Create a namespace" again
5. Name: `rsc-player-data-kv` → Copy the namespace ID
6. Update `durable-objects/wrangler.toml`:
   - Replace `TEMP_AUTH_KV_ID` with the first ID
   - Replace `TEMP_PLAYER_DATA_KV_ID` with the second ID

## Option 2: Use Existing KV Namespace

If you want to reuse the existing KV namespace for all data:

In `durable-objects/wrangler.toml`, set all three bindings to the same ID:

```toml
[[kv_namespaces]]
binding = "AUTH_KV"
id = "88142cf6969b4547ab17f2d97f6249a1"  # Same as KV

[[kv_namespaces]]
binding = "PLAYER_DATA_KV"
id = "88142cf6969b4547ab17f2d97f6249a1"  # Same as KV
```

This will use key prefixes (`user:` and `player:`) to separate data.

## Next Steps

After configuring the IDs:
1. Run `npm run build` in `durable-objects/` to bundle
2. Deploy with `wrangler deploy`
3. Test auth flow with test client
