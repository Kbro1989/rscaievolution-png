const fs = require('fs');
const path = require('path');

// Sound names found in codebase
const soundNames = [
    'prayeroff',
    'prayeron',
    'combat1a',
    'combat1b',
    'combat2a',
    'combat2b',
    'combat3a',
    'combat3b',
    'retreat',
    'victory',
    'foundgem',
    'prospect',
    'shoot',
    'underattack',
    'click',
    'chisel',
    'dropobject',
    'eat',
    'spellfail',
    'spellok',
    'door',
    'mechanical',
    'takeobject',
    'opendoor',
    'secretdoor',
    'recharge',
    'chink',
    'advance',
    'death',
    'filljar',
    'camera',
    'anvil',
    'cooking'
];

const DATA_DIR = path.join(__dirname, '../rsc-cloudflare/public/data204');
const SOUND_FILE = 'sounds1.mem';

function getUnsignedShort(buffer, offset) {
    return ((buffer[offset] & 0xff) << 8) + (buffer[offset + 1] & 0xff);
}

function calculateHash(fileName) {
    let wantedHash = 0;
    fileName = fileName.toUpperCase();
    for (let k = 0; k < fileName.length; k++) {
        wantedHash = ((wantedHash * 61) | 0) + fileName.charCodeAt(k) - 32;
    }
    return wantedHash;
}

function verifySounds() {
    const buffer = fs.readFileSync(path.join(DATA_DIR, SOUND_FILE));
    const numEntries = getUnsignedShort(buffer, 0);
    
    console.log(`Loaded ${SOUND_FILE} with ${numEntries} entries.`);
    
    const archiveHashes = new Set();
    
    for (let entry = 0; entry < numEntries; entry++) {
        let fileHash =
            ((buffer[entry * 10 + 2] & 0xff) * 0x1000000 +
                (buffer[entry * 10 + 3] & 0xff) * 0x10000 +
                (buffer[entry * 10 + 4] & 0xff) * 256 +
                (buffer[entry * 10 + 5] & 0xff)) |
            0;
        archiveHashes.add(fileHash);
    }

    console.log('\nVerifying sounds used in code:');
    let foundCount = 0;
    let missingCount = 0;

    soundNames.forEach(name => {
        const hash = calculateHash(name + '.pcm');
        if (archiveHashes.has(hash)) {
            console.log(`[OK] ${name}`);
            foundCount++;
        } else {
            console.log(`[MISSING] ${name}`);
            missingCount++;
        }
    });

    console.log(`\nSummary: ${foundCount} found, ${missingCount} missing.`);
}

verifySounds();
