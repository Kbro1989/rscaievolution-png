#!/usr/bin/env node

const fs = require('fs');
const items = JSON.parse(fs.readFileSync('./rsc-cloudflare/rsc-server/rsc-data-local/config/items.json', 'utf8'));

// Check specific item IDs from the command file
const commandItems = [
  { id: 373, name: 'Lobster' },
  { id: 370, name: 'Swordfish' },
  { id: 546, name: 'Shark' },
  { id: 326, name: 'Meat Pizza' },
  { id: 221, name: 'Str Pot (4)' },
  { id: 474, name: 'Atk Pot (3)' },
  { id: 480, name: 'Def Pot (3)' },
  { id: 486, name: 'Super Atk (3)' },
  { id: 483, name: 'Prayer Pot (3)' },
  { id: 193, name: 'Beer' },
  { id: 142, name: 'Wine' },
  { id: 598, name: 'Grog' },
  { id: 829, name: 'Dragon Bitter' },
  { id: 112, name: 'Bronze Med' },
  { id: 104, name: 'Steel Med' },
  { id: 116, name: 'Addy Med' },
  { id: 120, name: 'Rune Med' },
  { id: 795, name: 'Dragon Med' },
  { id: 117, name: 'Bronze Plate' },
  { id: 118, name: 'Steel Plate' },
  { id: 120, name: 'Addy Plate' },
  { id: 401, name: 'Rune Plate' },
  { id: 1278, name: 'Dragon Sq' },
  { id: 206, name: 'Bronze Legs' },
  { id: 121, name: 'Steel Legs' },
  { id: 123, name: 'Addy Legs' },
  { id: 402, name: 'Rune Legs' },
  { id: 4, name: 'Wooden Shield' },
  { id: 129, name: 'Steel Kite' },
  { id: 131, name: 'Addy Kite' },
  { id: 404, name: 'Rune Kite' },
  { id: 70, name: 'Bronze Sword' },
  { id: 72, name: 'Steel Sword' },
  { id: 74, name: 'Addy Sword' },
  { id: 75, name: 'Rune Sword' },
  { id: 593, name: 'Dragon Sword' },
  { id: 76, name: 'Bronze 2H' },
  { id: 78, name: 'Steel 2H' },
  { id: 80, name: 'Addy 2H' },
  { id: 81, name: 'Rune 2H' },
  { id: 205, name: 'Bronze Baxe' },
  { id: 90, name: 'Steel Baxe' },
  { id: 92, name: 'Addy Baxe' },
  { id: 93, name: 'Rune Baxe' },
  { id: 594, name: 'Dragon Baxe' },
  { id: 189, name: 'Shortbow' },
  { id: 188, name: 'Longbow' },
  { id: 655, name: 'Yew Short' },
  { id: 654, name: 'Yew Long' },
  { id: 657, name: 'Magic Short' },
  { id: 656, name: 'Magic Long' },
  { id: 576, name: 'Red Phat' },
  { id: 577, name: 'Yellow Phat' },
  { id: 578, name: 'Blue Phat' },
  { id: 579, name: 'Green Phat' },
  { id: 580, name: 'Purple Phat' },
  { id: 581, name: 'White Phat' },
  { id: 831, name: 'Red Mask' },
  { id: 832, name: 'Blue Mask' },
  { id: 828, name: 'Green Mask' },
  { id: 575, name: 'Xmas Cracker' },
  { id: 387, name: 'Disk of Return' },
  { id: 1289, name: 'Scythe' },
  { id: 1156, name: 'Bunny Ears' },
  { id: 677, name: 'Easter Egg' },
  { id: 971, name: 'Santa Hat' },
  { id: 150, name: 'Copper Ore' },
  { id: 155, name: 'Coal' },
  { id: 409, name: 'Runite Ore' },
  { id: 408, name: 'Runite Bar' },
  { id: 14, name: 'Logs' },
  { id: 633, name: 'Willow' },
  { id: 635, name: 'Yew Logs' },
  { id: 636, name: 'Magic Logs' },
  { id: 31, name: 'Air' },
  { id: 38, name: 'Chaos' },
  { id: 42, name: 'Death' },
  { id: 825, name: 'Blood' }
];

console.log('\n╔══════════════════════════════════════════════════════════════╗');
console.log('║       COMMAND MENU ITEM VERIFICATION REPORT                  ║');
console.log('╚══════════════════════════════════════════════════════════════╝\n');

let errors = [];
let corrected = [];

commandItems.forEach(expected => {
  const actual = items[expected.id];
  if (!actual) {
    errors.push(expected);
  } else if (actual.name.toLowerCase() !== expected.name.toLowerCase()) {
    corrected.push({ id: expected.id, expected: expected.name, actual: actual.name });
  }
});

if (errors.length === 0 && corrected.length === 0) {
  console.log('✅ ALL ITEM IDs ARE CORRECT AND VALID!\n');
} else {
  if (errors.length > 0) {
    console.log('❌ MISSING ITEM IDs:');
    errors.forEach(e => {
      console.log(`   ID ${e.id}: "${e.name}" - DOES NOT EXIST`);
    });
    console.log();
  }
  
  if (corrected.length > 0) {
    console.log('⚠️  NAME MISMATCHES:');
    corrected.forEach(c => {
      console.log(`   ID ${c.id}: Expected "${c.expected}" but found "${c.actual}"`);
    });
    console.log();
  }
}

console.log(`📊 TOTAL ITEMS CHECKED: ${commandItems.length}`);
console.log(`✅ VALID: ${commandItems.length - errors.length - corrected.length}`);
if (errors.length > 0) console.log(`❌ MISSING: ${errors.length}`);
if (corrected.length > 0) console.log(`⚠️  WRONG NAMES: ${corrected.length}`);
console.log();
