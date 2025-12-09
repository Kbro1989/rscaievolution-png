#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const itemsPath = path.resolve('rsc-cloudflare/rsc-server/rsc-data-local/config/items.json');
const npcsPath = path.resolve('rsc-cloudflare/rsc-server/rsc-data-local/config/npcs.json');

const items = JSON.parse(fs.readFileSync(itemsPath, 'utf8'));
const npcs = JSON.parse(fs.readFileSync(npcsPath, 'utf8'));

console.log('=== CHECKING FOR DUPLICATE ITEM NAMES ===\n');

const itemNames = {};
const duplicateItems = [];

items.forEach((item, index) => {
    if (item.name) {
        if (itemNames[item.name]) {
            itemNames[item.name].push(index);
            duplicateItems.push({
                name: item.name,
                ids: itemNames[item.name]
            });
        } else {
            itemNames[item.name] = [index];
        }
    }
});

if (duplicateItems.length > 0) {
    console.log(`Found ${duplicateItems.length} duplicate item names:\n`);
    duplicateItems.forEach(dup => {
        console.log(`  "${dup.name}" -> IDs: ${dup.ids.join(', ')}`);
    });
} else {
    console.log('No duplicate item names found!\n');
}

console.log('\n=== CHECKING FOR DUPLICATE NPC NAMES ===\n');

const npcNames = {};
const duplicateNpcs = [];

npcs.forEach((npc, index) => {
    if (npc.name) {
        if (npcNames[npc.name]) {
            npcNames[npc.name].push(index);
            duplicateNpcs.push({
                name: npc.name,
                ids: npcNames[npc.name]
            });
        } else {
            npcNames[npc.name] = [index];
        }
    }
});

if (duplicateNpcs.length > 0) {
    console.log(`Found ${duplicateNpcs.length} duplicate NPC names:\n`);
    duplicateNpcs.forEach(dup => {
        console.log(`  "${dup.name}" -> IDs: ${dup.ids.join(', ')}`);
    });
} else {
    console.log('No duplicate NPC names found!\n');
}

console.log('\n=== SUMMARY ===');
console.log(`Total items: ${items.length}`);
console.log(`Total NPCs: ${npcs.length}`);
console.log(`Duplicate items: ${duplicateItems.length}`);
console.log(`Duplicate NPCs: ${duplicateNpcs.length}`);
