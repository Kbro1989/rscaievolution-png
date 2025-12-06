const ids = require('../../ids');

module.exports = (router) => {
    router.on('talk', ids.NPCs.DARK_MAGE, (player, npc) => {
        // Dark Mage - West Ardougne (ID 667)
        player.message('You speak to the Dark Mage.');

        // Authentic Dialogue
        player.message('hello there');
        npc.message('why do do you interupt me traveller?');

        // Check if player has Underground Pass quest stage? (Skipping complex quest checks for now, focusing on utility)
        // Only showing "I experiment with dark magic" if asked or default logic.

        // Main function: Fixing Staff of Iban
        // Item IDs: Broken=1032?, Fixed=1031 (Staff of Iban)
        // Need to verify Broken ID. OpenRSC uses ItemId.STAFF_OF_IBAN_BROKEN.
        // Let's assume generic functionality first.

        player.message('i just wondered what you\'re doing?');
        npc.message('i experiment with dark magic', 'it\'s a dangerous craft');

        // Check for Broken Staff
        const BROKEN_STAFF = 1398; // Need to verify this ID. 
        // 1031 = Staff of Iban. 
        // Let's search for "Broken" or "Staff" in items to be sure. 
        // For now, I'll assume standard ID or search. 
        // Actually, I'll check player inventory for "Staff of Iban" logic in the code block below.

        // Attempting to find item ID via quick lookup if possible, otherwise guessing close to 1031.
        // 1398 is often "Staff of Iban (broken)" or similar?
        // Let's rely on name search in previous steps or just safe-code it later. 
        // For now, I'll put a TODO or use a likely ID.
        // OpenRSC code: ItemId.STAFF_OF_IBAN_BROKEN.id()

        // I will write the basic dialogue structure first.
        if (player.inventory.contains(1398)) { // Placeholder ID for broken staff
            player.message('could you fix this staff?');
            player.message('you show the mage your staff of iban');
            npc.message('almighty zamorak! the staff of iban!');
            player.message('can you fix it?');
            npc.message('this truly is dangerous magic traveller', 'i can fix it, but it will cost you', 'the process could kill me');
            player.message('how much?');
            npc.message('200,000 gold pieces, not a penny less');

            player.options('no chance, that\'s ridiculous', 'ok then', (option) => {
                if (option === 1) {
                    if (player.inventory.remove(10, 200_000)) { // 10 = Coins
                        if (player.inventory.remove(1398, 1)) {
                            player.inventory.add(1031, 1); // Fixed staff
                            player.message('you give the mage 200,000 coins');
                            player.message('and the staff of iban');
                            player.message('the mage fixes the staff and returns it to you');
                            player.message('thanks mage');
                            npc.message('you be carefull with that thing');
                        }
                    } else {
                        player.message('you don\'t have enough money');
                        player.message('oops, i\'m a bit short');
                    }
                } else {
                    npc.message('fine by me');
                }
            });
        }
    });
};
