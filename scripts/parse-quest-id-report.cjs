#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const report = JSON.parse(fs.readFileSync('quest-id-verification.json', 'utf8'));
const files = report.files;
let totalConsts = 0;
let totalMissing = 0;
const missingFiles = [];

for (const f of files) {
  const missingEntries = f.entries.filter(e => !e.found);
  totalConsts += f.entries.length;
  totalMissing += missingEntries.length;
  if (missingEntries.length > 0) {
    missingFiles.push({ file: f.file, missing: missingEntries });
  }
}

console.log(`Total files scanned: ${report.summary.totalFiles}`);
console.log(`Total constants: ${totalConsts}`);
console.log(`Total missing references: ${totalMissing}`);
console.log(`Files with missing constants: ${missingFiles.length}`);

missingFiles.forEach(f => {
  console.log('\n=== ' + f.file + ' (missing: ' + f.missing.length + ') ===');
  f.missing.forEach(e => console.log(`  ${e.kind} ${e.name} = ${e.value}  // comment: ${e.comment || ''}`));
});

// Write JSON summary
fs.writeFileSync('quest-id-verification-summary.json', JSON.stringify({ totalConsts, totalMissing, filesWithMissing: missingFiles.length, missingFiles }, null, 2));
console.log('\nWrote quest-id-verification-summary.json');
