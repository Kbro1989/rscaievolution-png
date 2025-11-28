// Simple inline test - no imports needed
const path = require('path');

async function testRSMVCache() {
    console.log('🧪 Testing RSMV Cache Access...\n');
    
    try {
        // Test 1: Check if RSMV package exists
        console.log('Step 1: Checking RSMV package...');
        const rsmvPath = path.join(__dirname, '..', 'libs', 'rsmv', 'dist', 'api.js');
        const fs = require('fs');
        
        if (fs.existsSync(rsmvPath)) {
            console.log('   ✅ RSMV package found\n');
        } else {
            console.log('   ❌ RSMV package not found at:', rsmvPath);
            return;
        }
        
        // Test 2: Check Jagex cache
        console.log('Step 2: Checking Jagex cache folder...');
        const cachePath = 'C:\\ProgramData\\Jagex\\RuneScape';
        
        if (fs.existsSync(cachePath)) {
            console.log('   ✅ Jagex cache folder found');
            const files = fs.readdirSync(cachePath);
            console.log(`   Found ${files.length} files/folders\n`);
        } else {
            console.log('   ❌ Jagex cache not found at:', cachePath);
            return;
        }
        
        // Test 3: Try to load RSMV
        console.log('Step 3: Loading RSMV module...');
        const RSMV = require(rsmvPath);
        console.log('   ✅ RSMV module loaded');
        console.log('   Available exports:', Object.keys(RSMV).join(', '), '\n');
        
        // Test 4: Try to initialize cache
        console.log('Step 4: Initializing cache...');
        const CacheFileSource = RSMV.CacheFileSource || RSMV.default?.CacheFileSource;
        
        if (CacheFileSource) {
            console.log('   ✅ CacheFileSource class found');
            console.log('   Attempting to load cache from:', cachePath);
            
            const cache = await CacheFileSource.fromCache(cachePath);
            console.log('   ✅ Cache loaded successfully!\n');
            
            // Test 5: Try to load Hans NPC
            console.log('Step 5: Loading Hans NPC (ID: 0)...');
            const hansConfig = await cache.getNpcConfig(0);
            console.log('   ✅ Success!');
            console.log('   Name:', hansConfig.name || 'Unknown');
            console.log('   Models:', hansConfig.models?.length || 0);
            console.log('   Color replacements:', hansConfig.color_replacements?.length || 0);
            
            console.log('\n🎉 All tests passed! RSMV is working with local Jagex cache!');
            
        } else {
            console.log('   ❌ CacheFileSource not found in RSMV exports');
        }
        
    } catch (error) {
        console.error('\n❌ Error:', error.message);
        console.error('\nStack:', error.stack);
    }
}

testRSMVCache();
