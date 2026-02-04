import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CLOUDFLARE_PATH = 'c:/Users/Destiny/Desktop/ai-architect-mmorpg/copy-of-rsc-evolution-ai/rsc-cloudflare/rsc-server/rsc-data-local/config';
const OPENRSC_PATH = 'c:/Users/Destiny/Desktop/ai-architect-mmorpg/copy-of-rsc-evolution-ai/openrsc-repo/server/conf/server/defs';

function loadJson(p) {
    if (!fs.existsSync(p)) return [];
    let content = fs.readFileSync(p, 'utf8');
    if (content.charCodeAt(0) === 0xFEFF) content = content.slice(1);
    return JSON.parse(content);
}

function loadXmlDefs(p, tagName) {
    const items = [];
    if (!fs.existsSync(p)) return items;
    const content = fs.readFileSync(p, 'utf8');

    // Regex to extract full blocks
    const blockRegex = new RegExp(`<${tagName}>([\\s\\S]*?)</${tagName}>`, 'gi');
    let match;

    while ((match = blockRegex.exec(content)) !== null) {
        const block = match[1];

        const getTag = (tag) => {
            const m = new RegExp(`<${tag}>(.*?)</${tag}>`, 'i').exec(block);
            return m ? m[1] : '';
        };

        items.push({
            name: getTag('name'),
            description: getTag('description'),
            command1: getTag('command1'),
            command2: getTag('command2'),
            type: parseInt(getTag('type')) || 1,
            width: parseInt(getTag('width')) || 1,
            height: parseInt(getTag('height')) || 1,
            objectModel: getTag('objectModel')
        });
    }
    return items;
}

async function main() {
    console.log('--- SYNC OBJECTS START ---');
    console.log('Loading definitions...');

    const cfObjectsPath = path.join(CLOUDFLARE_PATH, 'objects.json');
    const cfObjects = loadJson(cfObjectsPath);
    const orscObjects = loadXmlDefs(path.join(OPENRSC_PATH, 'GameObjectDef.xml'), 'GameObjectDef');

    console.log(`CF Objects: ${cfObjects.length}`);
    console.log(`ORSC Objects: ${orscObjects.length}`);

    let updated = 0;
    let added = 0;

    // Iterate through ORSC objects (Source of Truth)
    for (let i = 0; i < orscObjects.length; i++) {
        const src = orscObjects[i];

        // Prepare commands array
        const commands = [];
        if (src.command1 && src.command1.toLowerCase() !== 'null') commands.push(src.command1);
        if (src.command2 && src.command2.toLowerCase() !== 'null') commands.push(src.command2);

        // Map ORSC object type to CF type string
        // ORSC: 1=normal?, 2=gate? This is fuzzy.
        // But CF uses "blocked" or "unblocked". 
        // We might just keep CF type if it exists, or default to "blocked".
        // Actually, let's keep CF type if we are updating, default to "blocked" if adding.

        if (i < cfObjects.length) {
            // Update existing
            const dest = cfObjects[i];
            let changed = false;

            if (dest.name !== src.name) {
                console.log(`[Update:${i}] Name: "${dest.name}" -> "${src.name}"`);
                dest.name = src.name;
                changed = true;
            }
            if (dest.description !== src.description) {
                dest.description = src.description;
                changed = true;
            }

            // Sync commands: simple replacement
            if (JSON.stringify(dest.commands) !== JSON.stringify(commands)) {
                dest.commands = commands;
                changed = true;
            }

            // Sync Model Name (but keep ID if possible)
            if (src.objectModel && dest.model.name !== src.objectModel) {
                console.log(`[Update:${i}] Model: "${dest.model.name}" -> "${src.objectModel}"`);
                dest.model.name = src.objectModel;
                // We don't change model.id because we don't know the new one. 
                // It might remain pointing to old model (visual mismatch) but verifies ID Authenticity.
                changed = true;
            }

            if (changed) updated++;

        } else {
            // Add new
            const newObj = {
                name: src.name,
                description: src.description,
                commands: commands,
                model: {
                    name: src.objectModel,
                    id: 0 // Placeholder
                },
                width: src.width,
                height: src.height,
                type: "blocked", // Default
                itemHeight: 0
            };
            cfObjects.push(newObj);
            added++;
            // Only log first few
            if (added <= 3) console.log(`[Add:${i}] Added "${src.name}"`);
        }
    }

    console.log(`Sync Complete. Updated: ${updated}, Added: ${added}, Final Count: ${cfObjects.length}`);

    fs.writeFileSync(cfObjectsPath, JSON.stringify(cfObjects, null, 4));
    console.log(`Saved to ${cfObjectsPath}`);
}

main();
