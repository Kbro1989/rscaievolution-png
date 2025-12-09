const fs = require('fs');
const path = require('path');
const items = require('./rsc-cloudflare/rsc-server/rsc-data-local/config/items.json');

const PLAYER_SAVE_DIR = path.join(__dirname, 'rsc-cloudflare', 'rsc-server', 'player-saves');

function cleanPlayerSave(filePath) {
    const playerData = JSON.parse(fs.readFileSync(filePath, 'utf8'));

    let itemsRemoved = 0;

    // Clean inventory
    if (playerData.inventory) {
        const cleanedInventory = playerData.inventory.items.filter(item => {
            if (items[item.id]) {
                return true;
            }
            itemsRemoved++;
            return false;
        });
        playerData.inventory.items = cleanedInventory;
    }

    // Clean bank
    if (playerData.bank) {
        const cleanedBank = playerData.bank.items.filter(item => {
            if (items[item.id]) {
                return true;
            }
            itemsRemoved++;
            return false;
        });
        playerData.bank.items = cleanedBank;
    }

    if (itemsRemoved > 0) {
        fs.writeFileSync(filePath, JSON.stringify(playerData, null, 4));
        console.log(`Cleaned ${filePath}: Removed ${itemsRemoved} invalid items.`);
    } else {
        console.log(`Checked ${filePath}: No invalid items found.`);
    }
}

function cleanAllSaves() {
    const files = fs.readdirSync(PLAYER_SAVE_DIR);
    files.forEach(file => {
        if (file.endsWith('.json')) {
            cleanPlayerSave(path.join(PLAYER_SAVE_DIR, file));
        }
    });
}

cleanAllSaves();
