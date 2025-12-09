#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

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

const oursFiles = walk(oursRoot).map(f => path.relative(oursRoot, f)).sort();
const theirsFiles = (fs.existsSync(theirsRoot) ? walk(theirsRoot).map(f => path.relative(theirsRoot, f)).sort() : []);

const report = { summary: { ours: oursFiles.length, theirs: theirsFiles.length }, files: [] };
const ourSet = new Set(oursFiles);
const theirSet = new Set(theirsFiles);

function read(p) { try { return fs.readFileSync(p, 'utf8'); } catch (err) { return null; } }

for (const rel of Array.from(new Set([...oursFiles, ...theirsFiles])).sort()) {
  const oursPath = path.join(oursRoot, rel);
  const theirsPath = path.join(theirsRoot, rel);
  const ours = read(oursPath);
  const theirs = read(theirsPath);
  const ourLen = ours ? ours.split('\n').length : 0;
  const theirLen = theirs ? theirs.split('\n').length : 0;
  const ourRetFalse = ours ? (ours.match(/return false/g) || []).length : 0;
  const ourTodos = ours ? (ours.match(/TODO|stub|not implemented|placeholder|@todo/ig) || []).length : 0;
  const diffLines = (ours && theirs) ? (function(){
    const o = ours.split('\n');
    const t = theirs.split('\n');
    let diff = 0;
    const maxl = Math.max(o.length, t.length);
    for (let i=0;i<maxl;i++){
      if ((o[i]||'') !== (t[i]||'')) diff++;
    }
    return diff;
  }()) : 0;

  report.files.push({ rel, oursPresent: !!ours, theirsPresent: !!theirs, ourLen, theirLen, diffLines, ourRetFalse, ourTodos });
}

fs.writeFileSync('quest-diff-report.json', JSON.stringify(report, null, 2));
console.log('Wrote quest-diff-report.json (files: ' + report.files.length + ')');
