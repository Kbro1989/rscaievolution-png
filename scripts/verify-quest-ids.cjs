#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const oursRoot = path.resolve('rsc-cloudflare/rsc-server/src/plugins/quests');
const itemsPath = path.resolve('rsc-cloudflare/rsc-server/rsc-data-local/config/items.json');
const npcsPath = path.resolve('rsc-cloudflare/rsc-server/rsc-data-local/config/npcs.json');
const objectsPath = path.resolve('rsc-cloudflare/rsc-server/rsc-data-local/config/objects.json');

const items = JSON.parse(fs.readFileSync(itemsPath, 'utf8'));
const npcs = JSON.parse(fs.readFileSync(npcsPath, 'utf8'));
const objects = JSON.parse(fs.readFileSync(objectsPath, 'utf8'));

function walk(dir) {
  const files = [];
  if (!fs.existsSync(dir)) return files;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) files.push(...walk(p));
    else if (e.isFile() && p.endsWith('.js')) files.push(p);
  }
  return files;
}

function parseConsts(content) {
  const re = /const\s+([A-Z0-9_]+)\s*=\s*([0-9]+)\s*;\s*(\/\/.*)?/g;
  const out = [];
  let m;
  while (m = re.exec(content)) {
    const extra = m[3] ? m[3].replace(/\s*\/\//, '').trim() : null;
    out.push({ name: m[1], value: Number(m[2]), comment: extra });
  }
  return out;
}

const files = walk(oursRoot);
const report = { summary: { totalFiles: files.length }, files: [] };

for (const f of files) {
  const rel = path.relative(oursRoot, f);
  const content = fs.readFileSync(f, 'utf8');
  const consts = parseConsts(content).filter(c => c.name.startsWith('ITEM_') || c.name.startsWith('NPC_') || c.name.startsWith('OBJ_'));
  const itemsReport = consts.map(c => {
    let kind = 'unknown';
    if (c.name.startsWith('ITEM_')) kind = 'item';
    if (c.name.startsWith('NPC_')) kind = 'npc';
    if (c.name.startsWith('OBJ_')) kind = 'object';
    let found = false;
    let name = null;
    let canonical = null;
    if (kind === 'item') {
      found = c.value >= 0 && c.value < items.length;
      name = found ? items[c.value].name : null;
    } else if (kind === 'npc') {
      found = c.value >= 0 && c.value < npcs.length;
      name = found ? npcs[c.value].name : null;
    } else if (kind === 'object') {
      found = c.value >= 0 && c.value < objects.length;
      name = found ? objects[c.value].name : null;
    }
    return { name: c.name, value: c.value, kind, found, dataName: name, comment: c.comment };
  });
  report.files.push({ file: rel, count: itemsReport.length, entries: itemsReport });
}

fs.writeFileSync('quest-id-verification.json', JSON.stringify(report, null, 2));
console.log('Wrote quest-id-verification.json');
