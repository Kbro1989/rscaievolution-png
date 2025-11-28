import { getRSCItemByName, getRSCNPCByName } from './data/rscLoader';

export const testRSCIntegration = () => {
    console.log('=== RSC Integration Test ===');

    // Test items
    const coins = getRSCItemByName('Coins');
    console.log('✓ Loaded Coins:', coins ? (coins.stackable ? 'Stackable' : 'Not stackable') : 'FAILED');

    const sword = getRSCItemByName('Iron Short Sword');
    console.log('✓ Iron Short Sword price:', sword ? sword.price : 'FAILED', 'coins');

    // Test NPCs
    const rat = getRSCNPCByName('Giant Rat');
    console.log('✓ Giant Rat Level:', rat ? rat.combatLevel : 'FAILED');

    // Test sounds (Client-side only)
    if (typeof window !== 'undefined') {
        const testSound = new Audio('/audio/rsc/coins.wav');
        testSound.play().then(() => {
            console.log('✓ Sound system working!');
        }).catch(err => {
            console.error('✗ Sound error:', err);
        });
    } else {
        console.log('ℹ️ Sound test skipped (server-side)');
    }

    console.log('=== Test Complete ===');
};
