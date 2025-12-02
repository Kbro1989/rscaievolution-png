const npcs = require('./rsc-cloudflare/rsc-data/config/npcs.json');
const targets = ['Wizard', 'Darkwizard', 'Dark wizard', 'Mage', 'Witch'];

console.log('Found NPCs:');
npcs.forEach((npc, id) => {
    if (!npc) return;
    if (targets.some(t => npc.name.toLowerCase().includes(t.toLowerCase()))) {
        console.log(`${id}: ${npc.name} (Lvl: ${npc.combatLevel || '?'})`);
    }
});
