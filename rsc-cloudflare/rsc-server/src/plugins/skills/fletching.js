const { bows, arrows, darts } = require('@2003scape/rsc-data/skills/fletching');

const KNIFE_ID = 13;
const BOWSTRING_ID = 676;
const FEATHER_ID = 381;

// Log IDs that can be made into bows
const BOW_LOG_IDS = new Set(Object.keys(bows).map(Number));

// Arrow shaft headless IDs -> finished arrow mapping
const ARROW_SHAFTS = new Set(Object.keys(arrows).map(Number));

// Dart tip IDs
const DART_TIPS = new Set(Object.keys(darts).map(Number));

// Build reverse mapping: unstrung bow ID -> log ID and bow type
const UNSTRUNG_TO_LOG = {};
const BOWSTRING_ITEMS = {};

for (const [logId, bowTypes] of Object.entries(bows)) {
    for (const bowType of bowTypes) {
        UNSTRUNG_TO_LOG[bowType.unstrung] = {
            logId: Number(logId),
            ...bowType
        };
        BOWSTRING_ITEMS[bowType.unstrung] = bowType.strung;
    }
}

const UNSTRUNG_BOW_IDS = new Set(Object.keys(UNSTRUNG_TO_LOG).map(Number));

// === Bow Making (Step 1: Knife + Log) ===
async function cutBow(player, log) {
    const bowData = bows[log.id];

    if (!bowData || bowData.length === 0) {
        return false;
    }

    // Show menu for shortbow/longbow
    const options = bowData.map((bow, index) => {
        return `${index === 0 ? 'Shortbow' : 'Longbow'} (level ${bow.level})`;
    });

    const choice = await player.ask(options, true);

    if (choice === -1) {
        return true;
    }

    const selectedBow = bowData[choice];
    const fletchingLevel = player.skills.fletching.current;

    if (fletchingLevel < selectedBow.level) {
        player.message(
            `@que@You need a fletching level of ${selectedBow.level} to make this bow`
        );
        return true;
    }

    // Remove log, create unstrung bow
    const removed = player.inventory.remove(log.id, 1);

    if (!removed) {
        return true;
    }

    player.inventory.add(selectedBow.unstrung, 1);
    player.addExperience('fletching', selectedBow.experience);
    player.message('@que@You carefully cut the wood into shape');

    return true;
}

// === Bow Making (Step 2: Bowstring + Unstrung Bow) ===
async function stringBow(player, bowstring, unstrungBow) {
    const bowData = UNSTRUNG_TO_LOG[unstrungBow.id];

    if (!bowData) {
        return false;
    }

    const fletchingLevel = player.skills.fletching.current;

    if (fletchingLevel < bowData.level) {
        player.message(
            `@que@You need a fletching level of ${bowData.level} to string this bow`
        );
        return true;
    }

    // Remove bowstring and unstrung bow
    if (!player.inventory.remove(bowstring.id, 1)) {
        return true;
    }

    if (!player.inventory.remove(unstrungBow.id, 1)) {
        player.inventory.add(bowstring.id, 1); // Restore bowstring
        return true;
    }

    player.inventory.add(bowData.strung, 1);
    player.addExperience('fletching', bowData.experience);
    player.message('@que@You add a string to the bow');

    return true;
}

// === Arrow Making ===
async function makeArrow(player, headlessShaft, arrowhead) {
    const arrowData = arrows[headlessShaft.id];

    if (!arrowData) {
        return false;
    }

    const fletchingLevel = player.skills.fletching.current;

    if (fletchingLevel < arrowData.level) {
        player.message(
            `@que@You need a fletching level of ${arrowData.level} to make these arrows`
        );
        return true;
    }

    // Remove headless shaft and arrowhead
    if (!player.inventory.remove(headlessShaft.id, 1)) {
        return true;
    }

    if (!player.inventory.remove(arrowhead.id, 1)) {
        player.inventory.add(headlessShaft.id, 1); // Restore shaft
        return true;
    }

    player.inventory.add(arrowData.id, 1);
    player.addExperience('fletching', arrowData.experience);
    player.message('@que@You attach an arrowhead');

    return true;
}

// === Dart Making ===
async function makeDart(player, feather, dartTip) {
    const dartLevel = darts[dartTip.id];

    if (dartLevel === undefined) {
        return false;
    }

    const fletchingLevel = player.skills.fletching.current;

    if (fletchingLevel < dartLevel) {
        player.message(
            `@que@You need a fletching level of ${dartLevel} to make these darts`
        );
        return true;
    }

    // Remove feather and dart tip, create dart
    if (!player.inventory.remove(feather.id, 1)) {
        return true;
    }

    if (!player.inventory.remove(dartTip.id, 1)) {
        player.inventory.add(feather.id, 1); // Restore feather
        return true;
    }

    // Dart item ID = dart tip ID (based on data structure)
    player.inventory.add(dartTip.id, 1);
    player.addExperience('fletching', 12.5); // Base XP for darts
    player.message('@que@You attach a feather to the dart tip');

    return true;
}

// === Main Handler ===
async function onUseWithInventory(player, item1, item2) {
    let toolItem, materialItem;

    // Determine which is the tool and which is the material
    if (item1.id === KNIFE_ID) {
        toolItem = item1;
        materialItem = item2;
    } else if (item2.id === KNIFE_ID) {
        toolItem = item2;
        materialItem = item1;
    } else if (item1.id === BOWSTRING_ID) {
        toolItem = item1;
        materialItem = item2;
    } else if (item2.id === BOWSTRING_ID) {
        toolItem = item2;
        materialItem = item1;
    } else if (item1.id === FEATHER_ID) {
        toolItem = item1;
        materialItem = item2;
    } else if (item2.id === FEATHER_ID) {
        toolItem = item2;
        materialItem = item1;
    } else {
        // Check if it's arrow shaft + arrowhead (both materials)
        if (ARROW_SHAFTS.has(item1.id)) {
            return await makeArrow(player, item1, item2);
        } else if (ARROW_SHAFTS.has(item2.id)) {
            return await makeArrow(player, item2, item1);
        }
        return false;
    }

    // Handle based on tool type
    if (toolItem.id === KNIFE_ID && BOW_LOG_IDS.has(materialItem.id)) {
        return await cutBow(player, materialItem);
    }

    if (toolItem.id === BOWSTRING_ID && UNSTRUNG_BOW_IDS.has(materialItem.id)) {
        return await stringBow(player, toolItem, materialItem);
    }

    if (toolItem.id === FEATHER_ID && DART_TIPS.has(materialItem.id)) {
        return await makeDart(player, toolItem, materialItem);
    }

    return false;
}

module.exports = { onUseWithInventory };
