const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../node_modules/@ledgerhq/compressjs/src/lib/BWTC.js');

console.log(`[Fix-BWTC] Looking for file at: ${filePath}`);

if (fs.existsSync(filePath)) {
    console.log('[Fix-BWTC] File found. Reading content...');
    let content = fs.readFileSync(filePath, 'utf8');

    // 1. Check if already patched
    if (content.includes('var BWTC = {};')) {
        console.log('[Fix-BWTC] File appears to be already patched.');
        // Verify we don't ALSO have the bad one
        if (!content.includes('Object.create(null)')) {
            console.log('[Fix-BWTC] and Object.create(null) is gone. Exiting.');
            process.exit(0);
        }
    }

    // 2. Try Standard Regex Replacement
    const regex = /var\s+BWTC\s*=\s*Object\.create\(null\);/;
    if (regex.test(content)) {
        console.log('[Fix-BWTC] Found "Object.create(null)" pattern. Replacing...');
        content = content.replace(regex, 'var BWTC = {};');
        fs.writeFileSync(filePath, content);
        console.log('[Fix-BWTC] Patch applied successfully (Standard Regex).');
        process.exit(0);
    }

    // 3. Fallback: If decl is missing entirely (as suggested by logs), inject it before usage.
    // Look for: BWTC.MAGIC = "bwtc";
    console.log('[Fix-BWTC] Standard pattern not found. Checking for missing declaration...');

    const magicUsage = 'BWTC.MAGIC = "bwtc";';
    if (content.includes(magicUsage) && !content.includes('var BWTC')) {
        console.log('[Fix-BWTC] Found usage "BWTC.MAGIC" but NO "var BWTC". Injecting declaration...');
        content = content.replace(magicUsage, 'var BWTC = {};\n' + magicUsage);
        fs.writeFileSync(filePath, content);
        console.log('[Fix-BWTC] Patch applied successfully (Injection).');
        process.exit(0);
    }

    // 4. Debugging Output if all failed
    console.log('[Fix-BWTC] FAILED to patch. Dumping first 200 chars for analysis:');
    console.log('--- START FILE CONTENT ---');
    console.log(content.substring(0, 200));
    console.log('--- END FILE CONTENT ---');

} else {
    console.warn('[Fix-BWTC] BWTC.js not found at expected path. Skipping.');
}
