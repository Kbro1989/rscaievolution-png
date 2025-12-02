

const HERBS = {
    165: { clean: 43, level: 3, xp: 2.5 }, // Guam
    435: { clean: 44, level: 5, xp: 3.8 }, // Marrentill
    436: { clean: 45, level: 11, xp: 5 }, // Tarromin
    437: { clean: 46, level: 20, xp: 6.3 }, // Harralander
    438: { clean: 47, level: 25, xp: 7.5 }, // Ranarr
    439: { clean: 48, level: 40, xp: 8.8 }, // Irit
    440: { clean: 49, level: 48, xp: 10 }, // Avantoe
    441: { clean: 50, level: 54, xp: 11.3 }, // Kwuarm
    442: { clean: 51, level: 65, xp: 12.5 }, // Cadantine
    443: { clean: 52, level: 70, xp: 13.8 }, // Dwarf weed
    933: { clean: 934, level: 75, xp: 15 } // Torstol
};

const UNFINISHED_POTIONS = {
    43: 454, // Guam
    44: 455, // Marrentill
    45: 456, // Tarromin
    46: 457, // Harralander
    47: 458, // Ranarr
    48: 459, // Irit
    49: 460, // Avantoe
    50: 461, // Kwuarm
    51: 462, // Cadantine
    52: 463, // Dwarf weed
    934: 935 // Torstol
};

const FINISHED_POTIONS = {
    // Unfinished ID + Secondary ID -> Result
    454: { 270: { id: 221, level: 3, xp: 25 } }, // Guam + Eye of Newt -> Attack Potion
    455: { 271: { id: 435, level: 5, xp: 37.5 } }, // Marrentill + Unicorn Horn Dust -> Antipoison (Wait, check ID)
    456: { 273: { id: 474, level: 12, xp: 50 } }, // Tarromin + Limpwurt -> Strength Potion
    457: { 220: { id: 477, level: 22, xp: 62.5 } }, // Harralander + Red Spiders' Eggs -> Restore Potion
    458: { 219: { id: 480, level: 30, xp: 75 } }, // Ranarr + Snape Grass -> Prayer Potion
    459: { 270: { id: 483, level: 45, xp: 100 } }, // Irit + Eye of Newt -> Super Attack
    460: { 219: { id: 486, level: 50, xp: 112.5 } }, // Avantoe + Snape Grass -> Fishing Potion (Check recipe)
    461: { 273: { id: 489, level: 55, xp: 125 } }, // Kwuarm + Limpwurt -> Super Strength
    462: { 272: { id: 492, level: 66, xp: 150 } }, // Cadantine + White Berries -> Super Defense
    463: { 249: { id: 495, level: 72, xp: 162.5 } }, // Dwarf Weed + Wine of Zamorak -> Ranging Potion
    935: { 274: { id: 936, level: 78, xp: 175 } } // Torstol + Jangerberries -> Zamorak Brew
};

module.exports = {
    onInvAction: async (player, item, index) => {
        // Identify Herb
        if (HERBS[item.id]) {
            const herb = HERBS[item.id];

            player.sendBubble(item.id);

            if (player.isTired()) {
                player.message('You are too tired to identify this herb');
                return true;
            }

            if (player.skills.herblaw.current < herb.level) {
                player.message(`@que@You need a Herblaw level of ${herb.level} to identify this herb.`);
                return true;
            }

            const { world } = player;

            player.inventory.remove(item.id, 1, index);
            player.message(`@que@You inspect the herb carefully...`);

            await world.sleepTicks(2);

            player.inventory.add(herb.clean, 1, index);
            player.addExperience('herblaw', herb.xp);
            player.message(`@que@You identify the herb as ${player.getItemName(herb.clean)}.`);

            return true;
        }
    },

    onInvUseOnItem: (player, item1, item2) => {
        const v1 = item1.id;
        const v2 = item2.id;

        // Make Unfinished Potion (Herb + Vial of Water)
        let herbId = null;
        let vialIndex = null;
        let herbIndex = null;

        if (v1 === 464 && UNFINISHED_POTIONS[v2]) { // Vial of Water + Herb
            herbId = v2;
            vialIndex = player.inventory.indexOf(item1);
            herbIndex = player.inventory.indexOf(item2);
        } else if (v2 === 464 && UNFINISHED_POTIONS[v1]) { // Herb + Vial of Water
            herbId = v1;
            vialIndex = player.inventory.indexOf(item2);
            herbIndex = player.inventory.indexOf(item1);
        }

        if (herbId) {
            player.inventory.remove(464, 1, vialIndex);
            player.inventory.remove(herbId, 1, herbIndex);
            player.inventory.add(UNFINISHED_POTIONS[herbId], 1);
            player.message('You put the herb into the vial of water.');
            return true;
        }

        // Make Finished Potion (Unfinished + Secondary)
        let unfinishedId = null;
        let secondaryId = null;
        let unfinishedIndex = null;
        let secondaryIndex = null;

        if (FINISHED_POTIONS[v1] && FINISHED_POTIONS[v1][v2]) {
            unfinishedId = v1;
            secondaryId = v2;
            unfinishedIndex = player.inventory.indexOf(item1);
            secondaryIndex = player.inventory.indexOf(item2);
        } else if (FINISHED_POTIONS[v2] && FINISHED_POTIONS[v2][v1]) {
            unfinishedId = v2;
            secondaryId = v1;
            unfinishedIndex = player.inventory.indexOf(item2);
            secondaryIndex = player.inventory.indexOf(item1);
        }

        if (unfinishedId) {
            const potion = FINISHED_POTIONS[unfinishedId][secondaryId];
            if (player.skills.herblaw.current < potion.level) {
                player.message(`You need a Herblaw level of ${potion.level} to make this potion.`);
                return;
            }
            player.inventory.remove(unfinishedId, 1, unfinishedIndex);
            player.inventory.remove(secondaryId, 1, secondaryIndex);
            player.inventory.add(potion.id, 1);
            player.addExperience('herblaw', potion.xp);
            player.message(`You mix the ingredients to make a ${player.getItemName(potion.id)}.`);
            return true;
        }
    }
};
