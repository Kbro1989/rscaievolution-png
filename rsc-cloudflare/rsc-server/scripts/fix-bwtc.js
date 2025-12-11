const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../node_modules/@ledgerhq/compressjs/src/lib/BWTC.js');

if (fs.existsSync(filePath)) {
    console.log('Patching BWTC.js...');
    let content = fs.readFileSync(filePath, 'utf8');

    // Replace 'var BWTC = Object.create(null);' with 'var BWTC = {};'
    // Use regex to handle potential whitespace differences
    const regex = /var\s+BWTC\s*=\s*Object\.create\(null\);/;
    if (regex.test(content)) {
        content = content.replace(regex, 'var BWTC = {};');
        fs.writeFileSync(filePath, content);
        console.log('BWTC.js patched successfully.');
    } else {
        console.log('BWTC.js already patched or pattern not found.');
        // Debug: print a snippet to see what's there
        const match = content.match(/var\s+BWTC/);
        if (match) {
            const start = Math.max(0, match.index - 20);
            const end = Math.min(content.length, match.index + 50);
            console.log('Context found:', JSON.stringify(content.substring(start, end)));
        } else {
            console.log('BWTC declaration not found at all.');
        }
    }
} else {
    console.warn('BWTC.js not found, skipping patch.');
}
