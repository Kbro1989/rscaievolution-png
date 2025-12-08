#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const itemsPath = path.resolve('rsc-cloudflare/rsc-server/rsc-data-local/config/items.json');
const npcsPath = path.resolve('rsc-cloudflare/rsc-server/rsc-data-local/config/npcs.json');

const items = JSON.parse(fs.readFileSync(itemsPath, 'utf8'));
const npcs = JSON.parse(fs.readFileSync(npcsPath, 'utf8'));

const digsiteEntities = {
    "NPC_ARCHAEOLOGICAL_EXPERT": "Archaeological expert",
    "ITEM_GOLD_NUGGETS": "Gold nuggets",
    "ITEM_PANNING_TRAY_FULL": "Panning tray",
    "ITEM_PANNING_TRAY_GOLD_NUGGET": "Panning tray",
    "ITEM_PANNING_TRAY": "Panning tray",
    "ITEM_CRACKED_ROCK_SAMPLE": "Cracked rock sample",
    "ITEM_TALISMAN_OF_ZAROS": "Talisman of Zaros",
    "ITEM_DIGSITE_SCROLL": "Digsite scroll",
    "ITEM_UNIDENTIFIED_LIQUID": "Unidentified liquid",
    "ITEM_NITROGLYCERIN": "Nitroglycerin",
    "ITEM_UNIDENTIFIED_POWDER": "Unidentified powder",
    "ITEM_AMMONIUM_NITRATE": "Ammonium nitrate",
    "ITEM_MIXED_CHEMICALS_1": "Mixed chemicals",
    "ITEM_EXPLOSIVE_COMPOUND": "Explosive compound",
    "ITEM_MIXED_CHEMICALS_2": "Mixed chemicals",
    "ITEM_STONE_TABLET": "Stone tablet",
    "ITEM_GOLD_BAR": "Gold bar",
    "ITEM_BELT_BUCKLE": "Belt buckle",
    "ITEM_BONES": "Bones",
    "ITEM_BROKEN_ARROW": "Broken arrow",
    "ITEM_BROKEN_GLASS_DIGSITE_LVL_2": "Broken glass",
    "ITEM_BROKEN_STAFF": "Broken staff",
    "ITEM_BUTTONS": "Buttons",
    "ITEM_CERAMIC_REMAINS": "Ceramic remains",
    "ITEM_DAMAGED_ARMOUR_1": "Damaged armour",
    "ITEM_DAMAGED_ARMOUR_2": "Damaged armour",
    "ITEM_NEEDLE": "Needle",
    "ITEM_OLD_BOOT": "Old boot",
    "ITEM_OLD_TOOTH": "Old tooth",
    "ITEM_ROCK_SAMPLE_GREEN": "Rock sample",
    "ITEM_ROCK_SAMPLE_ORANGE": "Rock sample",
    "ITEM_ROCK_SAMPLE_PURPLE": "Rock sample",
    "ITEM_ROTTEN_APPLES": "Rotten apples",
    "ITEM_RUSTY_SWORD": "Rusty sword",
    "ITEM_VASE": "Vase"
};

const missing = [];

for (const [key, name] of Object.entries(digsiteEntities)) {
    let found = false;
    if (key.startsWith('NPC_')) {
        found = npcs.some(n => n.name === name);
    } else {
        found = items.some(i => i.name === name);
    }
    if (!found) {
        missing.push({ key, name });
    }
}

console.log('Missing entities:');
console.log(missing);

for (const entity of missing) {
    if (entity.key.startsWith('NPC_')) {
        npcs.push({
            name: entity.name,
            description: "A placeholder NPC.",
            command: "",
            attack: 1,
            strength: 1,
            hits: 1,
            defense: 1,
            hostility: null,
            animations: [],
            hairColour: null,
            topColour: null,
            bottomColour: null,
            skinColour: null,
            width: 100,
            height: 100,
            walkModel: 0,
            combatModel: 0,
            combatAnimation: 0
        });
        console.log(`Added placeholder for NPC: ${entity.name}`);
    } else {
        items.push({
            name: entity.name,
            description: "A placeholder item.",
            command: "Examine",
            sprite: 0,
            price: 1,
            stackable: false,
            special: false,
            equip: [],
            colour: "rgb(255, 255, 255)",
            untradeable: true,
            members: true
        });
        console.log(`Added placeholder for item: ${entity.name}`);
    }
}

fs.writeFileSync(itemsPath, JSON.stringify(items, null, 4));
fs.writeFileSync(npcsPath, JSON.stringify(npcs, null, 4));

console.log('Appended missing entities to items.json and npcs.json');
