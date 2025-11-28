import { Recipe, SkillName } from '../../types';

// Crafting Recipes for various stations
export interface CraftingRecipe extends Recipe {
    station: 'FURNACE' | 'ANVIL' | 'RANGE' | 'CRAFTING_TABLE';
}

export const CRAFTING_RECIPES: Record<string, CraftingRecipe> = {
    // ===== FURNACE (SMELTING) =====
    smelt_bronze_bar: {
        id: 'smelt_bronze_bar',
        name: 'Bronze Bar',
        station: 'FURNACE',
        skill: 'SMITHING',
        levelReq: 1,
        xp: 6.25,
        ingredients: [
            { id: 'copper_ore', qty: 1 },
            { id: 'tin_ore', qty: 1 }
        ],
        output: 'bronze_bar',
        outputQty: 1
    },
    smelt_iron_bar: {
        id: 'smelt_iron_bar',
        name: 'Iron Bar',
        station: 'FURNACE',
        skill: 'SMITHING',
        levelReq: 15,
        xp: 12.5,
        ingredients: [{ id: 'iron_ore', qty: 1 }],
        output: 'iron_bar',
        outputQty: 1
    },
    smelt_steel_bar: {
        id: 'smelt_steel_bar',
        name: 'Steel Bar',
        station: 'FURNACE',
        skill: 'SMITHING',
        levelReq: 30,
        xp: 17.5,
        ingredients: [
            { id: 'iron_ore', qty: 1 },
            { id: 'coal', qty: 2 }
        ],
        output: 'steel_bar',
        outputQty: 1
    },
    smelt_mithril_bar: {
        id: 'smelt_mithril_bar',
        name: 'Mithril Bar',
        station: 'FURNACE',
        skill: 'SMITHING',
        levelReq: 50,
        xp: 30,
        ingredients: [
            { id: 'mithril_ore', qty: 1 },
            { id: 'coal', qty: 4 }
        ],
        output: 'mithril_bar',
        outputQty: 1
    },
    smelt_adamant_bar: {
        id: 'smelt_adamant_bar',
        name: 'Adamant Bar',
        station: 'FURNACE',
        skill: 'SMITHING',
        levelReq: 70,
        xp: 37.5,
        ingredients: [
            { id: 'adamant_ore', qty: 1 },
            { id: 'coal', qty: 6 }
        ],
        output: 'adamant_bar',
        outputQty: 1
    },
    smelt_rune_bar: {
        id: 'smelt_rune_bar',
        name: 'Rune Bar',
        station: 'FURNACE',
        skill: 'SMITHING',
        levelReq: 85,
        xp: 50,
        ingredients: [
            { id: 'runite_ore', qty: 1 },
            { id: 'coal', qty: 8 }
        ],
        output: 'rune_bar',
        outputQty: 1
    },

    // ===== ANVIL (SMITHING) =====
    smith_bronze_sword: {
        id: 'smith_bronze_sword',
        name: 'Bronze Sword',
        station: 'ANVIL',
        skill: 'SMITHING',
        levelReq: 1,
        xp: 12,
        ingredients: [{ id: 'bronze_bar', qty: 1 }],
        output: 'bronze_sword',
        outputQty: 1
    },
    smith_bronze_pickaxe: {
        id: 'smith_bronze_pickaxe',
        name: 'Bronze Pickaxe',
        station: 'ANVIL',
        skill: 'SMITHING',
        levelReq: 1,
        xp: 10,
        ingredients: [{ id: 'bronze_bar', qty: 2 }],
        output: 'bronze_pickaxe',
        outputQty: 1
    },
    smith_bronze_axe: {
        id: 'smith_bronze_axe',
        name: 'Bronze Axe',
        station: 'ANVIL',
        skill: 'SMITHING',
        levelReq: 1,
        xp: 10,
        ingredients: [{ id: 'bronze_bar', qty: 1 }],
        output: 'bronze_axe',
        outputQty: 1
    },
    smith_iron_sword: {
        id: 'smith_iron_sword',
        name: 'Iron Sword',
        station: 'ANVIL',
        skill: 'SMITHING',
        levelReq: 15,
        xp: 25,
        ingredients: [{ id: 'iron_bar', qty: 1 }],
        output: 'iron_sword',
        outputQty: 1
    },
    smith_bronze_helmet: {
        id: 'smith_bronze_helmet',
        name: 'Bronze Helmet',
        station: 'ANVIL',
        skill: 'SMITHING',
        levelReq: 1,
        xp: 12,
        ingredients: [{ id: 'bronze_bar', qty: 1 }],
        output: 'bronze_helmet',
        outputQty: 1
    },

    // ===== COOKING RANGE =====
    cook_shrimp: {
        id: 'cook_shrimp',
        name: 'Cook Shrimp',
        station: 'RANGE',
        skill: 'COOKING',
        levelReq: 1,
        xp: 30,
        ingredients: [{ id: 'raw_shrimp', qty: 1 }],
        output: 'cooked_shrimp',
        outputQty: 1
    },
    cook_trout: {
        id: 'cook_trout',
        name: 'Cook Trout',
        station: 'RANGE',
        skill: 'COOKING',
        levelReq: 15,
        xp: 70,
        ingredients: [{ id: 'raw_trout', qty: 1 }],
        output: 'cooked_trout',
        outputQty: 1
    },
    cook_lobster: {
        id: 'cook_lobster',
        name: 'Cook Lobster',
        station: 'RANGE',
        skill: 'COOKING',
        levelReq: 40,
        xp: 120,
        ingredients: [{ id: 'raw_lobster', qty: 1 }],
        output: 'cooked_lobster',
        outputQty: 1
    },

    // ===== ICE AGE (PRIMITIVE CRAFTING) =====
    craft_hand_axe: {
        id: 'craft_hand_axe',
        name: 'Hand Axe',
        station: 'CRAFTING_TABLE',
        skill: 'CRAFTING',
        levelReq: 1,
        xp: 10,
        ingredients: [
            { id: 'twigs', qty: 2 },
            { id: 'flint', qty: 1 }
        ],
        output: 'hand_axe_primitive',
        outputQty: 1
    },
    cook_mammoth: {
        id: 'cook_mammoth',
        name: 'Cook Mammoth',
        station: 'RANGE',
        skill: 'COOKING',
        levelReq: 1,
        xp: 100,
        ingredients: [{ id: 'raw_mammoth_steak', qty: 1 }],
        output: 'cooked_mammoth_steak',
        outputQty: 1
    },
};

// Helper to get recipes for a specific station
export function getRecipesForStation(station: 'FURNACE' | 'ANVIL' | 'RANGE' | 'CRAFTING_TABLE'): CraftingRecipe[] {
    return Object.values(CRAFTING_RECIPES).filter(r => r.station === station);
}

// Helper to check if player can craft recipe
export function canCraftRecipe(recipe: CraftingRecipe, playerLevel: number, inventory: any[]): { canCraft: boolean; reason?: string } {
    if (playerLevel < recipe.levelReq) {
        return { canCraft: false, reason: `You need level ${recipe.levelReq} ${recipe.skill}.` };
    }

    for (const ingredient of recipe.ingredients) {
        const itemCount = inventory.filter(i => i.id === ingredient.id).reduce((sum, i) => sum + (i.count || 1), 0);
        if (itemCount < ingredient.qty) {
            return { canCraft: false, reason: `Not enough ${ingredient.id}.` };
        }
    }

    return { canCraft: true };
}
