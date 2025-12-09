#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const items = JSON.parse(fs.readFileSync('rsc-cloudflare/rsc-server/rsc-data-local/config/items.json', 'utf8'));
const npcs = JSON.parse(fs.readFileSync('rsc-cloudflare/rsc-server/rsc-data-local/config/npcs.json', 'utf8'));

// Scan all quest files for ID references
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

console.log('═══════════════════════════════════════════════════════════');
console.log('  SCANNING ' + questFiles.length + ' QUEST FILES FOR ID REFERENCES');
console.log('═══════════════════════════════════════════════════════════\n');

const itemIdReferences = {};
const npcIdReferences = {};

questFiles.forEach(file => {
    const content = fs.readFileSync(file, 'utf8');
    
    // Find all ITEM_ and NPC_ const assignments
    const itemMatches = content.match(/const\s+ITEM_\w+\s*=\s*(\d+)/g) || [];
    const npcMatches = content.match(/const\s+NPC_\w+\s*=\s*(\d+)/g) || [];
    
    itemMatches.forEach(match => {
        const id = parseInt(match.match(/\d+/)[0]);
        if (!itemIdReferences[id]) itemIdReferences[id] = [];
        if (!itemIdReferences[id].includes(path.basename(file))) {
            itemIdReferences[id].push(path.basename(file));
        }
    });
    
    npcMatches.forEach(match => {
        const id = parseInt(match.match(/\d+/)[0]);
        if (!npcIdReferences[id]) npcIdReferences[id] = [];
        if (!npcIdReferences[id].includes(path.basename(file))) {
            npcIdReferences[id].push(path.basename(file));
        }
    });
});

console.log('ITEM IDS REFERENCED IN QUESTS: ' + Object.keys(itemIdReferences).length);
console.log('NPC IDS REFERENCED IN QUESTS: ' + Object.keys(npcIdReferences).length);

// Check for issues
let itemIssues = [];
let npcIssues = [];
let validItems = 0;
let validNpcs = 0;

Object.entries(itemIdReferences).forEach(([id, quests]) => {
    const itemId = parseInt(id);
    if (itemId >= items.length || !items[itemId] || !items[itemId].name) {
        itemIssues.push({id: itemId, quests: quests});
    } else {
        validItems++;
    }
});

Object.entries(npcIdReferences).forEach(([id, quests]) => {
    const npcId = parseInt(id);
    if (npcId >= npcs.length || !npcs[npcId] || !npcs[npcId].name) {
        npcIssues.push({id: npcId, quests: quests});
    } else {
        validNpcs++;
    }
});

console.log('\n✓ VALID ITEM IDS: ' + validItems);
console.log('✓ VALID NPC IDS: ' + validNpcs);

if (itemIssues.length > 0) {
    console.log('\n⚠️ ITEM ID ISSUES FOUND: ' + itemIssues.length);
    itemIssues.forEach(issue => {
        console.log('   ID ' + issue.id + ' (OUT OF RANGE: max=' + (items.length - 1) + ')');
        console.log('      Used in: ' + issue.quests.join(', '));
    });
}

if (npcIssues.length > 0) {
    console.log('\n⚠️ NPC ID ISSUES FOUND: ' + npcIssues.length);
    npcIssues.forEach(issue => {
        console.log('   ID ' + issue.id + ' (OUT OF RANGE: max=' + (npcs.length - 1) + ')');
        console.log('      Used in: ' + issue.quests.join(', '));
    });
}

if (itemIssues.length === 0 && npcIssues.length === 0) {
    console.log('\n✓ ALL IDS ARE VALID');
} else {
    console.log('\n⚠️ TOTAL ISSUES: ' + (itemIssues.length + npcIssues.length));
}

console.log('\n═══════════════════════════════════════════════════════════\n');
