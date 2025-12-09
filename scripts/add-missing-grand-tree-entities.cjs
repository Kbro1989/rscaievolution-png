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

const missing = [];

for (const [key, name] of Object.entries(grandTreeEntities)) {
    let found = false;
    if (key.startsWith('NPC_')) {
        found = npcs.some(n => n.name === name);
    } else {
        found = items.some(i => i.name === name);
    }
    if (!found) {
        missing.push({ key, name });
    }
}

console.log('Missing entities:');
console.log(missing);

for (const entity of missing) {
    if (entity.key.startsWith('NPC_')) {
        npcs.push({
            name: entity.name,
            description: "A placeholder NPC.",
            command: "",
            attack: 1,
            strength: 1,
            hits: 1,
            defense: 1,
            hostility: null,
            animations: [],
            hairColour: null,
            topColour: null,
            bottomColour: null,
            skinColour: null,
            width: 100,
            height: 100,
            walkModel: 0,
            combatModel: 0,
            combatAnimation: 0
        });
        console.log(`Added placeholder for NPC: ${entity.name}`);
    } else {
        items.push({
            name: entity.name,
            description: "A placeholder item.",
            command: "Examine",
            sprite: 0,
            price: 1,
            stackable: false,
            special: false,
            equip: [],
            colour: "rgb(255, 255, 255)",
            untradeable: true,
            members: true
        });
        console.log(`Added placeholder for item: ${entity.name}`);
    }
}

fs.writeFileSync(itemsPath, JSON.stringify(items, null, 4));
fs.writeFileSync(npcsPath, JSON.stringify(npcs, null, 4));

console.log('Appended missing entities to items.json and npcs.json');
