const items = require('@2003scape/rsc-data/config/items');
const thieving = require('@2003scape/rsc-data/skills/thieving');
const { rollSkillSuccess } = require('../../rolls');

const PICKPOCKET_NPCS = thieving.pickpocket;
const PICKPOCKET_NPC_IDS = new Set(Object.keys(PICKPOCKET_NPCS).map(Number));

async function onNPCCommand(player, npc, command) {
    if (command !== 'pickpocket' || !PICKPOCKET_NPC_IDS.has(npc.id)) {
        return false;
    }

    await pickpocketNPC(player, npc);
    return true;
}

async function pickpocketNPC(player, npc) {
    const def = PICKPOCKET_NPCS[npc.id];
    const thievingLevel = player.skills.thieving.current;

    if (def.level > thievingLevel) {
        player.message(
            `@que@You need a thieving level of ${def.level} to pickpocket this NPC`
        );
        return;
    }

    player.message(`@que@You attempt to pick the ${npc.definition.name}'s pocket`);
    await player.world.sleepTicks(2);

    // Verify NPC is still near (optional but good practice)
    
    const success = rollSkillSuccess(def.roll[0], def.roll[1], thievingLevel);

    if (success) {
        player.addExperience('thieving', def.experience);
        
        // Handle Loot
        // Assuming def.loot is array of { id, amount, chance? } or similar
        // For simplicity, taking first item or coins
        if (def.loot) {
             // Simple loot logic - can be expanded based on data structure
             const lootItem = def.loot[0]; // Placeholder
             if (lootItem) {
                 player.inventory.add(lootItem.id, lootItem.amount || 1);
                 player.message('@que@You pick the pocket and find some loot');
             } else {
                 player.inventory.add(10, 3); // Default 3 coins
                 player.message('@que@You pick the pocket and find some coins');
             }
        } else {
             player.inventory.add(10, 3); // Default 3 coins
             player.message('@que@You pick the pocket and find some coins');
        }
        
    } else {
        player.message(`@que@You fail to pick the ${npc.definition.name}'s pocket`);
        player.message(`@que@${npc.definition.name}: What do you think you're doing?`);
        
        // Stun player
        player.damage(def.stunDamage || 1);
        player.sendSound('combat1b'); // Hit sound
        // TODO: Apply stun (busy wait or block movement)
        // player.stun(def.stunTime || 5000); 
    }
}

module.exports = { onNPCCommand };
