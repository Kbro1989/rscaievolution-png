// https://classic.runescape.wiki/w/Drinks

const BEER_GLASS_ID = 620;
const JUG_ID = 140;

const DRINK_EFFECTS = {
    // https://classic.runescape.wiki/w/Wine
    142: async (player, item) => {
        player.sendBubble(item.id);

        player.skills.attack.current = Math.max(
            0,
            player.skills.attack.base - 3
        );

        player.skills.hits.current = Math.min(
            player.skills.hits.current + 11,
            player.skills.hits.base
        );

        player.sendStats();

        player.inventory.add(JUG_ID);

        player.message('@que@You drink the wine');
        player.message('@que@It makes you feel a bit dizzy');
    },

    // https://classic.runescape.wiki/w/Beer
    193: async (player, item) => {
        player.sendBubble(item.id);

        player.skills.attack.current = Math.max(
            0,
            Math.floor(player.skills.attack.current * 0.94) - 1
        );

        const maxStrength = Math.floor(player.skills.strength.base * 1.02) + 1;

        if (player.skills.strength.current < maxStrength) {
            player.skills.strength.current = maxStrength;
        }

        player.skills.hits.current = Math.min(
            player.skills.hits.current + 1,
            player.skills.hits.base
        );

        player.sendStats();

        player.inventory.add(BEER_GLASS_ID);

        player.message('@que@You drink the beer');
        player.message('@que@You feel slightly reinvigorated');
        player.message('@que@And slightly dizzy too');
    },

    // https://classic.runescape.wiki/w/Asgarnian_Ale
    267: async (player, item) => {
        const { world } = player;

        player.sendBubble(item.id);
        player.message('@que@You drink the Ale');
        player.inventory.add(BEER_GLASS_ID);

        await world.sleepTicks(2);

        player.skills.attack.current = Math.max(
            0,
            player.skills.attack.current - 4
        );

        const maxStrength = player.skills.strength.base + 2;

        if (player.skills.strength.current < maxStrength) {
            player.skills.strength.current = maxStrength;
        }

        player.skills.hits.current = Math.min(
            player.skills.hits.current + 2,
            player.skills.hits.base
        );

        player.sendStats();

        player.message(
            '@que@You feel slightly reinvigorated',
            '@que@And slightly dizzy too'
        );
    },

    // https://classic.runescape.wiki/w/Wizard%27s_Mind_Bomb
    268: async (player, item) => {
        const { world } = player;

        player.sendBubble(item.id);
        player.message("@que@you drink the Wizard's Mind Bomb");
        player.inventory.add(BEER_GLASS_ID);

        await world.sleepTicks(2);

        for (const skillName of ['attack', 'strength', 'defense']) {
            player.skills[skillName].current = Math.min(
                0,
                player.skills[skillName].current - 2
            );
        }

        player.skills.magic.current =
            player.skills.magic.base +
            2 +
            (player.skills.magic.base >= 50 ? 1 : 0);

        player.sendStats();
        player.message('@que@You feel very strange');
    },

    // https://classic.runescape.wiki/w/Dwarven_Stout
    269: async (player, item) => {
        const { world } = player;

        player.sendBubble(item.id);

        player.message(
            '@que@You drink the Dwarven Stout',
            '@que@It tastes foul'
        );

        player.inventory.add(BEER_GLASS_ID);

        await world.sleepTicks(3);

        for (const skillName of ['attack', 'strength', 'defense']) {
            player.skills[skillName].current = Math.min(
                0,
                player.skills[skillName].current - 2
            );
        }

        player.skills.mining.current = player.skills.mining.base + 1;
        player.skills.smithing.current = player.skills.smithing.base + 1;

        player.skills.hits.current = Math.min(
            player.skills.hits.current + 1,
            player.skills.hits.base
        );

        player.sendStats();
        player.message('@que@It tastes pretty strong too');
    },

    // Attack Potion (3/2/1 dose) - Boosts attack by 10% + 3
    1287: async (player, item) => {
        player.sendBubble(item.id);
        const boost = Math.floor(player.skills.attack.base * 0.10) + 3;
        player.skills.attack.current = Math.min(player.skills.attack.base + boost, player.skills.attack.base + boost);
        player.sendStats();
        player.inventory.add(1288); // 2 dose
        player.message('@que@You drink the attack potion');
        player.message('@que@You feel your attack increase');
    },
    1288: async (player, item) => {
        player.sendBubble(item.id);
        const boost = Math.floor(player.skills.attack.base * 0.10) + 3;
        player.skills.attack.current = Math.min(player.skills.attack.base + boost, player.skills.attack.base + boost);
        player.sendStats();
        player.inventory.add(1289); // 1 dose
        player.message('@que@You drink the attack potion');
        player.message('@que@You feel your attack increase');
    },
    1289: async (player, item) => {
        player.sendBubble(item.id);
        const boost = Math.floor(player.skills.attack.base * 0.10) + 3;
        player.skills.attack.current = Math.min(player.skills.attack.base + boost, player.skills.attack.base + boost);
        player.sendStats();
        player.inventory.add(465); // Empty vial
        player.message('@que@You drink the attack potion');
        player.message('@que@You feel your attack increase');
    },

    // Cure poison Potion (3/2/1 dose) - Cures poison
    1290: async (player, item) => {
        player.sendBubble(item.id);
        if (player.isPoisoned) player.isPoisoned = false;
        player.inventory.add(1291); // 2 dose
        player.message('@que@You drink the cure poison potion');
        player.message('@que@You have been cured of poison');
    },
    1291: async (player, item) => {
        player.sendBubble(item.id);
        if (player.isPoisoned) player.isPoisoned = false;
        player.inventory.add(1292); // 1 dose
        player.message('@que@You drink the cure poison potion');
        player.message('@que@You have been cured of poison');
    },
    1292: async (player, item) => {
        player.sendBubble(item.id);
        if (player.isPoisoned) player.isPoisoned = false;
        player.inventory.add(465); // Empty vial
        player.message('@que@You drink the cure poison potion');
        player.message('@que@You have been cured of poison');
    },

    // Strength Potion (3/2/1 dose) - Boosts strength by 10% + 3
    1293: async (player, item) => {
        player.sendBubble(item.id);
        const boost = Math.floor(player.skills.strength.base * 0.10) + 3;
        player.skills.strength.current = Math.min(player.skills.strength.base + boost, player.skills.strength.base + boost);
        player.sendStats();
        player.inventory.add(1294); // 2 dose
        player.message('@que@You drink the strength potion');
        player.message('@que@You feel your strength increase');
    },
    1294: async (player, item) => {
        player.sendBubble(item.id);
        const boost = Math.floor(player.skills.strength.base * 0.10) + 3;
        player.skills.strength.current = Math.min(player.skills.strength.base + boost, player.skills.strength.base + boost);
        player.sendStats();
        player.inventory.add(1295); // 1 dose
        player.message('@que@You drink the strength potion');
        player.message('@que@You feel your strength increase');
    },
    1295: async (player, item) => {
        player.sendBubble(item.id);
        const boost = Math.floor(player.skills.strength.base * 0.10) + 3;
        player.skills.strength.current = Math.min(player.skills.strength.base + boost, player.skills.strength.base + boost);
        player.sendStats();
        player.inventory.add(465); // Empty vial
        player.message('@que@You drink the strength potion');
        player.message('@que@You feel your strength increase');
    },

    // Defense Potion (3/2/1 dose) - Boosts defense by 10% + 3
    1296: async (player, item) => {
        player.sendBubble(item.id);
        const boost = Math.floor(player.skills.defense.base * 0.10) + 3;
        player.skills.defense.current = Math.min(player.skills.defense.base + boost, player.skills.defense.base + boost);
        player.sendStats();
        player.inventory.add(1297); // 2 dose
        player.message('@que@You drink the defense potion');
        player.message('@que@You feel your defense increase');
    },
    1297: async (player, item) => {
        player.sendBubble(item.id);
        const boost = Math.floor(player.skills.defense.base * 0.10) + 3;
        player.skills.defense.current = Math.min(player.skills.defense.base + boost, player.skills.defense.base + boost);
        player.sendStats();
        player.inventory.add(1298); // 1 dose
        player.message('@que@You drink the defense potion');
        player.message('@que@You feel your defense increase');
    },
    1298: async (player, item) => {
        player.sendBubble(item.id);
        const boost = Math.floor(player.skills.defense.base * 0.10) + 3;
        player.skills.defense.current = Math.min(player.skills.defense.base + boost, player.skills.defense.base + boost);
        player.sendStats();
        player.inventory.add(465); // Empty vial
        player.message('@que@You drink the defense potion');
        player.message('@que@You feel your defense increase');
    },

    // Restore prayer Potion (3/2/1 dose) - Restores prayer by (L * 0.25 + 7)
    1299: async (player, item) => {
        player.sendBubble(item.id);
        const restore = Math.floor(player.skills.prayer.base * 0.25) + 7;
        player.skills.prayer.current = Math.min(player.skills.prayer.current + restore, player.skills.prayer.base);
        player.sendStats();
        player.inventory.add(1300); // 2 dose
        player.message('@que@You drink the restore prayer potion');
        player.message('@que@You feel your prayer restore');
    },
    1300: async (player, item) => {
        player.sendBubble(item.id);
        const restore = Math.floor(player.skills.prayer.base * 0.25) + 7;
        player.skills.prayer.current = Math.min(player.skills.prayer.current + restore, player.skills.prayer.base);
        player.sendStats();
        player.inventory.add(1301); // 1 dose
        player.message('@que@You drink the restore prayer potion');
        player.message('@que@You feel your prayer restore');
    },
    1301: async (player, item) => {
        player.sendBubble(item.id);
        const restore = Math.floor(player.skills.prayer.base * 0.25) + 7;
        player.skills.prayer.current = Math.min(player.skills.prayer.current + restore, player.skills.prayer.base);
        player.sendStats();
        player.inventory.add(465); // Empty vial
        player.message('@que@You drink the restore prayer potion');
        player.message('@que@You feel your prayer restore');
    }
};

async function onInventoryCommand(player, item) {
    if (!DRINK_EFFECTS.hasOwnProperty(item.id)) {
        return false;
    }

    player.inventory.remove(item.id);
    await DRINK_EFFECTS[item.id](player, item);

    return true;
}

module.exports = { onInventoryCommand };
