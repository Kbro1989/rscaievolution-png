import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Fix __dirname for ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CLOUDFLARE_PATH = 'c:/Users/Destiny/Desktop/ai-architect-mmorpg/copy-of-rsc-evolution-ai/rsc-cloudflare/rsc-server/rsc-data-local/config';
const OPENRSC_PATH = 'c:/Users/Destiny/Desktop/ai-architect-mmorpg/copy-of-rsc-evolution-ai/openrsc-repo/server/conf/server/defs';

function loadJson(acc, p) {
  try {
    if (!fs.existsSync(p)) {
      console.error(`[Load] File not found: ${p}`);
      return acc;
    }

    const buf = fs.readFileSync(p);
    let content = buf.toString('utf8');

    if (content.trim().startsWith('undefined')) {
      console.error(`[Load] File starts with 'undefined': ${p}`);
      return acc;
    }

    if (content.charCodeAt(0) === 0xFEFF) {
      content = content.slice(1);
    }

    return JSON.parse(content);
  } catch (e) {
    console.error(`[Load] Failed to load ${p}:`, e.message);
    return acc;
  }
}

function loadXmlDefs(p, tagName) {
  const items = [];
  try {
    if (!fs.existsSync(p)) {
      console.error(`[LoadXML] File not found: ${p}`);
      return items;
    }
    const content = fs.readFileSync(p, 'utf8');

    // Simple regex parser for implicit ID by order
    // <GameObjectDef>...<name>Tree</name>...</GameObjectDef>
    const regex = new RegExp(`<${tagName}>[\\s\\S]*?<name>(.*?)</name>[\\s\\S]*?</${tagName}>`, 'gi');
    let match;
    while ((match = regex.exec(content)) !== null) {
      items.push({ name: match[1] });
    }
  } catch (e) {
    console.error(`[LoadXML] Failed to load ${p}:`, e.message);
  }
  return items;
}

async function main() {
  console.log('--- ID AUDIT DEBUG MODE (ESM) ---');
  const report = [];
  report.push(`--- ID AUDIT REPORT ---`);
  report.push(`Run at: ${new Date().toISOString()}`);

  // Helper for Comparison
  function compare(category, orscList, cfList) {
    console.log(`\nChecking ${category}...`);
    report.push(`\n[${category}]`);
    report.push(`CF: ${cfList.length}, ORSC: ${orscList.length}`);

    let mismatches = 0;
    const maxId = Math.max(orscList.length, cfList.length) - 1;

    for (let id = 0; id <= maxId; id++) {
      const orscName = orscList[id] ? orscList[id].name : null;
      const cfName = cfList[id] ? cfList[id].name : null;

      if (orscName && !cfName) {
        // report.push(`[${category}:${id}] MISSING in CF. Expected: "${orscName}"`);
        mismatches++;
      } else if (orscName && cfName) {
        if (orscName.trim().toLowerCase() !== cfName.trim().toLowerCase()) {
          report.push(`[${category}:${id}] MISMATCH. ORSC="${orscName}" | CF="${cfName}"`);
          mismatches++;
        }
      }
    }
    report.push(`${category} Mismatches/Missing: ${mismatches}`);
    console.log(`Found ${mismatches} ${category} mismatches.`);
  }

  // 1. Items
  const cfItems = loadJson([], path.join(CLOUDFLARE_PATH, 'items.json'));
  const orscItemsWrapper = loadJson({}, path.join(OPENRSC_PATH, 'ItemDefs.json'));
  // OpenRSC items have explicit IDs, so we need to map them to an array
  const orscItemsRaw = orscItemsWrapper.item || [];
  const orscItems = [];
  orscItemsRaw.forEach(i => orscItems[i.id] = i);
  compare('ITEMS', orscItems, cfItems);

  // 2. NPCs
  const cfNpcs = loadJson([], path.join(CLOUDFLARE_PATH, 'npcs.json'));
  const orscNpcsWrapper = loadJson({}, path.join(OPENRSC_PATH, 'NpcDefs.json'));
  const orscNpcsRaw = orscNpcsWrapper.npcs || [];
  const orscNpcs = [];
  orscNpcsRaw.forEach(i => orscNpcs[i.id] = i);
  compare('NPCS', orscNpcs, cfNpcs);

  // 3. Objects
  const cfObjects = loadJson([], path.join(CLOUDFLARE_PATH, 'objects.json'));
  const orscObjects = loadXmlDefs(path.join(OPENRSC_PATH, 'GameObjectDef.xml'), 'GameObjectDef');
  compare('OBJECTS', orscObjects, cfObjects);

  // 4. Wall Objects
  const cfWalls = loadJson([], path.join(CLOUDFLARE_PATH, 'wall-objects.json'));
  const orscWalls = loadXmlDefs(path.join(OPENRSC_PATH, 'DoorDef.xml'), 'DoorDef');
  compare('WALL_OBJECTS', orscWalls, cfWalls);

  fs.writeFileSync('audit-report.txt', report.join('\n'));
  console.log('Report saved to audit-report.txt');
}

main();
