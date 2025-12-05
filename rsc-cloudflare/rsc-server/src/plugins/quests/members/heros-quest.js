/**
 * Hero's Quest (Members)
 * 
 * Quest Stages:
 * 0 - Not started
 * 1 - Talked to guild master, need to get Firebird feather, Master thief armband, Lava eel
 * 2 - Got Firebird feather
 * 3 - Got Master thief armband (requires partnering with opposite gang)
 * 4 - Got Lava eel
 * 5 - Have all items, can enter Heroes Guild
 * -1 - Complete
 * 
 * Requirements:
 * - 53 Cooking, 53 Fishing, 25 Herblaw, 50 Mining
 * - Quest: Shield of Arrav, Lost City, Merlin's Crystal, Dragon Slayer
 * 
 * Reward: 1 Quest Point, Access to Heroes Guild, 1275 XP in multiple skills
 */

const QUEST_NAME = "Hero's Quest";
const QUEST_POINTS = 1;

// NPC IDs
const NPC_ACHIETTIES = 316;
const NPC_GRUBOR = 317;
const NPC_GRIP = 318;
const NPC_ALFONSE = 319;
const NPC_CHARLIE = 320;
const NPC_STRAVEN = 171; // Phoenix Gang leader
const NPC_KATRINE = 168; // Black Arm gang leader

// Item IDs
const ITEM_FIREBIRD_FEATHER = 564;
const ITEM_LAVA_EEL = 565;
const ITEM_MASTER_THIEF_ARMBAND = 566;
const ITEM_ICE_GLOVES = 567;
const ITEM_OILY_FISHING_ROD = 568;
const ITEM_RAW_LAVA_EEL = 569;
const ITEM_CANDLERINE_KEY = 570;
const ITEM_MISC_KEY = 571;

function getQuestStage(player) {
    return player.questStages[QUEST_NAME] || 0;
}

function setQuestStage(player, stage) {
    player.questStages[QUEST_NAME] = stage;
}

// Check prerequisites
function hasPrerequisites(player) {
    // Check required quests completed
    const requiredQuests = ['Shield of Arrav', 'Lost City', "Merlin's Crystal", 'Dragon Slayer'];
    for (const quest of requiredQuests) {
        if (player.questStages[quest] !== -1) {
            return false;
        }
    }
    // Check skill levels
    return player.skills[7] >= 53 && // Cooking
        player.skills[10] >= 53 && // Fishing
        player.skills[15] >= 25 && // Herblaw
        player.skills[14] >= 50;  // Mining
}

