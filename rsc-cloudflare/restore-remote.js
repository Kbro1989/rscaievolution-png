
const fs = require('fs');

async function restoreRemote() {
    try {
        const data = fs.readFileSync('restore.json', 'utf8');
        const json = JSON.parse(data);

        console.log(`Connecting to https://openrsc-vinilla.pages.dev...`);

        const res = await fetch(`https://openrsc-vinilla.pages.dev/api/player/restore`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(json)
        });

        if (res.ok) {
            console.log(`✅ Success: Restored data for ${json.username}`);
            console.log(await res.text());
        } else {
            console.log(`❌ Failed: ${res.status} ${res.statusText}`);
            console.log(await res.text());
        }

    } catch (e) {
        console.error('Script Error:', e);
    }
}

restoreRemote();
