# Server Deployment Endpoints

This document tracks the different server versions and their Cloudflare endpoints.

## Architecture Overview

All servers share the **same Cloudflare KV storage** for player data, but each server has different game features/items. When a player logs into a "simpler" server, items/features that don't exist in that world are simply ignored.

**Example:**
- Player gains "Evolution Crystal" on Server 3
- Crystal saves to KV (shared storage)
- Player logs into Server 1 (Pure RSC) → item doesn't exist in game definitions → ignored
- Player's standard RSC items (swords, quest points) work everywhere

---

## 🏛️ Server 1: RSC Pure (Preservation)

**Purpose**: Authentic RuneScape Classic preservation - exactly as the Gower brothers left it.

- **Status**: ✅ Active Preservation Build
- **Git Commit**: `76cc6a8` (2025-11-29)
- **Cloudflare Endpoint**: TBD (set after first deployment)
- **Features**:
  - Original RSC gameplay
  - All classic quests
  - Original skills only
  - Authentic typos preserved ("retrive", "accidentially", "haved")
  - Missing sounds added (woodcutting, smelting)
- **Data Compatibility**: Base for all other servers
- **Notes**: This is the reference implementation. No custom features.

---

## 🌟 Server 2: TBD

**Purpose**: TBD - First evolution branch

- **Status**: Not yet deployed
- **Git Commit**: TBD
- **Cloudflare Endpoint**: TBD
- **Features**: TBD
- **Data Compatibility**: Superset of Server 1

---

## 🚀 Server 3: TBD

**Purpose**: TBD

- **Status**: Not yet deployed
- **Git Commit**: TBD
- **Cloudflare Endpoint**: TBD
- **Features**: TBD
- **Data Compatibility**: TBD

---

## How To Deploy a New Server

1. Make your changes to the game
2. Commit to git: `git commit -m "feat: description"`
3. Push to GitHub: `git push origin main`
4. Cloudflare auto-deploys
5. Get the deployment URL from Cloudflare Dashboard
6. Update this file with the new endpoint
7. (Optional) Tag the commit: `git tag -a v1.x-servername -m "Server X: Description"`

## Current Deployment

**Active Server**: Server 1 (RSC Pure)
**Last Updated**: 2025-11-29
**KV Namespace**: `f2881801ac59415a86236d0841f27103`

---

## Notes

- Each push to GitHub triggers a new Cloudflare build
- You can "freeze" a server by noting its git commit SHA
- To redeploy an old server, checkout that commit and push to a different branch
- All servers share player data via KV
