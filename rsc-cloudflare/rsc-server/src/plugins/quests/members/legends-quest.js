/**
 * @overview Legends' Quest - Members
 * @version 0.0.1
 * @author Your Name Here
 * @description An epic and challenging quest.
 *
 * Requirements:
 * - Quest Points: 107
 * - Herblaw: 45
 * - Agility: 50
 * - Crafting: 50
 * - Smithing: 50
 * - Strength: 50
 * - Thieving: 50
 * - Woodcutting: 50
 * - Prayer: 52
 * - Magic: 56
 *
 * Quests:
 * - Family Crest
 * - Heroes' Quest
 * - Shilo Village
 * - Underground Pass
 * - Waterfall Quest
 *
 * Reward:
 * - 4 Quest Points
 * - Choice of 4 skills to advance from level 60 to 61.
 * - Ability to wield the Dragonfire Shield.
 */

const QUEST_NAME = "Legends' Quest";
const QUEST_POINTS = 4;

// --- NPC and Item IDs ---
// TODO: Fill in with the correct IDs from your items.json and npcs.json
const NPC_SIR_RADIMUS_ERKLE = 0; // In his house to start
const ITEM_RADIMUS_SCROLLS = 0; // Given by Sir Radimus Erkle
const ITEM_MACHETE = 0;
const ITEM_PAPYRUS = 0;
const ITEM_CHARCOAL = 0;
const ITEM_COINS = 10;


function getQuestStage(player) {
    return player.questStages[QUEST_NAME] || 0;
}

function setQuestStage(player, stage) {
    player.questStages[QUEST_NAME] = stage;
}

async function onTalkToNPC(player, npc) {
    if (npc.id === NPC_SIR_RADIMUS_ERKLE) {
        const stage = getQuestStage(player);

        if (stage === 0) {
            await npc.say("Good day to you.", "No doubt you are keen to become a member of the Legends Guild?");
            const menu = await player.ask(["Yes actually, what's involved?", "Maybe some other time.", "Who are you?"]);

            if (menu === 0) {
                await npc.say("Well, you need to complete a quest for us.", "You need to map an area called the Kharazi Jungle", "It is the unexplored southern part of Karamja Island.", "You also need to befriend a native from the Kharazi tribe", "in order to get a gift or token of friendship.", "We want to display it in the Legends Guild Main hall.", "Are you interested in this quest?");
                const startQuest = await player.ask(["Yes, it sounds great!", "Not just at the moment."]);
                if (startQuest === 0) {
                    await npc.say("Excellent!", "Ok, you'll need this starting map of the Kharazi Jungle.");
                    player.message("Grand Vizier Erkle gives you some notes and a map.");
                    player.inventory.add(ITEM_RADIMUS_SCROLLS, 1);
                    await npc.say("Complete this map when you get to the Kharazi Jungle.", "It's towards the southern most part of Karamja.", "You'll need additional papyrus and charcoal to complete the map.", "There are three different sectors of the Kharazi jungle to map.");
                    player.message("Radimus shuffles around the back of his desk.");
                    await npc.say("It is likely to be very tough going.", "You'll need an axe and a machette to cut through ", "the dense Kharazi jungle,collect a machette from the ", "cupboard before you leave. Bring back some sort of token ", "which we can display in the Guild.", "And very good luck to you !");
                    setQuestStage(player, 1);
                } else {
                    await npc.say("Very well, if you change your mind, please come back and see me.");
                }
            } else if (menu === 1) {
                await npc.say("Ok, as you wish...");
            } else if (menu === 2) {
                await npc.say("My name is Radimus Erkle, I am the Grand Vizier of the Legends Guild.", "Are you interested in becoming a member?");
                // TODO: Handle this conversation branch
            }
        } else {
            player.message("The quest has not been started yet.");
            // TODO: Implement conversation logic for other quest stages
        }
        return true;
    }
    return false;
}

async function onUseItemOnObject(player, item, object) {
    // TODO: Implement item on object logic
    return false;
}

module.exports = {
    name: 'legends-quest',
    questName: QUEST_NAME,
    questPoints: QUEST_POINTS,
    onTalkToNPC,
    onUseItemOnObject,
    npcs: [NPC_SIR_RADIMUS_ERKLE],
    items: [ITEM_RADIMUS_SCROLLS, ITEM_MACHETE, ITEM_PAPYRUS, ITEM_CHARCOAL],
};