async function onTalkToNpc(player, npc) {
    const stage = getQuestStage(player);

    // Achietties - Guild Master
    if (npc.id === NPC_ACHIETTIES) {
        if (stage === 0) {
            await npc.say("Welcome to the Heroes Guild!");
            await npc.say("Only true heroes are allowed entry");

            if (!hasPrerequisites(player)) {
                await npc.say("You don't appear to meet the requirements");
                await npc.say("You need 53 Cooking, 53 Fishing, 25 Herblaw, 50 Mining");
                await npc.say("And you must have completed Shield of Arrav, Lost City,");
                await npc.say("Merlin's Crystal, and Dragon Slayer");
                return true;
            }

            const option = await player.ask([
                "How can I prove I am a hero?",
                "I'll come back later"
            ], true);

            if (option === 0) {
                await player.say("How can I prove I am a hero?");
                await npc.say("To prove yourself, you must collect three items:");
                await npc.say("A feather from the Firebird");
                await npc.say("A Master Thief's Armband");
                await npc.say("And a cooked Lava Eel");
                await npc.say("These are not easy to obtain!");

                setQuestStage(player, 1);
                player.message("You have started Hero's Quest");
            }
        } else if (stage >= 1 && stage <= 4) {
            await npc.say("How goes your quest?");

            // Check if player has all items
            const hasFeather = player.inventory.has(ITEM_FIREBIRD_FEATHER);
            const hasArmband = player.inventory.has(ITEM_MASTER_THIEF_ARMBAND);
            const hasEel = player.inventory.has(ITEM_LAVA_EEL);

            if (hasFeather && hasArmband && hasEel) {
                await player.say("I have all three items!");
                await npc.say("Let me see...");
                await npc.say("A Firebird feather - excellent!");
                await npc.say("A Master Thief's Armband - impressive!");
                await npc.say("A cooked Lava Eel - delicious!");
                await npc.say("You have proven yourself a true hero!");
                await npc.say("Welcome to the Heroes Guild!");

                player.inventory.remove(ITEM_FIREBIRD_FEATHER, 1);
                player.inventory.remove(ITEM_MASTER_THIEF_ARMBAND, 1);
                player.inventory.remove(ITEM_LAVA_EEL, 1);

                // Complete quest
                setQuestStage(player, -1);
                player.questPoints += QUEST_POINTS;
                // Add XP rewards
                player.addExperience('attack', 1275 * 4);
                player.addExperience('defense', 1275 * 4);
                player.addExperience('strength', 1275 * 4);
                player.addExperience('hits', 1275 * 4);
                player.addExperience('ranged', 1275 * 4);
                player.addExperience('cooking', 1275 * 4);
                player.addExperience('woodcutting', 1275 * 4);
                player.addExperience('firemaking', 1275 * 4);
                player.addExperience('fishing', 1275 * 4);
                player.addExperience('smithing', 1275 * 4);
                player.addExperience('mining', 1275 * 4);

                player.message("Congratulations! You have completed Hero's Quest!");
                player.message(`You gain ${QUEST_POINTS} Quest Point and XP in multiple skills`);
                player.message("You now have access to the Heroes Guild!");
            } else {
                await npc.say("You still need to collect:");
                if (!hasFeather) await npc.say("- A Firebird feather");
                if (!hasArmband) await npc.say("- A Master Thief's Armband");
                if (!hasEel) await npc.say("- A cooked Lava Eel");
            }
        } else if (stage === -1) {
            await npc.say("Welcome, hero!");
            await npc.say("Feel free to enjoy the facilities of the guild");
        }
        return true;
    }

    // Straven - Phoenix Gang help
    if (npc.id === NPC_STRAVEN) {
        if (stage >= 1 && player.cache.phoenixGang) {
            await npc.say("Ah, a fellow Phoenix member");
            await npc.say("Need help with the Hero's Quest?");
            await npc.say("I can help you infiltrate the Black Arm hideout");
            await npc.say("You'll need a partner from the Black Arm gang though");
            // Gang-specific quest help
        }
        return true;
    }

    // Katrine - Black Arm gang help  
    if (npc.id === NPC_KATRINE) {
        if (stage >= 1 && player.cache.blackArmGang) {
            await npc.say("Ah, a fellow Black Arm member");
            await npc.say("Need help with the Hero's Quest?");
            await npc.say("You'll need a partner from the Phoenix gang");
            // Gang-specific quest help
        }
        return true;
    }

    return false;
}

// Cook raw lava eel
function onUseItemOnObject(player, item, object) {
    // Cooking on range/fire
    if (item.id === ITEM_RAW_LAVA_EEL && (object.id === 114 || object.id === 11)) {
        if (player.skills[7] >= 53) { // Cooking
            player.inventory.remove(ITEM_RAW_LAVA_EEL, 1);
            player.inventory.add(ITEM_LAVA_EEL, 1);
            player.addExperience('cooking', 140 * 4);
            player.message('You cook the lava eel');
            return true;
        } else {
            player.message('You need level 53 Cooking to cook this');
            return true;
        }
    }
    return false;
}

module.exports = {
    name: 'heros-quest',
    questName: QUEST_NAME,
    questPoints: QUEST_POINTS,
    onTalkToNpc,
    onUseItemOnObject,
    npcs: [NPC_ACHIETTIES, NPC_GRUBOR, NPC_GRIP, NPC_ALFONSE, NPC_CHARLIE],
    objects: [114, 11] // ranges/fires
};
