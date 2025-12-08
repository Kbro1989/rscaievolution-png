#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const npcsPath = path.resolve('rsc-cloudflare/rsc-server/rsc-data-local/config/npcs.json');

const npcs = JSON.parse(fs.readFileSync(npcsPath, 'utf8'));

const missingNpcs = [];
const watchtowerEntities = {
    "NPC_WATCHTOWER_WIZARD": "Watchtower Wizard"
};

for (const [key, name] of Object.entries(watchtowerEntities)) {
    const npc = npcs.find(n => n.name === name);
    if (!npc) {
        missingNpcs.push({ key, name });
    }
}

console.log("Missing entities:", missingNpcs);

// Add missing NPCs as placeholders
for (const { key, name } of missingNpcs) {
    const newId = npcs.length;
    const newNpc = {
        name,
        description: `${name}`,
        attack: 10,
        strength: 10,
        hits: 50,
        defense: 10,
        animations: {
            walk: 1427,
            stand: 1426,
            stand_turn_90: 1428,
            stand_turn_180: 1431,
            stand_turn_270: 1429,
            stand_turn_1: 1428,
            stand_turn_neg1: 1429
        }
    };

    npcs.push(newNpc);
    console.log(`Added placeholder for NPC: ${name}`);
}

// Write back to file
fs.writeFileSync(npcsPath, JSON.stringify(npcs, null, 2));
console.log("Appended missing entities to npcs.json");
