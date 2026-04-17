const { Npcs } = require('../../../constants/ids');

const GUIDE = Npcs.GUIDE_476; // 476

async function onTalkToNPC(player, npc) {
    if (npc.id !== GUIDE) {
        return false;
    }

    player.engage(npc);

    try {
        const tutorialStage = player.cache.tutorial || 0;

        if (tutorialStage >= 10) {
            // Already past this instructor — give a short reminder
            await npc.say(
                "You've already spoken to me",
                "Continue through the door to find more instructors"
            );
            return true;
        }

        await npc.say("Welcome to the world of runescape",
            "My job is to help newcomers find their feet here",
            "Ah good, let's get started");
        await player.message("when speaking to characters such as myself");
        await player.message("Sometimes options will appear in the top left corner of the screen");
        await player.message("left click on one of them to continue the conversation");

        const option = await player.ask([
            "So what else can you tell me?",
            "What other controls do I have?"
        ]);

        if (option >= 0) {
            await player.message("I suggest you go through the door now");
            await player.message("There are several guides and advisors on the island");
            await player.message("Speak to them");
            await player.message("They will teach you about the various aspects of the game");

            player.message("@que@Use the quest history tab at the bottom of the screen to reread things said to you by ingame characters");

            player.cache.tutorial = 10;
        }
        // option === -1 (interrupted): falls through to finally, no stage change
    } finally {
        player.disengage();
    }

    return true;
}

module.exports = { onTalkToNPC };
