#!/usr/bin/env node

const fs = require('fs');

// Load the canonical databases
const items = JSON.parse(fs.readFileSync('./rsc-cloudflare/rsc-server/rsc-data-local/config/items.json', 'utf8'));
const objects = JSON.parse(fs.readFileSync('./rsc-cloudflare/rsc-server/rsc-data-local/config/objects.json', 'utf8'));

// Define the IDs to verify from pottery.js
const itemIdsToVerify = {
  'Clay': 149,
  'Soft Clay': 243,
  'Full Bucket': 141, // Assuming full water container
  'Empty Bucket': 140, // Assuming empty water container
  'Wine': 50, // Assuming wine item (old water source)
  'Vial of Water': 21 // Assuming vial of water item (old water source)
};

const objectIdsToVerify = {
  'Pottery Oven': 178,
  'Pottery Wheel': 179
};

console.log('╔══════════════════════════════════════════════════════════════════════════════╗');
console.log('║                 VERIFYING HARDCODED POTTERY ITEM/OBJECT IDs                ║');
console.log('╚══════════════════════════════════════════════════════════════════════════════╝\n');

let issuesFound = 0;

// Verify Item IDs
console.log('--- Item ID Verification ---');
for (const [name, id] of Object.entries(itemIdsToVerify)) {
  const item = items[id];
  if (!item) {
    console.log(`❌ MISMATCH: '${name}' (ID ${id}) - Item does not exist in items.json.`);
    issuesFound++;
  } else {
    const checkName = name.toLowerCase().replace(/ \(.+\)/, ''); // Clean name for flexible matching
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
    const checkName = name.toLowerCase().replace(/ \(.+\)/, '');
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
  console.log(`🚨 Found ${issuesFound} issues with hardcoded POTTERY item/object IDs.`);
} else {
  console.log(`✅ All hardcoded POTTERY item/object IDs are correct and map to the canonical databases.`);
}
console.log('---------------------------------------------------------------------------------\n');
