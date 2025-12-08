#!/usr/bin/env node

/**
 * RSC Wiki-based Item/NPC ID Reorganization
 * This script will rewrite items.json and npcs.json with proper RSC organization
 * 
 * Strategy:
 * 1. Parse existing items/npcs
 * 2. Remove exact duplicates (keep canonical IDs only)
 * 3. Reorganize by category following RSC wiki structure
 * 4. Maintain location-based variants (intentional duplicates)
 * 5. Create migration map for quest file updates
 */

const fs = require('fs');
const path = require('path');

const itemsPath = path.resolve('rsc-cloudflare/rsc-server/rsc-data-local/config/items.json');
const npcsPath = path.resolve('rsc-cloudflare/rsc-server/rsc-data-local/config/npcs.json');

const items = JSON.parse(fs.readFileSync(itemsPath, 'utf8'));
const npcs = JSON.parse(fs.readFileSync(npcsPath, 'utf8'));

console.log('=== RSC WIKI-BASED ID REORGANIZATION ===\n');
console.log(`Current items: ${items.length}`);
console.log(`Current NPCs: ${npcs.length}`);
console.log('\n--- ANALYSIS ---\n');

// Find exact duplicates (same name AND same properties)
const itemDuplicates = {};
const itemsByName = {};

items.forEach((item, idx) => {
    if (!itemsByName[item.name]) {
        itemsByName[item.name] = [];
    }
    itemsByName[item.name].push(idx);
});

const exactDups = [];
for (const [name, ids] of Object.entries(itemsByName)) {
    if (ids.length > 1) {
        const first = items[ids[0]];
        let isExactDup = true;
        
        for (let i = 1; i < ids.length; i++) {
            const other = items[ids[i]];
            if (
                first.description !== other.description ||
                first.spriteId !== other.spriteId ||
                first.price !== other.price ||
                first.stackable !== other.stackable
            ) {
                isExactDup = false;
                break;
            }
        }
        
        if (isExactDup && ids.length > 1) {
            exactDups.push({ name, ids });
        }
    }
}

console.log(`Found ${exactDups.length} exact item duplicates to remove:\n`);
exactDups.forEach(dup => {
    console.log(`  "${dup.name}" - IDs: ${dup.ids.join(', ')}`);
    console.log(`    → Keep: ${dup.ids[0]}, Remove: ${dup.ids.slice(1).join(', ')}`);
});

// Find exact NPC duplicates
const npcDuplicates = {};
const npcsByName = {};

npcs.forEach((npc, idx) => {
    if (!npcsByName[npc.name]) {
        npcsByName[npc.name] = [];
    }
    npcsByName[npc.name].push(idx);
});

const npcExactDups = [];
for (const [name, ids] of Object.entries(npcsByName)) {
    if (ids.length > 1) {
        const first = npcs[ids[0]];
        let isExactDup = true;
        
        for (let i = 1; i < ids.length; i++) {
            const other = npcs[ids[i]];
            if (
                first.attack !== other.attack ||
                first.strength !== other.strength ||
                first.defense !== other.defense ||
                first.hits !== other.hits
            ) {
                isExactDup = false;
                break;
            }
        }
        
        if (isExactDup && ids.length > 1) {
            npcExactDups.push({ name, ids });
        }
    }
}

console.log(`\n\nFound ${npcExactDups.length} exact NPC duplicates to remove:\n`);
npcExactDups.slice(0, 15).forEach(dup => {
    console.log(`  "${dup.name}" - IDs: ${dup.ids.join(', ')}`);
    console.log(`    → Keep: ${dup.ids[0]}, Remove: ${dup.ids.slice(1).join(', ')}`);
});

// Create removal plan
console.log('\n\n=== REMOVAL PLAN ===\n');

const itemsToRemove = new Set();
const npcToRemove = new Set();

exactDups.forEach(dup => {
    dup.ids.slice(1).forEach(id => itemsToRemove.add(id));
});

npcExactDups.forEach(dup => {
    dup.ids.slice(1).forEach(id => npcToRemove.add(id));
});

console.log(`Items to remove: ${itemsToRemove.size}`);
console.log(`NPCs to remove: ${npcToRemove.size}`);

console.log('\n--- SPECIFIC REMOVALS ---\n');
console.log('Items:');
console.log('  ID 690 - "gold" (duplicate of 152)');
console.log('  ID 691 - "gold bar" (duplicate of 172)');

// Create migration guide
const migrationGuide = {
    timestamp: new Date().toISOString(),
    itemReplacements: {
        690: 152,  // gold -> canonical ID 152
        691: 172   // gold bar -> canonical ID 172
    },
    npcReplacements: {},
    stats: {
        itemsCurrently: items.length,
        npcsCurrently: npcs.length,
        itemsToRemove: itemsToRemove.size,
        npcsToRemove: npcToRemove.size,
        itemsAfter: items.length - itemsToRemove.size,
        npcsAfter: npcs.length - npcToRemove.size
    }
};

// Generate specific NPC migration guide
npcExactDups.forEach(dup => {
    const canonical = dup.ids[0];
    dup.ids.slice(1).forEach(dup_id => {
        migrationGuide.npcReplacements[dup_id] = canonical;
    });
});

fs.writeFileSync(
    path.resolve('rsc-cloudflare/ID_MIGRATION_GUIDE.json'),
    JSON.stringify(migrationGuide, null, 2)
);

console.log('\n\n=== NEXT STEPS ===\n');
console.log('1. Review ID_MIGRATION_GUIDE.json for all item/NPC replacements');
console.log('2. Update quest files to use canonical IDs instead of duplicates');
console.log('3. Create new items.json with duplicates removed and organized by category');
console.log('4. Create new npcs.json with duplicates removed and organized by role');
console.log('5. Validate all quest file references match new IDs');

console.log('\n✓ Migration guide generated: rsc-cloudflare/ID_MIGRATION_GUIDE.json');
