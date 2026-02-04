
import fs from 'fs';

const openRscPath = 'C:/Users/Destiny/Desktop/ai-architect-mmorpg/copy-of-rsc-evolution-ai/openrsc-vanilla/rsc-server/src/plugins/items/item_list.txt';
const commandJsPath = 'C:/Users/Destiny/Desktop/ai-architect-mmorpg/copy-of-rsc-evolution-ai/rsc-cloudflare/rsc-server/src/packet-handlers/command.js';

// 1. Load Reference List (Name -> ID)
const nameToId = new Map();
const itemListRaw = fs.readFileSync(openRscPath, 'utf-8');
itemListRaw.split('\n').forEach(line => {
    const match = line.match(/ItemID = (\d+)\s+(.+)/);
    if (match) {
        const id = parseInt(match[1]);
        const name = match[2].trim();
        nameToId.set(name.toLowerCase(), id);
    }
});

let commandJs = fs.readFileSync(commandJsPath, 'utf-8');
let replacements = 0;

commandJs = commandJs.replace(/\{\s*id:\s*(\d+),\s*name:\s*'([^']+)'\s*\}/g, (match, idStr, name) => {
    const oldId = parseInt(idStr);
    const lookupName = name.toLowerCase();

    let newId = nameToId.get(lookupName);

    // Fuzzy heuristics
    if (newId === undefined) {
        // 1. Try "X Y" -> "Y X" (e.g. Bronze Medium Helmet -> Medium Bronze Helmet)
        const parts = lookupName.split(' ');
        if (parts.length > 1) {
            const reversedName = [parts[1], parts[0], ...parts.slice(2)].join(' ');
            newId = nameToId.get(reversedName);
        }
    }


    if (newId === undefined) {
        // 2. Try "Chainbody" -> "Chain Mail Body"
        if (lookupName.includes("chainbody")) {
            const chainName = lookupName.replace("chainbody", "chain mail body");
            newId = nameToId.get(chainName);
            if (newId === undefined) {
                console.log(`[DEBUG] Failed to find '${chainName}'. Keys containing 'chain mail':`);
                // for (const k of nameToId.keys()) { if (k.includes("chain mail")) console.log(`  - '${k}'`); }
            }
        }
    }

    if (newId === undefined) {
        // 3. Specific Potion mappings
        if (lookupName.includes("prayer potion")) {
            newId = nameToId.get("restore prayer potion");
            if (newId === undefined) {
                console.log(`[DEBUG] Failed to find 'restore prayer potion'. Keys containing 'prayer':`);
                for (const k of nameToId.keys()) { if (k.includes("prayer")) console.log(`  - '${k}'`); }
            }
        }
        else if (lookupName.includes("super strength")) newId = nameToId.get("super strength potion");
        else if (lookupName.includes("super attack")) newId = nameToId.get("super attack potion");
        else if (lookupName.includes("defense potion")) newId = nameToId.get("defence potion"); // s vs c
        else if (lookupName.includes("strength potion")) newId = nameToId.get("strength potion");
        else if (lookupName.includes("attack potion")) newId = nameToId.get("attack potion");
    }

    if (newId === undefined) {
        // 4. Try scanning all keys for partial word matches (Last Resort)
        // Only if we have > 2 words to avoid matching "Iron" to "Iron Dagger"
        const lookupWords = lookupName.split(' ');
        if (lookupWords.length >= 2) {
            for (const [key, id] of nameToId.entries()) {
                if (lookupWords.every(w => key.includes(w))) {
                    // Check if matches "Medium" if needed
                    if (lookupName.includes("medium") && !key.includes("medium")) continue;
                    if (lookupName.includes("large") && !key.includes("large")) continue;

                    newId = id;
                    break;
                }
            }
        }
    }

    if (newId !== undefined) {
        if (newId !== oldId) {
            console.log(`Fixing '${name}': ID ${oldId} -> ${newId}`);
            replacements++;
            return `{ id: ${newId}, name: '${name}' }`;
        }
    } else {
        if (lookupName.includes("willow")) {
            console.log(`[DEBUG] Finding willow. Keys containing 'willow':`);
            for (const k of nameToId.keys()) { if (k.includes("willow")) console.log(`  - '${k}'`); }
        }
        console.log(`[WARNING] Could not find ID for '${name}'. Leaving as ${oldId}.`);
    }

    return match;
});

fs.writeFileSync(commandJsPath, commandJs);
console.log(`Fixed ${replacements} item IDs in command.js`);
