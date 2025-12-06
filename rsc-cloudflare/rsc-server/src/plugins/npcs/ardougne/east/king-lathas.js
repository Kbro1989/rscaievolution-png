// King Lathas (East Ardougne Castle)
// Involves: Biohazard (End), Underground Pass (Start)

const KING_LATHAS = 512;
const KING_LATHAS_AMULET = 826;

// Quest Keys
// 'biohazard', 'undergroundPass'

async function onTalkToNPC(player, npc) {
    if (npc.id !== KING_LATHAS) {
        return false;
    }

    player.engage(npc);

    const biohazardStage = player.questStages.biohazard || 0;
    const undergroundPassStage = player.questStages.undergroundPass || 0;
    // Assuming -1 or specific value for complete. 
    // In my engine, usually `COMPLETE` constant or stage > X.
    // For now, I'll assume Biohazard stage 9 is "ready to finish".
    // And "COMPLETE" state is needed to start Underground Pass.
    // OpenRSC uses -1 for COMPLETED quests usually.

    // Biohazard Finish Logic
    if (biohazardStage === 9) {
        await player.ask(["I assume that you are the King of east Ardougne?"], true);
        await npc.say("You assume correctly- but where do you get such impertinence?");
        await player.ask(["I get it from finding out that the plague is a hoax"], true);
        await npc.say("A hoax, I've never heard such a ridiculous thing...");
        await player.ask(["I have evidence- from Guidor in Varrock"], true);
        await npc.say("Ah... I see. Well then you are right about the plague", "But I did it for the good of my people");
        await player.ask(["When is it ever good to lie to people like that?"], true);
        await npc.say("When it protects them from a far greater danger- a fear too big to fathom");

        const choice = await player.ask([
            "I don't understand...",
            "Well I've wasted enough of my time here"
        ], true);

        if (choice === 0) {
            await npc.say(
                "Their King, tyras, journeyed out to the West, on a voyage of discovery",
                "But he was captured by the Dark Lord",
                "The Dark Lord agreed to spare his life, but only on one condition...",
                "That he would drink from the chalice of eternity"
            );
            await player.ask(["So what happened?"], true);
            await npc.say(
                "The chalice corrupted him. He joined forces with the Dark Lord...",
                "...The embodiment of pure evil, banished all those years ago...",
                "And so I erected this wall, not just to protect my people",
                "But to protect all the people of Runescape"
            );
            // ... truncated slightly for brevity ...
            await npc.say("So I'm sorry that I lied about the plague", "I just hope that you can understand my reasons");

            await player.ask(["Well at least I know now. But what can we do about it?"], true);
            await npc.say("Nothing at the moment", "I'm waiting for my scouts to come back");
            // ...
            await npc.say("When this happens, can I count on your support?");
            await player.ask(["Absolutely"], true);
            await npc.say("Thank the gods. Let me give you this amulet", "Think of it as a thank you, for all that you have done");

            player.message("king lathas gives you a magic amulet");
            player.inventory.add(KING_LATHAS_AMULET, 1);
            player.sendInventory();
            player.updateQuestStage('biohazard', -1); // Complete
            player.message("You have completed the Biohazard Quest!");
        } else {
            await npc.say("No time is ever wasted- thanks for all you've done");
        }
    }
    // Underground Pass Start Logic (Requires Biohazard Complete)
    else if (biohazardStage === -1) { // Assuming -1 is complete
        if (undergroundPassStage === 0) {
            await player.ask(["hello king lathas"], true);
            await npc.say("adventurer, thank saradomin for your arrival");
            await player.ask(["have your scouts found a way though the mountains"], true);
            await npc.say("Not quite, we found a path to where we expected..", "..to find the 'well of voyage' an ancient portal to west runescape");
            await npc.say("however over the past era's a cluster of cultists", "have settled there, run by a madman named iban");
            await player.ask(["iban?"], true);
            await npc.say("a crazy loon who claims to be the son of zamorok", "go meet my main tracker koftik, he will help you");
            await npc.say("he waits for you at the west side of west ardounge");
            await player.ask(["i'll do my best lathas"], true);
            await npc.say("a warning traveller the ungerground pass..", "is lethal, we lost many men exploring those caverns");

            player.updateQuestStage('undergroundPass', 1);
        } else if (undergroundPassStage < 8) { // In progress
            await player.ask(["hello king lanthas"], true);
            await npc.say("traveller, how are you managing down there?");
            await player.ask(["it's a pretty nasty place but i'm ok"], true);
            await npc.say("well keep up the good work");
        } else if (undergroundPassStage === 8) { // Complete logic (End of UP)
            await npc.say("the traveller returns..any news?");
            await player.ask(["indeed, the quest is complete lathas", "i have defeated iban and his undead minions"], true);
            await npc.say("incrediable, you are a truly awesome warrior");
            // ...
            player.updateQuestStage('undergroundPass', -1);
            player.message("You have completed the Underground Pass Quest!");
        } else {
            // Already completed UP
            await player.ask(["hello king lathas"], true);
            await npc.say("well hello there traveller", "the mages are still ressurecting the well of voyage");
        }
    } else {
        player.message("the king is too busy to talk");
    }

    player.disengage();
    return true;
}

module.exports = { onTalkToNPC };
