const fs = require('fs');
const path = require('path');

const npcsPath = path.join(__dirname, '../rsc-cloudflare/rsc-server/rsc-data-local/config/npcs.json');

try {
    const data = fs.readFileSync(npcsPath, 'utf8');
    const npcs = JSON.parse(data);

    console.log('Searching for "Legend", "Guard"...');

    npcs.forEach((npc, index) => {
        if (!npc.name) return;
        const name = npc.name.toLowerCase();
        if (name.includes('seer')) {
            console.log(`ID: ${index} | Name: ${npc.name} | Desc: ${npc.description}`);
        }
    });

} catch (err) {
    console.error('Error:', err);
}
