#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const itemsPath = path.resolve('rsc-cloudflare/rsc-server/rsc-data-local/config/items.json');
const items = JSON.parse(fs.readFileSync(itemsPath, 'utf8'));

// Categorize items by their properties and names
const categories = {
    'Weapons': { range: [], items: [] },
    'Armor & Clothing': { range: [], items: [] },
    'Potions': { range: [], items: [] },
    'Food & Cooking': { range: [], items: [] },
    'Materials & Resources': { range: [], items: [] },
    'Quest Items': { range: [], items: [] },
    'Amulets & Jewelry': { range: [], items: [] },
    'Herbs & Herblore': { range: [], items: [] },
    'Fish & Fishing': { range: [], items: [] },
    'Runes & Magic': { range: [], items: [] },
    'Tools & Equipment': { range: [], items: [] },
    'Miscellaneous': { range: [], items: [] }
};

const weaponKeywords = ['sword', 'axe', 'staff', 'bow', 'arrow', 'dagger', 'halberd', 'scimitar', 'mace', 'spear', 'warhammer', 'crossbow', 'bolt'];
const armorKeywords = ['armour', 'armor', 'plate', 'chain', 'leather', 'robe', 'helm', 'helmet', 'boots', 'gloves', 'gauntlets', 'leggings', 'plate', 'cape', 'dress', 'skirt', 'shirt', 'coif'];
const potionKeywords = ['potion', 'poison'];
const foodKeywords = ['cake', 'bread', 'pie', 'meat', 'fish', 'lobster', 'salmon', 'trout', 'pizza', 'batta', 'bowl', 'soup', 'apple', 'banana', 'orange', 'banana', 'cheese', 'egg', 'herb', 'cabbage', 'burnt', 'cooked'];
const amuletKeywords = ['amulet', 'necklace', 'ring', 'ring', 'talisman'];
const herbloreKeywords = ['herb', 'leaf', 'ash', 'seed', 'root'];
const fishKeywords = ['fish', 'oyster', 'eel'];
const runeKeywords = ['rune', 'essence', 'orb'];
const toolKeywords = ['pickaxe', 'axe', 'hatchet', 'saw', 'hammer', 'chisel', 'file', 'knife', 'needle', 'tinderbox', 'bucket', 'pot', 'cauldron', 'pestle', 'mortar'];
const questKeywords = ['quest', 'scroll', 'book', 'map', 'key', 'seal', 'deed', 'journal', 'note', 'letter', 'token', 'certificate'];

items.forEach((item, idx) => {
    const name = item.name.toLowerCase();
    let categorized = false;

    for (const keyword of weaponKeywords) {
        if (name.includes(keyword)) {
            categories['Weapons'].items.push({ id: idx, name: item.name });
            categorized = true;
            break;
        }
    }

    if (!categorized) {
        for (const keyword of armorKeywords) {
            if (name.includes(keyword)) {
                categories['Armor & Clothing'].items.push({ id: idx, name: item.name });
                categorized = true;
                break;
            }
        }
    }

    if (!categorized) {
        for (const keyword of potionKeywords) {
            if (name.includes(keyword)) {
                categories['Potions'].items.push({ id: idx, name: item.name });
                categorized = true;
                break;
            }
        }
    }

    if (!categorized) {
        for (const keyword of foodKeywords) {
            if (name.includes(keyword)) {
                categories['Food & Cooking'].items.push({ id: idx, name: item.name });
                categorized = true;
                break;
            }
        }
    }

    if (!categorized) {
        for (const keyword of amuletKeywords) {
            if (name.includes(keyword)) {
                categories['Amulets & Jewelry'].items.push({ id: idx, name: item.name });
                categorized = true;
                break;
            }
        }
    }

    if (!categorized) {
        for (const keyword of herbloreKeywords) {
            if (name.includes(keyword)) {
                categories['Herbs & Herblore'].items.push({ id: idx, name: item.name });
                categorized = true;
                break;
            }
        }
    }

    if (!categorized) {
        for (const keyword of fishKeywords) {
            if (name.includes(keyword)) {
                categories['Fish & Fishing'].items.push({ id: idx, name: item.name });
                categorized = true;
                break;
            }
        }
    }

    if (!categorized) {
        for (const keyword of runeKeywords) {
            if (name.includes(keyword)) {
                categories['Runes & Magic'].items.push({ id: idx, name: item.name });
                categorized = true;
                break;
            }
        }
    }

    if (!categorized) {
        for (const keyword of toolKeywords) {
            if (name.includes(keyword)) {
                categories['Tools & Equipment'].items.push({ id: idx, name: item.name });
                categorized = true;
                break;
            }
        }
    }

    if (!categorized) {
        for (const keyword of questKeywords) {
            if (name.includes(keyword)) {
                categories['Quest Items'].items.push({ id: idx, name: item.name });
                categorized = true;
                break;
            }
        }
    }

    if (!categorized) {
        categories['Materials & Resources'].items.push({ id: idx, name: item.name });
    }
});

// Calculate ID ranges for each category
for (const [category, data] of Object.entries(categories)) {
    if (data.items.length > 0) {
        const ids = data.items.map(i => i.id).sort((a, b) => a - b);
        data.range = [ids[0], ids[ids.length - 1]];
        data.count = ids.length;
    }
}

// Output documentation
console.log('=== RUNESCAPE CLASSIC ITEM ID RANGES ===\n');
console.log(`Total Items: ${items.length}\n`);

for (const [category, data] of Object.entries(categories)) {
    if (data.count > 0) {
        console.log(`\n${category}:`);
        console.log(`  Range: ${data.range[0]}-${data.range[1]}`);
        console.log(`  Count: ${data.count}`);
        
        // Show first few and last few items
        const preview = [...data.items.slice(0, 3)];
        if (data.items.length > 6) {
            preview.push({ id: '...', name: '...' });
            preview.push(...data.items.slice(-3));
        } else {
            preview.push(...data.items.slice(3));
        }
        
        preview.forEach(item => {
            if (item.id === '...') {
                console.log(`    ${item.id}`);
            } else {
                console.log(`    [${item.id}] ${item.name}`);
            }
        });
    }
}

// Save to file
const output = {
    timestamp: new Date().toISOString(),
    totalItems: items.length,
    categories: {}
};

for (const [category, data] of Object.entries(categories)) {
    if (data.count > 0) {
        output.categories[category] = {
            range: data.range,
            count: data.count,
            items: data.items
        };
    }
}

fs.writeFileSync(
    path.resolve('rsc-cloudflare/ITEM_ID_RANGES.json'),
    JSON.stringify(output, null, 2)
);

console.log('\n\n✓ Documentation saved to: rsc-cloudflare/ITEM_ID_RANGES.json');
