const { Items, Npcs } = require('../../../constants/ids');

const SURVIVAL_EXPERT = Npcs.SURVIVAL_EXPERT;

async function onTalkToNPC(player, npc) {
    if (npc.id !== SURVIVAL_EXPERT) {
        return false;
    }

    player.engage(npc);

    try {
        const tutorialStage = player.cache.tutorial || 0;

        if (tutorialStage < 10) {
            await npc.say("You should speak to the guide first");
            return true;
        }

        if (tutorialStage >= 15) {
            await npc.say("You've already learned the basics of survival",
                "Continue to the combat instructor");
            return true;
        }

        await npc.say(
            "Hello there, newcomer",
            "My job is to teach you the basics of survival",
            "You're going to need a few tools to survive out here"
        );

        if (!player.inventory.has(Items.BRONZE_AXE)) {
            await npc.say("Here, take this axe");
            player.inventory.add(Items.BRONZE_AXE, 1);
            player.message("The survival expert gives you a bronze axe");
        }

        if (!player.inventory.has(Items.TINDERBOX)) {
            await npc.say("And you'll need this tinderbox to make a fire");
            player.inventory.add(Items.TINDERBOX, 1);
            player.message("The survival expert gives you a tinderbox");
        }

        await npc.say(
            "Now, go cut down a tree and light a fire",
            "You'll need to click on the tree to chop it",
            "Then use the tinderbox on the logs to light them"
        );

        // Set to 12 (between guide=10 and controls-guide=15) to avoid stage overlap
        if (tutorialStage < 12) {
            player.cache.tutorial = 12;
        }
    } finally {
        player.disengage();
    }

    return true;
}

module.exports = { onTalkToNPC };
