#!/usr/bin/env node
const fs = require('fs');
const report = JSON.parse(fs.readFileSync('quest-diff-report.json','utf8'));
const files = report.files;

function list(filter, label, limit) {
  const arr = files.filter(filter).sort((a,b)=> (b.diffLines||0)-(a.diffLines||0));
  console.log(`${label} - ${arr.length}`);
  arr.slice(0,limit||100).forEach(f => {
    console.log(`  ${f.rel}  | diff=${f.diffLines}  | returnFalse=${f.ourRetFalse}  | TODOs=${f.ourTodos}  | oursLen=${f.ourLen}  | theirLen=${f.theirLen}`);
  });
}

list(f => f.theirsPresent && !f.oursPresent, 'Files present in Open-RSC but missing in our repo', 200);
console.log('\n');
list(f => f.oursPresent && !f.theirsPresent, 'Files present in our repo but missing in Open-RSC', 200);
console.log('\n');
list(f => f.ourRetFalse > 0, 'Files in our repo with `return false` (possible stubs)', 200);
console.log('\n');
list(f => f.ourTodos > 0, 'Files in our repo with TODO/stub comments', 200);
console.log('\nTop diffs:');
files.sort((a,b)=> (b.diffLines||0)-(a.diffLines||0)).slice(0,20).forEach(f=> console.log(`  ${f.rel} | diffLines=${f.diffLines} | ourLen=${f.ourLen} | theirLen=${f.theirLen} | returnFalse=${f.ourRetFalse} | TODOs=${f.ourTodos}`));
