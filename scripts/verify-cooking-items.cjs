#!/usr/bin/env node

const fs = require('fs');

// Load the canonical item database
const items = JSON.parse(fs.readFileSync('./rsc-cloudflare/rsc-server/rsc-data-local/config/items.json', 'utf8'));

// Define the IDs to verify from cooking.js
const idsToVerify = {
  'Gauntlets of cooking': 666,
  'Raw Swordfish': 359,
  'Raw Lobster': 362,
  'Raw Shark': 522,
  'Raw Oomlie Meat': 1194,
  'Seaweed': 594,
  'Soda Ash': 596,
  'Uncooked Swamp Paste': 744,
  'Swamp Paste': 745,
  'Burntmeat': 133,
  'Cake Tin': 331
};

console.log('╔══════════════════════════════════════════════════════════════════════════════╗');
console.log('║                 VERIFYING HARDCODED COOKING ITEM IDs                       ║');
console.log('╚══════════════════════════════════════════════════════════════════════════════╝\n');

let issuesFound = 0;

for (const [name, id] of Object.entries(idsToVerify)) {
  const item = items[id];
  if (!item) {
    console.log(`❌ MISMATCH: '${name}' (ID ${id}) - Item does not exist in the database.`);
    issuesFound++;
  } else {
    const commandName = name.toLowerCase();
    const dbName = item.name.toLowerCase();
    if (dbName.includes(commandName) || commandName.includes(dbName)) {
      console.log(`✅ OK: '${name}' (ID ${id}) maps to '${item.name}' in local items.json.`);
    } else {
      console.log(`❌ MISMATCH: '${name}' (ID ${id}) - Database name is '${item.name}'.`);
      issuesFound++;
    }
  }
}

console.log('\n---------------------------------------------------------------------------------');
if (issuesFound > 0) {
  console.log(`🚨 Found ${issuesFound} issues with hardcoded COOKING item IDs.`);
} else {
  console.log(`✅ All hardcoded COOKING item IDs are correct and map to the canonical database.`);
}
console.log('---------------------------------------------------------------------------------\n');
