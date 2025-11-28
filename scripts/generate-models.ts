#!/usr/bin/env tsx
/**
 * Model Generation Script
 * Generates all required .glb models from RuneScape cache using RSMV
 */

import { hybridGenerator } from '../services/backend/hybridContentGenerator';
import * as fs from 'fs/promises';
import * as path from 'path';

// Define all models that need to be generated
const MODELS_TO_GENERATE = [
    // Trees (OSRS Woodcutting)
    { type: 'loc' as const, id: 1276, name: 'tree', description: 'Normal Tree' },
    { type: 'loc' as const, id: 1281, name: 'oak_tree', description: 'Oak Tree' },
    { type: 'loc' as const, id: 1308, name: 'willow_tree', description: 'Willow Tree' },
    { type: 'loc' as const, id: 1307, name: 'maple_tree', description: 'Maple Tree' },
    { type: 'loc' as const, id: 1309, name: 'yew_tree', description: 'Yew Tree' },

    // Rocks (OSRS Mining)
    { type: 'loc' as const, id: 11936, name: 'copper_rock', description: 'Copper Rock' },
    { type: 'loc' as const, id: 11933, name: 'tin_rock', description: 'Tin Rock' },
    { type: 'loc' as const, id: 11954, name: 'iron_rock', description: 'Iron Rock' },
    { type: 'loc' as const, id: 11930, name: 'coal_rock', description: 'Coal Rock' },
    { type: 'loc' as const, id: 11942, name: 'mithril_rock', description: 'Mithril Rock' },
    { type: 'loc' as const, id: 11939, name: 'adamant_rock', description: 'Adamant Rock' },

    // Fishing Spots (OSRS Fishing)
    { type: 'npc' as const, id: 1530, name: 'fishing_spot_net', description: 'Fishing Spot (Net/Bait)' },
    { type: 'npc' as const, id: 1544, name: 'fishing_spot_bait', description: 'Fishing Spot (Lure/Bait)' },
    { type: 'npc' as const, id: 1536, name: 'fishing_spot_cage', description: 'Fishing Spot (Cage/Harpoon)' },
    { type: 'npc' as const, id: 1542, name: 'fishing_spot_harpoon', description: 'Fishing Spot (Harpoon)' },
    { type: 'npc' as const, id: 1520, name: 'fishing_spot_shark', description: 'Fishing Spot (Shark)' },

    // Crafting Stations
    { type: 'loc' as const, id: 11666, name: 'furnace', description: 'Furnace' },
    { type: 'loc' as const, id: 2097, name: 'anvil', description: 'Anvil' },
    { type: 'loc' as const, id: 16893, name: 'range', description: 'Cooking Range' },
    { type: 'loc' as const, id: 1747, name: 'portal', description: 'Portal' },
    { type: 'loc' as const, id: 2213, name: 'bank_booth', description: 'Bank Booth' },

    // NPCs
    { type: 'npc' as const, id: 3117, name: 'survival_guide', description: 'Survival Expert (Tutorial)' },
    { type: 'npc' as const, id: 0, name: 'hans', description: 'Hans (Tutorial)' },
    { type: 'npc' as const, id: 166, name: 'banker', description: 'Banker' },
    { type: 'npc' as const, id: 2693, name: 'giant_rat', description: 'Giant Rat' },
    { type: 'npc' as const, id: 1097, name: 'chicken', description: 'Chicken' },
    { type: 'npc' as const, id: 101, name: 'goblin', description: 'Goblin' },
    { type: 'npc' as const, id: 947, name: 'mining_instructor', description: 'Mining Instructor' },
    { type: 'npc' as const, id: 944, name: 'combat_instructor', description: 'Combat Instructor' },
    { type: 'npc' as const, id: 942, name: 'master_chef', description: 'Master Chef' },
    { type: 'npc' as const, id: 943, name: 'quest_guide', description: 'Quest Guide' },
    { type: 'npc' as const, id: 949, name: 'financial_advisor', description: 'Financial Advisor' },
    { type: 'npc' as const, id: 948, name: 'brother_brace', description: 'Brother Brace' },
    { type: 'npc' as const, id: 954, name: 'magic_instructor', description: 'Magic Instructor' },

    // Items (Ground Items)
    { type: 'item' as const, id: 1265, name: 'bronze_pickaxe', description: 'Bronze Pickaxe' },
    { type: 'item' as const, id: 1351, name: 'bronze_axe', description: 'Bronze Axe' },
    { type: 'item' as const, id: 303, name: 'net', description: 'Small Fishing Net' },
    { type: 'item' as const, id: 590, name: 'tinderbox', description: 'Tinderbox' },
    { type: 'item' as const, id: 1205, name: 'bronze_dagger', description: 'Bronze Dagger' },
    { type: 'item' as const, id: 1171, name: 'wooden_shield', description: 'Wooden Shield' },
    { type: 'item' as const, id: 841, name: 'shortbow', description: 'Shortbow' },
    { type: 'item' as const, id: 882, name: 'bronze_arrow', description: 'Bronze Arrow' },
    { type: 'item' as const, id: 556, name: 'air_rune', description: 'Air Rune' },
    { type: 'item' as const, id: 558, name: 'mind_rune', description: 'Mind Rune' },
    { type: 'item' as const, id: 555, name: 'water_rune', description: 'Water Rune' },
    { type: 'item' as const, id: 557, name: 'earth_rune', description: 'Earth Rune' },
    { type: 'item' as const, id: 554, name: 'fire_rune', description: 'Fire Rune' },
    { type: 'item' as const, id: 559, name: 'body_rune', description: 'Body Rune' },
    { type: 'item' as const, id: 1925, name: 'bucket', description: 'Bucket' },
    { type: 'item' as const, id: 1931, name: 'pot', description: 'Pot' },
    { type: 'item' as const, id: 2309, name: 'bread_dough', description: 'Bread Dough' },
    { type: 'item' as const, id: 1929, name: 'bucket_of_water', description: 'Bucket of Water' },
    { type: 'item' as const, id: 1933, name: 'pot_of_flour', description: 'Pot of Flour' },
];

