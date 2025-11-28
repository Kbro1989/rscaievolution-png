#!/usr/bin/env tsx
/**
 * Quick Placeholder Model Generator
 * Creates simple cube primitives as temporary .glb files
 * This allows the game to run while we work on proper RSMV extraction
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

// Same list as before
const MODELS_TO_GENERATE = [
    'tree', 'oak_tree', 'willow_tree', 'maple_tree', 'yew_tree',
    'copper_rock', 'tin_rock', 'iron_rock', 'coal_rock', 'mithril_rock', 'adamant_rock',
    'fishing_spot_net', 'fishing_spot_bait', 'fishing_spot_cage', 'fishing_spot_harpoon', 'fishing_spot_shark',
    'furnace', 'anvil', 'range', 'portal', 'bank_booth',
    'survival_guide', 'hans', 'banker', 'giant_rat', 'chicken', 'goblin',
    'mining_instructor', 'combat_instructor', 'master_chef', 'quest_guide', 'financial_advisor', 'brother_brace', 'magic_instructor',
    'bronze_pickaxe', 'bronze_axe', 'net', 'tinderbox', 'bronze_dagger', 'wooden_shield', 'shortbow', 'bronze_arrow',
    'air_rune', 'mind_rune', 'water_rune', 'earth_rune', 'fire_rune', 'body_rune',
    'bucket', 'pot', 'bread_dough', 'bucket_of_water', 'pot_of_flour'
];

async function createPlaceholderGLB(name: string, color: [number, number, number]) {
    console.log(`📦 Creating placeholder: ${name}.glb`);

    const outputPath = path.join(process.cwd(), 'public', 'models', `${name}.glb`);

    // Check if already exists
    try {
        await fs.access(outputPath);
        console.log(`   ✓ Already exists`);
        return true;
    } catch {
        // Doesn't exist
    }

    // Create a simple GLB with a colored cube using Blender
    // This is a minimal GLB created via Blender python script
    const blenderScript = `
import bpy
import sys

# Clear scene
bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete()

# Create cube
bpy.ops.mesh.primitive_cube_add(size=1, location=(0, 0, 0.5))
cube = bpy.context.object

# Create material
mat = bpy.data.materials.new(name="Material")
mat.use_nodes = True
bsdf = mat.node_tree.nodes["Principled BSDF"]
bsdf.inputs['Base Color'].default_value = (${color[0]}, ${color[1]}, ${color[2]}, 1.0)

# Assign material
cube.data.materials.append(mat)

# Export as GLB
bpy.ops.export_scene.gltf(
    filepath="${outputPath.replace(/\\/g, '\\\\')}",
    export_format='GLB',
    use_selection=False
)
`.trim();

    const scriptPath = path.join(process.cwd(), 'public', 'models', 'temp', `generate_${name}.py`);
    await fs.mkdir(path.dirname(scriptPath), { recursive: true });
    await fs.writeFile(scriptPath, blenderScript);

    let blenderPath = process.env.BLENDER_PATH || 'C:\\Program Files\\Blender Foundation\\Blender 5.0\\blender.exe';

    // Check if configured path exists, if not try launcher
    try {
        await fs.access(blenderPath);
    } catch {
        const launcherPath = 'C:\\Program Files\\Blender Foundation\\Blender 5.0\\blender-launcher.exe';
        try {
            await fs.access(launcherPath);
            blenderPath = launcherPath;
        } catch {
            console.error('❌ Blender not found. Please set BLENDER_PATH.');
            return false;
        }
    }

    try {
        await execAsync(`"${blenderPath}" --background --python "${scriptPath}"`, { timeout: 30000 });
        console.log(`   ✅ Created`);
        return true;
    } catch (error: any) {
        console.error(`   ❌ Failed: ${error.message}`);
        return false;
    }
}

function getColorForModel(name: string): [number, number, number] {
    // Assign colors based on object type
    if (name.includes('tree')) return [0.3, 0.5, 0.2]; // Dark green  
    if (name.includes('rock')) return [0.5, 0.5, 0.5]; // Gray
    if (name.includes('fishing')) return [0.2, 0.4, 0.8]; // Blue
    if (name.includes('furnace')) return [0.6, 0.3, 0.1]; // Brown
    if (name.includes('anvil')) return [0.4, 0.4, 0.4]; // Gray
    if (name.includes('range')) return [0.5, 0.5, 0.5]; // Gray
    if (name.includes('portal')) return [0.5, 0.2, 0.8]; // Purple
    if (name.includes('bank')) return [0.7, 0.6, 0.3]; // Gold
    // NPCs
    return [0.9, 0.7, 0.6]; // Skin tone
}

async function main() {
    console.log('🎮 Creating Placeholder Models\n');
    console.log(`This will create simple cube placeholders for testing.\n`);
    console.log('='.repeat(60));

    const outputDir = path.join(process.cwd(), 'public', 'models');
    await fs.mkdir(outputDir, { recursive: true });

    let success = 0;
    let failed = 0;

    for (const name of MODELS_TO_GENERATE) {
        const color = getColorForModel(name);
        const result = await createPlaceholderGLB(name, color);
        if (result) success++;
        else failed++;
    }

    console.log('\n' + '='.repeat(60));
    console.log(`\n📊 Summary: `);
    console.log(`   ✅ Created: ${success} `);
    console.log(`   ❌ Failed: ${failed} `);
    console.log(`\n✨ Placeholder generation complete!\n`);
    console.log(`⚠️  These are temporary cubes.Run 'npm run generate-models' later to`);
    console.log(`   replace them with real RuneScape models from RSMV.\\n`);

    process.exit(failed > 0 ? 1 : 0);
}

main().catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
});
