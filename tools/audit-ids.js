const fs = require('fs');
const path = require('path');

const load = (relPath) => {
    try {
        const p = path.join(__dirname, '../rsc-cloudflare/rsc-server/rsc-data-local/config', relPath);
        return JSON.parse(fs.readFileSync(p, 'utf8'));
    } catch (e) {
        console.error("Failed to load " + relPath, e);
        return [];
    }
};

const items = load('items.json');
const objects = load('objects.json');
const npcs = load('npcs.json');

const npcTargets = [
    "Sir Radimus Erkle",
    "Legends Guild Guard",
    "Koftik",
    "Banker"
];

const objectTargets = [
    "Mithril Gate",
    "Gate", // Legends Guild
    "Old Bridge"
];

const itemTargets = [
    "Radimus Scroll",
    "Papyrus",
    "Charcoal",
    "Damp Cloth",
    "Arrow",
    "Lit Arrow"
];

console.log("--- NPCs ---");
npcs.forEach((npc, i) => {
    if (!npc || !npc.name) return;
    if (npcTargets.includes(npc.name)) {
        console.log(`[NPC] ${i}: ${npc.name} (${npc.description})`);
    } else if (npc.name.toLowerCase().includes('banker')) {
        console.log(`[NPC] ${i}: ${npc.name} (${npc.description})`);
    }
});

console.log("\n--- Objects ---");
objects.forEach((obj, i) => {
    if (!obj || !obj.name) return;
    if (objectTargets.includes(obj.name)) {
        console.log(`[Object] ${i}: ${obj.name} (${obj.description})`);
    } else if (obj.name.toLowerCase().includes('old bridge')) {
        console.log(`[Object] ${i}: ${obj.name} (${obj.description})`);
    }
});

console.log("\n--- Items ---");
items.forEach((item, i) => {
    if (!item || !item.name) return;
    if (itemTargets.includes(item.name)) {
        console.log(`[Item] ${i}: ${item.name}`);
    }
});
