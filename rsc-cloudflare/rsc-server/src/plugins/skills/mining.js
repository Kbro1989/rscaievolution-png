// https://classic.runescape.wiki/w/Mining

const items = require('@2003scape/rsc-data/config/items');
const { rocks, pickaxes } = require('@2003scape/rsc-data/skills/mining');
const { rollSkillSuccess } = require('../../rolls');

const ROCK_IDS = new Set(Object.keys(rocks).map(Number));

// Sort pickaxes best to worst (in order of best to worst)
// Pickaxes DO have mining level requirements to use in RSC
const PICKAXE_IDS = Object.keys(pickaxes)
    .map(Number)
    .sort((a, b) => {
        if (pickaxes[a] === pickaxes[b]) {
            return 0;
        }

        return pickaxes[a] > pickaxes[b] ? -1 : 1;
    });

async function mineRock(player, gameObject) {
    const rockID = gameObject.id;

    if (!ROCK_IDS.has(rockID)) {
        return false;
    }

    const rock = rocks[rockID];
    const miningLevel = player.skills.mining.current;

    if (rock.level > miningLevel) {
        player.message(
            `You need a mining level of ${rock.level} to mine this rock`
        );

        return true;
    }

    let bestPickaxeID = -1;

    for (const pickaxeID of PICKAXE_IDS) {
        if (player.inventory.has(pickaxeID)) {
            bestPickaxeID = pickaxeID;
            break;
        }
    }

    if (bestPickaxeID === -1) {
        player.message('@que@You need a pickaxe to mine this rock');
        return true;
    }

    if (player.isTired()) {
        player.message('@que@You are too tired to mine this rock');
        return true;
    }

    const { world } = player;
    const { x, y } = gameObject;
    const pickaxeName = items[bestPickaxeID].name.toLowerCase();

    player.message(`@que@You swing your ${pickaxeName} at the rock...`);
    player.sendBubble(bestPickaxeID);
    player.sendSound('mine');

    await world.sleepTicks(3);

    const oreSuccess = rollSkillSuccess(
        rock.roll[0] * pickaxes[bestPickaxeID],
        rock.roll[1] * pickaxes[bestPickaxeID],
        miningLevel
    );

    if (world.gameObjects.getAtPoint(x, y)[0] === gameObject && oreSuccess) {
        // Deplete rock if it has an empty state
        if (rock.empty) {
            const emptyRock = world.replaceEntity(
                'gameObjects',
                gameObject,
                rock.empty
            );

            world.setTimeout(() => {
                world.replaceEntity('gameObjects', emptyRock, rockID);
            }, rock.respawn);
        }

        player.addExperience('mining', rock.experience);
        player.message('@que@You manage to obtain some ore');
        player.inventory.add(rock.ore);
    } else {
        player.message('@que@You fail to mine the rock');
    }

    return true;
}

async function prospectRock(player, gameObject) {
    const rockID = gameObject.id;

    if (!ROCK_IDS.has(rockID)) {
        return false;
    }

    const rock = rocks[rockID];

    player.message('@que@You examine the rock for ores...');
    await player.world.sleepTicks(2);

    const oreName = items[rock.ore].name.toLowerCase();
    player.message(`@que@This rock contains ${oreName}`);

    return true;
}

async function onGameObjectCommandOne(player, gameObject) {
    if (!/mine/i.test(gameObject.definition.commands[0])) {
        return false;
    }

    return await mineRock(player, gameObject);
}

async function onGameObjectCommandTwo(player, gameObject) {
    if (!/prospect/i.test(gameObject.definition.commands[1])) {
        return false;
    }

    return await prospectRock(player, gameObject);
}

module.exports = { onGameObjectCommandOne, onGameObjectCommandTwo };
