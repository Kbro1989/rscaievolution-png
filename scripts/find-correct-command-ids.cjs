#!/usr/bin/env node

const fs = require('fs');

// Load the canonical item database
const items = JSON.parse(fs.readFileSync('./rsc-cloudflare/rsc-server/rsc-data-local/config/items.json', 'utf8'));

// List of item names to find from the COMMAND_IMPROVEMENTS.js report
const itemNamesToFind = [
  'Strength Potion',
  'Attack Potion',
  'Defense Potion',
  'Super Attack',
  'Prayer Potion',
  'Restore Potion',
  'Air-Rune',
  'Fire-Rune',
  'Death-Rune',
  'Blood-Rune',
  'Soul-Rune',
  'Bronze Medium Helmet',
  'Steel Plate Body',
  'Rune Legs',
  'Dragon Square Shield',
  'Rune 2-handed Sword',
  'Dragon Axe',
  'Magic Longbow',
  'Lobster',
  'Swordfish',
  'Shark',
  'Rune Med Helmet',
  'Rune Plate',
  'Staff of Zamorak'
];

console.log('╔══════════════════════════════════════════════════════════════════════════════╗');
console.log('║                FINDING CORRECT IDs IN CANONICAL DATABASE                   ║');
console.log('╚══════════════════════════════════════════════════════════════════════════════╝\n');

const corrections = {};

for (const name of itemNamesToFind) {
  const foundItem = items.find(item => item && item.name && item.name.toLowerCase() === name.toLowerCase());
  
  if (foundItem) {
    corrections[name] = items.indexOf(foundItem);
  } else {
    corrections[name] = 'NOT FOUND';
  }
}

console.log('--------------------------- CORRECT ID MAPPING -------------------------------');
for (const [name, id] of Object.entries(corrections)) {
  console.log(`'${name}': ${id},`);
}
console.log('---------------------------------------------------------------------------------\n');
