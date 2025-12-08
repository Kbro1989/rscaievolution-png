#!/usr/bin/env node

const fs = require('fs');

// Load the canonical item database
const items = JSON.parse(fs.readFileSync('./rsc-cloudflare/rsc-server/rsc-data-local/config/items.json', 'utf8'));

// List of item names to find from the COMMAND_IMPROVEMENTS.js report
const itemNamesToFind = [
  'Strength Potion', 'Attack Potion', 'Defense Potion', 'Super Attack',
  'Prayer Potion', 'Restore Potion', 'Air-Rune', 'Fire-Rune',
  'Death-Rune', 'Blood-Rune', 'Soul-Rune', 'Bronze Medium Helmet',
  'Steel Plate Body', 'Rune Legs', 'Dragon Square Shield', 'Rune 2-handed Sword',
  'Dragon Axe', 'Magic Longbow', 'Lobster', 'Swordfish',
  'Shark', 'Rune Med Helmet', 'Rune Plate', 'Staff of Zamorak'
];

console.log('╔══════════════════════════════════════════════════════════════════════════════╗');
console.log('║           FUZZY SEARCH FOR CORRECT IDs IN CANONICAL DATABASE               ║');
console.log('╚══════════════════════════════════════════════════════════════════════════════╝\n');

const corrections = {};

// Simple fuzzy matching function
const fuzzyMatch = (searchTerm, candidate) => {
  const st = searchTerm.toLowerCase().replace(/[^a-z0-9]/g, '');
  const c = candidate.toLowerCase().replace(/[^a-z0-9]/g, '');
  return c.includes(st);
};

for (const name of itemNamesToFind) {
  let foundItem = null;
  let bestMatch = null;
  let bestMatchScore = 0;

  for (const item of items) {
    if (item && item.name) {
      if (item.name.toLowerCase() === name.toLowerCase()) {
        foundItem = item;
        break;
      }
      if (fuzzyMatch(name, item.name)) {
        // A simple scoring system - prioritize exact word matches
        const score = name.toLowerCase().split(' ').reduce((acc, word) => {
          if (item.name.toLowerCase().includes(word)) {
            return acc + 1;
          }
          return acc;
        }, 0);
        if (score > bestMatchScore) {
          bestMatch = item;
          bestMatchScore = score;
        }
      }
    }
  }

  if (foundItem) {
    corrections[name] = items.indexOf(foundItem);
  } else if (bestMatch) {
    corrections[name] = items.indexOf(bestMatch);
  } else {
    corrections[name] = 'NOT FOUND';
  }
}

console.log('--------------------------- CORRECT ID MAPPING (FUZZY) --------------------------');
for (const [name, id] of Object.entries(corrections)) {
  const dbName = items[id] ? items[id].name : 'N/A';
  console.log(`'${name}': ${id}, // Canonical Name: '${dbName}'`);
}
console.log('---------------------------------------------------------------------------------\n');
