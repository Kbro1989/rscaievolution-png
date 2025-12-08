#!/usr/bin/env node

const fs = require('fs');

const corrections = {
  221: 217, 474: 452, 480: 458, 486: 464, 483: 461,
  31: 33, 33: 31, 42: 38, 825: 591, 619: 779,
  107: 103, 118: 117, 402: 392, 1278: 1204, 81: 80,
  594: 566, 656: 628, 373: 363, 370: 360, 546: 523,
  114: 389, 401: 391, 1308: 1142
};

const filesToFix = [
  './COMMAND_IMPROVEMENTS.js'
];

console.log('╔══════════════════════════════════════════════════════════════════════════════╗');
console.log('║                   FIXING INCORRECT COMMAND ITEM IDs                        ║');
console.log('╚══════════════════════════════════════════════════════════════════════════════╝\n');

let fixesApplied = 0;

for (const file of filesToFix) {
  let content = fs.readFileSync(file, 'utf8');
  for (const [oldId, newId] of Object.entries(corrections)) {
    const regex = new RegExp(`\\b${oldId}\\b`, 'g');
    if (content.match(regex)) {
      content = content.replace(regex, newId);
      fixesApplied++;
    }
  }
  fs.writeFileSync(file, content, 'utf8');
}

console.log(`✅ Applied ${fixesApplied} fixes to ${filesToFix.length} files.`);
console.log('---------------------------------------------------------------------------------\n');
