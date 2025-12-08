#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const itemsPath = path.resolve('rsc-cloudflare/rsc-server/rsc-data-local/config/items.json');
const npcsPath = path.resolve('rsc-cloudflare/rsc-server/rsc-data-local/config/npcs.json');

const items = JSON.parse(fs.readFileSync(itemsPath, 'utf8'));
const npcs = JSON.parse(fs.readFileSync(npcsPath, 'utf8'));

const grandTreeEntities = {
    "NPC_KING_NARNODE_SHAREEN": "King Narnode Shareen",
    "NPC_HAZELMERE": "Hazelmere",
    "NPC_GLOUGH": "Glough",
    "NPC_CHARLIE": "Charlie",
    "NPC_SHIPYARD_WORKER_WHITE": "Shipyard worker",
    "NPC_SHIPYARD_WORKER_BLACK": "Shipyard worker",
    "NPC_SHIPYARD_FOREMAN": "Shipyard foreman",
    "NPC_FEMI": "Femi",
    "NPC_ANITA": "Anita",
    "ITEM_TREE_GNOME_TRANSLATION": "Gnome translation",
    "ITEM_BARK_SAMPLE": "Bark sample",
    "ITEM_GLOUGHS_NOTES": "Glough's notes",
    "ITEM_PEBBLE_1": "Pebble",
    "ITEM_PEBBLE_2": "Pebble",
    "ITEM_PEBBLE_3": "Pebble",
    "ITEM_PEBBLE_4": "Pebble"
};

const mappings = {};

for (const [key, name] of Object.entries(grandTreeEntities)) {
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
