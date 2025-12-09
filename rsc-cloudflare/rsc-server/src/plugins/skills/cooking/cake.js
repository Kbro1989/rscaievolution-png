// https://classic.runescape.wiki/w/Cake

const { Items } = require('../../../constants/ids');

const CAKE_TIN_ID = Items.CAKE_TIN;
const EGG_ID = Items.EGG;
const FLOUR_ID = Items.FLOUR_136;
const MILK_ID = Items.MILK;
const POT_ID = Items.POT;
const UNCOOKED_CAKE_ID = Items.UNCOOKED_CAKE;

const INGREDIENT_IDS = new Set([FLOUR_ID, EGG_ID, MILK_ID]);

async function onUseWithInventory(player, item, target) {
    if (
        (item.id !== CAKE_TIN_ID || !INGREDIENT_IDS.has(target.id)) &&
        (!INGREDIENT_IDS.has(item.id) || target.id !== CAKE_TIN_ID)
    ) {
        return false;
    }

    const cookingLevel = player.skills.cooking.current;

    if (cookingLevel < 40) {
        player.message('You need level 40 cooking to do this');
    } else if (!player.inventory.has(EGG_ID)) {
        player.message('@que@I also need an egg to make a cake');
    } else if (!player.inventory.has(MILK_ID)) {
        player.message('@que@I also need some milk to make a cake');
    } else if (!player.inventory.has(FLOUR_ID)) {
        player.message('@que@I also need some flour to make a cake');
    } else {
        for (const ingredientID of INGREDIENT_IDS) {
            player.inventory.remove(ingredientID);
        }

        player.inventory.add(POT_ID);
        player.inventory.add(UNCOOKED_CAKE_ID);

        player.message(
            '@que@You mix some milk, flour, and egg together into a cake ' +
            'mixture'
        );
    }

    return true;
}

module.exports = { onUseWithInventory };
