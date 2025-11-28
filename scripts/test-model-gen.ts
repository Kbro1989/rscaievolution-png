
import { hybridGenerator } from '../services/backend/hybridContentGenerator';
import path from 'path';
import fs from 'fs/promises';

async function test() {
    console.log('🧪 Testing Hybrid Content Generator...');

    try {
        const result = await hybridGenerator.generateFromEntity({
            entityType: 'loc',
            entityId: 1276, // Tree
            era: 0,
            outputName: 'test_tree_classic'
        });

        console.log('✅ Generation successful:', result);

        // Check if file exists
        const fullPath = path.join(process.cwd(), 'public', result.modelPath.replace(/^\//, ''));
        const stats = await fs.stat(fullPath);
        console.log(`📦 Output file size: ${stats.size} bytes`);

    } catch (error) {
        console.error('❌ Test failed:', error);
        process.exit(1);
    }
}

test();
