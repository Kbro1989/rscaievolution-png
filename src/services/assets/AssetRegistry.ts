// src/services/assets/AssetRegistry.ts

/**
 * Unified asset registry for all RSC assets used in the game.
 * Each entry defines the 3D model, associated material, a 2D sprite for UI,
 * and optional sounds for ambient and interaction events.
 */
export interface AssetDescriptor {
    id: string;
    name: string;
    category: string; // e.g., "nature", "resource", "npc"
    modelPath: string; // Model file path (.glb or .obj)
    mtlPath?: string;   // MTL file path (optional, only for .obj files)
    spritePath: string; // UI sprite (png) path
    sounds?: {
        ambient?: string;   // Looping ambient sound
        interact?: string; // Sound played on interaction (e.g., chop, mine)
    };
    scale?: number; // Uniform scale for the model
    tags?: string[]; // Tags from RSC data (e.g., TAG_STACKABLE, TAG_WEARABLE)
}

export const ASSET_REGISTRY: Record<string, AssetDescriptor> = {
    // === MINING RESOURCES ===
    "copper_ore": {
        id: "copper_ore",
        name: "Copper Rock",
        category: "resource",
        modelPath: "/models/copper_rock.glb",
        spritePath: "/sprites/rsc/copper_ore/0.png",
        sounds: {
            interact: "/audio/rsc/mine.wav",
        },
        scale: 0.03,
        tags: ["TAG_MINING", "TAG_TIER_1"]
    },
    "tin_ore": {
        id: "tin_ore",
        name: "Tin Rock",
        category: "resource",
        modelPath: "/models/tin_rock.glb",
        spritePath: "/sprites/rsc/tin_ore/0.png",
        sounds: {
            interact: "/audio/rsc/mine.wav",
        },
        scale: 0.03,
        tags: ["TAG_MINING", "TAG_TIER_1"]
    },

    // === WOODCUTTING RESOURCES ===
    "tree": {
        id: "tree",
        name: "Tree",
        category: "nature",
        modelPath: "/models/tree.glb",
        spritePath: "/sprites/rsc/tree/0.png",
        sounds: {
            interact: "/audio/rsc/fish.wav",
        },
        scale: 0.05,
        tags: ["TAG_WOODCUTTING", "TAG_TIER_1"]
    },

    // === FISHING RESOURCES ===
    "fishing_spot": {
        id: "fishing_spot",
        name: "Fishing Spot",
        category: "resource",
        modelPath: "/models/fishing_spot_net.glb",
        spritePath: "/sprites/rsc/fishing_spot/0.png",
        sounds: {
            interact: "/audio/rsc/fish.wav",
        },
        scale: 0.02,
    },
    // === CRAFTING STATIONS ===
    "furnace": {
        id: "furnace",
        name: "Furnace",
        category: "station",
        modelPath: "/models/furnace.glb",
        spritePath: "/sprites/rsc/furnace/0.png",
        sounds: {
            interact: "/audio/rsc/cooking.wav",
        },
        scale: 0.04,
        tags: ["TAG_SMITHING_STATION"]
    },
    "anvil": {
        id: "anvil",
        name: "Anvil",
        category: "station",
        modelPath: "/models/anvil.glb",
        spritePath: "/sprites/rsc/anvil/0.png",
        sounds: {
            interact: "/audio/rsc/anvil.wav",
        },
        scale: 0.03,
        tags: ["TAG_SMITHING_STATION"]
    },
    "range": {
        id: "range",
        name: "Range",
        category: "station",
        modelPath: "/models/range.glb",
        spritePath: "/sprites/rsc/range/0.png",
        sounds: {
            interact: "/audio/rsc/cooking.wav",
        },
        scale: 0.04,
        tags: ["TAG_COOKING_STATION"]
    },
    "fire": {
        id: "fire",
        name: "Fire",
        category: "station",
        modelPath: "/models/furnace.glb", // Using furnace as fire placeholder
        spritePath: "/sprites/rsc/fire/0.png",
        sounds: {
            interact: "/audio/rsc/cooking.wav",
        },
        scale: 0.02,
        tags: ["TAG_COOKING_STATION"]
    },

    // === NPCS ===
    "survivalist": {
        id: "survivalist",
        name: "Survivalist",
        category: "npc",
        modelPath: "/models/survival_guide.glb",
        spritePath: "/sprites/rsc/man/0.png",
        scale: 0.05,
        tags: ["TAG_NPC_GUIDE"]
    },
    "mining_instructor": {
        id: "mining_instructor",
        name: "Mining Instructor",
        category: "npc",
        modelPath: "/models/survival_guide.glb", // Using generic NPC model
        spritePath: "/sprites/rsc/man/0.png",
        scale: 0.05,
        tags: ["TAG_NPC_GUIDE"]
    },
    "combat_instructor": {
        id: "combat_instructor",
        name: "Combat Instructor",
        category: "npc",
        modelPath: "/models/survival_guide.glb", // Using generic NPC model
        spritePath: "/sprites/rsc/man/0.png",
        scale: 0.05,
        tags: ["TAG_NPC_GUIDE"]
    },
    "giant_rat": {
        id: "giant_rat",
        name: "Giant Rat",
        category: "npc",
        modelPath: "/models/giant_rat.glb",
        spritePath: "/sprites/rsc/rat/0.png",
        sounds: {
            interact: "/audio/rsc/combat1a.wav",
        },
        scale: 0.03,
        tags: ["TAG_NPC_ENEMY", "TAG_COMBAT"]
    },
    "young_mammoth": {
        id: "young_mammoth",
        name: "Young Mammoth",
        category: "npc",
        modelPath: "/models/giant_rat.glb", // Placeholder
        spritePath: "/sprites/rsc/rat/0.png",
        scale: 0.08,
        tags: ["TAG_NPC_ENEMY", "TAG_COMBAT"]
    },

    // === TOOLS & ITEMS ===
    "bronze_pickaxe": {
        id: "bronze_pickaxe",
        name: "Bronze Pickaxe",
        category: "tool",
        modelPath: "/models/copper_rock.glb", // Placeholder for pickaxe
        spritePath: "/sprites/rsc/bronze_pickaxe/0.png",
        sounds: {
            interact: "/audio/rsc/mine.wav",
        },
        scale: 0.02,
        tags: ["TAG_TOOL_PICK", "TAG_BRONZE"]
    },
    "bronze_axe": {
        id: "bronze_axe",
        name: "Bronze Axe",
        category: "tool",
        modelPath: "/models/tree.glb", // Placeholder for axe
        spritePath: "/sprites/rsc/bronze_axe/0.png",
        sounds: {
            interact: "/audio/rsc/fish.wav",
        },
        scale: 0.02,
        tags: ["TAG_TOOL_AXE", "TAG_BRONZE"]
    },
    "net": {
        id: "net",
        name: "Net",
        category: "tool",
        modelPath: "/models/fishing_spot_net.glb", // Placeholder for net
        spritePath: "/sprites/rsc/net/0.png",
        sounds: {
            interact: "/audio/rsc/fish.wav",
        },
        scale: 0.02,
        tags: ["TAG_TOOL_NET"]
    },
    "tinderbox": {
        id: "tinderbox",
        name: "Tinderbox",
        category: "tool",
        modelPath: "/models/furnace.glb", // Placeholder for tinderbox
        spritePath: "/sprites/rsc/tinderbox/0.png",
        sounds: {
            interact: "/audio/rsc/cooking.wav",
        },
        scale: 0.015,
        tags: ["TAG_TOOL_TINDERBOX"]
    },

    // === GENERIC/FALLBACK ===
    "rock": {
        id: "rock",
        name: "Rock",
        category: "nature",
        modelPath: "/models/copper_rock.glb", // Placeholder for generic rock
        spritePath: "/sprites/rsc/rock/0.png",
        sounds: {
            interact: "/audio/rsc/prospect.wav",
        },
        scale: 0.04,
    },
};

