
import fs from 'fs';

const itemsPath = 'C:/Users/Destiny/Desktop/ai-architect-mmorpg/copy-of-rsc-evolution-ai/rsc-cloudflare/rsc-server/rsc-data-local/config/items.json';

const items = JSON.parse(fs.readFileSync(itemsPath, 'utf8'));

const exceptions = ["of", "the", "a", "an", "in", "on", "at", "to", "for", "with", "by", "and", "or"];
const forceLowercase = ["(t)", "(g)"];

let count = 0;

function toTitleCase(str) {
    // Handle special cases first
    if (str.includes("2-handed")) {
        // Run general title case first, then fix 2-handed
        let temp = toTitleCase(str.replace("2-handed", "2-Handed"));
        return temp.replace("2-Handed", "2-handed");
    }

    return str.split(' ').map((word, index, arr) => {
        const lowerWord = word.toLowerCase();

        // Always capitalize first and last word
        if (index === 0 || index === arr.length - 1) {
            return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
        }

        // Lowercase exceptions
        if (exceptions.includes(lowerWord)) {
            return lowerWord;
        }

        // Force lowercase suffixes like (t)
        if (forceLowercase.includes(lowerWord)) {
            return lowerWord;
        }

        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    }).join(' ');
}


items.forEach(item => {
    if (item && item.name) {
        const oldName = item.name;
        // Check for specific overrides if needed, or just apply Title Case
        let newName = toTitleCase(oldName);

        // Hardcode fixes from user feedback if any (none specific given other than "wrong names")
        // But logic covers standard cases.
        if (newName !== oldName) {
            item.name = newName;
            count++;
        }
    }
});

fs.writeFileSync(itemsPath, JSON.stringify(items, null, 4));
console.log(`Updated ${count} item names to Title Case.`);
