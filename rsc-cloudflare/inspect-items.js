const fs = require('fs');
const path = 'c:\\Users\\Destiny\\Desktop\\ai-architect-mmorpg\\copy-of-rsc-evolution-ai\\openrsc-repo\\server\\conf\\server\\defs\\ItemDefs.json';

try {
    const data = fs.readFileSync(path, 'utf8');
    const json = JSON.parse(data);
    const items = json.item || json;

    const ids = [828, 831, 832, 112];
    ids.forEach(id => {
        const item = items.find(i => i.id === id);
        if (item) {
            console.log(JSON.stringify(item, null, 2));
        } else {
            console.log(`ID ${id} NOT FOUND`);
        }
    });

} catch (err) { console.error(err.message); }
