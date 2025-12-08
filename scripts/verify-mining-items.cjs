#!/usr/bin/env node

const fs = require('fs');

// Load the canonical item database
const items = JSON.parse(fs.readFileSync('./rsc-cloudflare/rsc-server/rsc-data-local/config/items.json', 'utf8'));

// Define the IDs to verify from mining.js
const idsToVerify = {
  'Bronze Pickaxe': 155,
  'Iron Pickaxe': 1184,
  'Steel Pickaxe': 1185,
  'Mithril Pickaxe': 1186,
  'Adamant Pickaxe': 1258,
  'Rune Pickaxe': 1188,
  'Diamond': 160,
  'Ruby': 161,
  'Emerald': 162,
  'Sapphire': 163,
  'Dragonstone Amulet (u)': 582
};

console.log('╔══════════════════════════════════════════════════════════════════════════════╗');
console.log('║                 VERIFYING HARDCODED MINING ITEM IDs                        ║');
console.log('╚══════════════════════════════════════════════════════════════════════════════╝\n');

let issuesFound = 0;

for (const [name, id] of Object.entries(idsToVerify)) {
  const item = items[id];
  if (!item) {
    console.log(`❌ MISMATCH: '${name}' (ID ${id}) - Item does not exist in the database.`);
    issuesFound++;
  } else {
    const commandName = name.toLowerCase().replace(/ \(u\)/, ''); // Remove (u) from amulet names if present
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
  console.log(`🚨 Found ${issuesFound} issues with hardcoded MINING item IDs.`);
} else {
  console.log(`✅ All hardcoded MINING item IDs are correct and map to the canonical database.`);
}
console.log('---------------------------------------------------------------------------------\n');
