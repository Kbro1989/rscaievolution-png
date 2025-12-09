#!/usr/bin/env node

const fs = require('fs');
const items = JSON.parse(fs.readFileSync('./rsc-cloudflare/rsc-server/rsc-data-local/config/items.json', 'utf8'));

// Test key items from new commands
const testItems = [
  { id: 213, expect: 'Strength Potion' },
  { id: 81, expect: 'rune 2-handed Sword' },
  { id: 33, expect: 'Air-Rune' },
  { id: 31, expect: 'Fire-Rune' },
  { id: 38, expect: 'Death-Rune' },
  { id: 619, expect: 'Blood-Rune' },
  { id: 1308, expect: 'Staff of Zamorak' },
  { id: 235, expect: 'restore prayer Potion' }
];

console.log('✅ KEY ITEM VERIFICATION:\n');
let allPass = true;

testItems.forEach(test => {
  const item = items[test.id];
  if (!item) {
    console.log('❌ ID ' + test.id + ': NOT FOUND');
    allPass = false;
  } else if (item.name.toLowerCase() === test.expect.toLowerCase()) {
    console.log('✅ ID ' + test.id + ': ' + item.name);
  } else {
    console.log('⚠️  ID ' + test.id + ': ' + item.name + ' (expected ' + test.expect + ')');
  }
});

console.log('\n' + (allPass ? '✅ All critical items verified!' : '⚠️  Check mismatches above') + '\n');
