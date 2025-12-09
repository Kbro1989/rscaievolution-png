#!/usr/bin/env node

const fs = require('fs');
const items = JSON.parse(fs.readFileSync('./rsc-cloudflare/rsc-server/rsc-data-local/config/items.json', 'utf8'));

console.log('🔍 COMPLETE POTION LIST WITH DOSES:\n');

const potions = [];
for (let id = 200; id < 300; id++) {
  const item = items[id];
  if (item && item.name.toLowerCase().includes('potion')) {
    potions.push({ id, name: item.name });
  }
}

potions.forEach(p => {
  console.log('ID ' + p.id + ': ' + p.name);
});

console.log('\n' + potions.length + ' potions found');
