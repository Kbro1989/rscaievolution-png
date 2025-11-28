import fs from 'fs';
import path from 'path';

// Node.js script to load and parse RSC landscape data
// This will be used to generate JSON files for frontend consumption
const { Landscape } = require('@2003scape/rsc-landscape');

const landscape = new Landscape();

// Load the .mem files
const landBuffer = fs.readFileSync(path.join(__dirname, '../temp/rsc-data/landscape/land63.mem'));
const mapsBuffer = fs.readFileSync(path.join(__dirname, '../temp/rsc-data/landscape/maps63.mem'));

landscape.loadMem(landBuffer, mapsBuffer);
landscape.parseArchives();

// Export key sectors to JSON
const sectors = [];

for (const sector of landscape.getPopulatedSectors()) {
    const sectorData = {
        x: sector.x,
        y: sector.y,
        plane: sector.plane,
        members: sector.members,
        tiles: []
    };

    // Extract tile data
    for (let x = 0; x < sector.width; x++) {
        sectorData.tiles[x] = [];
        for (let y = 0; y < sector.height; y++) {
            const tile = sector.tiles[x][y];
            sectorData.tiles[x][y] = {
                colour: tile.colour,
                elevation: tile.elevation,
                direction: tile.direction,
                overlay: tile.overlay,
                wall: tile.wall,
                objectId: tile.objectId
            };
        }
    }

    sectors.push(sectorData);
}

// Write to JSON file
const outputPath = path.join(__dirname, '../public/rsc-sectors.json');
fs.writeFileSync(outputPath, JSON.stringify(sectors, null, 2));

console.log(`Exported ${sectors.length} sectors to ${outputPath}`);
