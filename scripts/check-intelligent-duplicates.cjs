#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const itemsPath = path.resolve('rsc-cloudflare/rsc-server/rsc-data-local/config/items.json');
const npcsPath = path.resolve('rsc-cloudflare/rsc-server/rsc-data-local/config/npcs.json');

const items = JSON.parse(fs.readFileSync(itemsPath, 'utf8'));
const npcs = JSON.parse(fs.readFileSync(npcsPath, 'utf8'));

console.log('=== ANALYZING DUPLICATE ITEMS ===\n');

const itemsByName = {};
items.forEach((item, idx) => {
    if (!itemsByName[item.name]) {
        itemsByName[item.name] = [];
    }
    itemsByName[item.name].push(idx);
});

const intentionalDuplicates = [];
const suspiciousDuplicates = [];

for (const [name, ids] of Object.entries(itemsByName)) {
    if (ids.length <= 1) continue;

    const variants = ids.map(idx => items[idx]);
    
    // Check if they have DIFFERENT properties (variations = intentional)
    const descriptions = new Set(variants.map(v => v.description));
    const spriteIds = new Set(variants.map(v => v.spriteId));
    const prices = new Set(variants.map(v => v.price));
    
    // If all properties are identical, it's suspicious/duplicate
    if (descriptions.size === 1 && spriteIds.size === 1 && prices.size === 1) {
        suspiciousDuplicates.push({
            name,
            ids,
            properties: variants[0]
        });
    } else {
        intentionalDuplicates.push({
            name,
            ids,
            hasVariations: {
                descriptions: descriptions.size,
                sprites: spriteIds.size,
                prices: prices.size
            }
        });
    }
}

console.log(`INTENTIONAL DUPLICATES (different variations/doses/colors):\n`);
intentionalDuplicates.slice(0, 20).forEach(dup => {
    console.log(`  "${dup.name}" (${dup.ids.length} variants)`);
    console.log(`    IDs: ${dup.ids.join(', ')}`);
    console.log(`    Variations: ${JSON.stringify(dup.hasVariations)}\n`);
});

console.log(`\nSUSPICIOUS DUPLICATES (identical properties):\n`);
suspiciousDuplicates.forEach(dup => {
    console.log(`  "${dup.name}" -> IDs: ${dup.ids.join(', ')}`);
});

console.log('\n\n=== ANALYZING DUPLICATE NPCs ===\n');

const npcsByName = {};
npcs.forEach((npc, idx) => {
    if (!npcsByName[npc.name]) {
        npcsByName[npc.name] = [];
    }
    npcsByName[npc.name].push(idx);
});

const npcIntentional = [];
const npcSuspicious = [];

for (const [name, ids] of Object.entries(npcsByName)) {
    if (ids.length <= 1) continue;

    const variants = ids.map(idx => npcs[idx]);
    
    // Check if they have DIFFERENT combat stats (locations = intentional)
    const attacks = new Set(variants.map(v => v.attack));
    const strengths = new Set(variants.map(v => v.strength));
    const defenses = new Set(variants.map(v => v.defense));
    
    if (attacks.size === 1 && strengths.size === 1 && defenses.size === 1) {
        npcSuspicious.push({
            name,
            ids,
            properties: variants[0]
        });
    } else {
        npcIntentional.push({
            name,
            ids,
            hasVariations: {
                attacks: attacks.size,
                strengths: strengths.size,
                defenses: defenses.size
            }
        });
    }
}

console.log(`INTENTIONAL NPC DUPLICATES (different stats/locations):\n`);
npcIntentional.slice(0, 20).forEach(dup => {
    console.log(`  "${dup.name}" (${dup.ids.length} variants)`);
    console.log(`    IDs: ${dup.ids.join(', ')}`);
    console.log(`    Variations: ${JSON.stringify(dup.hasVariations)}\n`);
});

console.log(`\nSUSPICIOUS NPC DUPLICATES (identical stats):\n`);
npcSuspicious.slice(0, 30).forEach(dup => {
    console.log(`  "${dup.name}" -> IDs: ${dup.ids.join(', ')}`);
    console.log(`    Stats: ATK=${dup.properties.attack} STR=${dup.properties.strength} DEF=${dup.properties.defense}`);
});

console.log('\n\n=== SUMMARY ===');
console.log(`Intentional item variations: ${intentionalDuplicates.length}`);
console.log(`Suspicious item duplicates: ${suspiciousDuplicates.length}`);
console.log(`Intentional NPC variations: ${npcIntentional.length}`);
console.log(`Suspicious NPC duplicates: ${npcSuspicious.length}`);
