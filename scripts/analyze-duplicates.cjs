#!/usr/bin/env node

const fs = require('fs');

const items = JSON.parse(fs.readFileSync('rsc-cloudflare/rsc-server/rsc-data-local/config/items.json', 'utf8'));
const npcs = JSON.parse(fs.readFileSync('rsc-cloudflare/rsc-server/rsc-data-local/config/npcs.json', 'utf8'));

console.log('═══════════════════════════════════════════════════════════');
console.log('  ANALYZING DUPLICATE IDS');
console.log('═══════════════════════════════════════════════════════════\n');

// Find exact item duplicates
let duplicateItems = {};
items.forEach((item, idx) => {
    if (!item || !item.name) return;
    const key = JSON.stringify({name: item.name, price: item.price, stackable: item.stackable});
    if (!duplicateItems[key]) duplicateItems[key] = [];
    duplicateItems[key].push(idx);
});

const exactDups = Object.entries(duplicateItems).filter(([_, indices]) => indices.length > 1);

console.log('EXACT ITEM DUPLICATES: ' + exactDups.length + '\n');

// Categorize them
let intentional = 0;
let unintentional = 0;

exactDups.forEach(([key, indices]) => {
    const item = items[indices[0]];
    const isIntentional = 
        item.name.toLowerCase().includes('potion') ||  // Different doses
        item.name.toLowerCase().includes('amulet') ||  // Worn vs unstrung
        item.name.toLowerCase().includes('armour') ||  // Different colors
        item.name.toLowerCase().includes('armor') ||   // Different colors
        item.name.toLowerCase().includes('ore') ||     // Pickaxe selection
        item.name.toLowerCase().includes('log');       // Axe selection

    if (isIntentional) {
        intentional++;
    } else {
        unintentional++;
    }
});

console.log('CATEGORIZATION:');
console.log('  Likely intentional: ' + intentional);
console.log('  Likely unintentional: ' + unintentional);

console.log('\n--- UNINTENTIONAL DUPLICATES (Should be consolidated) ---\n');

let consolidated = 0;
exactDups.forEach(([key, indices]) => {
    const item = items[indices[0]];
    const isIntentional = 
        item.name.toLowerCase().includes('potion') ||
        item.name.toLowerCase().includes('amulet') ||
        item.name.toLowerCase().includes('armour') ||
        item.name.toLowerCase().includes('armor') ||
        item.name.toLowerCase().includes('ore') ||
        item.name.toLowerCase().includes('log');

    if (!isIntentional && consolidated < 20) {  // Show first 20
        console.log('IDs [' + indices.join(', ') + ']');
        console.log('  Name: ' + item.name);
        console.log('  Price: ' + item.price);
        console.log('  Stackable: ' + item.stackable);
        console.log('');
        consolidated++;
    }
});

// Now analyze NPCs
console.log('\n--- NPC DUPLICATE ANALYSIS ---\n');

let duplicateNpcs = {};
npcs.forEach((npc, idx) => {
    if (!npc || !npc.name) return;
    const key = JSON.stringify({name: npc.name, attack: npc.attack, strength: npc.strength, defense: npc.defense});
    if (!duplicateNpcs[key]) duplicateNpcs[key] = [];
    duplicateNpcs[key].push(idx);
});

const npcExactDups = Object.entries(duplicateNpcs).filter(([_, indices]) => indices.length > 1);

console.log('EXACT NPC DUPLICATES: ' + npcExactDups.length + '\n');

// Categorize them
let npcIntentional = 0;
let npcUnintentional = 0;

npcExactDups.forEach(([key, indices]) => {
    const npc = npcs[indices[0]];
    const isIntentional = 
        npc.name.toLowerCase().includes('guard') ||    // Multiple guards
        npc.name.toLowerCase().includes('bartender') ||// Multiple bartenders
        npc.name.toLowerCase().includes('shopkeeper') ||// Multiple shops
        npc.name.toLowerCase().includes('pilot');      // Multiple gnome pilots

    if (isIntentional) {
        npcIntentional++;
    } else {
        npcUnintentional++;
    }
});

console.log('NPC CATEGORIZATION:');
console.log('  Likely intentional (location-based): ' + npcIntentional);
console.log('  Likely unintentional: ' + npcUnintentional);

console.log('\n--- UNINTENTIONAL NPC DUPLICATES ---\n');

let npcConsolidated = 0;
npcExactDups.forEach(([key, indices]) => {
    const npc = npcs[indices[0]];
    const isIntentional = 
        npc.name.toLowerCase().includes('guard') ||
        npc.name.toLowerCase().includes('bartender') ||
        npc.name.toLowerCase().includes('shopkeeper') ||
        npc.name.toLowerCase().includes('pilot');

    if (!isIntentional && npcConsolidated < 20) {  // Show first 20
        console.log('IDs [' + indices.join(', ') + ']');
        console.log('  Name: ' + npc.name);
        console.log('  Attack: ' + npc.attack + ', Strength: ' + npc.strength + ', Defense: ' + npc.defense);
        console.log('');
        npcConsolidated++;
    }
});

console.log('═══════════════════════════════════════════════════════════\n');
