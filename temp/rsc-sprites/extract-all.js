import { Config } from '@2003scape/rsc-config';
import { EntitySprites, Textures } from './src/index.js';
import fs from 'fs/promises';
import path from 'path';

async function dumpSprites(output, spriteMap) {
    await fs.mkdir(output, { recursive: true });
    for (let [name, sprites] of spriteMap.entries()) {
        let spritesList = Array.isArray(sprites) ? sprites : [sprites];

        if (spritesList.length > 1) {
            await fs.mkdir(path.join(output, name), { recursive: true });
            for (let i = 0; i < spritesList.length; i++) {
                const dataUrl = spritesList[i].toDataURL();
                const buffer = Buffer.from(dataUrl.split(',')[1], 'base64');
                await fs.writeFile(path.join(output, name, `${i}.png`), buffer);
            }
        } else {
            const dataUrl = spritesList[0].toDataURL();
            const buffer = Buffer.from(dataUrl.split(',')[1], 'base64');
            await fs.writeFile(path.join(output, `${name}.png`), buffer);
        }
    }
}

async function main() {
    const configPath = '../mudclient204/data204/config85.jag';
    const texturesPath = '../mudclient204/data204/textures17.jag';
    const entitiesPath = '../mudclient204/data204/entity24.jag';
    
    const outputTextures = '../../public/textures';
    const outputEntities = '../../public/sprites'; // For NPCs/Items

    console.log('Loading config...');
    const config = new Config();
    await config.init();
    config.loadArchive(await fs.readFile(configPath));

    // 1. Textures
    console.log('Loading textures...');
    try {
        const textures = new Textures(config);
        await textures.init(); // Initialize inherited archive
        textures.loadArchive(await fs.readFile(texturesPath));
        console.log(`Found ${textures.sprites.size} textures.`);
        await dumpSprites(outputTextures, textures.sprites);
        console.log('Textures saved.');
    } catch (e) {
        console.error('Error extracting textures:', e);
    }

    // 2. Entities (NPCs, Items)
    console.log('Loading entities...');
    try {
        const entities = new EntitySprites(config);
        await entities.init(); // Initialize inherited archive
        entities.loadArchive(await fs.readFile(entitiesPath));
        // EntitySprites might need parseArchives() or similar?
        // README says: entitySprites.parseArchives() populate entitySprites.sprites
        // But source code loadArchive calls parseSprite internally?
        // Let's check loadArchive in entity-sprites.js again.
        // It calls super.loadArchive(buffer) then iterates animations and parses sprites.
        // So loadArchive does the parsing.
        
        console.log(`Found ${entities.sprites.size} entity sprites.`);
        await dumpSprites(outputEntities, entities.sprites);
        console.log('Entities saved.');
    } catch (e) {
        console.error('Error extracting entities:', e);
    }

    console.log('Done!');
}

main().catch(console.error);
