import fs from 'fs';

// --- Load Data ---
const newItems = JSON.parse(fs.readFileSync('./rsc-cloudflare/rsc-server/rsc-data-local/config/items.json', 'utf8'));
const backupItems = JSON.parse(fs.readFileSync('./rsc-cloudflare/rsc-server/rsc-data-local/config/items.json.backup', 'utf8'));
const saveData = JSON.parse(fs.readFileSync('./temp_save.json', 'utf8'));

// --- Create Mappings ---
// Map old item names to their new IDs
const nameToNewIdMap = new Map(newItems.map((item, index) => [item.name.toLowerCase(), index]));
// Map old item IDs to their names from the backup
const oldIdToNameMap = new Map(backupItems.map((item, index) => [index, item.name.toLowerCase()]));

// --- Migrate Inventory ---
const migratedInventory = saveData.inventory.map(item => {
    const itemName = oldIdToNameMap.get(item.id);
    if (itemName && nameToNewIdMap.has(itemName)) {
        const newItemId = nameToNewIdMap.get(itemName);
        return { ...item, id: newItemId };
    }
    return null; // This item will be removed
}).filter(item => item !== null); // Filter out removed items

saveData.inventory = migratedInventory;

// --- Generate New Bank ---
const newBank = newItems.map((item, index) => ({
    id: index,
    amount: 100
}));

saveData.bank = newBank;

// --- Save Corrected Data ---
fs.writeFileSync('./corrected_save.json', JSON.stringify(saveData));

console.log('Successfully generated corrected_save.json');
