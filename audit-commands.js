import fs from 'fs';

// --- Load Data ---
const commandScript = fs.readFileSync('./rsc-cloudflare/rsc-server/src/packet-handlers/command.js', 'utf8');
const items = JSON.parse(fs.readFileSync('./rsc-cloudflare/rsc-server/rsc-data-local/config/items.json', 'utf8'));

// --- Regular Expression to find all item spawns ---
const itemSpawnRegex = /\{\s*id:\s*(\d+),\s*name:\s*'[^']+'\s*\}/g;

// --- Audit Logic ---
const auditResults = {
    valid: [],
    invalid: [],
    mismatchedHandlers: []
};

let match;
while ((match = itemSpawnRegex.exec(commandScript)) !== null) {
    const itemId = parseInt(match[1], 10);
    const itemData = items[itemId];

    if (!itemData) {
        auditResults.invalid.push({ id: itemId, reason: 'Item ID not found in items.json' });
        continue;
    }

    const command = itemData.command.toLowerCase();
    let expectedHandler;

    if (command.includes('wield') || command.includes('wear')) {
        expectedHandler = 'inventoryWear';
    } else if (command.includes('eat')) {
        expectedHandler = 'onEat';
    } else if (command.includes('drink')) {
        expectedHandler = 'onDrink';
    } else {
        expectedHandler = 'onInventoryCommand'; // Generic handler
    }

    // This is a simplified check. A more robust audit would trace the plugin calls.
    // For now, we'll just validate the item and its command.
    auditResults.valid.push({ id: itemId, name: itemData.name, command: itemData.command, expectedHandler });
}

// --- Generate Report ---
console.log('--- Command Item Spawner Audit ---');
console.log(`\n✅ Valid Items Found: ${auditResults.valid.length}`);
auditResults.valid.forEach(item => {
    console.log(`  - ID: ${item.id}, Name: ${item.name}, Command: '${item.command}', Expected Handler: ${item.expectedHandler}`);
});

if (auditResults.invalid.length > 0) {
    console.log(`\n❌ Invalid Items Found: ${auditResults.invalid.length}`);
    auditResults.invalid.forEach(item => {
        console.log(`  - ID: ${item.id}, Reason: ${item.reason}`);
    });
}

if (auditResults.mismatchedHandlers.length > 0) {
    console.log(`\n⚠️ Mismatched Handlers Found: ${auditResults.mismatchedHandlers.length}`);
    auditResults.mismatchedHandlers.forEach(item => {
        console.log(`  - ID: ${item.id}, Name: ${item.name}, Command: '${item.command}', Expected: ${item.expected}, Actual: ${item.actual}`);
    });
}
