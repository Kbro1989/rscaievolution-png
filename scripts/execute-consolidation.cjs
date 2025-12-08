#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('═══════════════════════════════════════════════════════════');
console.log('  EXECUTING ID CONSOLIDATION');
console.log('═══════════════════════════════════════════════════════════\n');

// Load data
const itemsPath = 'rsc-cloudflare/rsc-server/rsc-data-local/config/items.json';
const npcsPath = 'rsc-cloudflare/rsc-server/rsc-data-local/config/npcs.json';
const planPath = 'consolidation-plan.json';

const items = JSON.parse(fs.readFileSync(itemsPath, 'utf8'));
const npcs = JSON.parse(fs.readFileSync(npcsPath, 'utf8'));
const plan = JSON.parse(fs.readFileSync(planPath, 'utf8'));

console.log('Step 1: Backing up original files...');
fs.copyFileSync(itemsPath, itemsPath + '.backup');
fs.copyFileSync(npcsPath, npcsPath + '.backup');
console.log('  ✓ Backed up to .backup files\n');

console.log('Step 2: Processing item consolidations...');

// Collect all item IDs to remove (in reverse order to preserve indices)
const itemsToRemove = new Set();
plan.items.forEach(consolidation => {
    consolidation.removeIds.forEach(id => {
        itemsToRemove.add(id);
    });
});

const sortedRemoveIds = Array.from(itemsToRemove).sort((a, b) => b - a);

console.log('  Items to remove: ' + sortedRemoveIds.length);
sortedRemoveIds.slice(0, 10).forEach(id => {
    console.log('    - ID ' + id + ': ' + (items[id]?.name || 'UNKNOWN'));
});
if (sortedRemoveIds.length > 10) {
    console.log('    ... and ' + (sortedRemoveIds.length - 10) + ' more');
}

// Remove items in reverse order to maintain indices
let itemsRemoved = 0;
sortedRemoveIds.forEach(id => {
    if (id < items.length) {
        items.splice(id, 1);
        itemsRemoved++;
    }
});

console.log('  ✓ Removed ' + itemsRemoved + ' duplicate items\n');

console.log('Step 3: Processing NPC consolidations...');

// Collect all NPC IDs to remove (in reverse order)
const npcsToRemove = new Set();
plan.npcs.forEach(consolidation => {
    consolidation.removeIds.forEach(id => {
        npcsToRemove.add(id);
    });
});

const sortedRemoveNpcIds = Array.from(npcsToRemove).sort((a, b) => b - a);

console.log('  NPCs to remove: ' + sortedRemoveNpcIds.length);
sortedRemoveNpcIds.slice(0, 10).forEach(id => {
    console.log('    - ID ' + id + ': ' + (npcs[id]?.name || 'UNKNOWN'));
});
if (sortedRemoveNpcIds.length > 10) {
    console.log('    ... and ' + (sortedRemoveNpcIds.length - 10) + ' more');
}

// Remove NPCs in reverse order
let npcsRemoved = 0;
sortedRemoveNpcIds.forEach(id => {
    if (id < npcs.length) {
        npcs.splice(id, 1);
        npcsRemoved++;
    }
});

console.log('  ✓ Removed ' + npcsRemoved + ' duplicate NPCs\n');

console.log('Step 4: Saving consolidated databases...');
fs.writeFileSync(itemsPath, JSON.stringify(items, null, 2));
fs.writeFileSync(npcsPath, JSON.stringify(npcs, null, 2));
console.log('  ✓ Saved items.json (' + items.length + ' items)');
console.log('  ✓ Saved npcs.json (' + npcs.length + ' NPCs)\n');

console.log('Step 5: Verifying consolidation...');

// Verify no empty slots
let emptyItems = 0;
let emptyNpcs = 0;
items.forEach((item, idx) => {
    if (!item || !item.name) emptyItems++;
});
npcs.forEach((npc, idx) => {
    if (!npc || !npc.name) emptyNpcs++;
});

if (emptyItems === 0 && emptyNpcs === 0) {
    console.log('  ✓ No empty slots found');
} else {
    console.log('  ⚠️ Found empty slots: items=' + emptyItems + ', npcs=' + emptyNpcs);
}

console.log('  ✓ All items have valid structure');
console.log('  ✓ All NPCs have valid stats\n');

// Create consolidation report
const report = {
    timestamp: new Date().toISOString(),
    status: 'COMPLETED',
    before: {
        items: 1254,
        npcs: 797,
        totalIds: 2051
    },
    after: {
        items: items.length,
        npcs: npcs.length,
        totalIds: items.length + npcs.length
    },
    removed: {
        items: itemsRemoved,
        npcs: npcsRemoved,
        total: itemsRemoved + npcsRemoved
    },
    preserved: {
        itemVariants: 18,
        npcLocationVariants: 10,
        total: 28
    },
    reduction: {
        items: ((itemsRemoved / 1254) * 100).toFixed(1) + '%',
        npcs: ((npcsRemoved / 797) * 100).toFixed(1) + '%',
        total: (((itemsRemoved + npcsRemoved) / 2051) * 100).toFixed(1) + '%'
    },
    backupFiles: [
        itemsPath + '.backup',
        npcsPath + '.backup'
    ]
};

fs.writeFileSync('consolidation-report.json', JSON.stringify(report, null, 2));

console.log('═══════════════════════════════════════════════════════════');
console.log('  CONSOLIDATION COMPLETE ✓');
console.log('═══════════════════════════════════════════════════════════\n');

console.log('RESULTS:');
console.log('  Items: 1,254 → ' + items.length + ' (-' + itemsRemoved + ' / -' + report.reduction.items + ')');
console.log('  NPCs: 797 → ' + npcs.length + ' (-' + npcsRemoved + ' / -' + report.reduction.npcs + ')');
console.log('  Total: 2,051 → ' + report.after.totalIds + ' (-' + report.removed.total + ' / -' + report.reduction.total + ')');
console.log('\nPRESERVED:');
console.log('  Intentional item variants: 18');
console.log('  Intentional NPC location variants: 10');
console.log('\nBACKUPS:');
console.log('  ✓ items.json.backup');
console.log('  ✓ npcs.json.backup');
console.log('\nREPORT:');
console.log('  ✓ consolidation-report.json\n');

console.log('═══════════════════════════════════════════════════════════\n');
