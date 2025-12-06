// https://classic.runescape.wiki/w/Transcript:Oracle
// Dragon Slayer quest NPC

const ORACLE_ID = 214; // Oracle NPC ID

const RANDOM_RESPONSES = [
    'You must search from within to find your true destiny',
    'No crisps at the party',
    'It is cunning, almost foxlike',
    "Is it waking up time, I'm not quite sure",
    'When in Asgarnia do as the Asgarnians do',
    'The light at the end of the tunnel is the demon infested lava pit',
    'Watch out for cabbages they are green and leafy',
    'Too many cooks spoil the anchovie pizza'
];

async function onTalkToNPC(player, npc) {
    if (npc.id !== ORACLE_ID) {
        return false;
    }

    player.engage(npc);

    // Check Dragon Slayer quest stage
    const questStage = player.questStages.dragonSlayer || 0;

    if (questStage === 2) {
        // Player needs map piece
        const choice = await player.ask([
            'I seek a piece of the map of the isle of Crandor',
            'Can you impart your wise knowledge to me oh oracle'
        ], true);

        if (choice === 0) {
            await npc.say(
                "The map's behind a door below",
                'But entering is rather tough',
                'And this is what you need to know',
                'You must hold the following stuff',
                'First a drink used by the mage',
                'Next some worm string, changed to sheet',
                'Then a small crustacean cage',
                "Last a bowl that's not seen heat"
            );
        } else {
            await npc.say(
                'You must search from within to find your true destiny'
            );
        }
    } else {
        // Random wisdom
        const randomWisdom = RANDOM_RESPONSES[
            Math.floor(Math.random() * RANDOM_RESPONSES.length)
        ];

        await npc.say(randomWisdom);
    }

    player.disengage();
    return true;
}

module.exports = { onTalkToNPC };
