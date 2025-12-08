/**
 * @overview Underground Pass - Members
 * @version 0.0.1
 * @author Your Name Here
 * @description A quest to navigate the treacherous Underground Pass.
 *
 * Requirements:
 * - Quest: Biohazard
 *
 * Reward:
 * - 5 Quest Points
 * - 5,000 Agility XP
 * - 5,000 Attack XP
 * - Iban's Staff
 */

const QUEST_NAME = "Underground Pass";
const QUEST_POINTS = 5;

// --- NPC and Item IDs ---
const NPC_KOFTIK = 626;
const ITEM_DAMP_CLOTH = 989;


function getQuestStage(player) {
    return player.questStages[QUEST_NAME] || 0;
}

function setQuestStage(player, stage) {
    player.questStages[QUEST_NAME] = stage;
}

async function onTalkToNPC(player, npc) {
    if (npc.id === NPC_KOFTIK) {
        const stage = getQuestStage(player);

        if (stage === 1) {
            await player.say("hello there, are you the kings scout?");
            await npc.say("that i am brave adventurer", "King lathas informed me that you need to cross these mountains", "i'm afraid you'll have to go through the ancient underground pass");
            await player.say("That's ok, i've travelled through many a cave in my time");
            await npc.say("these caves are different..they're filled with the spirit of Zamorak", "You can feel it as you wind your way round the stalactites..", "an icy chill that penetrate's the very fabric of your being", "not so many travellers come down here these days...", "...but there are some who are still foolhardy enough");
            setQuestStage(player, 2);
            const menu = await player.ask(["i'll take my chances", "tell me more"]);
            if (menu === 0) {
                await npc.say("ok traveller, i'll catch up with you by the bridge");
            } else if (menu === 1) {
                await npc.say("I remember seeing one such warrior. Going by the name of Randas...", "..he stood tall and proud like an elven king...", "..that same pride made him vulnerable to Zamorak's calls...", "..Randas' worthy desire to be a great and mighty warrior...", "..also made him corruptible to Zamorak's promises of glory", "..Zamorak showed him a way to achieve his goals, by appealing...", "..to that most base and dark nature that resides in all of us");
                await player.say("what happened to him?");
                await npc.say("no one knows");
            }
        }
        return true;
    }
    return false;
}

module.exports = {
    name: 'underground-pass',
    questName: QUEST_NAME,
    questPoints: QUEST_POINTS,
    onTalkToNPC,
    npcs: [NPC_KOFTIK],
    items: [ITEM_DAMP_CLOTH],
};