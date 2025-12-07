const fs = require('fs');
const path = 'c:\\Users\\Destiny\\Desktop\\ai-architect-mmorpg\\copy-of-rsc-evolution-ai\\openrsc-repo\\server\\conf\\server\\defs\\ItemDefs.json';

try {
    const data = fs.readFileSync(path, 'utf8');
    const json = JSON.parse(data);
    const items = json.item || json;

    const i828 = items.find(i => i.id === 828); // Green Mask
    const i112 = items.find(i => i.id === 112); // Bronze Med

    console.log('--- 828 (Green Mask) ---');
    console.log(i828);
    console.log('\n--- 112 (Bronze Med) ---');
    console.log(i112);

} catch (err) { console.error(err); }
