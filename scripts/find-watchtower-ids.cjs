#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const itemsPath = path.resolve('rsc-cloudflare/rsc-server/rsc-data-local/config/items.json');
const npcsPath = path.resolve('rsc-cloudflare/rsc-server/rsc-data-local/config/npcs.json');

const items = JSON.parse(fs.readFileSync(itemsPath, 'utf8'));
const npcs = JSON.parse(fs.readFileSync(npcsPath, 'utf8'));

const watchtowerEntities = {
    "NPC_WATCHTOWER_WIZARD": "Watchtower Wizard"
};

const mappings = {};

for (const [key, name] of Object.entries(watchtowerEntities)) {
    if (key.startsWith('NPC_')) {
        const npc = npcs.find(n => n.name === name);
        if (npc) {
            mappings[key] = npcs.indexOf(npc);
        }
    } else {
        const item = items.find(i => i.name === name);
        if (item) {
            mappings[key] = items.indexOf(item);
        }
    }
}

console.log(mappings);
