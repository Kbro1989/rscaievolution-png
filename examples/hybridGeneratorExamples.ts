/**
 * Example Usage: Hybrid Content Generator with Evolution
 * 
 * This demonstrates how to use the RSMV + Blender + Evolution pipeline
 */

import { hybridGenerator } from '../services/backend/hybridContentGenerator';

// ===================================
// Example 1: Generate Primitive Hans
// ===================================
async function example1_primitiveHans() {
    const result = await hybridGenerator.generateFromEntity({
        entityType: 'npc',
        entityId: 0,      // Hans NPC
        era: 0,           // Caveman/Primitive
        outputName: 'hans_primitive'
    });

    console.log('Generated:', result.modelPath);
    console.log('Config:', result.config.name);
    // Output: /models/hybrid/hans_primitive.glb
    // Blocky, no smoothing, earthy colors
}

// ===================================
// Example 2: Generate Godhood Hans
// ===================================
async function example2_godhoodHans() {
    const result = await hybridGenerator.generateFromEntity({
        entityType: 'npc',
        entityId: 0,
        era: 12,          // GODHOOD!
        outputName: 'hans_god'
    });

    console.log('Generated:', result.modelPath);
    // Output: /models/hybrid/hans_god.glb
    // Ultra smooth (subdiv: 4)
    // Divine glow (emission: 5.0)
    // Bloom, levitation, particle effects
}

// ===================================
// Example 3: Search for Oak Trees
// ===================================
async function example3_searchTrees() {
    const trees = await hybridGenerator.searchEntities('loc', 'oak');

    console.log(`Found ${trees.length} oak entities`);
    trees.forEach(tree => {
        console.log(`- ID ${tree.id}: ${tree.name}`);
    });

    // Generate evolved oak tree
    if (trees.length > 0) {
        const oakTree = await hybridGenerator.generateFromEntity({
            entityType: 'loc',
            entityId: trees[0].id,
            era: 9,  // RS3 level smooth
            outputName: 'oak_tree_evolved'
        });

        console.log('Generated:', oakTree.modelPath);
    }
}

// ===================================
// Example 4: Era Progression
// ===================================
async function example4_eraProgression() {
    // Generate Hans at all eras for comparison
    const eras = [0, 3, 6, 9, 12];

    for (const era of eras) {
        const result = await hybridGenerator.generateFromEntity({
            entityType: 'npc',
            entityId: 0,  // Hans
            era,
            outputName: `hans_era_${era}`
        });

        console.log(`Era ${era}: ${result.modelPath}`);
    }

    // Output:
    // Era 0:  /models/hybrid/hans_era_0.glb   (Primitive)
    // Era 3:  /models/hybrid/hans_era_3.glb   (Ancient)
    // Era 6:  /models/hybrid/hans_era_6.glb   (Classical)
    // Era 9:  /models/hybrid/hans_era_9.glb   (Industrial)
    // Era 12: /models/hybrid/hans_era_12.glb  (GODHOOD)
}

// ===================================
// Example 5: Custom Modifications
// ===================================
async function example5_customModifications() {
    const result = await hybridGenerator.generateFromEntity({
        entityType: 'npc',
        entityId: 0,
        era: 12,
        modifications: {
            additionalColorShift: 240,  // Blue hue
            rescale: 1.5                // 50% bigger
        },
        outputName: 'hans_blue_giant_god'
    });

    console.log('Generated:', result.modelPath);
    // Blue-tinted, 1.5x size, ultra smooth, divine effects
}

// ===================================
// Example 6: Botty Integration
// ===================================
async function example6_bottyUse(playerEra: number) {
    // Botty needs oak trees at player's current era
    const trees = await hybridGenerator.searchEntities('loc', 'oak');

    if (trees.length > 0) {
        // Generate tree at player's evolution level
        const oakTree = await hybridGenerator.generateFromEntity({
            entityType: 'loc',
            entityId: trees[0].id,
            era: playerEra,  // Match player's progression
            modifications: {
                // colorShift and rescale are not supported by the current type definition
            },
            outputName: `oak_${Date.now()}`
        });

        // Spawn in game world
        return {
            model: oakTree.modelPath,
            position: { x: 0, y: 0, z: 0 },
            type: 'RESOURCE',
            harvestable: true
        };
    }
}

// ===================================
// Example 7: Complete Pipeline Test
// ===================================
async function example7_fullPipeline() {
    console.log('=== RSMV + Blender + Evolution Pipeline Test ===\n');

    // 1. Search for Hans
    console.log('Step 1: Searching for Hans NPC...');
    const npcs = await hybridGenerator.searchEntities('npc', 'hans');
    console.log(`Found: ${npcs[0]?.name}\n`);

    // 2. Get entity config
    console.log('Step 2: Fetching entity config...');
    const hansResult = await hybridGenerator.generateFromEntity({
        entityType: 'npc',
        entityId: 0,
        era: 0,
        outputName: 'test_hans'
    });
    console.log(`Models in config: ${hansResult.config.models?.length}`);
    console.log(`Color replacements: ${hansResult.config.color_replacements?.length}\n`);

    // 3. Generate at multiple eras
    console.log('Step 3: Generating evolution progression...');
    for (const era of [0, 6, 12]) {
        const result = await hybridGenerator.generateFromEntity({
            entityType: 'npc',
            entityId: 0,
            era,
            outputName: `test_era_${era}`
        });
        console.log(`✓ Era ${era} complete: ${result.modelPath}`);
    }

    console.log('\n✅ Full pipeline test complete!');
}

// Run examples
if (require.main === module) {
    example7_fullPipeline().catch(console.error);
}
