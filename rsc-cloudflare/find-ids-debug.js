const fs = require('fs');
const path = require('path');

const itemsPath = path.join(__dirname, 'rsc-server/rsc-data-local/config/items.json');
const items = JSON.parse(fs.readFileSync(itemsPath, 'utf8'));

const targets = ['Dragon Square Shield', 'Rune Plate Mail Body', 'Bronze Square Shield', 'Iron Square Shield'];

targets.forEach(target => {
    const id = items.findIndex(i => i.name.toLowerCase() === target.toLowerCase());
    if (id !== -1) {
        console.log(`Found '${items[id].name}': ID ${id}, Sprite: ${items[id].sprite}`);
        // Also check requirements (wield requirements are often in a separate file or logic)
        // items.json usually defaults to just visual/stats.
        // Quest requirments are in `ItemWieldHandler` or similar.
    } else {
        console.log(`Could not find '${target}'`);
    }
});

// Search for any item containing "plate" and "rune"
console.log('\nSearching for "rune" and "plate"...');
items.forEach((item, index) => {
    if (item.name.toLowerCase().includes('rune') && item.name.toLowerCase().includes('plate')) {
        console.log(`[${index}] ${item.name}`);
    }
});
