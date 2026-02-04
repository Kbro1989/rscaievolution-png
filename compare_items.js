import fs from 'fs';
import path from 'path';

const openRscPath = 'C:/Users/Destiny/Desktop/ai-architect-mmorpg/copy-of-rsc-evolution-ai/openrsc-vanilla/rsc-server/src/plugins/items/item_list.txt';
const cloudflarePath = 'C:/Users/Destiny/Desktop/ai-architect-mmorpg/copy-of-rsc-evolution-ai/rsc-cloudflare/rsc-server/rsc-data-local/config/items.json';

// Read reference list (OpenRSC)
const itemListRaw = fs.readFileSync(openRscPath, 'utf-8');
const referenceMap = new Map();

itemListRaw.split('\n').forEach(line => {
    const match = line.match(/ItemID = (\d+)\s+(.+)/);
    if (match) {
        referenceMap.set(parseInt(match[1]), match[2].trim().toLowerCase());
    }
});

// Read target list (Cloudflare)
const itemsJson = JSON.parse(fs.readFileSync(cloudflarePath, 'utf-8'));

console.log(`Reference list size: ${referenceMap.size}`);
console.log(`Target list size: ${itemsJson.length}`);

let mismatches = 0;
for (let i = 0; i < itemsJson.length; i++) {
    const cloudflareItem = itemsJson[i];
    const cloudflareName = cloudflareItem.name.toLowerCase();

    if (referenceMap.has(i)) {
        const referenceName = referenceMap.get(i);
        // Simple fuzzy check or direct string comparison
        if (cloudflareName !== referenceName) {
            console.log(`Mismatch at ID ${i}: Cloudflare="${cloudflareItem.name}" vs Reference="${referenceMap.get(i)}"`);
            mismatches++;
        }
    } else {
        console.log(`ID ${i} exists in Cloudflare but not in Reference list.`);
        mismatches++;
    }

    if (mismatches > 20) {
        console.log("Too many mismatches, stopping output...");
        break;
    }
}

if (mismatches === 0) {
    console.log("Lists are perfectly aligned!");
} else {
    console.log(`Total mismatches found: ${mismatches} (showing first 20)`);
}
