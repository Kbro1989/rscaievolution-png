const { Npcs } = require('../../../constants/ids');

const COMMUNITY_INSTRUCTOR_ID = Npcs.COMMUNITY_INSTRUCTOR || 496; // 496

async function onTalkToNPC(player, npc) {
    if (npc.id !== COMMUNITY_INSTRUCTOR_ID) {
        return false;
    }

    player.engage(npc);

    try {
        const tutorialStage = player.cache.tutorial || 0;

        if (tutorialStage < 80) {
            await npc.say("You should speak to the magic instructor first");
            return true;
        }

        if (tutorialStage >= 100) {
            await npc.say("You've already completed the tutorial",
                "Time to head out into the real world!");
            return true;
        }

        await npc.say(
            "You're almost ready to go out into the main game area",
            "When you get out there",
            "You will be able to interact with thousands of other players"
        );

        // Use a loop instead of recursion to prevent stack-overflow on
        // interrupted asks and ensure clean exit paths
        let keepTalking = true;

        while (keepTalking) {
            const menu = await player.ask([
                "How can I communicate with other players?",
                "Are there rules on ingame behaviour?",
                "goodbye then"
            ]);

            if (menu === 0) {
                await npc.say(
                    "typing in the game window will bring up chat",
                    "Which players in the nearby area will be able to see",
                    "If you want to speak to a particular friend anywhere in the game",
                    "You will be able to select the smiley face icon",
                    "then click to add a friend, and type in your friend's name",
                    "If that player is logged in on the same world as you",
                    "their name will go green",
                    "If they are logged in on a different world their name will go yellow",
                    "clicking on their name will allow you to send a message"
                );
                // Loop back to menu
            } else if (menu === 1) {
                await npc.say(
                    "Yes you should read the rules of conduct on our front page",
                    "To make sure you do nothing to get yourself banned",
                    "but as general guide always try to be courteous to people in game",
                    "Remember the people in the game are real people somewhere",
                    "With real feelings",
                    "If you go round being abusive or causing trouble",
                    "your character could quickly be the one in trouble"
                );
                // Loop back to menu
            } else if (menu === 2) {
                await npc.say("Good luck");
                player.cache.tutorial = 100;
                keepTalking = false;
            } else {
                // menu === -1 (interrupted/walk-away): break cleanly
                // No stage change — player must talk again to complete
                keepTalking = false;
            }
        }
    } finally {
        player.disengage();
    }

    return true;
}

module.exports = { onTalkToNPC };
