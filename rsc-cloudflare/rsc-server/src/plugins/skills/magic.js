const spells = require('@2003scape/rsc-data/config/spells.json');
const { items } = require('@2003scape/rsc-data/items');

const TELEPORTS = {
    'Varrock teleport': { x: 122, y: 503 },
    'Lumbridge teleport': { x: 120, y: 648 },
    'Falador teleport': { x: 313, y: 550 },
    'Camelot teleport': { x: 465, y: 456 },
    'Ardougne teleport': { x: 585, y: 621 },
    'Watchtower teleport': { x: 493, y: 3523 }
};

// XP Table for common spells (if not in JSON)
const SPELL_XP = {
    'Wind strike': 5.5,
    'Confuse': 13,
    'Water strike': 7.5,
    'Enchant lvl-1 amulet': 17.5,
    'Earth strike': 9.5,
    'Weaken': 21,
    'Fire strike': 11.5,
    'Bones to bananas': 25,
    'Wind bolt': 13.5,
    'Curse': 29,
    'Low level alchemy': 31,
    'Water bolt': 16.5,
    'Varrock teleport': 35,
    'Enchant lvl-2 amulet': 37,
    'Earth bolt': 19.5,
    'Lumbridge teleport': 41,
    'Telekinetic grab': 43,
    'Fire bolt': 22.5,
    'Falador teleport': 47,
    'Crumble undead': 24.5,
    'High level alchemy': 65,
    'Camelot teleport': 55.5,
    'Ardougne teleport': 61,
    'Watchtower teleport': 68,
    'Wind blast': 34.5,
    'Water blast': 39.5,
    'Earth blast': 44.5,
    'Fire blast': 50.5,
    'Wind wave': 60,
    'Water wave': 65,
    'Earth wave': 70,
    'Fire wave': 75
};

const SPELL_MAX_HITS = {
    'Wind strike': 2,
    'Water strike': 4,
    'Earth strike': 6,
    'Fire strike': 8,
    'Wind bolt': 9,
    'Water bolt': 10,
    'Earth bolt': 11,
    'Fire bolt': 12,
    'Wind blast': 13,
    'Water blast': 14,
    'Earth blast': 15,
    'Fire blast': 16,
    'Wind wave': 17,
    'Water wave': 18,
    'Earth wave': 19,
    'Fire wave': 20
};

const ENCHANT_MAP = {
    'Enchant lvl-1 amulet': { src: 301, dest: 314, xp: 17.5 },
    'Enchant lvl-2 amulet': { src: 302, dest: 315, xp: 37 },
    'Enchant lvl-3 amulet': { src: 303, dest: 316, xp: 59 },
    'Enchant lvl-4 amulet': { src: 304, dest: 317, xp: 67 }
    // 'Enchant lvl-5 amulet': { src: 305, dest: 597, xp: 78 } // Dragonstone -> Glory (Need to verify ID)
};

module.exports = (api) => {
    const checkAndRemoveRunes = (player, spell) => {
        // Check if player has runes
        for (const rune of spell.runes) {
            let hasStaff = false;
            const weapon = player.inventory.getWieldedWeapon();

            if (weapon) {
                // Fire staff (615), Water staff (616), Air staff (617), Earth staff (618)
                if (rune.id === 31 && weapon.id === 615) hasStaff = true;
                if (rune.id === 32 && weapon.id === 616) hasStaff = true;
                if (rune.id === 33 && weapon.id === 617) hasStaff = true;
                if (rune.id === 34 && weapon.id === 618) hasStaff = true;
            }

            if (!hasStaff) {
                if (!player.inventory.contains(rune.id, rune.amount)) {
                    // Get rune name
                    const runeName = items[rune.id] ? items[rune.id].name : 'rune';
                    player.message(`You do not have enough ${runeName}s to cast this spell.`);
                    return false;
                }
            }
        }

        // Remove runes
        for (const rune of spell.runes) {
            let hasStaff = false;
            const weapon = player.inventory.getWieldedWeapon();

            if (weapon) {
                if (rune.id === 31 && weapon.id === 615) hasStaff = true;
                if (rune.id === 32 && weapon.id === 616) hasStaff = true;
                if (rune.id === 33 && weapon.id === 617) hasStaff = true;
                if (rune.id === 34 && weapon.id === 618) hasStaff = true;
            }

            if (!hasStaff) {
                player.inventory.remove(rune.id, rune.amount);
            }
        }

        return true;
    };

    api.onSpellOnSelf((player, spellId) => {
        const spell = spells[spellId];
        if (!spell) return;

        if (player.skills.magic.current < spell.level) {
            player.message(`You need a magic level of ${spell.level} to cast this spell.`);
            return;
        }

        if (!checkAndRemoveRunes(player, spell)) return;

        player.message('You cast the spell...');

        if (TELEPORTS[spell.name]) {
            const dest = TELEPORTS[spell.name];
            player.teleport(dest.x, dest.y);
        } else if (spell.name === 'Bones to bananas') {
            let count = 0;
            // Iterate backwards to safely remove
            for (let i = player.inventory.items.length - 1; i >= 0; i--) {
                const item = player.inventory.items[i];
                if (item.id === 20) { // Bones
                    player.inventory.remove(20, 1);
                    player.inventory.add(249, 1); // Banana
                    count++;
                }
            }
            if (count > 0) {
                player.message('You convert your bones into bananas!');
            } else {
                player.message("You aren't holding any bones!");
            }
        }

        const xp = SPELL_XP[spell.name] || 0;
        if (xp) player.addExperience('magic', xp);
    });

    api.onSpellOnInvItem((player, item, spellId) => {
        const spell = spells[spellId];
        if (!spell) return;

        if (player.skills.magic.current < spell.level) {
            player.message(`You need a magic level of ${spell.level} to cast this spell.`);
            return;
        }

        if (spell.name.includes('alchemy')) {
            if (item.id === 10) { // Coins
                player.message("You can't cast alchemy on gold!");
                return;
            }

            if (!checkAndRemoveRunes(player, spell)) return;

            const isHigh = spell.name.includes('High');
            const value = item.definition.price || 1;

            if (player.skills.magic.current < spell.level) {
                player.message(`You need a magic level of ${spell.level} to cast this spell.`);
                return;
            }

            if (!checkAndRemoveRunes(player, spell)) return;

            if (!player.withinRange(npc, 5)) {
                player.message("I can't reach that!");
                return;
            }

            const maxHit = SPELL_MAX_HITS[spell.name] || 0;
            // Simple damage roll: 0 to maxHit
            // In real RSC, magic accuracy depends on magic level vs opponent magic defense.
            // For now, we'll use a simplified hit chance.

            let damage = 0;
            // 70% chance to hit for now (should use combat formula)
            if (Math.random() < 0.7) {
                damage = Math.floor(Math.random() * (maxHit + 1));
            }

            npc.damage(damage, player);
            player.message(`You cast ${spell.name} on the ${npc.definition.name}`);

            // XP: Base + 2 * Damage
            let xp = SPELL_XP[spell.name] || 0;
            if (spell.type === 'offensive') {
                xp += damage * 2;
            }

            player.addExperience('magic', xp);

            // NPC Retaliation
            if (!npc.opponent && !npc.chasing) {
                npc.attack(player);
            }
        });
};
