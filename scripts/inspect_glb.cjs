const fs = require('fs');

const filePath = process.argv[2];
if (!filePath) {
    console.error('Usage: node inspect_glb.js <path_to_glb>');
    process.exit(1);
}

try {
    const buffer = fs.readFileSync(filePath);
    
    // GLB Header: magic (4), version (4), length (4)
    const magic = buffer.readUInt32LE(0);
    if (magic !== 0x46546C67) { // 'glTF'
        console.error('Not a valid GLB file');
        process.exit(1);
    }

    const version = buffer.readUInt32LE(4);
    const length = buffer.readUInt32LE(8);

    // Chunk 0: JSON
    const chunkLength = buffer.readUInt32LE(12);
    const chunkType = buffer.readUInt32LE(16);

    if (chunkType !== 0x4E4F534A) { // 'JSON'
        console.error('First chunk is not JSON');
        process.exit(1);
    }

    const jsonBuffer = buffer.slice(20, 20 + chunkLength);
    const jsonStr = jsonBuffer.toString('utf8');
    const json = JSON.parse(jsonStr);

    console.log('--- GLB Structure Analysis ---');
    console.log(`File: ${filePath}`);
    console.log(`Version: ${version}`);
    
    if (json.nodes) {
        console.log('\nNodes:');
        json.nodes.forEach((node, index) => {
            console.log(`  [${index}] Name: "${node.name || '<unnamed>'}"`);
            if (node.mesh !== undefined) {
                console.log(`      -> Mesh Index: ${node.mesh}`);
            }
        });
    }

    if (json.meshes) {
        console.log('\nMeshes:');
        json.meshes.forEach((mesh, index) => {
            console.log(`  [${index}] Name: "${mesh.name || '<unnamed>'}"`);
            mesh.primitives.forEach((prim, pIndex) => {
                console.log(`      Primitive ${pIndex}: Material Index: ${prim.material}`);
            });
        });
    }

    if (json.materials) {
        console.log('\nMaterials:');
        json.materials.forEach((mat, index) => {
            console.log(`  [${index}] Name: "${mat.name || '<unnamed>'}"`);
        });
    }

} catch (err) {
    console.error('Error reading file:', err);
}
