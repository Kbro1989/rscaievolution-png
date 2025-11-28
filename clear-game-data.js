/**
 * Clear All Game Data
 * Run this in the browser console to reset everything
 */

console.log('🗑️ Clearing all game data...');

// List all localStorage keys
const allKeys = Object.keys(localStorage);
let cleared = 0;

// Clear game-specific data
const gamePrefixes = [
    'rsc_evo_gods_',
    'companion_memories',
    'gronk_error_log'
];

allKeys.forEach(key => {
    if (gamePrefixes.some(prefix => key.startsWith(prefix))) {
        console.log(`  Removing: ${key}`);
        localStorage.removeItem(key);
        cleared++;
    }
});

console.log(`✅ Cleared ${cleared} items from localStorage`);
console.log('🎮 Refresh the page to start fresh!');
