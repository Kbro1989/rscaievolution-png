#!/usr/bin/env node

const fs = require('fs');

const items = JSON.parse(fs.readFileSync('rsc-cloudflare/rsc-server/rsc-data-local/config/items.json', 'utf8'));
const npcs = JSON.parse(fs.readFileSync('rsc-cloudflare/rsc-server/rsc-data-local/config/npcs.json', 'utf8'));

console.log('═══════════════════════════════════════════════════════════');
console.log('  CONSOLIDATION PLAN - UNINTENTIONAL DUPLICATES');
console.log('═══════════════════════════════════════════════════════════\n');

// Find unintentional item duplicates
let duplicateItems = {};
items.forEach((item, idx) => {
    if (!item || !item.name) return;
    const key = JSON.stringify({name: item.name, price: item.price, stackable: item.stackable});
    if (!duplicateItems[key]) duplicateItems[key] = [];
    duplicateItems[key].push(idx);
});

const exactDups = Object.entries(duplicateItems).filter(([_, indices]) => indices.length > 1);

let itemConsolidations = [];
exactDups.forEach(([key, indices]) => {
    const item = items[indices[0]];
    const isIntentional = 
        item.name.toLowerCase().includes('potion') ||
        item.name.toLowerCase().includes('amulet') ||
        item.name.toLowerCase().includes('armour') ||
        item.name.toLowerCase().includes('armor') ||
        item.name.toLowerCase().includes('ore') ||
        item.name.toLowerCase().includes('log');

    if (!isIntentional) {
        // Keep the first ID, remove the rest
        const keepId = indices[0];
        const removeIds = indices.slice(1);
        itemConsolidations.push({
            name: item.name,
            keepId: keepId,
            removeIds: removeIds,
            price: item.price
        });
    }
});

console.log('ITEM CONSOLIDATIONS: ' + itemConsolidations.length + '\n');
console.log('ITEMS TO KEEP (canonical IDs):\n');

itemConsolidations.forEach(cons => {
    console.log('ID ' + cons.keepId + ': ' + cons.name);
    console.log('  Remove duplicates: [' + cons.removeIds.join(', ') + ']');
});

// Find unintentional NPC duplicates
let duplicateNpcs = {};
npcs.forEach((npc, idx) => {
    if (!npc || !npc.name) return;
    const key = JSON.stringify({name: npc.name, attack: npc.attack, strength: npc.strength, defense: npc.defense});
    if (!duplicateNpcs[key]) duplicateNpcs[key] = [];
    duplicateNpcs[key].push(idx);
});

const npcExactDups = Object.entries(duplicateNpcs).filter(([_, indices]) => indices.length > 1);

let npcConsolidations = [];
npcExactDups.forEach(([key, indices]) => {
    const npc = npcs[indices[0]];
    const isIntentional = 
        npc.name.toLowerCase().includes('guard') ||
        npc.name.toLowerCase().includes('bartender') ||
        npc.name.toLowerCase().includes('shopkeeper') ||
        npc.name.toLowerCase().includes('pilot');

    if (!isIntentional) {
        const keepId = indices[0];
        const removeIds = indices.slice(1);
        npcConsolidations.push({
            name: npc.name,
            keepId: keepId,
            removeIds: removeIds,
            stats: {attack: npc.attack, strength: npc.strength, defense: npc.defense}
        });
    }
});

console.log('\n\nNPC CONSOLIDATIONS: ' + npcConsolidations.length + '\n');
console.log('NPCS TO KEEP (canonical IDs):\n');

npcConsolidations.forEach(cons => {
    console.log('ID ' + cons.keepId + ': ' + cons.name);
    console.log('  Remove duplicates: [' + cons.removeIds.join(', ') + ']');
    console.log('  Stats: A' + cons.stats.attack + ' S' + cons.stats.strength + ' D' + cons.stats.defense);
});

// Save consolidation plan
const plan = {
    items: itemConsolidations,
    npcs: npcConsolidations,
    timestamp: new Date().toISOString(),
    totalItemConsolidations: itemConsolidations.length,
    totalNpcConsolidations: npcConsolidations.length
};

fs.writeFileSync('consolidation-plan.json', JSON.stringify(plan, null, 2));
console.log('\n\n✓ Consolidation plan saved to consolidation-plan.json');
console.log('═══════════════════════════════════════════════════════════\n');
