const fs = require('fs');
const path = require('path');

const objectsPath = path.join(__dirname, '../rsc-cloudflare/rsc-server/rsc-data-local/config/objects.json');

try {
    const data = fs.readFileSync(objectsPath, 'utf8');
    const objects = JSON.parse(data);

    console.log(`Loaded ${objects.length} objects.`);
    for(let i=0; i<5 && i<objects.length; i++) console.log(objects[i].name);
    
    objects.forEach((obj, index) => {
        if (!obj.name) return;
        const name = obj.name.toLowerCase();
        if (name.includes('bank') && name.includes('booth')) {
            console.log(`ID: ${index} | Name: ${obj.name} | Desc: ${obj.description}`);
        }
    });

} catch (err) {
    console.error('Error:', err);
}
