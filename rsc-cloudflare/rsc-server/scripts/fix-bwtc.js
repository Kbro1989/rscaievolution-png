const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../node_modules/@ledgerhq/compressjs/src/lib/BWTC.js');

if (fs.existsSync(filePath)) {
    console.log('Patching BWTC.js...');
    let content = fs.readFileSync(filePath, 'utf8');

    // Replace 'var BWTC = Object.create(null);' with 'var BWTC = {};'
    // and ensure it's declared before use if hoisting is failing
    if (content.includes('var BWTC = Object.create(null);')) {
        content = content.replace('var BWTC = Object.create(null);', 'var BWTC = {};');
        fs.writeFileSync(filePath, content);
        console.log('BWTC.js patched successfully.');
    } else {
        console.log('BWTC.js already patched or pattern not found.');
    }
} else {
    console.warn('BWTC.js not found, skipping patch.');
}
