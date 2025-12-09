#!/usr/bin/env node

const fs = require('fs');

// Load the canonical item database
const items = JSON.parse(fs.readFileSync('./rsc-cloudflare/rsc-server/rsc-data-local/config/items.json', 'utf8'));

// Define the IDs to verify from leather.js
const idsToVerify = {
  'Leather': 147,
  'Needle': 39,
  'Thread': 43
};

console.log('╔══════════════════════════════════════════════════════════════════════════════╗');
console.log('║                 VERIFYING HARDCODED LEATHER CRAFTING ITEM IDs              ║');
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
  console.log(`🚨 Found ${issuesFound} issues with hardcoded LEATHER CRAFTING item IDs.`);
} else {
  console.log(`✅ All hardcoded LEATHER CRAFTING item IDs are correct and map to the canonical database.`);
}
console.log('---------------------------------------------------------------------------------\n');
