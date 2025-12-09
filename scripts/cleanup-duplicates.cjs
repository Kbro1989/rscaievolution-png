#!/usr/bin/env node

/**
 * Clean up items.json and npcs.json by removing exact duplicates
 * and creating a migration map for quest files
 */

const fs = require('fs');
const path = require('path');

const itemsPath = path.resolve('rsc-cloudflare/rsc-server/rsc-data-local/config/items.json');
const npcsPath = path.resolve('rsc-cloudflare/rsc-server/rsc-data-local/config/npcs.json');

let items = JSON.parse(fs.readFileSync(itemsPath, 'utf8'));
let npcs = JSON.parse(fs.readFileSync(npcsPath, 'utf8'));

const migrationGuide = JSON.parse(fs.readFileSync(
    path.resolve('rsc-cloudflare/ID_MIGRATION_GUIDE.json'), 'utf8'
));

console.log('=== CLEANING UP DUPLICATES ===\n');
console.log(`Before: ${items.length} items, ${npcs.length} NPCs\n`);

// Track which indices to remove (in reverse order for safe removal)
const itemsToRemove = [];
const npcsToRemove = [];

// Remove duplicate items
Object.entries(migrationGuide.itemReplacements).forEach(([dup_id, canonical_id]) => {
    const idx = parseInt(dup_id);
    if (idx < items.length) {
        itemsToRemove.push(idx);
    }
});

// Remove duplicate NPCs
Object.entries(migrationGuide.npcReplacements).forEach(([dup_id, canonical_id]) => {
    const idx = parseInt(dup_id);
    if (idx < npcs.length) {
        npcsToRemove.push(idx);
    }
});

// Sort in reverse order to remove from end first (preserves indices)
itemsToRemove.sort((a, b) => b - a);
npcsToRemove.sort((a, b) => b - a);

console.log(`Removing ${itemsToRemove.length} duplicate items...`);
itemsToRemove.forEach(idx => {
    console.log(`  [${idx}] ${items[idx].name}`);
});

console.log(`\nRemoving ${npcsToRemove.length} duplicate NPCs...`);
npcsToRemove.slice(0, 10).forEach(idx => {
    console.log(`  [${idx}] ${npcs[idx].name}`);
});
if (npcsToRemove.length > 10) {
    console.log(`  ... and ${npcsToRemove.length - 10} more`);
}

// Remove items (in reverse order)
itemsToRemove.forEach(idx => {
    items.splice(idx, 1);
});

// Remove NPCs (in reverse order)
npcsToRemove.forEach(idx => {
    npcs.splice(idx, 1);
});

console.log(`\n✓ After cleanup: ${items.length} items, ${npcs.length} NPCs`);

// Create new index mapping (old index -> new index) due to removals
const itemIndexMap = {};
const npcIndexMap = {};

// Rebuild maps accounting for removals
let newItemIdx = 0;
items.forEach((item, idx) => {
    // Find original index by searching for matching item
    for (let oldIdx = 0; oldIdx < items.length; oldIdx++) {
        if (items[idx] === item) {
            itemIndexMap[oldIdx] = newItemIdx;
            break;
        }
    }
});

let newNpcIdx = 0;
npcs.forEach((npc, idx) => {
    for (let oldIdx = 0; oldIdx < npcs.length; oldIdx++) {
        if (npcs[idx] === npc) {
            npcIndexMap[oldIdx] = newNpcIdx;
            break;
        }
    }
});

// Save cleaned data
fs.writeFileSync(itemsPath, JSON.stringify(items, null, 2));
fs.writeFileSync(npcsPath, JSON.stringify(npcs, null, 2));

console.log('\n✓ items.json saved');
console.log('✓ npcs.json saved');

// Create detailed migration report
const report = {
    timestamp: new Date().toISOString(),
    action: 'Removed exact duplicates from items.json and npcs.json',
    itemsRemoved: itemsToRemove.length,
    npcsRemoved: npcsToRemove.length,
    itemsBefore: parseInt(fs.readFileSync(itemsPath, 'utf8').split('"name"').length - 1),
    npcsBefore: parseInt(fs.readFileSync(npcsPath, 'utf8').split('"name"').length - 1),
    itemsAfter: items.length,
    npcsAfter: npcs.length,
    details: {
        itemDuplicatesRemoved: itemsToRemove.map(idx => ({
            id: idx,
            name: items[idx]?.name || 'unknown'
        })).slice(0, 10),
        npcDuplicatesRemoved: npcsToRemove.map(idx => ({
            id: idx,
            name: npcs[idx]?.name || 'unknown'
        })).slice(0, 10)
    },
    nextSteps: [
        'Update quest files to use canonical IDs',
        'Search for references to removed IDs in source code',
        'Run tests to verify quest functionality'
    ]
};

fs.writeFileSync(
    path.resolve('rsc-cloudflare/CLEANUP_REPORT.json'),
    JSON.stringify(report, null, 2)
);

console.log('\n✓ Cleanup report saved to CLEANUP_REPORT.json');
console.log('\n=== IMPORTANT ===');
console.log('Now need to update quest files to use canonical IDs instead of duplicates');
console.log('Use ID_MIGRATION_GUIDE.json to find all replacements needed');
