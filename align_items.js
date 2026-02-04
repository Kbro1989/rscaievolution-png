
import fs from 'fs';

const openRscPath = 'C:/Users/Destiny/Desktop/ai-architect-mmorpg/copy-of-rsc-evolution-ai/openrsc-vanilla/rsc-server/src/plugins/items/item_list.txt';
const cloudflarePath = 'C:/Users/Destiny/Desktop/ai-architect-mmorpg/copy-of-rsc-evolution-ai/rsc-cloudflare/rsc-server/rsc-data-local/config/items.json';
const outputPath = 'C:/Users/Destiny/Desktop/ai-architect-mmorpg/copy-of-rsc-evolution-ai/rsc-cloudflare/rsc-server/rsc-data-local/config/items_aligned.json';

// 1. Read the Target List (OpenRSC) - The "Correct" Order
const targetListRaw = fs.readFileSync(openRscPath, 'utf-8');
const targetOrder = [];
// Map to track duplicate names handling
const targetNameCounts = {};

targetListRaw.split('\n').forEach(line => {
    const match = line.match(/ItemID = (\d+)\s+(.+)/);
    if (match) {
        const id = parseInt(match[1]);
        const name = match[2].trim();
        targetOrder[id] = name;

        const lowerName = name.toLowerCase();
        targetNameCounts[lowerName] = (targetNameCounts[lowerName] || 0) + 1;
    }
});

console.log(`Target list loaded. Max ID: ${targetOrder.length - 1}`);

// 2. Read the Source Items (Cloudflare) - The Data Pool
const startItems = JSON.parse(fs.readFileSync(cloudflarePath, 'utf-8'));
const sourceItemPool = {}; // Map: Name -> Array of Item Objects

startItems.forEach(item => {
    if (!item) return;
    const lowerName = item.name.toLowerCase();
    if (!sourceItemPool[lowerName]) {
        sourceItemPool[lowerName] = [];
    }
    sourceItemPool[lowerName].push(item);
});

// 3. Reconstruct items.json
const alignedItems = [];
let missingCount = 0;
let reorderedCount = 0;

for (let i = 0; i < targetOrder.length; i++) {
    const targetName = targetOrder[i];

    if (!targetName) {
        // Gap in ID? Push null or empty? OpenRSC list usually contiguous.
        // If undefined, it means item_list.txt skipped an ID?
        // Check if we need to fill.
        alignedItems.push(null);
        continue;
    }

    const lowerTargetName = targetName.toLowerCase();
    const candidates = sourceItemPool[lowerTargetName];

    if (candidates && candidates.length > 0) {
        // Take the first match
        const item = candidates.shift();

        // Ensure name casing matches target (optional, but good for consistency)
        // item.name = targetName; // User standardized names already, let's keep standardized version if close

        // Adjust members status if needed? No, keep source data.

        alignedItems.push(item);
        reorderedCount++;
    } else {
        // Item missing in Cloudflare list
        // Create a placeholder based on valid reference
        console.log(`Missing item at ID ${i}: ${targetName}`);
        alignedItems.push({
            name: targetName,
            description: "Missing item restored from reference list",
            command: "",
            sprite: 0, // Default sprite
            price: 1,
            stackable: false,
            special: false,
            equip: null,
            colour: null,
            untradeable: false,
            members: false // Safe default
        });
        missingCount++;
    }
}

// 4. Check for leftovers (Items in Cloudflare not in OpenRSC list)
// These might be custom items. We should append them or warn?
// RSC typically has fixed ID range. If they are customs, they should be at the end.
let customCount = 0;
Object.keys(sourceItemPool).forEach(key => {
    if (sourceItemPool[key].length > 0) {
        sourceItemPool[key].forEach(item => {
            // Check if it's a "real" item or junk
            // console.log(`Leftover item: ${item.name}`);
            // alignedItems.push(item); // Append for safety?
            // Appending changes ID. If user relies on 1290 limit, appending is risky.
            // But losing data is also bad.
            // Given user said "false recreation with wrong IDs", leftovers might be the "wrong" ones.
            // I will NOT append them to stay strict to the "List".
            customCount++;
        });
    }
});

// Write result
fs.writeFileSync(outputPath, JSON.stringify(alignedItems, null, 4));

console.log(`Reordering complete.`);
console.log(`Matched/Reordered: ${reorderedCount}`);
console.log(`Missing (Created Placeholders): ${missingCount}`);
console.log(`Leftover/Dropped (Source items not in Target List): ${customCount}`);
console.log(`New items.json size: ${alignedItems.length}`);