async function generateModel(config: typeof MODELS_TO_GENERATE[0], era: number = 0) {
    console.log(`\n🔨 Generating: ${config.description} (${config.name}.glb)`);

    const outputPath = path.join(process.cwd(), 'public', 'models', `${config.name}.glb`);

    // Check if already exists
    try {
        await fs.access(outputPath);
        console.log(`   ✓ Already exists, skipping...`);
        return { success: true, cached: true };
    } catch {
        // Doesn't exist, generate it
    }

    try {
        const result = await hybridGenerator.generateFromEntity({
            entityType: config.type,
            entityId: config.id,
            era: era,
            outputName: config.name
        });

        // Copy from hybrid folder to public/models
        const sourcePath = path.join(process.cwd(), 'public', result.modelPath.replace(/^\//, ''));
        await fs.copyFile(sourcePath, outputPath);

        console.log(`   ✅ Generated successfully!`);
        return { success: true, cached: false };
    } catch (error: any) {
        console.error(`   ❌ Failed: ${error.message}`);
        return { success: false, error: error.message };
    }
}

async function main() {
    console.log('🎮 RuneScape Model Generator\n');
    console.log(`Cache Path: C:\\ProgramData\\Jagex\\RuneScape`);
    console.log(`Models to generate: ${MODELS_TO_GENERATE.length}\n`);
    console.log('='.repeat(60));

    // Ensure output directory exists
    const outputDir = path.join(process.cwd(), 'public', 'models');
    await fs.mkdir(outputDir, { recursive: true });

    const results = {
        success: 0,
        cached: 0,
        failed: 0,
        errors: [] as string[]
    };

    // Generate all models
    for (const config of MODELS_TO_GENERATE) {
        const result = await generateModel(config);

        if (result.success) {
            if (result.cached) {
                results.cached++;
            } else {
                results.success++;
            }
        } else {
            results.failed++;
            results.errors.push(`${config.name}: ${result.error}`);
        }
    }

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('\n📊 Generation Summary:');
    console.log(`   ✅ Generated: ${results.success}`);
    console.log(`   📦 Cached: ${results.cached}`);
    console.log(`   ❌ Failed: ${results.failed}`);

    if (results.errors.length > 0) {
        console.log('\n⚠️  Errors:');
        results.errors.forEach(err => console.log(`   - ${err}`));
    }

    console.log('\n✨ Model generation complete!\n');

    process.exit(results.failed > 0 ? 1 : 0);
}

main().catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
});
