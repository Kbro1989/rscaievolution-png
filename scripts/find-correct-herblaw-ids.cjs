const fs = require('fs');

const items = JSON.parse(fs.readFileSync('./rsc-cloudflare/rsc-server/rsc-data-local/config/items.json', 'utf8'));

const itemNamesToFind = [
  'Pestle and Mortar',
  'Unicorn Horn',
  'Ground Unicorn Horn',
  'Blue Dragon Scale',
  'Ground Blue Dragon Scale',
  'Chocolate Bar',
  'Chocolate Dust',
  'Bat Bones',
  'Ground Bat Bones',
  'Charcoal',
  'Ground Charcoal',
  'Vial of Water'
];

console.log('╔══════════════════════════════════════════════════════════════════════════════╗');
console.log('║                 FINDING CORRECT IDs FOR HERBLAW ITEMS                      ║');
console.log('╚══════════════════════════════════════════════════════════════════════════════╝\n');

const corrections = {};

// Flexible fuzzy matching function
const fuzzyMatch = (searchTerm, candidate) => {
  const st = searchTerm.toLowerCase().replace(/[^a-z0-9]/g, '');
  const c = candidate.toLowerCase().replace(/[^a-z0-9]/g, '');
  return c.includes(st);
};

for (const name of itemNamesToFind) {
  let foundItem = null;
  let bestMatch = null;
  let bestMatchScore = 0;

  for (const item of items) {
    if (item && item.name) {
      // Exact match first
      if (item.name.toLowerCase() === name.toLowerCase()) {
        foundItem = item;
        break;
      }
      // Fuzzy match
      if (fuzzyMatch(name, item.name)) {
        const score = name.toLowerCase().split(' ').reduce((acc, word) => {
          if (item.name.toLowerCase().includes(word)) {
            return acc + 1;
          }
          return acc;
        }, 0);
        if (score > bestMatchScore) {
          bestMatch = item;
          bestMatchScore = score;
        }
      }
    }
  }

  if (foundItem) {
    corrections[name] = items.indexOf(foundItem);
  } else if (bestMatch) {
    corrections[name] = items.indexOf(bestMatch);
  } else {
    corrections[name] = 'NOT FOUND';
  }
}

console.log('--------------------------- CORRECT ID MAPPING (HERBLAW) ------------------------');
for (const [name, id] of Object.entries(corrections)) {
  const dbName = items[id] ? items[id].name : 'N/A';
  console.log(`'${name}': ${id}, // Canonical Name: '${dbName}'`);
}
console.log('---------------------------------------------------------------------------------\n');
