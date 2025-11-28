// Comprehensive Item Registry
export interface ItemDefinition {
    id: string;
    name: string;
    tier: number;
    category: 'RESOURCE' | 'TOOL' | 'EQUIPMENT' | 'CONSUMABLE' | 'MATERIAL';
    skill?: string;
    equipSlot?: 'WEAPON' | 'SHIELD' | 'HELMET' | 'BODY' | 'LEGS' | 'GLOVES' | 'BOOTS' | 'RING' | 'AMULET';
    icon: string;
    examine?: string;
    stackable?: boolean;
    tradeable?: boolean;
    stats?: {
        power?: number;
        armor?: number;
        aim?: number;
        magicPower?: number;
        healAmount?: number;
    };
    era?: number; // 0 = Precambrian/Tutorial
}

export const ITEM_DEFINITIONS: Record<string, ItemDefinition> = {
    // ===== LOGS (WOODCUTTING) =====
    logs: { id: 'logs', name: 'Logs', tier: 1, category: 'RESOURCE', skill: 'WOODCUTTING', icon: '🪵', examine: 'Logs cut from a tree.', stackable: true, tradeable: true },
    oak_logs: { id: 'oak_logs', name: 'Oak Logs', tier: 2, category: 'RESOURCE', skill: 'WOODCUTTING', icon: '🪵', examine: 'Logs cut from an oak tree.', stackable: true, tradeable: true },
    willow_logs: { id: 'willow_logs', name: 'Willow Logs', tier: 3, category: 'RESOURCE', skill: 'WOODCUTTING', icon: '🌿', examine: 'Logs cut from a willow tree.', stackable: true, tradeable: true },
    maple_logs: { id: 'maple_logs', name: 'Maple Logs', tier: 4, category: 'RESOURCE', skill: 'WOODCUTTING', icon: '🍁', examine: 'Logs cut from a maple tree.', stackable: true, tradeable: true },
    yew_logs: { id: 'yew_logs', name: 'Yew Logs', tier: 5, category: 'RESOURCE', skill: 'WOODCUTTING', icon: '🌲', examine: 'Logs cut from a yew tree.', stackable: true, tradeable: true },

    // ===== ORES (MINING) =====
    copper_ore: { id: 'copper_ore', name: 'Copper Ore', tier: 1, category: 'RESOURCE', skill: 'MINING', icon: '🪨', examine: 'Copper ore ready to be smelted.', stackable: true, tradeable: true },
    tin_ore: { id: 'tin_ore', name: 'Tin Ore', tier: 1, category: 'RESOURCE', skill: 'MINING', icon: '🪨', examine: 'Tin ore ready to be smelted.', stackable: true, tradeable: true },
    iron_ore: { id: 'iron_ore', name: 'Iron Ore', tier: 2, category: 'RESOURCE', skill: 'MINING', icon: '⛏️', examine: 'Iron ore ready to be smelted.', stackable: true, tradeable: true },
    coal: { id: 'coal', name: 'Coal', tier: 3, category: 'RESOURCE', skill: 'MINING', icon: '⚫', examine: 'Fuel for the furnace.', stackable: true, tradeable: true },
    mithril_ore: { id: 'mithril_ore', name: 'Mithril Ore', tier: 4, category: 'RESOURCE', skill: 'MINING', icon: '💎', examine: 'Rare mithril ore.', stackable: true, tradeable: true },
    adamant_ore: { id: 'adamant_ore', name: 'Adamantite Ore', tier: 5, category: 'RESOURCE', skill: 'MINING', icon: '💚', examine: 'Very rare adamantite ore.', stackable: true, tradeable: true },

    // ===== FISH (FISHING) =====
    raw_shrimp: { id: 'raw_shrimp', name: 'Raw Shrimp', tier: 1, category: 'CONSUMABLE', skill: 'FISHING', icon: '🦐', examine: 'Some raw shrimp.', stackable: true, tradeable: true },
    raw_anchovies: { id: 'raw_anchovies', name: 'Raw Anchovies', tier: 1, category: 'CONSUMABLE', skill: 'FISHING', icon: '🐟', examine: 'Raw anchovies.', stackable: true, tradeable: true },
    raw_trout: { id: 'raw_trout', name: 'Raw Trout', tier: 2, category: 'CONSUMABLE', skill: 'FISHING', icon: '🐟', examine: 'A raw trout.', stackable: true, tradeable: true },
    raw_salmon: { id: 'raw_salmon', name: 'Raw Salmon', tier: 2, category: 'CONSUMABLE', skill: 'FISHING', icon: '🐠', examine: 'A raw salmon.', stackable: true, tradeable: true },
    raw_lobster: { id: 'raw_lobster', name: 'Raw Lobster', tier: 3, category: 'CONSUMABLE', skill: 'FISHING', icon: '🦞', examine: 'A raw lobster.', stackable: true, tradeable: true },
    raw_swordfish: { id: 'raw_swordfish', name: 'Raw Swordfish', tier: 4, category: 'CONSUMABLE', skill: 'FISHING', icon: '🐟', examine: 'A raw swordfish.', stackable: true, tradeable: true },
    raw_shark: { id: 'raw_shark', name: 'Raw Shark', tier: 5, category: 'CONSUMABLE', skill: 'FISHING', icon: '🦈', examine: 'A fearsome raw shark.', stackable: true, tradeable: true },

    // ===== BARS (SMITHING MATERIALS) =====
    bronze_bar: { id: 'bronze_bar', name: 'Bronze Bar', tier: 1, category: 'MATERIAL', skill: 'SMITHING', icon: '🔩', examine: 'A bronze bar.', stackable: true, tradeable: true },
    iron_bar: { id: 'iron_bar', name: 'Iron Bar', tier: 2, category: 'MATERIAL', skill: 'SMITHING', icon: '🔩', examine: 'An iron bar.', stackable: true, tradeable: true },
    steel_bar: { id: 'steel_bar', name: 'Steel Bar', tier: 3, category: 'MATERIAL', skill: 'SMITHING', icon: '🔩', examine: 'A steel bar.', stackable: true, tradeable: true },
    mithril_bar: { id: 'mithril_bar', name: 'Mithril Bar', tier: 4, category: 'MATERIAL', skill: 'SMITHING', icon: '💠', examine: 'A mithril bar.', stackable: true, tradeable: true },
    adamant_bar: { id: 'adamant_bar', name: 'Adamant Bar', tier: 5, category: 'MATERIAL', skill: 'SMITHING', icon: '💚', examine: 'An adamant bar.', stackable: true, tradeable: true },

    // ===== TOOLS =====
    bronze_pickaxe: { id: 'bronze_pickaxe', name: 'Bronze Pickaxe', tier: 1, category: 'TOOL', equipSlot: 'WEAPON', icon: '⛏️', examine: 'A bronze pickaxe.', stackable: false, tradeable: true },
    iron_pickaxe: { id: 'iron_pickaxe', name: 'Iron Pickaxe', tier: 2, category: 'TOOL', equipSlot: 'WEAPON', icon: '⛏️', examine: 'An iron pickaxe.', stackable: false, tradeable: true },
    bronze_axe: { id: 'bronze_axe', name: 'Bronze Axe', tier: 1, category: 'TOOL', equipSlot: 'WEAPON', icon: '🪓', examine: 'A bronze hatchet.', stackable: false, tradeable: true },
    iron_axe: { id: 'iron_axe', name: 'Iron Axe', tier: 2, category: 'TOOL', equipSlot: 'WEAPON', icon: '🪓', examine: 'An iron hatchet.', stackable: false, tradeable: true },

    // ===== WEAPONS =====
    bronze_sword: { id: 'bronze_sword', name: 'Bronze Sword', tier: 1, category: 'EQUIPMENT', equipSlot: 'WEAPON', icon: '⚔️', examine: 'A bronze sword.', stackable: false, tradeable: true },
    iron_sword: { id: 'iron_sword', name: 'Iron Sword', tier: 2, category: 'EQUIPMENT', equipSlot: 'WEAPON', icon: '⚔️', examine: 'An iron sword.', stackable: false, tradeable: true },
    steel_sword: { id: 'steel_sword', name: 'Steel Sword', tier: 3, category: 'EQUIPMENT', equipSlot: 'WEAPON', icon: '⚔️', examine: 'A steel sword.', stackable: false, tradeable: true },

    // ===== ARMOR =====
    bronze_helmet: { id: 'bronze_helmet', name: 'Bronze Helmet', tier: 1, category: 'EQUIPMENT', equipSlot: 'HELMET', icon: '⛑️', examine: 'A bronze helmet.', stackable: false, tradeable: true },
    bronze_platebody: { id: 'bronze_platebody', name: 'Bronze Platebody', tier: 1, category: 'EQUIPMENT', equipSlot: 'BODY', icon: '🛡️', examine: 'A bronze platebody.', stackable: false, tradeable: true },
    bronze_platelegs: { id: 'bronze_platelegs', name: 'Bronze Platelegs', tier: 1, category: 'EQUIPMENT', equipSlot: 'LEGS', icon: '👖', examine: 'Bronze platelegs.', stackable: false, tradeable: true },

    // ===== COOKED FOOD =====
    cooked_shrimp: { id: 'cooked_shrimp', name: 'Cooked Shrimp', tier: 1, category: 'CONSUMABLE', icon: '🍤', examine: 'Some nicely cooked shrimp.', stackable: true, tradeable: true },
    cooked_trout: { id: 'cooked_trout', name: 'Cooked Trout', tier: 2, category: 'CONSUMABLE', icon: '🍖', examine: 'A nicely cooked trout.', stackable: true, tradeable: true },
    cooked_lobster: { id: 'cooked_lobster', name: 'Cooked Lobster', tier: 3, category: 'CONSUMABLE', icon: '🦞', examine: 'A delicious cooked lobster.', stackable: true, tradeable: true },

    // ===== ICE AGE (TUTORIAL) =====
    twigs: { id: 'twigs', name: 'Twigs', tier: 0, category: 'RESOURCE', skill: 'WOODCUTTING', icon: '🌿', examine: 'Small branches gathered from a sapling.', stackable: true, tradeable: true, era: 0 },
    flint: { id: 'flint', name: 'Flint', tier: 0, category: 'RESOURCE', skill: 'MINING', icon: '🪨', examine: 'A sharp piece of flint.', stackable: true, tradeable: true, era: 0 },
    hand_axe_primitive: { id: 'hand_axe_primitive', name: 'Hand Axe', tier: 0, category: 'TOOL', equipSlot: 'WEAPON', icon: '🪓', examine: 'A crude axe made of flint and twigs.', stackable: false, tradeable: true, stats: { power: 2, aim: 1 }, era: 0 },
    raw_mammoth_steak: { id: 'raw_mammoth_steak', name: 'Raw Mammoth Steak', tier: 0, category: 'CONSUMABLE', skill: 'COOKING', icon: '🥩', examine: 'A huge slab of raw mammoth meat.', stackable: true, tradeable: true, era: 0 },
    cooked_mammoth_steak: { id: 'cooked_mammoth_steak', name: 'Mammoth Steak', tier: 0, category: 'CONSUMABLE', icon: '🍖', examine: 'A delicious, prehistoric steak.', stackable: true, tradeable: true, stats: { healAmount: 8 }, era: 0 },
};

export type ItemId = keyof typeof ITEM_DEFINITIONS;
