#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const itemsPath = path.resolve('rsc-cloudflare/rsc-server/rsc-data-local/config/items.json');
const npcsPath = path.resolve('rsc-cloudflare/rsc-server/rsc-data-local/config/npcs.json');

const items = JSON.parse(fs.readFileSync(itemsPath, 'utf8'));
const npcs = JSON.parse(fs.readFileSync(npcsPath, 'utf8'));

const touristTrapEntities = {
    "NPC_IRENA": "Irena",
    "ITEM_ANA_IN_A_BARREL": "Ana in a barrel",
    "ITEM_WROUGHT_IRON_KEY": "Wrought iron key",
    "ITEM_COINS": "Coins"
};

const mappings = {};

for (const [key, name] of Object.entries(touristTrapEntities)) {
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
