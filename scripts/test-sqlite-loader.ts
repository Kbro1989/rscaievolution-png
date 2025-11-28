
import { GameCacheLoader } from '../libs/rsmv/src/cache/sqlite';
import path from 'path';

// Polyfill __non_webpack_require__ if needed
if (typeof globalThis.__non_webpack_require__ === 'undefined') {
    (globalThis as any).__non_webpack_require__ = require;
}

async function testCacheLoad() {
    console.log('🧪 Testing GameCacheLoader...');
    const cachePath = 'C:\\ProgramData\\Jagex\\RuneScape';

    try {
        const loader = new GameCacheLoader(cachePath, false);
        console.log('✅ GameCacheLoader instantiated');

        const meta = loader.getCacheMeta();
        console.log('Meta:', meta);

        // Try to open a table (index 255 is usually the reference table)
        const indexTable = loader.openTable(255);
        console.log('✅ Index table opened');

    } catch (error) {
        console.error('❌ Cache load failed:', error);
    }
}

testCacheLoad();
