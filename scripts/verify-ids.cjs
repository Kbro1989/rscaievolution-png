
const fs = require('fs');
const path = require('path');
const { fetchEntityData } = require('./lib/wiki-client.cjs');

// Paths to local config
const DATA_DIR = path.resolve(__dirname, '../rsc-cloudflare/rsc-server/rsc-data-local/config');
const ITEMS_PATH = path.join(DATA_DIR, 'items.json');
const NPCS_PATH = path.join(DATA_DIR, 'npcs.json');

async function verifyCategory(category, filePath) {
    console.log(`Loading ${category} from ${filePath}...`);
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

    // Parse args
    const filterArg = process.argv.find(a => a.startsWith('--filter='));
    const filter = filterArg ? filterArg.split('=')[1].toLowerCase() : null;

    let itemsToVerify = data.map((item, index) => ({ ...item, localId: index }));

    if (filter) {
        itemsToVerify = itemsToVerify.filter(i => i.name && i.name.toLowerCase().includes(filter));
        console.log(`Filtering for '${filter}': ${itemsToVerify.length} matches found.`);
    } else {
        // Without filter, limit for safety unless --all used
        const allArg = process.argv.includes('--all');
        if (!allArg) {
            console.log('No filter provided. Limiting to first 10 items. Use --all to check everything.');
            itemsToVerify = itemsToVerify.slice(0, 10);
        }
    }

    console.log(`Verifying ${itemsToVerify.length} ${category} against RSC Wiki...`);

    const mismatches = [];
    const missing = [];

    for (const item of itemsToVerify) {
        if (!item.name || item.name === 'null') continue;

        console.log(`Checking: ${item.name} (Local ID: ${item.localId})...`);
        const wikiData = await fetchEntityData(item.name);

        if (!wikiData) {
            missing.push({ name: item.name, localId: item.localId });
            console.log(`  -> Not found on Wiki.`);
            continue;
        }

        if (wikiData.id !== undefined && wikiData.id !== null) {
            if (wikiData.id !== item.localId) {
                console.warn(`  -> MISMATCH! Local: ${item.localId} | Wiki: ${wikiData.id}`);
                mismatches.push({
                    name: item.name,
                    localId: item.localId,
                    wikiId: wikiData.id
                });
            } else {
                console.log(`  -> Match.`);
            }
        } else {
            console.log(`  -> ID not found in Wiki Infobox.`);
        }
    }

    console.log('\n--- REPORT ---');
    console.log(`Mismatches: ${mismatches.length}`);
    console.log(`Missing/No-Wiki-Page: ${missing.length}`);

    if (mismatches.length > 0) {
        console.table(mismatches);
    }
}

// Simple CLI arg parser
const args = process.argv.slice(2);
if (args.includes('items')) {
    verifyCategory('items', ITEMS_PATH);
} else if (args.includes('npcs')) {
    verifyCategory('npcs', NPCS_PATH);
} else {
    console.log('Usage: node scripts/verify-ids.cjs [items|npcs] --filter=name [--all]');
}
