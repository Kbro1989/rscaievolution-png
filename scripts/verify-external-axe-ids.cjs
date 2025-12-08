#!/usr/bin/env node

const fs = require('fs');

// Load the canonical item database
const items = JSON.parse(fs.readFileSync('./rsc-cloudflare/rsc-server/rsc-data-local/config/items.json', 'utf8'));

console.log('╔══════════════════════════════════════════════════════════════════════════════╗');
console.log('║                 VERIFYING EXTERNAL AXE IDS (WOODCUTTING)                   ║');
console.log('╚══════════════════════════════════════════════════════════════════════════════╝\n');

try {
  const { axes } = require('@2003scape/rsc-data/skills/woodcutting');
  const AXE_IDS_FROM_EXTERNAL = Object.keys(axes).map(Number);

  let issuesFound = 0;
  console.log('AXE IDs found in external module: ' + AXE_IDS_FROM_EXTERNAL.length + '\n');

  for (const axeId of AXE_IDS_FROM_EXTERNAL) {
    const item = items[axeId];
    if (!item) {
      console.log(`❌ ISSUE: Axe ID ${axeId} from external module does not exist in local items.json.`);
      issuesFound++;
    } else if (!item.name.toLowerCase().includes('axe')) {
      console.log(`⚠️ WARNING: Axe ID ${axeId} (name: '${item.name}') from external module does not seem to be an axe in local items.json.`);
    } else {
      console.log(`✅ OK: Axe ID ${axeId} maps to '${item.name}' in local items.json.`);
    }
  }

  console.log('\n---------------------------------------------------------------------------------');
  if (issuesFound > 0) {
    console.log(`🚨 Found ${issuesFound} critical issues with external AXE IDs.`);
  } else {
    console.log(`✅ All external AXE IDs successfully map to valid items in local items.json.`);
  }
  console.log('---------------------------------------------------------------------------------\n');

} catch (error) {
  console.log('⚠️ ERROR: Could not load external module @2003scape/rsc-data/skills/woodcutting.');
  console.log('   This is expected if it\'s an npm package not directly accessible.');
  console.log('   Further investigation of the npm package\'s contents might be needed if issues arise during runtime.');
  console.log('---------------------------------------------------------------------------------\n');
}
