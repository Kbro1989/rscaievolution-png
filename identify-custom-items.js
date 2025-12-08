import fs from 'fs';

const backupItems = JSON.parse(fs.readFileSync('./rsc-cloudflare/rsc-server/rsc-data-local/config/items.json.backup', 'utf8'));
const currentItems = JSON.parse(fs.readFileSync('./rsc-cloudflare/rsc-server/rsc-data-local/config/items.json', 'utf8'));

const currentItemsMap = new Map(currentItems.map((item, index) => [item.name, { ...item, id: index }]));

const drinkCommandDifferences = backupItems.reduce((acc, backupItem, index) => {
    const currentItem = currentItemsMap.get(backupItem.name);
    if (currentItem && backupItem.command.toLowerCase().includes('drink') && !currentItem.command.toLowerCase().includes('drink')) {
        acc.push({
            name: backupItem.name,
            backupId: index,
            currentId: currentItem.id,
            backupCommand: backupItem.command,
            currentCommand: currentItem.command
        });
    }
    return acc;
}, []);

console.log('Drinkable Items with Missing "Drink" Command:');
drinkCommandDifferences.forEach(item => {
    console.log(`- ${item.name} (Backup ID: ${item.backupId}, Current ID: ${item.currentId}): Backup Command: '${item.backupCommand}', Current Command: '${item.currentCommand}'`);
});

fs.writeFileSync('./drink-command-differences.json', JSON.stringify(drinkCommandDifferences, null, 4));
console.log('\nDrink command differences saved to drink-command-differences.json');
