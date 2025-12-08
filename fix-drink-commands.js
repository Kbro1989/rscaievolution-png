import fs from 'fs';

const items = JSON.parse(fs.readFileSync('./rsc-cloudflare/rsc-server/rsc-data-local/config/items.json', 'utf8'));
const differences = JSON.parse(fs.readFileSync('./drink-command-differences.json', 'utf8'));

differences.forEach(diff => {
    if (items[diff.currentId]) {
        items[diff.currentId].command = 'Drink';
        console.log(`Updated item ${diff.name} (ID: ${diff.currentId}) to include "Drink" command.`);
    }
});

fs.writeFileSync('./rsc-cloudflare/rsc-server/rsc-data-local/config/items.json', JSON.stringify(items, null, 4));
console.log('\nitems.json has been updated.');
