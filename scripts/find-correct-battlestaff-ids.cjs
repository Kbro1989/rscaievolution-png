const fs = require('fs');

const items = JSON.parse(fs.readFileSync('./rsc-cloudflare/rsc-server/rsc-data-local/config/items.json', 'utf8'));
const { battlestaves } = require('../rsc-cloudflare/rsc-server/rsc-data-local/skills/crafting.json');

const itemNamesToFind = [
  'Battlestaff'
];

for (const orbId in battlestaves) {
    const def = battlestaves[orbId];
    // Add orb name to search list if possible, otherwise just use its ID
    const orbItem = items[orbId];
    if (orbItem && orbItem.name) {
        itemNamesToFind.push(orbItem.name);
    }
    // Add resulting battlestaff name to search list if possible, otherwise just use its ID
    const resultItem = items[def.id];
    if (resultItem && resultItem.name) {
        itemNamesToFind.push(resultItem.name);
    }
}

console.log('╔══════════════════════════════════════════════════════════════════════════════╗');
console.log('║                 FINDING CORRECT IDs FOR BATTLESTAFF ITEMS                  ║');
console.log('╚══════════════════════════════════════════════════════════════════════════════╝\n');

const corrections = {};

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
      if (item.name.toLowerCase() === name.toLowerCase()) {
        foundItem = item;
        break;
      }
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

console.log('--------------------------- CORRECT ID MAPPING (BATTLESTAFF) ------------------------');
for (const [name, id] of Object.entries(corrections)) {
  const dbName = items[id] ? items[id].name : 'N/A';
  console.log(`'${name}': ${id}, // Canonical Name: '${dbName}'`);
}
console.log('---------------------------------------------------------------------------------\n');

console.log('--------------------------- BATTLESTAFF DATA (ORB_ID: { level, experience, id }) ------------------------');
for (const orbId in battlestaves) {
    const def = battlestaves[orbId];
    const orbName = items[orbId] ? items[orbId].name : 'Unknown Orb';
    const resultName = items[def.id] ? items[def.id].name : 'Unknown Result';
    console.log(`'${orbName}' (ID: ${orbId}): { level: ${def.level}, experience: ${def.experience}, id: ${def.id}, // Result: '${resultName}' }`);
}
console.log('---------------------------------------------------------------------------------\n');