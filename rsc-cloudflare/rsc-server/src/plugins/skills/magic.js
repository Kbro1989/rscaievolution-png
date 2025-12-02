const spells = require('@2003scape/rsc-data/config/spells.json');
const items = require('@2003scape/rsc-data/config/items');

// Teleport destinations
const TELEPORTS = {
    'Varrock teleport': { x: 122, y: 503, xp: 35 },
    'Lumbridge teleport': { x: 120, y: 648, xp: 41 },
    'Falador teleport': { x: 313, y: 550, xp: 47 },
    'Camelot teleport': { x: 465, y: 456, xp: 55.5 },
    'Ardougne teleport': { x: 585, y: 621, xp: 61 },
    'Watchtower teleport': { x: 493, y: 3523, xp: 68 }
};

// Combat spell max hits (authentic RSC)
const COMBAT_SPELLS = {
    'Wind strike': { maxHit: 2, xp: 5.5 },
    'Water strike': { maxHit: 4, xp: 7.5 },
    'Earth strike': { maxHit: 6, xp: 9.5 },
    'Fire strike': { maxHit: 8, xp: 11.5 },
    'Wind bolt': { maxHit: 9, xp: 13.5 },
    'Water bolt': { maxHit: 10, xp: 16.5 },
    'Earth bolt': { maxHit: 11, xp: 19.5 },
    'Fire bolt': { maxHit: 12, xp: 22.5 },
    'Wind blast': { maxHit: 13, xp: 34.5 },
    'Water blast': { maxHit: 14, xp: 39.5 },
    'Earth blast': { maxHit: 15, xp: 44.5 },
    'Fire blast': { maxHit: 16, xp: 50.5 },
    'Wind wave': { maxHit: 17, xp: 60 },
    'Water wave': { maxHit: 18, xp: 65 },
    'Earth wave': { maxHit: 19, xp: 70 },
    'Fire wave': { maxHit: 20, xp: 75 }
};

// Enchant amulet mappings (src = unenchanted, dest = enchanted)
const ENCHANT_AMULETS = {
    'Enchant lvl-1 amulet': { src: 301, dest: 314, xp: 17.5 }, // Sapphire -> Magic
    'Enchant lvl-2 amulet': { src: 302, dest: 315, xp: 37 },   // Emerald -> Defense
    'Enchant lvl-3 amulet': { src: 303, dest: 316, xp: 59 },   // Ruby -> Strength
    'Enchant lvl-4 amulet': { src: 304, dest: 317, xp: 67 }    // Diamond -> Power
    // Dragonstone (305 -> 597) requires completion of "Heroes' Quest"
};

