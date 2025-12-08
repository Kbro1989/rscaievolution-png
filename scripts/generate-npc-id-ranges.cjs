#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const npcsPath = path.resolve('rsc-cloudflare/rsc-server/rsc-data-local/config/npcs.json');
const npcs = JSON.parse(fs.readFileSync(npcsPath, 'utf8'));

// Categorize NPCs by their roles and descriptions
const categories = {
    'Traders & Merchants': { npcs: [] },
    'Quest NPCs': { npcs: [] },
    'Combat NPCs': { npcs: [] },
    'Civilians': { npcs: [] },
    'Religious': { npcs: [] },
    'Monsters & Creatures': { npcs: [] },
    'Skilled Trainers': { npcs: [] },
    'Guards & Protection': { npcs: [] },
    'Miscellaneous': { npcs: [] }
};

const traderKeywords = ['shopkeeper', 'merchant', 'bartender', 'vendor', 'trader', 'banker', 'chest'];
const questKeywords = ['quest', 'elder', 'king', 'prince', 'duchess', 'general', 'captain'];
const combatKeywords = ['warrior', 'knight', 'paladin', 'dragon', 'demon', 'monster', 'orc', 'troll', 'giant', 'goblin', 'skeleton', 'zombie', 'ghost', 'spectre', 'mage', 'wizard', 'sorcerer', 'warlock', 'assassin', 'bandit', 'pirate'];
const civilianKeywords = ['man', 'woman', 'lady', 'boy', 'girl', 'child', 'citizen', 'villager', 'person', 'guide', 'explorer', 'scholar'];
const religiousKeywords = ['monk', 'priest', 'bishop', 'cleric', 'druid', 'prayer', 'saradomin', 'zamorak', 'armadyl', 'bandos'];
const monsterKeywords = ['rat', 'spider', 'bear', 'wolf', 'chicken', 'cow', 'pig', 'sheep', 'scorpion', 'snake', 'hornet', 'beetle', 'fly'];
const trainerKeywords = ['trainer', 'master', 'instructor', 'teacher', 'coach', 'sage', 'wise'];
const guardKeywords = ['guard', 'watchman', 'soldier', 'sentinel', 'protector'];

npcs.forEach((npc, idx) => {
    const name = npc.name.toLowerCase();
    const desc = (npc.description || '').toLowerCase();
    const combined = name + ' ' + desc;
    let categorized = false;

    for (const keyword of traderKeywords) {
        if (combined.includes(keyword)) {
            categories['Traders & Merchants'].npcs.push({ id: idx, name: npc.name });
            categorized = true;
            break;
        }
    }

    if (!categorized) {
        for (const keyword of questKeywords) {
            if (combined.includes(keyword)) {
                categories['Quest NPCs'].npcs.push({ id: idx, name: npc.name });
                categorized = true;
                break;
            }
        }
    }

    if (!categorized) {
        for (const keyword of combatKeywords) {
            if (combined.includes(keyword)) {
                categories['Combat NPCs'].npcs.push({ id: idx, name: npc.name });
                categorized = true;
                break;
            }
        }
    }

    if (!categorized) {
        for (const keyword of religiousKeywords) {
            if (combined.includes(keyword)) {
                categories['Religious'].npcs.push({ id: idx, name: npc.name });
                categorized = true;
                break;
            }
        }
    }

    if (!categorized) {
        for (const keyword of monsterKeywords) {
            if (combined.includes(keyword)) {
                categories['Monsters & Creatures'].npcs.push({ id: idx, name: npc.name });
                categorized = true;
                break;
            }
        }
    }

    if (!categorized) {
        for (const keyword of trainerKeywords) {
            if (combined.includes(keyword)) {
                categories['Skilled Trainers'].npcs.push({ id: idx, name: npc.name });
                categorized = true;
                break;
            }
        }
    }

    if (!categorized) {
        for (const keyword of guardKeywords) {
            if (combined.includes(keyword)) {
                categories['Guards & Protection'].npcs.push({ id: idx, name: npc.name });
                categorized = true;
                break;
            }
        }
    }

    if (!categorized) {
        for (const keyword of civilianKeywords) {
            if (combined.includes(keyword)) {
                categories['Civilians'].npcs.push({ id: idx, name: npc.name });
                categorized = true;
                break;
            }
        }
    }

    if (!categorized) {
        categories['Miscellaneous'].npcs.push({ id: idx, name: npc.name });
    }
});

// Calculate ID ranges for each category
for (const [category, data] of Object.entries(categories)) {
    if (data.npcs.length > 0) {
        const ids = data.npcs.map(n => n.id).sort((a, b) => a - b);
        data.range = [ids[0], ids[ids.length - 1]];
        data.count = ids.length;
    }
}

// Output documentation
console.log('=== RUNESCAPE CLASSIC NPC ID RANGES ===\n');
console.log(`Total NPCs: ${npcs.length}\n`);

for (const [category, data] of Object.entries(categories)) {
    if (data.count > 0) {
        console.log(`\n${category}:`);
        console.log(`  Range: ${data.range[0]}-${data.range[1]}`);
        console.log(`  Count: ${data.count}`);
        
        // Show first few and last few
        const preview = [...data.npcs.slice(0, 3)];
        if (data.npcs.length > 6) {
            preview.push({ id: '...', name: '...' });
            preview.push(...data.npcs.slice(-3));
        } else {
            preview.push(...data.npcs.slice(3));
        }
        
        preview.forEach(npc => {
            if (npc.id === '...') {
                console.log(`    ${npc.id}`);
            } else {
                console.log(`    [${npc.id}] ${npc.name}`);
            }
        });
    }
}

// Save to file
const output = {
    timestamp: new Date().toISOString(),
    totalNPCs: npcs.length,
    categories: {}
};

for (const [category, data] of Object.entries(categories)) {
    if (data.count > 0) {
        output.categories[category] = {
            range: data.range,
            count: data.count,
            npcs: data.npcs
        };
    }
}

fs.writeFileSync(
    path.resolve('rsc-cloudflare/NPC_ID_RANGES.json'),
    JSON.stringify(output, null, 2)
);

console.log('\n\n✓ Documentation saved to: rsc-cloudflare/NPC_ID_RANGES.json');
