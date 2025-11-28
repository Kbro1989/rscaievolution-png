import { ResourceEntity, NPC } from '../../types';

export const TUTORIAL_ISLAND_REGION = {
    name: 'Tutorial Island',
    bounds: {
        minLat: -5,
        maxLat: 5,
        minLon: -5,
        maxLon: 5
    },
    spawnPoint: {
        lat: 0,
        lon: 0
    },
    description: 'A small island for new adventurers to learn the basics.',

    // Resource spawns for each gathering skill
    resources: [
        // MINING
        { id: 'copper_rock_1', type: 'COPPER_ROCK', position: { x: -3, z: -2 }, tier: 1, active: true },
        { id: 'copper_rock_2', type: 'COPPER_ROCK', position: { x: -3, z: -1 }, tier: 1, active: true },
        { id: 'tin_rock_1', type: 'TIN_ROCK', position: { x: -2, z: -2 }, tier: 1, active: true },
        { id: 'tin_rock_2', type: 'TIN_ROCK', position: { x: -2, z: -1 }, tier: 1, active: true },

        // WOODCUTTING
        { id: 'tree_1', type: 'TREE', position: { x: 2, z: -3 }, tier: 1, active: true },
        { id: 'tree_2', type: 'TREE', position: { x: 3, z: -3 }, tier: 1, active: true },
        { id: 'tree_3', type: 'TREE', position: { x: 2, z: -2 }, tier: 1, active: true },

        // FISHING
        { id: 'fishing_spot_1', type: 'FISHING_SPOT_NET', position: { x: -4, z: 2 }, tier: 1, active: true },
        { id: 'fishing_spot_2', type: 'FISHING_SPOT_NET', position: { x: -3, z: 2 }, tier: 1, active: true },

        // CRAFTING STATIONS
        { id: 'furnace_1', type: 'FURNACE', position: { x: 0, z: -3 }, tier: 1, active: true },
        { id: 'anvil_1', type: 'ANVIL', position: { x: 1, z: -3 }, tier: 1, active: true },
        { id: 'range_1', type: 'RANGE', position: { x: 0, z: 3 }, tier: 1, active: true },
        { id: 'fire_1', type: 'FIRE', position: { x: 1, z: 3 }, tier: 1, active: true, despawnTime: 120000 },
    ] as ResourceEntity[],

    // NPCs for tutorial guidance and combat training
    npcs: [
        // Tutorial Guides
        {
            id: 'guide_survivalist',
            name: 'Survivalist',
            position: { x: 0, z: 0 },
            role: 'GUIDE' as const,
            voice: 'MALE' as const,
            combatLevel: 1,
            examine: 'The survival skills instructor.',
            dialogue: 'Welcome to Tutorial Island! I will teach you the basics of survival.',
            tags: ['TUTORIAL_GUIDE']
        },
        {
            id: 'guide_mining',
            name: 'Mining Instructor',
            position: { x: -2.5, z: -1.5 },
            role: 'GUIDE' as const,
            voice: 'MALE' as const,
            combatLevel: 1,
            examine: 'An experienced miner.',
            dialogue: 'Click on rocks to mine them. Gather copper and tin ore!',
            tags: ['TUTORIAL_GUIDE', 'MINING_TRAINER']
        },
        {
            id: 'guide_combat',
            name: 'Combat Instructor',
            position: { x: 3, z: 1 },
            role: 'GUIDE' as const,
            voice: 'MALE' as const,
            combatLevel: 1,
            examine: 'A seasoned warrior.',
            dialogue: 'Attack the rats to practice combat. Equip your weapon first!',
            tags: ['TUTORIAL_GUIDE', 'COMBAT_TRAINER']
        },

        // Combat Training
        {
            id: 'rat_1',
            name: 'Giant Rat',
            position: { x: 3.5, z: 0.5 },
            role: 'ENEMY' as const,
            voice: 'CREATURE' as const,
            combatLevel: 2,
            hp: 6,
            maxHp: 6,
            examine: 'A giant rat. Looks dangerous.',
            lootTableId: 'rat_basic',
            tags: ['COMBAT_TUTORIAL']
        },
        {
            id: 'rat_2',
            name: 'Giant Rat',
            position: { x: 4, z: 1 },
            role: 'ENEMY' as const,
            voice: 'CREATURE' as const,
            combatLevel: 2,
            hp: 6,
            maxHp: 6,
            examine: 'A giant rat. Looks dangerous.',
            lootTableId: 'rat_basic',
            tags: ['COMBAT_TUTORIAL']
        },
    ] as NPC[],

    // Ground items for tutorials (starter items)
    groundItems: [
        { id: 'bronze_pickaxe_spawn', item: { id: 'bronze_pickaxe', name: 'Bronze Pickaxe', tags: ['TAG_TOOL_PICK'], description: 'A pickaxe made of bronze.', icon: '⛏️' }, position: { x: -2, z: -3 } },
        { id: 'bronze_axe_spawn', item: { id: 'bronze_axe', name: 'Bronze Axe', tags: ['TAG_TOOL_AXE'], description: 'An axe made of bronze.', icon: '🪓' }, position: { x: 2, z: -4 } },
        { id: 'net_spawn', item: { id: 'net', name: 'Net', tags: ['TAG_TOOL_NET'], description: 'A fishing net.', icon: '🕸️' }, position: { x: -4, z: 3 } },
        { id: 'tinderbox_spawn', item: { id: 'tinderbox', name: 'Tinderbox', tags: ['TAG_TOOL_TINDERBOX'], description: 'Used to light fires.', icon: '🔥' }, position: { x: 1, z: 4 } },
    ]
};
