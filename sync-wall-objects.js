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
            doorType: parseInt(getTag('doorType')) || 1, // doorType maps to some property?
            modelVar1: parseInt(getTag('modelVar1')) || 0,
            modelVar2: parseInt(getTag('modelVar2')) || 0,
            modelVar3: parseInt(getTag('modelVar3')) || 0,
        });
    }
    return items;
}

async function main() {
    console.log('--- SYNC WALL OBJECTS START ---');

    const cfObjectsPath = path.join(CLOUDFLARE_PATH, 'wall-objects.json');
    const cfObjects = loadJson(cfObjectsPath);
    const orscObjects = loadXmlDefs(path.join(OPENRSC_PATH, 'DoorDef.xml'), 'DoorDef');

    console.log(`CF Wall Objects: ${cfObjects.length}`);
    console.log(`ORSC Wall Objects: ${orscObjects.length}`);

    let updated = 0;
    let added = 0;

    for (let i = 0; i < orscObjects.length; i++) {
        const src = orscObjects[i];

        // Prepare commands array
        const commands = [];
        if (src.command1 && src.command1.toLowerCase() !== 'null') commands.push(src.command1);
        if (src.command2 && src.command2.toLowerCase() !== 'null') commands.push(src.command2);

        if (i < cfObjects.length) {
            // Update
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
            if (JSON.stringify(dest.commands) !== JSON.stringify(commands)) {
                dest.commands = commands;
                changed = true;
            }
            if (changed) updated++;
        } else {
            // Add new
            // CF Wall Object structure:
            /*
               {
                   "name": "Wall",
                   "description": "",
                   "commands": ["WalkTo", "Examine"],
                   "height": 192,
                   "colourFront": null,
                   "textureFront": 2,
                   "colourBack": null,
                   "textureBack": 2,
                   "blocked": true,
                   "invisible": false
               }
            */
            // OpenRSC has `modelVar1`, `modelVar2`.
            // Looking at OpenRSC: <modelVar1>192</modelVar1> maps to CF "height": 192.
            // <modelVar2> maps to texture/color?

            const newObj = {
                name: src.name,
                description: src.description,
                commands: commands,
                height: src.modelVar1,
                // We default texture to 0 or try to infer? 
                // modelVar2 seems to be texture ID.
                textureFront: src.modelVar2,
                textureBack: src.modelVar3,
                colourFront: null, // Default
                colourBack: null,
                blocked: true, // Default
                invisible: false
            };
            cfObjects.push(newObj);
            added++;
            if (added <= 3) console.log(`[Add:${i}] Added "${src.name}"`);
        }
    }

    console.log(`Sync Complete. Updated: ${updated}, Added: ${added}, Final Count: ${cfObjects.length}`);

    fs.writeFileSync(cfObjectsPath, JSON.stringify(cfObjects, null, 4));
    console.log(`Saved to ${cfObjectsPath}`);
}

main();
