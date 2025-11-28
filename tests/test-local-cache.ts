/**
 * Quick test to verify RSMV can load from local Jagex cache
 */

async function testLocalCache() {
    // Dynamic import to avoid compilation issues
    const { hybridGenerator } = await import('../services/backend/hybridContentGenerator.js');
    console.log('🧪 Testing RSMV with local Jagex cache...\n');

    try {
        // Test 1: Load Hans NPC (ID: 0)
        console.log('Test 1: Loading Hans NPC (ID: 0)...');
        const hans = await hybridGenerator.generateFromEntity({
            entityType: 'npc',
            entityId: 0,
            era: 0,
            outputName: 'test_hans_local'
        });

        console.log('✅ Success!');
        console.log(`   Name: ${hans.config.name}`);
        console.log(`   Models: ${hans.config.models?.length || 0}`);
        console.log(`   Output: ${hans.modelPath}\n`);

        // Test 2: Search for entities
        console.log('Test 2: Searching for "oak" entities...');
        const trees = await hybridGenerator.searchEntities('loc', 'oak');

        console.log(`✅ Found ${trees.length} results`);
        if (trees.length > 0) {
            console.log(`   First result: ${trees[0].name} (ID: ${trees[0].id})\n`);
        }

        console.log('🎉 All tests passed! Local Jagex cache is working!\n');
        console.log('You can now generate models without downloading the cache.');

    } catch (error: any) {
        console.error('❌ Error:', error.message);
        console.error('\nTroubleshooting:');
        console.error('1. Ensure RuneScape is installed at: C:\\ProgramData\\Jagex\\RuneScape');
        console.error('2. Check that the cache files exist in that folder');
        console.error('3. Try running RuneScape once to update the cache');
    }
}

// Run test
testLocalCache().catch(console.error);
