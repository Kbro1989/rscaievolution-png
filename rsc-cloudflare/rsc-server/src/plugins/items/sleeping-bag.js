const { Items } = require('../../constants/ids');

const SLEEPING_BAG_ID = Items.SLEEPING_BAG;

async function onInventoryCommand(player, item) {
    if (item.id !== SLEEPING_BAG_ID) {
        return false;
    }

    player.message('@que@You rest using your sleeping bag...');
    player.fatigue = 0;
    player.sendFatigue();
    player.message('@que@You feel refreshed!');

    return true;
}

module.exports = { onInventoryCommand };
