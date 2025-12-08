#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const items = JSON.parse(fs.readFileSync('rsc-cloudflare/rsc-server/rsc-data-local/config/items.json', 'utf8'));
const npcs = JSON.parse(fs.readFileSync('rsc-cloudflare/rsc-server/rsc-data-local/config/npcs.json', 'utf8'));

// Scan quest files
const questDir = 'rsc-cloudflare/rsc-server/src/plugins/quests';
const questFiles = [];

function scanDir(dir) {
    const files = fs.readdirSync(dir);
    files.forEach(file => {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
            scanDir(fullPath);
        } else if (file.endsWith('.js')) {
            questFiles.push(fullPath);
        }
    });
}

scanDir(questDir);

// Build ID → quest file mapping
const itemToQuests = {};
const npcToQuests = {};

questFiles.forEach(file => {
    const content = fs.readFileSync(file, 'utf8');
    const questName = path.basename(file, '.js');
    
    const itemMatches = content.match(/const\s+ITEM_\w+\s*=\s*(\d+)/g) || [];
    const npcMatches = content.match(/const\s+NPC_\w+\s*=\s*(\d+)/g) || [];
    
    itemMatches.forEach(match => {
        const id = parseInt(match.match(/\d+/)[0]);
        if (!itemToQuests[id]) itemToQuests[id] = [];
        if (!itemToQuests[id].includes(questName)) {
            itemToQuests[id].push(questName);
        }
    });
    
    npcMatches.forEach(match => {
        const id = parseInt(match.match(/\d+/)[0]);
        if (!npcToQuests[id]) npcToQuests[id] = [];
        if (!npcToQuests[id].includes(questName)) {
            npcToQuests[id].push(questName);
        }
    });
});

console.log('═══════════════════════════════════════════════════════════');
console.log('  ID TO QUEST FILE MAPPING');
console.log('═══════════════════════════════════════════════════════════\n');

// Export mapping
const mapping = {
    items: {},
    npcs: {},
    timestamp: new Date().toISOString()
};

Object.entries(itemToQuests).forEach(([id, quests]) => {
    const itemId = parseInt(id);
    mapping.items[itemId] = {
        name: items[itemId]?.name || 'UNKNOWN',
        price: items[itemId]?.price || 0,
        usedIn: quests
    };
});

Object.entries(npcToQuests).forEach(([id, quests]) => {
    const npcId = parseInt(id);
    mapping.npcs[npcId] = {
        name: npcs[npcId]?.name || 'UNKNOWN',
        stats: {
            attack: npcs[npcId]?.attack || 0,
            strength: npcs[npcId]?.strength || 0,
            defense: npcs[npcId]?.defense || 0
        },
        usedIn: quests
    };
});

fs.writeFileSync('id-to-quest-mapping.json', JSON.stringify(mapping, null, 2));

console.log('ITEM IDS AND THEIR QUEST FILES:');
console.log('(showing first 30)\n');

let count = 0;
Object.entries(mapping.items).forEach(([id, info]) => {
    if (count < 30) {
        console.log('ID ' + id + ': ' + info.name);
        console.log('  Price: ' + info.price + ' gp');
        console.log('  Used in: ' + info.usedIn.join(', '));
        console.log('');
        count++;
    }
});

console.log('\nNPC IDS AND THEIR QUEST FILES:');
console.log('(showing first 30)\n');

count = 0;
Object.entries(mapping.npcs).forEach(([id, info]) => {
    if (count < 30) {
        console.log('ID ' + id + ': ' + info.name);
        console.log('  Stats: A' + info.stats.attack + ' S' + info.stats.strength + ' D' + info.stats.defense);
        console.log('  Used in: ' + info.usedIn.join(', '));
        console.log('');
        count++;
    }
});

console.log('\n✓ Full mapping saved to id-to-quest-mapping.json');
console.log('═══════════════════════════════════════════════════════════\n');
