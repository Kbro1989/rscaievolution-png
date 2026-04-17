
const fs = require('fs');
const path = require('path');

const VANILLA_DATA_DIR = 'C:/Users/Destiny/Desktop/ai-architect-mmorpg/copy-of-rsc-evolution-ai/rsc-vanilla/rsc-data/config';
const SERVER_CONSTANTS_DIR = 'C:/Users/Destiny/Desktop/Ollama_Code_Editor_Quant/openrsc-repo/server/src/com/openrsc/server/constants';

function sanitizeName(name) {
    if (!name) return 'UNKNOWN';
    return name
        .toUpperCase()
        .replace(/[^A-Z0-9]+/g, '_')
        .replace(/^_+|_+$/g, '');
}

function resolveGaps() {
    console.log('--- RESOLVING GAPS USING ABSOLUTE PATHS ---');

    if (!fs.existsSync(VANILLA_DATA_DIR)) {
        console.error(`Error: Vanilla data directory not found at ${VANILLA_DATA_DIR}`);
        return;
    }

    const itemsJsonPath = path.join(VANILLA_DATA_DIR, 'items.json');
    const objectsJsonPath = path.join(VANILLA_DATA_DIR, 'objects.json');
    const itemJavaPath = path.join(SERVER_CONSTANTS_DIR, 'ItemId.java');
    const sceneryJavaPath = path.join(SERVER_CONSTANTS_DIR, 'SceneryId.java');

    // Item Resolution
    if (fs.existsSync(itemsJsonPath) && fs.existsSync(itemJavaPath)) {
        const items = JSON.parse(fs.readFileSync(itemsJsonPath, 'utf8'));
        const itemIdsFile = fs.readFileSync(itemJavaPath, 'utf8');

        const existingIds = new Set();
        const idRegex = /([A-Z0-9_]+)\((\d+)\)/g;
        let match;
        while ((match = idRegex.exec(itemIdsFile)) !== null) {
            existingIds.add(parseInt(match[2]));
        }

        console.log(`\n--- ITEM GAPS (Missing in Server) ---`);
        let missingCount = 0;
        items.forEach((item, id) => {
            if (item && item.name && !existingIds.has(id)) {
                if (missingCount < 20) console.log(`${sanitizeName(item.name)}(${id})`);
                missingCount++;
            }
        });
        console.log(`Total missing items: ${missingCount}`);
    }

    // Scenery/Object Resolution
    if (fs.existsSync(objectsJsonPath) && fs.existsSync(sceneryJavaPath)) {
        const objects = JSON.parse(fs.readFileSync(objectsJsonPath, 'utf8'));
        const sceneryIdsFile = fs.readFileSync(sceneryJavaPath, 'utf8');

        console.log(`\n--- SCENERY TODO RESOLUTIONS ---`);
        const todoRegex = /\/\/ TODO Needs name\s+([A-Z0-9_]+)\((\d+)\)/g;
        let match;
        while ((match = todoRegex.exec(sceneryIdsFile)) !== null) {
            const id = parseInt(match[2]);
            if (objects[id]) {
                const cleanName = sanitizeName(objects[id].name);
                console.log(`ID ${id}: ${match[1]} -> ${cleanName}`);
            }
        }
    }
}

resolveGaps();
