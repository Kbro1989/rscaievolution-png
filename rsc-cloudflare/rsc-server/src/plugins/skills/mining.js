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
        if (pickaxes[a].attempts === pickaxes[b].attempts) {
            return 0;
        }

        return pickaxes[a].attempts > pickaxes[b].attempts ? -1 : 1;
    });

async function mineRock(player, gameObject) {
    const rockID = gameObject.id;

    if (!ROCK_IDS.has(rockID)) {
        player.message(`@que@Debug: Rock ID ${rockID} not defined in mining skill.`);
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
    let bestPickaxeDef = null;

    for (const pickaxeID of PICKAXE_IDS) {
        const def = pickaxes[pickaxeID];
        if (player.inventory.has(pickaxeID) && miningLevel >= def.level) {
            bestPickaxeID = pickaxeID;
            bestPickaxeDef = def;
            break;
        }
    }

    if (bestPickaxeID === -1) {
        // Check if they have a pickaxe they can't use
        let hasPickaxe = false;
        let reqLevel = 0;
        for (const pickaxeID of PICKAXE_IDS) {
            if (player.inventory.has(pickaxeID)) {
                hasPickaxe = true;
                reqLevel = pickaxes[pickaxeID].level;
                break;
            }
        }

        // Re-check for specific message
        const ownedPickaxes = PICKAXE_IDS.filter(id => player.inventory.has(id));

        if (ownedPickaxes.length > 0) {
            // They have pickaxes, but none they can use.
            // The best one they have is the first one in ownedPickaxes (since sorted).
            const bestOwned = ownedPickaxes[0];
            const levelNeeded = pickaxes[bestOwned].level;
            player.message(`You need a mining level of ${levelNeeded} to use this pickaxe`);
        } else {
            player.message('@que@You need a pickaxe to mine this rock');
        }
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

    let rollLow = 128;
    let rollHigh = 256;

    if (rock.roll) {
        rollLow = rock.roll[0];
        rollHigh = rock.roll[1];
    } else {
        console.warn(`Rock ${rockID} missing roll data, using default [${rollLow}, ${rollHigh}]`);
    }

    console.log(`Mining: Level=${miningLevel} Rock=${rockID} Pickaxe=${bestPickaxeID} Attempts=${bestPickaxeDef.attempts} Roll=[${rollLow}, ${rollHigh}]`);

    const oreSuccess = rollSkillSuccess(
        rollLow * bestPickaxeDef.attempts,
        rollHigh * bestPickaxeDef.attempts,
        miningLevel
    );

    console.log(`Mining: Success=${oreSuccess}`);

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
        player.message(`@que@Debug: Rock ID ${rockID} not defined in mining skill.`);
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
