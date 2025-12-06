// https://classic.runescape.wiki/w/Transcript:Zenesha
// Ardougne Platebody Shop

const ZENESHA_ID = 331; // Zenesha NPC ID

async function onTalkToNPC(player, npc) {
    if (npc.id !== ZENESHA_ID) {
        return false;
    }

    player.engage(npc);

    await npc.say('hello I sell plate mail tops');

    // OpenRSC: multi(player, n, false, "I'm not intersted", "I may be intersted");
    // Typo in OpenRSC ("intersted") kept authentic or fixed? 
    // Creating dialogue options

    const choice = await player.ask([
        "I'm not interested",
        "I may be interested"
    ], true);

    if (choice === 0) {
        await npc.say("I'm not interested"); // Wait, player says this? 
        // OpenRSC: say(player, n, "I'm not interested");
        // Yes, player speaks. `player.ask` usually makes player speak the choice if second arg is true?
        // Wait, `player.ask` makes player speak strict choice. 
        // If choice 0 selected ("I'm not interested"), player says it.
        // OpenRSC code:
        // if (menu == 0) { say(player, n, "I'm not interested"); }
        // This implies player confirms/repeats it? 
        // In our engine `player.ask(..., true)` makes player say the selected option.
        // So we don't need explicit `player.say`.

        // But OpenRSC logic:
        // Multi returns choice.
        // If 0: Player says "I'm not interested".
        // If 1: Player says "I may be interested".

        // Our engine handles this automatically via `ask(..., true)`.

    } else if (choice === 1) {
        // Player said "I may be interested" via ask
        await npc.say('Look at these fine samples then');
        player.disengage();
        player.openShop('zeneshas-plate-mail-shop');
        return true;
    }

    player.disengage();
    return true;
}

module.exports = { onTalkToNPC };
