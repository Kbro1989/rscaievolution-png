const { Items, Npcs } = require('../../../constants/ids');

const COMBAT_INSTRUCTOR_ID = Npcs.COMBAT_INSTRUCTOR || 474; // 474
const RAT_TUTORIAL_ID = Npcs.RAT_473 || 473; // 473
const WOODEN_SHIELD_ID = Items.WOODEN_SHIELD || 4; // 4
const BRONZE_LONG_SWORD_ID = Items.BRONZE_LONG_SWORD || 70; // 70

async function onTalkToNPC(player, npc) {
    if (npc.id !== COMBAT_INSTRUCTOR_ID) {
        return false;
    }

    player.engage(npc);

    try {
        const tutorialStage = player.cache.tutorial || 0;

        if (tutorialStage < 15) {
            // Player hasn't reached this instructor yet
            await npc.say("You're not ready for combat training yet",
                "Go speak to the controls guide first");
            return true;
        }

        if (tutorialStage === 15) {
            if (!player.inventory.has(WOODEN_SHIELD_ID) && !player.inventory.has(BRONZE_LONG_SWORD_ID)) {
                await player.say("Aha a new recruit");
                await npc.say(
                    "I'm here to teach you the basics of fighting",
                    "First of all you need weapons"
                );

                player.inventory.add(WOODEN_SHIELD_ID);
                player.inventory.add(BRONZE_LONG_SWORD_ID);
                player.message("The instructor gives you a sword and shield");
                await player.world.sleepTicks(3);

                await npc.say(
                    "look after these well",
                    "These items will now have appeared in your inventory",
                    "You can access them by selecting the bag icon in the menu bar",
                    "which can be found in the top right hand corner of the screen",
                    "To wield your weapon and shield left click on them within your inventory",
                    "their box will go red to show you are wearing them"
                );
                player.message("When you have done this speak to the combat instructor again");
                player.cache.tutorial = 16;
            } else {
                // Player already has the items somehow — advance stage
                await npc.say("I see you already have a weapon and shield",
                    "Wield them and speak to me again");
                player.cache.tutorial = 16;
            }
        } else if (tutorialStage === 16) {
            const hasShieldEquipped = player.inventory.isWearing(WOODEN_SHIELD_ID);
            const hasSwordEquipped = player.inventory.isWearing(BRONZE_LONG_SWORD_ID);

            if (hasShieldEquipped && hasSwordEquipped) {
                await npc.say("Today we're going to be killing giant rats");

                await npc.say(
                    "move your mouse over a rat you will see it is level 7",
                    "You will see that it's level is written in green",
                    "If it is green this means you have a strong chance of killing it",
                    "creatures with their name in red should probably be avoided",
                    "As this indicates they are tougher than you",
                    "left click on the rat to attack it"
                );
                player.cache.tutorial = 20;
            } else {
                await npc.say(
                    "You need to wield your equipment",
                    "You can access it by selecting the bag icon",
                    "which can be found in the top right hand corner of the screen",
                    "To wield your weapon and shield left click on them",
                    "their boxs will go red to show you are wearing them"
                );
                player.message("When you have done this speak to the combat instructor again");
            }
        } else if (tutorialStage >= 20 && tutorialStage < 25) {
            await npc.say(
                "Well done you're a born fighter",
                "As you kill things",
                "Your combat experience will go up",
                "this expereince will slowly cause you to get tougher",
                "eventually you will be able to take on stronger enemies",
                "Such as those found in dungeons",
                "Now contine to the building to the northeast"
            );
            player.cache.tutorial = 25;
        } else {
            // Stage >= 25: already done
            await npc.say("You've already completed combat training",
                "Continue to the building to the northeast");
        }
    } finally {
        player.disengage();
    }

    return true;
}

module.exports = { onTalkToNPC };
