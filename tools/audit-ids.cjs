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
    "Gate",
    "Old Bridge"
];

const itemTargets = [
    "Radimus Scroll",
    "Papyrus",
    "Charcoal",
    "Damp Cloth",
    "Arrow",
    "Lit Arrow" // Might be named differently, check partials
];

// Helper for loose matching
const match = (name, targets) => {
    if (!name) return false;
    name = name.toLowerCase();
    return targets.some(t => name.includes(t.toLowerCase()));
};

console.log("--- NPCs ---");
npcs.forEach((npc, i) => {
    if (!npc || !npc.name) return;
    // Specific checks
    if (npc.name === 'Sir Radimus Erkle') console.log(`[NPC] ${i}: ${npc.name}`);
    if (npc.name === 'Legends Guild Guard') console.log(`[NPC] ${i}: ${npc.name}`);
    if (npc.name === 'Koftik') console.log(`[NPC] ${i}: ${npc.name}`);
    if (npc.name === 'Banker') console.log(`[NPC] ${i}: ${npc.name}`);
});

console.log("\n--- Objects ---");
objects.forEach((obj, i) => {
    if (!obj || !obj.name) return;
    if (obj.name === 'Mithril Gate') console.log(`[Object] ${i}: ${obj.name}`);
    if (obj.name === 'Old Bridge') console.log(`[Object] ${i}: ${obj.name}`);

    // Gate logic is complex, just dump some relevant ones if needed, or specific IDs
    // We want the one used in Legends Quest (1079 in OpenRSC)
});

console.log("\n--- Items ---");
items.forEach((item, i) => {
    if (!item || !item.name) return;
    const n = item.name.toLowerCase();
    if (match(n, itemTargets)) console.log(`[Item] ${i}: ${item.name}`);
});
