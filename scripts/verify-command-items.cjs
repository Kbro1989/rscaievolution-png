#!/usr/bin/env node

const fs = require('fs');

// Load the canonical item database
const items = JSON.parse(fs.readFileSync('./rsc-cloudflare/rsc-server/rsc-data-local/config/items.json', 'utf8'));

// Define the IDs to verify from the COMMAND_IMPROVEMENTS.js report
const idsToVerify = {
  'Strength Potion': 217,
  'attack Potion': 452,
  'defense Potion': 458,
  'Super attack Potion': 464,
  'restore prayer Potion': 461,
  'Super strength Potion': 470,
  'Air-Rune': 33,
  'Fire-Rune': 31,
  'Death-Rune': 38,
  'Blood-Rune': 591,
  'Soul-Rune': 779,
  'Medium Bronze Helmet': 103,
  'Steel Plate Mail Body': 117,
  'Rune Plate Mail Legs': 392,
  'Dragon Square Shield': 1204,
  'rune 2-handed Sword': 80,
  'Dragon axe': 566,
  'Magic Longbow': 628,
  'Lobster': 363,
  'Swordfish': 360,
  'Shark': 523,
  'Medium Rune Helmet': 389,
  'Rune Plate Mail Body': 391,
  'Staff of zamorak': 1142
};

console.log('╔══════════════════════════════════════════════════════════════════════════════╗');
console.log('║           VERIFYING COMMAND ITEM IDs AGAINST CANONICAL DATABASE              ║');
console.log('╚══════════════════════════════════════════════════════════════════════════════╝\n');

let issuesFound = 0;
let verifiedCount = 0;

for (const [name, id] of Object.entries(idsToVerify)) {
  const item = items[id];
  
  if (!item) {
    console.log(`❌ MISMATCH: '${name}' (ID ${id}) - Item does not exist in the database.`);
    issuesFound++;
  } else {
    // Flexible name check: ignore case and check if the database name includes the command name (or vice-versa).
    const commandName = name.toLowerCase().replace(/ \(\\d\)/, ''); // Remove (4) from potion names if present
    const dbName = item.name.toLowerCase();
    if (dbName.includes(commandName) || commandName.includes(dbName)) {
      verifiedCount++;
    } else {
      console.log(`❌ MISMATCH: '${name}' (ID ${id}) - Database name is '${item.name}'.`);
      issuesFound++;
    }
  }
}

console.log('\n---------------------------------------------------------------------------------');
if (issuesFound > 0) {
  console.log(`\n🚨 Found ${issuesFound} issues.`);
} else {
  console.log(`\n✅ All ${verifiedCount} item IDs are correct and match the canonical database.`);
}
console.log('---------------------------------------------------------------------------------\n');
