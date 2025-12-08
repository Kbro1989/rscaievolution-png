#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const mappingPath = path.resolve('quest-const-mappings.json');
if (!fs.existsSync(mappingPath)) {
  console.error('Mapping file not found:', mappingPath);
  process.exit(1);
}
const mapping = JSON.parse(fs.readFileSync(mappingPath, 'utf8'));
const oursRoot = path.resolve('rsc-cloudflare/rsc-server/src/plugins/quests');

const changed = [];
for (const rel of Object.keys(mapping)) {
  const filePath = path.join(oursRoot, rel);
  if (!fs.existsSync(filePath)) {
    console.warn('File missing in ours, skipping:', filePath);
    continue;
  }
  let content = fs.readFileSync(filePath, 'utf8');
  const backupPath = filePath + '.bak';
  fs.writeFileSync(backupPath, content);
  const changes = [];
  for (const name of Object.keys(mapping[rel])) {
    const m = mapping[rel][name];
    if (m.openrsc === null || m.openrsc === undefined) continue; // skip null mappings
    const re = new RegExp(`const\\s+${name}\\s*=\\s*([0-9]+)\\s*;`);
    if (re.test(content)) {
      content = content.replace(re, `const ${name} = ${m.openrsc};`);
      changes.push({ name, from: m.ours, to: m.openrsc });
    } else {
      // fallback: some constants are defined in arrays or with 'var' - we won't touch those
    }
  }
  if (changes.length > 0) {
    fs.writeFileSync(filePath, content);
    changed.push({ file: rel, changes });
  }
}

if (changed.length === 0) {
  console.log('No changes applied');
} else {
  console.log('Applied changes to files:');
  changed.forEach(c => {
    console.log(' ', c.file);
    c.changes.forEach(ch => console.log(`    ${ch.name}: ${ch.from} -> ${ch.to}`));
  });
}
