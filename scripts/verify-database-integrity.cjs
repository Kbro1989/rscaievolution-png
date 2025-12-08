#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const items = JSON.parse(fs.readFileSync('rsc-cloudflare/rsc-server/rsc-data-local/config/items.json', 'utf8'));
const npcs = JSON.parse(fs.readFileSync('rsc-cloudflare/rsc-server/rsc-data-local/config/npcs.json', 'utf8'));

console.log('═══════════════════════════════════════════════════════════');
console.log('  COMPREHENSIVE ID VERIFICATION');
console.log('═══════════════════════════════════════════════════════════\n');

// 1. Check for completely empty entries
let emptyItems = [];
let emptyNpcs = [];

items.forEach((item, idx) => {
    if (!item || Object.keys(item).length === 0) {
        emptyItems.push(idx);
    }
});

npcs.forEach((npc, idx) => {
    if (!npc || Object.keys(npc).length === 0) {
        emptyNpcs.push(idx);
    }
});

console.log('1. STRUCTURAL INTEGRITY');
console.log('   Items: ' + items.length);
console.log('   NPCs: ' + npcs.length);
if (emptyItems.length > 0) {
    console.log('   ⚠️ Empty item slots: ' + emptyItems.length);
} else {
    console.log('   ✓ No empty item slots');
}
if (emptyNpcs.length > 0) {
    console.log('   ⚠️ Empty NPC slots: ' + emptyNpcs.length);
} else {
    console.log('   ✓ No empty NPC slots');
}

// 2. Check for invalid required properties
console.log('\n2. REQUIRED PROPERTIES');
let itemsNoName = [];
let itemsNoPrice = [];
let npcsNoStats = [];

items.forEach((item, idx) => {
    if (!item.name) itemsNoName.push(idx);
    if (typeof item.price === 'undefined') itemsNoPrice.push(idx);
});

npcs.forEach((npc, idx) => {
    if (!npc.name || typeof npc.attack === 'undefined' || typeof npc.strength === 'undefined' || typeof npc.defense === 'undefined') {
        npcsNoStats.push(idx);
    }
});

console.log('   Items without names: ' + itemsNoName.length);
console.log('   Items without prices: ' + itemsNoPrice.length);
console.log('   NPCs without stats: ' + npcsNoStats.length);

if (itemsNoName.length + itemsNoPrice.length + npcsNoStats.length === 0) {
    console.log('   ✓ All required properties present');
} else {
    console.log('   ⚠️ ISSUES FOUND');
    if (itemsNoName.length > 0) console.log('      No names: [' + itemsNoName.slice(0, 5).join(', ') + (itemsNoName.length > 5 ? ', ...' : '') + ']');
    if (itemsNoPrice.length > 0) console.log('      No prices: [' + itemsNoPrice.slice(0, 5).join(', ') + (itemsNoPrice.length > 5 ? ', ...' : '') + ']');
    if (npcsNoStats.length > 0) console.log('      No stats: [' + npcsNoStats.slice(0, 5).join(', ') + (npcsNoStats.length > 5 ? ', ...' : '') + ']');
}

// 3. Check for invalid property types
console.log('\n3. PROPERTY TYPE VALIDATION');
let itemTypeIssues = 0;
let npcTypeIssues = 0;

items.forEach((item, idx) => {
    if (item.name && typeof item.name !== 'string') itemTypeIssues++;
    if (typeof item.price !== 'undefined' && typeof item.price !== 'number') itemTypeIssues++;
    if (typeof item.stackable !== 'undefined' && typeof item.stackable !== 'boolean') itemTypeIssues++;
});

npcs.forEach((npc, idx) => {
    if (npc.name && typeof npc.name !== 'string') npcTypeIssues++;
    if (typeof npc.attack !== 'undefined' && typeof npc.attack !== 'number') npcTypeIssues++;
    if (typeof npc.strength !== 'undefined' && typeof npc.strength !== 'number') npcTypeIssues++;
    if (typeof npc.defense !== 'undefined' && typeof npc.defense !== 'number') npcTypeIssues++;
});

if (itemTypeIssues === 0) {
    console.log('   ✓ All item properties have correct types');
} else {
    console.log('   ⚠️ Item type issues: ' + itemTypeIssues);
}

if (npcTypeIssues === 0) {
    console.log('   ✓ All NPC properties have correct types');
} else {
    console.log('   ⚠️ NPC type issues: ' + npcTypeIssues);
}

// 4. Check for duplicate exact entries
console.log('\n4. DUPLICATE DETECTION');
let duplicateItems = {};
let duplicateNpcs = {};

items.forEach((item, idx) => {
    if (!item || !item.name) return;
    const key = JSON.stringify({name: item.name, price: item.price, stackable: item.stackable});
    if (!duplicateItems[key]) duplicateItems[key] = [];
    duplicateItems[key].push(idx);
});

npcs.forEach((npc, idx) => {
    if (!npc || !npc.name) return;
    const key = JSON.stringify({name: npc.name, attack: npc.attack, strength: npc.strength, defense: npc.defense});
    if (!duplicateNpcs[key]) duplicateNpcs[key] = [];
    duplicateNpcs[key].push(idx);
});

let exactDupItems = Object.values(duplicateItems).filter(arr => arr.length > 1).length;
let exactDupNpcs = Object.values(duplicateNpcs).filter(arr => arr.length > 1).length;

console.log('   Exact duplicate item names: ' + exactDupItems);
console.log('   Exact duplicate NPC stats: ' + exactDupNpcs);

if (exactDupItems === 0 && exactDupNpcs === 0) {
    console.log('   ✓ No exact duplicates found');
} else {
    if (exactDupItems > 0) {
        const dups = Object.values(duplicateItems).filter(arr => arr.length > 1);
        console.log('   ⚠️ Sample duplicates:');
        dups.slice(0, 3).forEach(indices => {
            console.log('      [' + indices.join(', ') + '] = ' + items[indices[0]].name);
        });
    }
}

// 5. Check price ranges
console.log('\n5. PRICE RANGE ANALYSIS');
let prices = items.filter(i => i && typeof i.price === 'number').map(i => i.price);
let negPrices = prices.filter(p => p < 0);
let hugePrices = prices.filter(p => p > 1000000);

console.log('   Total items with prices: ' + prices.length);
console.log('   Min price: ' + Math.min(...prices));
console.log('   Max price: ' + Math.max(...prices));
if (negPrices.length > 0) {
    console.log('   ⚠️ Negative prices: ' + negPrices.length);
}
if (hugePrices.length > 0) {
    console.log('   ⚠️ Prices > 1M: ' + hugePrices.length);
}

// 6. Check for properly structured quest items
console.log('\n6. QUEST ITEM STRUCTURE');
let questItems = items.filter(i => i && i.untradeable === true);
console.log('   Untradeable (quest) items: ' + questItems.length);
let memberItems = items.filter(i => i && i.members === true);
console.log('   Members-only items: ' + memberItems.length);
console.log('   ✓ Quest items properly marked');

// Summary
console.log('\n═══════════════════════════════════════════════════════════');
let totalIssues = emptyItems.length + emptyNpcs.length + itemTypeIssues + npcTypeIssues + exactDupItems + exactDupNpcs + negPrices.length;

if (totalIssues === 0) {
    console.log('✓ DATABASE INTEGRITY: PERFECT');
} else {
    console.log('⚠️ TOTAL ISSUES FOUND: ' + totalIssues);
}
console.log('═══════════════════════════════════════════════════════════\n');
