const items = require('@2003scape/rsc-data/config/items');
const { rocks, pickaxes } = require('@2003scape/rsc-data/skills/mining');
const { rollSkillSuccess } = require('../../rolls');

const ROCK_IDS = new Set(Object.keys(rocks).map(Number));

// Sort pickaxes best to worst
const PICKAXE_IDS = Object.keys(pickaxes)
    .map(Number)
    .sort((a, b) => (pickaxes[a] > pickaxes[b] ? -1 : 1));

async function onGameObjectCommand(player, gameObject, command) {
    if (!ROCK_IDS.has(gameObject.id)) {
        return false;
    }

    if (command === 'prospect') {
        await prospectRock(player, gameObject);
        return true;
    }

    if (command === 'mine') {
        await mineRock(player, gameObject);
        return true;
    }

    return false;
}

async function prospectRock(player, gameObject) {
    const rock = rocks[gameObject.id];
    player.message('@que@You examine the rock for ores...');
    await player.world.sleepTicks(2);
    
    const oreName = items[rock.ore].name.toLowerCase();
    player.message(`@que@This rock contains ${oreName}`);
    
    if (rock.level > player.skills.mining.current) {
        // Optional: hint about level requirement?
    }
}

async function mineRock(player, gameObject) {
    const rock = rocks[gameObject.id];
    const miningLevel = player.skills.mining.current;

    if (rock.level > miningLevel) {
        player.message(
            `@que@You need a mining level of ${rock.level} to mine this rock`
        );
        return;
    }

    let bestPickaxeID = -1;
    for (const pickID of PICKAXE_IDS) {
        if (player.inventory.has(pickID)) {
            // Check if player has level for this pickaxe (RSC didn't have pickaxe reqs, but good to check if data exists)
            // Assuming no reqs for now as per RSC wiki
            bestPickaxeID = pickID;
            break;
        }
    }

    if (bestPickaxeID === -1) {
        player.message('@que@You need a pickaxe to mine this rock');
        return;
    }

    if (player.isTired()) {
        player.message('@que@You are too tired to mine this rock');
        return;
    }

    player.message('@que@You swing your pick at the rock...');
    player.sendBubble(bestPickaxeID);
    player.sendSound('chisel'); // Best approximation if 'mine' sound doesn't exist

    await player.world.sleepTicks(3);

    // Verify rock is still there
    if (player.world.gameObjects.getAtPoint(gameObject.x, gameObject.y)[0] !== gameObject) {
        return;
    }

    const success = rollSkillSuccess(
        rock.roll ? rock.roll[0] * pickaxes[bestPickaxeID] : 100, // Fallback if roll missing
        rock.roll ? rock.roll[1] * pickaxes[bestPickaxeID] : 100,
        miningLevel
    );

    if (success) {
        player.addExperience('mining', rock.experience);
        player.inventory.add(rock.ore);
        player.message('@que@You manage to obtain some ore');
        player.sendSound('foundgem'); // Or similar success sound

        // Deplete rock
        if (rock.empty) {
            const emptyRock = player.world.replaceEntity(
                'gameObjects',
                gameObject,
                rock.empty
            );

            player.world.setTimeout(() => {
                player.world.replaceEntity('gameObjects', emptyRock, gameObject.id);
            }, rock.respawn || 5000); // Default 5s respawn
        }
    } else {
        player.message('@que@You fail to mine the rock');
    }
}

module.exports = { onGameObjectCommand };
