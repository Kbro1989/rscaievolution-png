/**
 * Spell packet handlers
 */

async function spellSelf({ player }, { spellId }) {
    if (player.locked) {
        return;
    }

    await player.world.callPlugin('onSpellOnSelf', player, spellId);
}

async function spellPlayer({ player }, { targetIndex, spellId }) {
    if (player.locked) {
        return;
    }

    const target = player.world.players.getByIndex(targetIndex);

    if (!target) {
        return;
    }

    // Magic range check (usually 5)
    if (!player.withinRange(target, 5)) {
        player.message("I can't reach that!");
        return;
    }

    await player.world.callPlugin('onSpellOnPlayer', player, target, spellId);
}

async function spellNpc({ player }, { index, id }) {
    if (player.locked) {
        return;
    }

    const npc = player.world.npcs.getByIndex(index);

    if (!npc) {
        return;
    }

    // Don't check range here - shootMagic handles it internally (like ranged combat)
    await player.world.callPlugin('onSpellOnNpc', player, npc, id);
}

async function spellInvItem({ player }, { index, spellId }) {
    if (player.locked) {
        return;
    }

    const item = player.inventory.items[index];

    if (!item) {
        return;
    }

    await player.world.callPlugin('onSpellOnInvItem', player, item, spellId);
}

async function spellGroundItem({ player }, { x, y, id, spellId }) {
    if (player.locked) {
        return;
    }

    const item = player.world.groundItems.getAt(x, y).find(i => i.id === id);

    if (!item) {
        return;
    }

    if (!player.withinRange({ x, y }, 5)) {
        player.message("I can't reach that!");
        return;
    }

    await player.world.callPlugin('onSpellOnGroundItem', player, item, spellId);
}

async function spellObject({ player }, { x, y, spellId }) {
    if (player.locked) {
        return;
    }

    const object = player.world.gameObjects.getObject(x, y);

    if (!object) {
        return;
    }

    if (!player.withinRange(object, 5)) {
        player.message("I can't reach that!");
        return;
    }

    await player.world.callPlugin('onSpellOnObject', player, object, spellId);
}

async function spellDoor({ player }, { x, y, dir, spellId }) {
    if (player.locked) {
        return;
    }

    const object = player.world.wallObjects.getObject(x, y, dir);

    if (!object) {
        return;
    }

    if (!player.withinRange(object, 5)) {
        player.message("I can't reach that!");
        return;
    }

    await player.world.callPlugin('onSpellOnDoor', player, object, spellId);
}

module.exports = {
    spellSelf,
    spellPlayer,
    spellNpc,
    castNPC: spellNpc, // Client sends castNPC for spell on NPC
    spellInvItem,
    spellGroundItem,
    spellObject,
    spellDoor
};

