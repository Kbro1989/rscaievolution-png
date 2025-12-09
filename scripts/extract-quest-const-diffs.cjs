#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const files = [
  'members/heros-quest.js',
  'members/family-crest.js',
  'members/gertrudes-cat.js',
  'members/holy-grail.js',
  'members/jungle-potion.js',
  'members/dwarf-cannon.js'
];
const oursRoot = path.resolve('rsc-cloudflare/rsc-server/src/plugins/quests');
const argTheirs = process.argv[2] || process.env.THEIRS_ROOT || '';
const defaultTheirsCandidates = ['openrsc', 'openrsc-vanilla'];
let theirsRootCandidate = '';
if (argTheirs) {
  theirsRootCandidate = path.resolve(argTheirs, 'rsc-server/src/plugins/quests');
}
if (!theirsRootCandidate) {
  for (const cand of defaultTheirsCandidates) {
    const candPath = path.resolve(cand, 'rsc-server/src/plugins/quests');
    if (fs.existsSync(candPath)) { theirsRootCandidate = candPath; break; }
  }
}
const theirsRoot = theirsRootCandidate || path.resolve('openrsc-vanilla/rsc-server/src/plugins/quests');

function extractConsts(content) {
  const re = /const\s+([A-Z0-9_]+)\s*=\s*([0-9]+)\s*;/g;
  const out = {};
  let m;
  while (m = re.exec(content)) out[m[1]] = parseInt(m[2], 10);
  return out;
}

for (const rel of files) {
  const ourPath = path.join(oursRoot, rel);
  const theirPath = path.join(theirsRoot, rel);
  const ourContent = fs.existsSync(ourPath) ? fs.readFileSync(ourPath, 'utf8') : null;
  const theirContent = fs.existsSync(theirPath) ? fs.readFileSync(theirPath, 'utf8') : null;
  if (!ourContent || !theirContent) {
    console.log(`${rel}: missing file(s) on either side`);
    continue;
  }
  const ours = extractConsts(ourContent);
  const theirs = extractConsts(theirContent);
  const diff = [];
  for (const k of Object.keys({...ours, ...theirs}).sort()) {
    const ov = (k in ours) ? ours[k] : null;
    const tv = (k in theirs) ? theirs[k] : null;
    if (ov !== tv) diff.push({ name: k, ours: ov, theirs: tv });
  }
  if (diff.length === 0) console.log(`${rel}: constants match`);
  else {
    console.log(`${rel}: constants differ:`);
    diff.forEach(d => console.log(`  ${d.name}: ours=${d.ours}  openrsc=${d.theirs}`));
    const outPath = `quest-const-mappings.json`;
    let existing = {};
    if (fs.existsSync(outPath)) existing = JSON.parse(fs.readFileSync(outPath, 'utf8'));
    existing[rel] = diff.reduce((acc, d) => { acc[d.name] = { ours: d.ours, openrsc: d.theirs }; return acc; }, {});
    fs.writeFileSync(outPath, JSON.stringify(existing, null, 2));
  }
}
