import { Config } from '@2003scape/rsc-config';
import { EntitySprites } from '@2003scape/rsc-sprites';
import fs from 'fs/promises';
import path from 'path';

async function extractPlayerSprites() {
    const configPath = './temp/mudclient204/data204/config85.jag';
    const entitiesPath = './temp/mudclient204/data204/entity24.jag';
    const outputDir = './public/sprites/player';

    console.log('Loading RSC config...');
    const config = new Config();
    await config.init();
    config.loadArchive(await fs.readFile(configPath));

    console.log('Loading RSC entity sprites...');
    const entities = new EntitySprites(config);
    await entities.init();
    entities.loadArchive(await fs.readFile(entitiesPath));

    console.log('Creating output directory...');
    await fs.mkdir(outputDir, { recursive: true });

    // RSC color arrays from client
    const hairColours = [15, 24, 9, 5, 0, 11];
    const topBottomColours = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14];
    const skinColours = [0, 1, 2, 3, 4];

    // Generate base player with different color combinations
    const combinations = [
        { name: 'preview', hairColour: 2, topColour: 8, bottomColour: 14, skinColour: 0 }
    ];

    for (const combo of combinations) {
        console.log(`Generating player sprites: ${combo.name}...`);
        
        // Default male player animations
        // Based on RSC: head=1, torso=2, legs=3, etc.
        const animations = [1, 2, 3, 4, 5, 6, 7, 0, 0, 0, 0];
        
        const sprites = entities.assembleAnimationSprites(animations, {
            hairColour: hairColours[combo.hairColour],
            topColour: topBottomColours[combo.topColour],
            bottomColour: topBottomColours[combo.bottomColour],
            skinColour: skinColours[combo.skinColour]
        });

        // Save front, side, back views
        const angles = [0, 4, 8]; // front, side, back
        const angleNames = ['front', 'side', 'back'];
        
        for (let i = 0; i < angles.length; i++) {
            const angle = angles[i];
            const canvas = sprites[angle];
            if (!canvas) continue;

            const dataUrl = canvas.toDataURL();
            const buffer = Buffer.from(dataUrl.split(',')[1], 'base64');
            
            const filename = `${combo.name}_${angleNames[i]}.png`;
            await fs.writeFile(path.join(outputDir, filename), buffer);
        }
    }

    console.log('✓ Player sprites extracted!');
}

extractPlayerSprites().catch(console.error);
