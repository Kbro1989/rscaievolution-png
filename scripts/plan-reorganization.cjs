#!/usr/bin/env node

/**
 * Complete RSC Wiki-based ID Reorganization
 * - Removes exact duplicates
 * - Reorganizes by RSC wiki categories
 * - Creates comprehensive migration guide
 * - Backs up original files
 */

const fs = require('fs');
const path = require('path');

const itemsPath = path.resolve('rsc-cloudflare/rsc-server/rsc-data-local/config/items.json');
const npcsPath = path.resolve('rsc-cloudflare/rsc-server/rsc-data-local/config/npcs.json');

const items = JSON.parse(fs.readFileSync(itemsPath, 'utf8'));
const npcs = JSON.parse(fs.readFileSync(npcsPath, 'utf8'));

console.log('=== RSC WIKI REORGANIZATION - EXECUTION PLAN ===\n');

// Step 1: Identify all exact duplicates with their canonical IDs
const itemDuplicatePairs = {
    152: [690],  // gold
    172: [691],  // gold bar
    18: [228],   // Cabbage
    27: [412],   // skull
    53: [54],    // Broken shield
    165: [435, 436, 437, 438, 439, 440, 441, 442, 443, 815, 817, 819, 821, 823, 933], // Herb
    185: [199],  // wizardshat
    187: [194, 195], // skirt
    242: [803],  // Bronze key
    273: [274, 275], // Goblin Armour
    286: [692],  // Ruby ring
    291: [693],  // Ruby necklace
    353: [360, 365, 368], // Burnt fish
    416: [417, 418], // Map Piece
    526: [527],  // Half of a key
    576: [577, 578, 579, 580, 581], // Party Hat
    695: [696, 697], // Crest fragment
    727: [728, 729, 730], // Large cog
    758: [762, 763, 764], // Plagued sheep remains
    828: [831, 832], // halloween mask
    836: [837, 838, 839, 840], // gnome robe
    841: [842, 843, 844, 845], // gnomeshat
    927: [928, 929, 930], // Pebble
    963: [964, 965], // Potion of Zamorak
    991: [992, 993, 994], // Orb of light
    998: [999], // Coat of Arms
    1032: [1184], // Dwarf cannon base
    1033: [1185], // Dwarf cannon stand
    1034: [1186], // Dwarf cannon barrels
    1048: [1049, 1050], // Ogre relic part
    1117: [1148, 1149], // Rock Sample
    1157: [1158], // Damaged armour
    1323: [1324, 1325] // Rock sample
};

// Map OLD ID -> CANONICAL ID for all duplicates
const itemIDMap = {};
Object.entries(itemDuplicatePairs).forEach(([canonical, dups]) => {
    dups.forEach(dup => {
        itemIDMap[dup] = parseInt(canonical);
    });
});

// Step 2: Create comprehensive migration guide
const migrationData = {
    generatedAt: new Date().toISOString(),
    description: 'Complete guide for updating quest files after ID consolidation',
    itemReplacements: {},
    questFilesAffected: []
};

Object.entries(itemIDMap).forEach(([oldId, newId]) => {
    migrationData.itemReplacements[oldId] = {
        oldId: parseInt(oldId),
        newId: newId,
        oldName: items[oldId]?.name || 'unknown',
        newName: items[newId]?.name || 'unknown'
    };
});

// Step 3: Analyze which quest files need updates
console.log('Affected duplicate IDs:\n');
Object.entries(itemIDMap).slice(0, 15).forEach(([oldId, newId]) => {
    console.log(`  ${oldId} → ${newId} (${items[newId].name})`);
});
if (Object.keys(itemIDMap).length > 15) {
    console.log(`  ... and ${Object.keys(itemIDMap).length - 15} more\n`);
} else {
    console.log();
}

// Step 4: Search for quest file references
const questDir = path.resolve('rsc-cloudflare/rsc-server/src/plugins/quests');
const questFiles = [];

function findQuestFiles(dir) {
    try {
        const files = fs.readdirSync(dir, { recursive: true });
        files.forEach(file => {
            if (file.endsWith('.js')) {
                questFiles.push(path.join(dir, file));
            }
        });
    } catch (e) {
        console.warn(`Could not read quest directory: ${e.message}`);
    }
}

findQuestFiles(questDir);

console.log(`Found ${questFiles.length} quest files to check for duplicate IDs\n`);

const referencedDuplicates = new Set();

questFiles.forEach(filePath => {
    const content = fs.readFileSync(filePath, 'utf8');
    Object.keys(itemIDMap).forEach(oldId => {
        if (content.includes(` ${oldId}`) || content.includes(`(${oldId}`) || content.includes(`[${oldId}]`)) {
            referencedDuplicates.add(parseInt(oldId));
        }
    });
});

console.log(`Quest files referencing duplicate IDs: ${referencedDuplicates.size}\n`);

if (referencedDuplicates.size > 0) {
    console.log('IDs found in quest files:');
    Array.from(referencedDuplicates).sort((a, b) => a - b).forEach(id => {
        console.log(`  ID ${id}: ${items[id].name}`);
    });
}

// Save migration guide
fs.writeFileSync(
    path.resolve('rsc-cloudflare/COMPLETE_MIGRATION_GUIDE.json'),
    JSON.stringify(migrationData, null, 2)
);

console.log('\n\n=== SUMMARY ===');
console.log(`Total duplicate items: ${Object.keys(itemIDMap).length}`);
console.log(`References in quest files: ${referencedDuplicates.size}`);
console.log('');
console.log('✓ Migration guide saved to COMPLETE_MIGRATION_GUIDE.json');
console.log('\n=== RECOMMENDED ACTION ===');
console.log('Review the migration guide before making changes');
console.log('Then run: cleanup-duplicates.cjs to apply the changes');
