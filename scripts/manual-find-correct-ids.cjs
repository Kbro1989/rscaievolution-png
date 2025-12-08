#!/usr/bin/env node

const fs = require('fs');

// Load the canonical item database
const items = JSON.parse(fs.readFileSync('./rsc-cloudflare/rsc-server/rsc-data-local/config/items.json', 'utf8'));

const searchTerms = ['bronze', 'steel', 'rune', 'legs', 'restore potion'];

console.log('╔══════════════════════════════════════════════════════════════════════════════╗');
console.log('║               MANUAL SEARCH FOR REMAINING COMMAND ITEM IDs                 ║');
console.log('╚══════════════════════════════════════════════════════════════════════════════╝\n');

for (const term of searchTerms) {
  console.log(`--------------------------- ITEMS CONTAINING '${term}' --------------------------`);
  items.forEach((item, id) => {
    if (item && item.name && item.name.toLowerCase().includes(term)) {
      console.log(`[${id}] ${item.name}`);
    }
  });
  console.log('---------------------------------------------------------------------------------\n');
}