module.exports = (api) => {
    // Helper: Check and remove runes (accounts for elemental staves)
    const checkAndRemoveRunes = (player, spell) => {
        const staffRunes = {
            615: 31, // Fire staff -> Fire runes
            616: 32, // Water staff -> Water runes
            617: 33, // Air staff -> Air runes
            618: 34  // Earth staff -> Earth runes
        };

        const weapon = player.inventory.getWieldedWeapon();
        const staffReplacesRune = weapon ? staffRunes[weapon.id] : null;

        // Check runes
        for (const rune of spell.runes) {
            if (rune.id === staffReplacesRune) continue; // Staff provides infinite

            if (!player.inventory.contains(rune.id, rune.amount)) {
                const runeName = items[rune.id]?.name || 'rune';
                player.message(`@que@You do not have enough ${runeName}s to cast this spell.`);
                return false;
            }
        }

        // Remove runes
        for (const rune of spell.runes) {
            if (rune.id === staffReplacesRune) continue;
            player.inventory.remove(rune.id, rune.amount);
        }

        return true;
    };

    // ===== SPELL ON SELF (Teleports, Bones to Bananas) =====
    api.onSpellOnSelf((player, spellId) => {
        const spell = spells[spellId];
        if (!spell) return;

        if (player.skills.magic.current < spell.level) {
            player.message(`@que@You need a magic level of ${spell.level} to cast this spell.`);
            return;
        }

        if (!checkAndRemoveRunes(player, spell)) return;

        // Teleports
        if (TELEPORTS[spell.name]) {
            const dest = TELEPORTS[spell.name];
            player.teleport(dest.x, dest.y);
            player.message('@que@You teleport away!');
            player.addExperience('magic', dest.xp);
            return;
        }

        // Bones to Bananas
        if (spell.name === 'Bones to bananas') {
            let count = 0;
            for (let i = player.inventory.items.length - 1; i >= 0; i--) {
                const item = player.inventory.items[i];
                if (item.id === 20) { // Bones
                    player.inventory.remove(20, 1);
                    player.inventory.add(249, 1); // Banana
                    count++;
                }
            }
            if (count > 0) {
                player.message('@que@You convert your bones into bananas!');
                player.addExperience('magic', 25);
            } else {
                player.message("@que@You aren't holding any bones!");
            }
        }
    });

    // ===== SPELL ON INVENTORY ITEM (Alchemy, Enchanting) =====
    api.onSpellOnInvItem((player, item, spellId) => {
        const spell = spells[spellId];
        if (!spell) return;

        if (player.skills.magic.current < spell.level) {
            player.message(`@que@You need a magic level of ${spell.level} to cast this spell.`);
            return;
        }

        // === ALCHEMY ===
        if (spell.name.includes('alchemy')) {
            if (item.id === 10) {
                player.message("@que@You can't cast alchemy on gold!");
                return;
            }

            if (!checkAndRemoveRunes(player, spell)) return;

            const isHigh = spell.name.includes('High');
            const baseValue = item.definition.price || 1;
            const goldAmount = isHigh
                ? Math.floor(baseValue * 1.0)  // High = 100% (some items 150%)
                : Math.floor(baseValue * 0.6); // Low = 60%

            player.inventory.remove(item.id, 1);
            player.inventory.add(10, goldAmount); // Coins

            player.message(`@que@You convert the ${item.definition.name} into ${goldAmount} gold.`);
            player.addExperience('magic', isHigh ? 65 : 31);
            return;
        }

        // === ENCHANTING ==
        if (spell.name.includes('Enchant') && ENCHANT_AMULETS[spell.name]) {
            const enchant = ENCHANT_AMULETS[spell.name];

            if (item.id !== enchant.src) {
                player.message('@que@This spell cannot be cast on this item.');
                return;
            }

            if (!checkAndRemoveRunes(player, spell)) return;

            player.inventory.remove(enchant.src, 1);
            player.inventory.add(enchant.dest, 1);

            player.message('@que@You successfully enchant the amulet.');
            player.addExperience('magic', enchant.xp);
        }
    });

    // ===== SPELL ON NPC (Curse Spells) =====
    api.onSpellOnNPC((player, npc, spellId) => {
        const spell = spells[spellId];
        if (!spell) return;

        if (player.skills.magic.current < spell.level) {
            player.message(`@que@You need a magic level of ${spell.level} to cast this spell.`);
            return;
        }

        if (!player.withinRange(npc, 5)) {
            player.message("@que@I can't reach that!");
            return;
        }

        // === COMBAT SPELLS ===
        if (COMBAT_SPELLS[spell.name]) {
            player.autocastSpellId = spellId;
            player.shootMagic(npc, spellId);
            return;
        }

        if (!checkAndRemoveRunes(player, spell)) return;

        // === CURSE SPELLS (Don't work in PvP) ===
        const curseSpells = ['Confuse', 'Weaken', 'Curse', 'Vulnerability', 'Enfeeble', 'Stun'];
        if (curseSpells.includes(spell.name)) {
            player.message(`@que@You cast ${spell.name} on the ${npc.definition.name}`);
            // TODO: Implement stat reduction effect
            const xpMap = {
                'Confuse': 13,
                'Weaken': 21,
                'Curse': 29,
                'Vulnerability': 76,
                'Enfeeble': 83,
                'Stun': 90
            };
            player.addExperience('magic', xpMap[spell.name] || 0);
        }
    });

    // ===== SPELL ON GROUND ITEM (Telekinetic Grab) =====
    api.onSpellOnGroundItem((player, groundItem, spellId) => {
        const spell = spells[spellId];
        if (!spell) return;

        if (spell.name === 'Telekinetic grab') {
            if (player.skills.magic.current < spell.level) {
                player.message(`@que@You need a magic level of ${spell.level} to cast this spell.`);
                return;
            }

            if (!player.withinRange(groundItem, 5)) {
                player.message("@que@I can't reach that!");
                return;
            }

            if (!checkAndRemoveRunes(player, spell)) return;

            // Pick up the item
            if (player.inventory.add(groundItem.id, groundItem.amount)) {
                player.world.groundItems.remove(groundItem);
                player.message('@que@You grab the item with magic!');
                player.addExperience('magic', 43);
            } else {
                player.message("@que@You don't have enough inventory space.");
            }
        }
    });
};
