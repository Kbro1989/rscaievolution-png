#!/usr/bin/env node

const fs = require('fs');

// Load the canonical databases
const items = JSON.parse(fs.readFileSync('./rsc-cloudflare/rsc-server/rsc-data-local/config/items.json', 'utf8'));
const objects = JSON.parse(fs.readFileSync('./rsc-cloudflare/rsc-server/rsc-data-local/config/objects.json', 'utf8'));

// Define the IDs to verify from spinning-wheel.js
const itemIdsToVerify = {
  'Ball of Wool': 207,
  'Bowstring': 676,
  'Flax': 675,
  'Wool': 145
};

const objectIdsToVerify = {
  'Spinning Wheel': 121
};

console.log('╔══════════════════════════════════════════════════════════════════════════════╗\n║                 VERIFYING HARDCODED SPINNING WHEEL ITEM/OBJECT IDs         ║\n╚══════════════════════════════════════════════════════════════════════════════╝\n');

let issuesFound = 0;

// Verify Item IDs
console.log('--- Item ID Verification ---');
for (const [name, id] of Object.entries(itemIdsToVerify)) {
  const item = items[id];
  if (!item) {
    console.log(`❌ MISMATCH: '${name}' (ID ${id}) - Item does not exist in items.json.`);
    issuesFound++;
  } else {
    const checkName = name.toLowerCase();
    const dbName = item.name.toLowerCase();
    if (dbName.includes(checkName) || checkName.includes(dbName)) {
      console.log(`✅ OK: '${name}' (ID ${id}) maps to '${item.name}' in items.json.`);
    } else {
      console.log(`❌ MISMATCH: '${name}' (ID ${id}) - Database name is '${item.name}'.`);
      issuesFound++;
    }
  }
}

// Verify Object IDs
console.log('\n--- GameObject ID Verification ---');
for (const [name, id] of Object.entries(objectIdsToVerify)) {
  const obj = objects[id];
  if (!obj) {
    console.log(`❌ MISMATCH: '${name}' (ID ${id}) - Object does not exist in objects.json.`);
    issuesFound++;
  } else {
    const checkName = name.toLowerCase();
    const dbName = obj.name.toLowerCase();
    if (dbName.includes(checkName) || checkName.includes(dbName)) {
      console.log(`✅ OK: '${name}' (ID ${id}) maps to '${obj.name}' in objects.json.`);
    } else {
      console.log(`❌ MISMATCH: '${name}' (ID ${id}) - Database name is '${obj.name}'.`);
      issuesFound++;
    }
  }
}

console.log('\n---------------------------------------------------------------------------------');
if (issuesFound > 0) {
  console.log(`🚨 Found ${issuesFound} issues with hardcoded SPINNING WHEEL item/object IDs.`);
} else {
  console.log(`✅ All hardcoded SPINNING WHEEL item/object IDs are correct and map to the canonical databases.`);
}
console.log('---------------------------------------------------------------------------------\n');
