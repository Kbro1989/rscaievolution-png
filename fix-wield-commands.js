import fs from 'fs';

const items = JSON.parse(fs.readFileSync('./rsc-cloudflare/rsc-server/rsc-data-local/config/items.json', 'utf8'));

let updatedCount = 0;

items.forEach((item, index) => {
    if (item.equip && (!item.command || item.command === '')) {
        // Determine the command based on the equip slot
        let command = 'Wield'; // Default
        if (item.equip.includes(0) || item.equip.includes(1) || item.equip.includes(2) || item.equip.includes(3) || item.equip.includes(4) || item.equip.includes(5) || item.equip.includes(6) || item.equip.includes(7)) {
            command = 'Wear';
        }

        item.command = command;
        updatedCount++;
        console.log(`Updated item ${item.name} (ID: ${index}) to include "${command}" command.`);
    }
});

fs.writeFileSync('./rsc-cloudflare/rsc-server/rsc-data-local/config/items.json', JSON.stringify(items, null, 4));
console.log(`\nitems.json has been updated. ${updatedCount} items were modified.`);
