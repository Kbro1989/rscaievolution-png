// Resource Node Definitions
export interface ResourceNodeDefinition {
    type: string;
    skill: 'WOODCUTTING' | 'MINING' | 'FISHING';
    levelReq: number;
    xpReward: number;
    respawnTime: number; // milliseconds
    drops: string[]; // item IDs
    toolRequired?: string; // item ID
    visualTier: number; // for rendering
    era?: number; // 0 = Precambrian/Tutorial
}

export const RESOURCE_NODES: Record<string, ResourceNodeDefinition> = {
    // ===== TREES (WOODCUTTING) =====
    TREE: {
        type: 'TREE',
        skill: 'WOODCUTTING',
        levelReq: 1,
        xpReward: 25,
        respawnTime: 5000,
        drops: ['logs'],
        visualTier: 1
    },
    OAK_TREE: {
        type: 'OAK_TREE',
        skill: 'WOODCUTTING',
        levelReq: 15,
        xpReward: 37,
        respawnTime: 8000,
        drops: ['oak_logs'],
        visualTier: 2
    },
    WILLOW_TREE: {
        type: 'WILLOW_TREE',
        skill: 'WOODCUTTING',
        levelReq: 30,
        xpReward: 67,
        respawnTime: 10000,
        drops: ['willow_logs'],
        visualTier: 3
    },
    MAPLE_TREE: {
        type: 'MAPLE_TREE',
        skill: 'WOODCUTTING',
        levelReq: 45,
        xpReward: 100,
        respawnTime: 12000,
        drops: ['maple_logs'],
        visualTier: 4
    },
    YEW_TREE: {
        type: 'YEW_TREE',
        skill: 'WOODCUTTING',
        levelReq: 60,
        xpReward: 175,
        respawnTime: 15000,
        drops: ['yew_logs'],
        visualTier: 5
    },

    // ===== ROCKS (MINING) =====
    COPPER_ROCK: {
        type: 'COPPER_ROCK',
        skill: 'MINING',
        levelReq: 1,
        xpReward: 17,
        respawnTime: 5000,
        drops: ['copper_ore'],
        visualTier: 1
    },
    TIN_ROCK: {
        type: 'TIN_ROCK',
        skill: 'MINING',
        levelReq: 1,
        xpReward: 17,
        respawnTime: 5000,
        drops: ['tin_ore'],
        visualTier: 1
    },
    IRON_ROCK: {
        type: 'IRON_ROCK',
        skill: 'MINING',
        levelReq: 15,
        xpReward: 35,
        respawnTime: 10000,
        drops: ['iron_ore'],
        visualTier: 2
    },
    COAL_ROCK: {
        type: 'COAL_ROCK',
        skill: 'MINING',
        levelReq: 30,
        xpReward: 50,
        respawnTime: 12000,
        drops: ['coal'],
        visualTier: 3
    },
    MITHRIL_ROCK: {
        type: 'MITHRIL_ROCK',
        skill: 'MINING',
        levelReq: 55,
        xpReward: 80,
        respawnTime: 15000,
        drops: ['mithril_ore'],
        visualTier: 4
    },
    ADAMANT_ROCK: {
        type: 'ADAMANT_ROCK',
        skill: 'MINING',
        levelReq: 70,
        xpReward: 95,
        respawnTime: 20000,
        drops: ['adamant_ore'],
        visualTier: 5
    },

    // ===== FISHING SPOTS =====
    FISHING_SPOT_NET: {
        type: 'FISHING_SPOT_NET',
        skill: 'FISHING',
        levelReq: 1,
        xpReward: 10,
        respawnTime: 0, // Fishing spots don't deplete
        drops: ['raw_shrimp', 'raw_anchovies'],
        visualTier: 1
    },
    FISHING_SPOT_BAIT: {
        type: 'FISHING_SPOT_BAIT',
        skill: 'FISHING',
        levelReq: 20,
        xpReward: 50,
        respawnTime: 0,
        drops: ['raw_trout', 'raw_salmon'],
        visualTier: 2
    },
    FISHING_SPOT_CAGE: {
        type: 'FISHING_SPOT_CAGE',
        skill: 'FISHING',
        levelReq: 40,
        xpReward: 90,
        respawnTime: 0,
        drops: ['raw_lobster'],
        visualTier: 3
    },
    FISHING_SPOT_HARPOON: {
        type: 'FISHING_SPOT_HARPOON',
        skill: 'FISHING',
        levelReq: 50,
        xpReward: 100,
        respawnTime: 0,
        drops: ['raw_swordfish'],
        visualTier: 4
    },
    FISHING_SPOT_SHARK: {
        type: 'FISHING_SPOT_SHARK',
        skill: 'FISHING',
        levelReq: 76,
        xpReward: 110,
        respawnTime: 0,
        drops: ['raw_shark'],
        visualTier: 5
    },

    // ===== ICE AGE (TUTORIAL) =====
    SAPLING: {
        type: 'SAPLING',
        skill: 'WOODCUTTING',
        levelReq: 1,
        xpReward: 10,
        respawnTime: 3000,
        drops: ['twigs'],
        visualTier: 0,
        era: 0
    },
    FLINT_ROCK: {
        type: 'FLINT_ROCK',
        skill: 'MINING',
        levelReq: 1,
        xpReward: 10,
        respawnTime: 3000,
        drops: ['flint'],
        visualTier: 0,
        era: 0
    },
};

// Helper to check if player can gather from resource
export function canGatherResource(resourceType: string, playerLevel: number): { canGather: boolean; reason?: string } {
    const resource = RESOURCE_NODES[resourceType];
    if (!resource) return { canGather: false, reason: 'Unknown resource' };

    if (playerLevel < resource.levelReq) {
        return { canGather: false, reason: `You need level ${resource.levelReq} ${resource.skill} to gather this.` };
    }

    return { canGather: true };
}
