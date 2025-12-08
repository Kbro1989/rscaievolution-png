#!/usr/bin/env node

const fs = require('fs');
const wieldable = JSON.parse(fs.readFileSync('./rsc-cloudflare/rsc-server/rsc-data-local/wieldable.json', 'utf8'));
const items = JSON.parse(fs.readFileSync('./rsc-cloudflare/rsc-server/rsc-data-local/config/items.json', 'utf8'));

console.log('🔍 MAGIC ITEM ANALYSIS:\n');

const magicItems = [];
for (let id = 0; id < 1300; id++) {
  const item = items[id];
  const stats = wieldable[id];
  if (item && stats && stats.magic > 0) {
    magicItems.push({ id, name: item.name, magic: stats.magic });
  }
}

console.log('TOP 20 ITEMS BY MAGIC BONUS:\n');
magicItems.sort((a, b) => b.magic - a.magic).slice(0, 20).forEach(m => {
  console.log('ID ' + m.id + ': ' + m.name + ' - Magic: +' + m.magic);
});

console.log('\n\nCURRENT GOD CAPES:\n');
const godCapes = [1309, 1310, 1311];
godCapes.forEach(id => {
  const item = items[id];
  const stats = wieldable[id];
  console.log('ID ' + id + ': ' + item.name);
  console.log('  Current Magic: ' + (stats.magic || 0));
});
