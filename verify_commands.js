
import fs from 'fs';

const openRscPath = 'C:/Users/Destiny/Desktop/ai-architect-mmorpg/copy-of-rsc-evolution-ai/openrsc-vanilla/rsc-server/src/plugins/items/item_list.txt';
const commandJsPath = 'C:/Users/Destiny/Desktop/ai-architect-mmorpg/copy-of-rsc-evolution-ai/rsc-cloudflare/rsc-server/src/packet-handlers/command.js';

// 1. Load Reference List
const referenceMap = new Map();
const itemListRaw = fs.readFileSync(openRscPath, 'utf-8');
itemListRaw.split('\n').forEach(line => {
    const match = line.match(/ItemID = (\d+)\s+(.+)/);
    if (match) {
        referenceMap.set(parseInt(match[1]), match[2].trim().toLowerCase());
    }
});

// 2. Load command.js
const commandJs = fs.readFileSync(commandJsPath, 'utf-8');

// 3. Find usages like { id: 373, name: 'Lobster' }
const regex = /\{\s*id:\s*(\d+),\s*name:\s*'([^']+)'\s*\}/g;

let match;
let mismatches = 0;
let checked = 0;
let report = "";

function log(msg) {
    console.log(msg);
    report += msg + "\n";
}

log("Checking command.js item IDs...");

while ((match = regex.exec(commandJs)) !== null) {
    const usageId = parseInt(match[1]);
    const usageName = match[2];
    checked++;

    const refName = referenceMap.get(usageId);

    if (!refName) {
        log(`[WARNING] ID ${usageId} ('${usageName}') not found in reference list!`);
        mismatches++;
        continue;
    }

    if (!refName.includes(usageName.toLowerCase()) && !usageName.toLowerCase().includes(refName)) {
        log(`[MISMATCH] ID ${usageId}: usage='${usageName}' vs ref='${refName}'`);
        mismatches++;
    }
}

const addRegex = /inventory\.add\((\d+)/g;
while ((match = addRegex.exec(commandJs)) !== null) {
    const usageId = parseInt(match[1]);
    checked++;
    const refName = referenceMap.get(usageId);
    if (!refName) {
        log(`[WARNING] inventory.add(${usageId}) - ID not found in reference!`);
        mismatches++;
    }
}

log(`Verification complete. Checked ${checked} usages. Found ${mismatches} potential issues.`);
fs.writeFileSync('verify_report.txt', report);
