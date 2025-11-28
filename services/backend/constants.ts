import { SkillName, SkillDefinition, SkillType, Prayer, SkillGuideItem, Spell, Recipe, InventoryItem } from '../../types';

// --- XP TABLES & LEVELING CONSTANTS ---
export const MAX_LEVEL = 120;

export const generateXPTable = (max: number): number[] => {
    const xp = [0];
    let pts = 0;
    for (let lvl = 1; lvl <= max; lvl++) {
        pts += Math.floor(lvl + 300 * Math.pow(2, lvl / 7.0));
        xp[lvl] = Math.floor(pts / 4);
    }
    return xp;
};

export const SKILL_XP_TABLE = generateXPTable(MAX_LEVEL);

export const getLevelForXP = (xp: number, table: number[]) => {
    for (let i = 1; i < table.length - 1; i++) {
        if (xp < table[i + 1]) return i;
    }
    return table.length - 1;
};

// --- SKILL & ERA CONFIGURATION ---
export const ERA_DATA = [
    { id: 0, name: "Caveman", minLvl: 0 },
    { id: 1, name: "Prehistoric Human", minLvl: 10 },
    { id: 2, name: "Ancient Village", minLvl: 20 },
    { id: 3, name: "Lost Civilization", minLvl: 30 }, // Unlocks EGYPT
    { id: 4, name: "Bronze Age", minLvl: 40 },
    { id: 5, name: "Iron Age", minLvl: 50 },
    { id: 6, name: "Classical Era", minLvl: 60 },
    { id: 7, name: "Medieval Era", minLvl: 70 },
    { id: 8, name: "Renaissance", minLvl: 80 },
    { id: 9, name: "Industrial Era", minLvl: 90 },
    { id: 10, name: "Atomic Age", minLvl: 100 },
    { id: 11, name: "Information Age", minLvl: 110 },
    { id: 12, name: "Deity/Godhood", minLvl: 120 }
];

export const SKILL_DEFINITIONS: Record<SkillName, SkillDefinition> = {
    // COMBAT SKILLS
    ATTACK: { id: 'ATTACK', name: 'Attack', skillType: 'COMBAT', maxLevel: 120, eraUnlocked: 0, dependencies: [], items: ['Hand Axe', 'Bone Spear', 'Bronze Sword'] },
    DEFENSE: { id: 'DEFENSE', name: 'Defense', skillType: 'COMBAT', maxLevel: 120, eraUnlocked: 0, dependencies: [], items: ['Wooden Shield', 'Bone Shield'] },
    STRENGTH: { id: 'STRENGTH', name: 'Strength', skillType: 'COMBAT', maxLevel: 120, eraUnlocked: 0, dependencies: [], items: [] },
    HITS: { id: 'HITS', name: 'Hitpoints', skillType: 'COMBAT', maxLevel: 120, eraUnlocked: 0, dependencies: [], items: [] },
    RANGED: { id: 'RANGED', name: 'Ranged', skillType: 'COMBAT', maxLevel: 120, eraUnlocked: 1, dependencies: [], items: ['Slingshot', 'Shortbow'] },
    PRAYER: { id: 'PRAYER', name: 'Prayer', skillType: 'COMBAT', maxLevel: 120, eraUnlocked: 1, dependencies: [], items: ['Bones'] },
    MAGIC: { id: 'MAGIC', name: 'Magic', skillType: 'COMBAT', maxLevel: 120, eraUnlocked: 3, dependencies: ['CRAFTING'], items: ['Runes', 'Enchanted Jewelry'] },

    // GATHERING SKILLS
    MINING: { id: 'MINING', name: 'Mining', skillType: 'GATHERING', maxLevel: 120, eraUnlocked: 0, dependencies: [], items: ['Copper Ore'] },
    WOODCUTTING: { id: 'WOODCUTTING', name: 'Woodcutting', skillType: 'GATHERING', maxLevel: 120, eraUnlocked: 0, dependencies: [], items: ['Logs'] },
    FISHING: { id: 'FISHING', name: 'Fishing', skillType: 'GATHERING', maxLevel: 120, eraUnlocked: 0, dependencies: [], items: ['Raw Shrimp'] },
    FARMING: { id: 'FARMING', name: 'Farming', skillType: 'GATHERING', maxLevel: 120, eraUnlocked: 2, dependencies: [], items: ['Seeds'] },
    HUNTER: { id: 'HUNTER', name: 'Hunter', skillType: 'GATHERING', maxLevel: 120, eraUnlocked: 1, dependencies: [], items: ['Traps'] },

    // ARTISAN SKILLS
    SMITHING: { id: 'SMITHING', name: 'Smithing', skillType: 'ARTISAN', maxLevel: 120, eraUnlocked: 3, dependencies: ['MINING'], items: ['Bronze Bar'] },
    CRAFTING: { id: 'CRAFTING', name: 'Crafting', skillType: 'ARTISAN', maxLevel: 120, eraUnlocked: 0, dependencies: [], items: ['Leather'] },
    FLETCHING: { id: 'FLETCHING', name: 'Fletching', skillType: 'ARTISAN', maxLevel: 120, eraUnlocked: 1, dependencies: ['WOODCUTTING'], items: ['Arrow Shaft'] },
    COOKING: { id: 'COOKING', name: 'Cooking', skillType: 'ARTISAN', maxLevel: 120, eraUnlocked: 0, dependencies: ['FISHING'], items: ['Meat'] },
    FIREMAKING: { id: 'FIREMAKING', name: 'Firemaking', skillType: 'ARTISAN', maxLevel: 120, eraUnlocked: 0, dependencies: ['WOODCUTTING'], items: ['Fire'] },
    HERBLORE: { id: 'HERBLORE', name: 'Herblore', skillType: 'ARTISAN', maxLevel: 120, eraUnlocked: 5, dependencies: ['FARMING'], items: ['Herbs'] },
    CONSTRUCTION: { id: 'CONSTRUCTION', name: 'Construction', skillType: 'ARTISAN', maxLevel: 120, eraUnlocked: 4, dependencies: ['WOODCUTTING', 'CRAFTING'], items: ['Planks'] },

    // SUPPORT SKILLS
    AGILITY: { id: 'AGILITY', name: 'Agility', skillType: 'SUPPORT', maxLevel: 120, eraUnlocked: 1, dependencies: [], items: ['Shortcuts'] },
    THIEVING: { id: 'THIEVING', name: 'Thieving', skillType: 'SUPPORT', maxLevel: 120, eraUnlocked: 2, dependencies: [], items: ['Coins'] },
    SLAYER: { id: 'SLAYER', name: 'Slayer', skillType: 'SUPPORT', maxLevel: 120, eraUnlocked: 6, dependencies: ['ATTACK', 'STRENGTH', 'DEFENSE'], items: [] },

    // SPECIAL SKILLS
    EVOLUTION: { id: 'EVOLUTION', name: 'Evolution', skillType: 'SPECIAL', maxLevel: 120, eraUnlocked: 0, dependencies: [], items: ['New Eras', 'Technology'] }
};

// --- SKILL PROGRESSION & LEVEL REQUIREMENTS ---
export interface SkillUnlock {
    level: number;
    item?: string;
    action?: string;
    xpBonus?: number;
    successRate?: number;
}

export const SKILL_PROGRESSION: Record<SkillName, SkillUnlock[]> = {
    WOODCUTTING: [
        { level: 1, item: 'logs', action: 'Chop Tree', xpBonus: 25 },
        { level: 15, item: 'oak_logs', action: 'Chop Oak', xpBonus: 37.5 },
        { level: 30, item: 'willow_logs', action: 'Chop Willow', xpBonus: 67.5 },
        { level: 45, item: 'maple_logs', action: 'Chop Maple', xpBonus: 100 },
        { level: 60, item: 'yew_logs', action: 'Chop Yew', xpBonus: 175 },
        { level: 75, item: 'magic_logs', action: 'Chop Magic Tree', xpBonus: 250 }
    ],
    MINING: [
        { level: 1, item: 'copper_ore', action: 'Mine Copper', xpBonus: 17.5 },
        { level: 1, item: 'tin_ore', action: 'Mine Tin', xpBonus: 17.5 },
        { level: 15, item: 'iron_ore', action: 'Mine Iron', xpBonus: 35 },
        { level: 30, item: 'coal', action: 'Mine Coal', xpBonus: 50 },
        { level: 40, item: 'gold_ore', action: 'Mine Gold', xpBonus: 65 },
        { level: 55, item: 'mithril_ore', action: 'Mine Mithril', xpBonus: 80 },
        { level: 70, item: 'adamantite_ore', action: 'Mine Adamantite', xpBonus: 95 },
        { level: 85, item: 'runite_ore', action: 'Mine Runite', xpBonus: 125 }
    ],
    FISHING: [
        { level: 1, item: 'raw_shrimp', action: 'Net Fishing', xpBonus: 10 },
        { level: 5, item: 'raw_sardine', action: 'Bait Fishing', xpBonus: 20 },
        { level: 10, item: 'raw_herring', action: 'Bait Fishing', xpBonus: 30 },
        { level: 20, item: 'raw_trout', action: 'Fly Fishing', xpBonus: 50 },
        { level: 30, item: 'raw_pike', action: 'Bait Fishing', xpBonus: 60 },
        { level: 40, item: 'raw_salmon', action: 'Fly Fishing', xpBonus: 70 },
        { level: 50, item: 'raw_tuna', action: 'Harpoon', xpBonus: 80 },
        { level: 62, item: 'raw_lobster', action: 'Cage', xpBonus: 90 },
        { level: 76, item: 'raw_swordfish', action: 'Harpoon', xpBonus: 100 },
        { level: 91, item: 'raw_shark', action: 'Harpoon', xpBonus: 110 }
    ],
    COOKING: [
        { level: 1, item: 'cooked_shrimp', action: 'Cook Shrimp', xpBonus: 30, successRate: 0.5 },
        { level: 5, item: 'cooked_sardine', action: 'Cook Sardine', xpBonus: 40, successRate: 0.55 },
        { level: 15, item: 'cooked_trout', action: 'Cook Trout', xpBonus: 70, successRate: 0.65 },
        { level: 30, item: 'cooked_salmon', action: 'Cook Salmon', xpBonus: 90, successRate: 0.7 },
        { level: 40, item: 'cooked_tuna', action: 'Cook Tuna', xpBonus: 100, successRate: 0.75 },
        { level: 50, item: 'cooked_lobster', action: 'Cook Lobster', xpBonus: 120, successRate: 0.8 },
        { level: 80, item: 'cooked_shark', action: 'Cook Shark', xpBonus: 210, successRate: 0.85 }
    ],
    SMITHING: [
        { level: 1, item: 'bronze_bar', action: 'Smelt Bronze', xpBonus: 6.25 },
        { level: 15, item: 'iron_bar', action: 'Smelt Iron', xpBonus: 12.5 },
        { level: 30, item: 'steel_bar', action: 'Smelt Steel', xpBonus: 17.5 },
        { level: 40, item: 'gold_bar', action: 'Smelt Gold', xpBonus: 22.5 },
        { level: 50, item: 'mithril_bar', action: 'Smelt Mithril', xpBonus: 30 },
        { level: 70, item: 'adamant_bar', action: 'Smelt Adamant', xpBonus: 37.5 },
        { level: 85, item: 'rune_bar', action: 'Smelt Rune', xpBonus: 50 }
    ],
    CRAFTING: [
        { level: 1, item: 'leather_gloves', action: 'Craft Gloves', xpBonus: 13.8 },
        { level: 7, item: 'leather_boots', action: 'Craft Boots', xpBonus: 16.25 },
        { level: 14, item: 'leather_body', action: 'Craft Body', xpBonus: 25 },
        { level: 20, item: 'hardleather_body', action: 'Craft Hard Leather', xpBonus: 35 },
        { level: 38, item: 'studded_body', action: 'Craft Studded', xpBonus: 40 }
    ],
    FLETCHING: [
        { level: 1, item: 'arrow_shaft', action: 'Cut Logs', xpBonus: 5 },
        { level: 1, item: 'headless_arrow', action: 'Attach Feather', xpBonus: 1 },
        { level: 1, item: 'bronze_arrow', action: 'Add Bronze Tips', xpBonus: 1.5 },
        { level: 5, item: 'shortbow', action: 'String Shortbow', xpBonus: 5 },
        { level: 10, item: 'longbow', action: 'String Longbow', xpBonus: 10 },
        { level: 25, item: 'oak_shortbow', action: 'String Oak Shortbow', xpBonus: 16.5 },
        { level: 40, item: 'willow_longbow', action: 'String Willow Longbow', xpBonus: 41.5 },
        { level: 70, item: 'yew_longbow', action: 'String Yew Longbow', xpBonus: 75 }
    ],
    FIREMAKING: [
        { level: 1, item: 'fire_normal', action: 'Light Logs', xpBonus: 40 },
        { level: 15, item: 'fire_oak', action: 'Light Oak', xpBonus: 60 },
        { level: 30, item: 'fire_willow', action: 'Light Willow', xpBonus: 90 },
        { level: 45, item: 'fire_maple', action: 'Light Maple', xpBonus: 135 },
        { level: 60, item: 'fire_yew', action: 'Light Yew', xpBonus: 202.5 },
        { level: 75, item: 'fire_magic', action: 'Light Magic Logs', xpBonus: 303.8 }
    ],
    PRAYER: [
        { level: 1, item: 'bones', action: 'Bury Bones', xpBonus: 4.5 },
        { level: 15, item: 'big_bones', action: 'Bury Big Bones', xpBonus: 15 },
        { level: 30, item: 'dragon_bones', action: 'Bury Dragon Bones', xpBonus: 72 }
    ],
    HERBLORE: [
        { level: 1, item: 'herb_clean', action: 'Clean Herb', xpBonus: 2.5 },
        { level: 3, item: 'attack_potion', action: 'Make Attack Potion', xpBonus: 25 },
        { level: 5, item: 'antipoison', action: 'Make Antipoison', xpBonus: 37.5 },
        { level: 12, item: 'strength_potion', action: 'Make Strength Potion', xpBonus: 50 },
        { level: 26, item: 'restore_potion', action: 'Make Restore', xpBonus: 62.5 },
        { level: 38, item: 'prayer_potion', action: 'Make Prayer Potion', xpBonus: 87.5 },
        { level: 45, item: 'super_attack', action: 'Make Super Attack', xpBonus: 100 }
    ],
    THIEVING: [
        { level: 1, item: 'coins', action: 'Pickpocket Man', xpBonus: 8, successRate: 0.5 },
        { level: 10, item: 'silk', action: 'Steal from Stall', xpBonus: 24, successRate: 0.7 },
        { level: 25, item: 'cake', action: 'Steal Cake', xpBonus: 16, successRate: 0.65 },
        { level: 40, item: 'gems', action: 'Pickpocket Guard', xpBonus: 46.8, successRate: 0.6 },
        { level: 55, item: 'jewelry', action: 'Steal Jewelry', xpBonus: 54, successRate: 0.75 },
        { level: 70, item: 'gold_ore', action: 'Pickpocket Hero', xpBonus: 84.3, successRate: 0.5 }
    ],
    AGILITY: [
        { level: 1, action: 'Gnome Agility Course', xpBonus: 85 },
        { level: 20, action: 'Barbarian Outpost', xpBonus: 150 },
        { level: 35, action: 'Wilderness Course', xpBonus: 240 },
        { level: 52, action: 'Werewolf Course', xpBonus: 380 },
        { level: 70, action: 'Ardougne Rooftop', xpBonus: 480 },
        { level: 90, action: 'Advanced Course', xpBonus: 790 }
    ],
    FARMING: [
        { level: 1, item: 'potato_seed', action: 'Plant Potato', xpBonus: 8 },
        { level: 5, item: 'onion_seed', action: 'Plant Onion', xpBonus: 9.5 },
        { level: 12, item: 'cabbage_seed', action: 'Plant Cabbage', xpBonus: 10 },
        { level: 31, item: 'tomato_seed', action: 'Plant Tomato', xpBonus: 12.5 },
        { level: 47, item: 'strawberry_seed', action: 'Plant Strawberry', xpBonus: 26 }
    ],
    HUNTER: [
        { level: 1, item: 'raw_bird_meat', action: 'Bird Snare', xpBonus: 25 },
        { level: 11, item: 'tropical_wagtail', action: 'Bird Trap', xpBonus: 48 },
        { level: 27, item: 'chinchompa', action: 'Box Trap', xpBonus: 198 },
        { level: 43, item: 'red_salamander', action: 'Net Trap', xpBonus: 224 },
        { level: 63, item: 'black_chinchompa', action: 'Box Trap', xpBonus: 315 }
    ],
    CONSTRUCTION: [
        { level: 1, item: 'crude_chair', action: 'Build Chair', xpBonus: 58 },
        { level: 10, item: 'wooden_table', action: 'Build Table', xpBonus: 87 },
        { level: 22, item: 'oak_door', action: 'Build Oak Door', xpBonus: 120 },
        { level: 33, item: 'teak_bench', action: 'Build Teak Bench', xpBonus: 180 },
        { level: 50, item: 'mahogany_throne', action: 'Build Throne', xpBonus: 350 },
        { level: 75, item: 'marble_altar', action: 'Build Altar', xpBonus: 1490 }
    ],
    SLAYER: [
        { level: 1, action: 'Kill Goblins', xpBonus: 5 },
        { level: 15, action: 'Kill Hill Giants', xpBonus: 40 },
        { level: 30, action: 'Kill Bloodvelds', xpBonus: 120 },
        { level: 50, action: 'Kill Dust Devils', xpBonus: 190 },
        { level: 75, action: 'Kill Abyssal Demons', xpBonus: 150 },
        { level: 95, action: 'Kill Dark Beasts', xpBonus: 220 }
    ],
    ATTACK: [
        { level: 1, item: 'bronze_sword', xpBonus: 4 },
        { level: 10, item: 'iron_sword', xpBonus: 4 },
        { level: 20, item: 'steel_sword', xpBonus: 4 },
        { level: 30, item: 'mithril_sword', xpBonus: 4 },
        { level: 40, item: 'adamant_sword', xpBonus: 4 },
        { level: 50, item: 'rune_sword', xpBonus: 4 }
    ],
    STRENGTH: [
        { level: 1, item: 'bronze_2h', xpBonus: 4 },
        { level: 10, item: 'iron_2h', xpBonus: 4 },
        { level: 20, item: 'steel_2h', xpBonus: 4 },
        { level: 30, item: 'mithril_2h', xpBonus: 4 },
        { level: 40, item: 'adamant_2h', xpBonus: 4 },
        { level: 50, item: 'rune_2h', xpBonus: 4 }
    ],
    DEFENSE: [
        { level: 1, item: 'bronze_platebody', xpBonus: 1.33 },
        { level: 10, item: 'iron_platebody', xpBonus: 1.33 },
        { level: 20, item: 'steel_platebody', xpBonus: 1.33 },
        { level: 30, item: 'mithril_platebody', xpBonus: 1.33 },
        { level: 40, item: 'adamant_platebody', xpBonus: 1.33 },
        { level: 50, item: 'rune_platebody', xpBonus: 1.33 }
    ],
    RANGED: [
        { level: 1, item: 'shortbow', xpBonus: 4 },
        { level: 5, item: 'oak_shortbow', xpBonus: 4 },
        { level: 20, item: 'willow_shortbow', xpBonus: 4 },
        { level: 40, item: 'maple_shortbow', xpBonus: 4 },
        { level: 50, item: 'yew_shortbow', xpBonus: 4 }
    ],
    MAGIC: [
        { level: 1, action: 'Wind Strike', xpBonus: 5.5 },
        { level: 5, action: 'Water Strike', xpBonus: 7.5 },
        { level: 9, action: 'Earth Strike', xpBonus: 9.5 },
        { level: 13, action: 'Fire Strike', xpBonus: 11.5 },
        { level: 25, action: 'Teleport Lumbridge', xpBonus: 41 },
        { level: 45, action: 'Superheat Item', xpBonus: 53 },
        { level: 55, action: 'High Alchemy', xpBonus: 65 }
    ],
    HITS: [
        { level: 1, xpBonus: 1.33 }
    ],
    EVOLUTION: [
        { level: 10, action: 'Evolve to Era 1' },
        { level: 20, action: 'Evolve to Era 2' },
        { level: 30, action: 'Evolve to Era 3' },
        { level: 40, action: 'Evolve to Era 4' },
        { level: 50, action: 'Evolve to Era 5' }
    ]
};

export const PRAYERS: Prayer[] = [
    { id: 'thick_skin', name: 'Thick Skin', level: 1, description: '+5% Defense', icon: '🛡️', drainRate: 1 },
    { id: 'burst_strength', name: 'Burst of Strength', level: 4, description: '+5% Strength', icon: '💪', drainRate: 1 },
    { id: 'clarity_thought', name: 'Clarity of Thought', level: 7, description: '+5% Attack', icon: '👁️', drainRate: 1 },
    { id: 'rock_skin', name: 'Rock Skin', level: 10, description: '+10% Defense', icon: '🧱', drainRate: 2 },
    { id: 'superhuman', name: 'Superhuman Strength', level: 13, description: '+10% Strength', icon: '🏋️', drainRate: 2 },
    { id: 'improved_reflexes', name: 'Improved Reflexes', level: 16, description: '+10% Attack', icon: '🤺', drainRate: 2 },
    { id: 'rapid_restore', name: 'Rapid Restore', level: 19, description: '2x HP Restore', icon: '❤️', drainRate: 1 },
    { id: 'rapid_heal', name: 'Rapid Heal', level: 22, description: '2x Stat Restore', icon: '🩹', drainRate: 1 },
    { id: 'protect_item', name: 'Protect Item', level: 25, description: 'Keep 1 extra item', icon: '🎒', drainRate: 1 },
    { id: 'steel_skin', name: 'Steel Skin', level: 28, description: '+15% Defense', icon: '⛓️', drainRate: 3 },
    { id: 'ultimate_strength', name: 'Ultimate Strength', level: 31, description: '+15% Strength', icon: '🔥', drainRate: 3 },
    { id: 'incredible_reflexes', name: 'Incredible Reflexes', level: 34, description: '+15% Attack', icon: '⚡', drainRate: 3 },
    { id: 'protect_magic', name: 'Protect from Magic', level: 37, description: 'Invulnerability to Magic', icon: '🔮', drainRate: 4 },
    { id: 'protect_missiles', name: 'Protect from Missiles', level: 40, description: 'Invulnerability to Ranged', icon: '🏹', drainRate: 4 },
    { id: 'protect_melee', name: 'Protect from Melee', level: 43, description: 'Invulnerability to Melee', icon: '⚔️', drainRate: 4 },
];

export const getAINameForEra = (era: number): string => {
    const names = [
        "Gronk", "Gronk", "Chieftain Gronk", "Overseer Gronk",
        "Sir Gronk", "General Gronk", "Senator Gronk", "Lord Gronk",
        "Unit GR-0NK", "Gronk Prime", "Gronk X", "Neo Gronk", "The One"
    ];
    return names[Math.min(era, names.length - 1)];
};

export const SKILL_REGISTRY: SkillName[] = Object.keys(SKILL_DEFINITIONS) as SkillName[];

export const SKILL_GUIDES: Partial<Record<SkillName, SkillGuideItem[]>> = {
    ATTACK: [
        { level: 1, name: 'Bronze Weapons', icon: '⚔️', description: 'Wield Bronze weaponry.', era: 4 },
        { level: 60, name: 'Dragon Weapons', icon: '⚔️', description: 'Wield Dragon weaponry.', era: 7 },
        { level: 99, name: 'Skill Mastery', icon: '👑', description: 'Become a Master of Attack.', era: 11 },
        { level: 120, name: 'Godly Might', icon: '⚡', description: 'Wield the power of the Gods.', era: 12 },
    ],
    EVOLUTION: [
        { level: 1, name: 'Caveman', icon: '🦴', description: 'The dawn of man.', era: 0 },
        { level: 40, name: 'Bronze Age', icon: '🧱', description: 'Discovery of metal.', era: 4 },
        { level: 100, name: 'Atomic Age', icon: '☢️', description: 'Splitting the atom.', era: 10 },
        { level: 120, name: 'Godhood', icon: '✨', description: 'Ascension.', era: 12 },
    ]
};

export const SPELLS: Spell[] = [
    { id: 'wind_strike', name: 'Wind Strike', level: 1, xp: 5.5, icon: '💨', description: 'A basic air missile.', type: 'COMBAT' },
    { id: 'confuse', name: 'Confuse', level: 3, xp: 13, icon: '😵', description: 'Reduces enemy attack.', type: 'COMBAT' },
    { id: 'water_strike', name: 'Water Strike', level: 5, xp: 7.5, icon: '💧', description: 'A basic water missile.', type: 'COMBAT' },
    { id: 'lvl1_enchant', name: 'Lvl-1 Enchant', level: 7, xp: 17.5, icon: '✨', description: 'Enchant jewelry.', type: 'UTILITY' },
    { id: 'earth_strike', name: 'Earth Strike', level: 9, xp: 9.5, icon: '🪨', description: 'A basic earth missile.', type: 'COMBAT' },
    { id: 'varrock_tele', name: 'Home Teleport', level: 25, xp: 35, icon: '🏛️', description: 'Teleport to the hub.', type: 'TELEPORT' },
    { id: 'high_alchemy', name: 'High Alchemy', level: 55, xp: 65, icon: '💰', description: 'Convert items to gold.', type: 'UTILITY' },
];

export const RECIPES: Record<string, { id: string; name: string; ingredients: { id: string; qty: number }[]; skill: SkillName; levelReq: number; xp: number; output: string; outputQty: number; station?: string }> = {
    // Primitive (Hand Crafting)
    'wooden_spear': { id: 'wooden_spear', name: 'Wooden Spear', ingredients: [{ id: 'logs', qty: 1 }, { id: 'flint', qty: 1 }], skill: 'CRAFTING', levelReq: 1, xp: 8, output: 'wooden_spear', outputQty: 1, station: 'CRAFTING_TABLE' },

    // FLETCHING
    'arrow_shaft': { id: 'arrow_shaft', name: 'Arrow Shafts', ingredients: [{ id: 'logs', qty: 1 }], skill: 'FLETCHING', levelReq: 1, xp: 5, output: 'arrow_shaft', outputQty: 15, station: 'FLETCHING_TABLE' },
    'headless_arrow': { id: 'headless_arrow', name: 'Headless Arrows', ingredients: [{ id: 'arrow_shaft', qty: 1 }, { id: 'feather', qty: 1 }], skill: 'FLETCHING', levelReq: 1, xp: 1, output: 'headless_arrow', outputQty: 1, station: 'FLETCHING_TABLE' },
    'shortbow': { id: 'shortbow', name: 'Shortbow', ingredients: [{ id: 'logs', qty: 1 }, { id: 'bow_string', qty: 1 }], skill: 'FLETCHING', levelReq: 5, xp: 10, output: 'shortbow', outputQty: 1, station: 'FLETCHING_TABLE' },

    // SPINNING
    'ball_of_wool': { id: 'ball_of_wool', name: 'Ball of Wool', ingredients: [{ id: 'wool', qty: 1 }], skill: 'CRAFTING', levelReq: 1, xp: 2.5, output: 'ball_of_wool', outputQty: 1, station: 'SPINNING_WHEEL' },
    'bow_string': { id: 'bow_string', name: 'Bow String', ingredients: [{ id: 'flax', qty: 1 }], skill: 'CRAFTING', levelReq: 10, xp: 15, output: 'bow_string', outputQty: 1, station: 'SPINNING_WHEEL' },

    // LOOM
    'cloth': { id: 'cloth', name: 'Cloth', ingredients: [{ id: 'ball_of_wool', qty: 4 }], skill: 'CRAFTING', levelReq: 10, xp: 12, output: 'cloth', outputQty: 1, station: 'LOOM' },

    // POTTERY
    'pot_unfired': { id: 'pot_unfired', name: 'Unfired Pot', ingredients: [{ id: 'soft_clay', qty: 1 }], skill: 'CRAFTING', levelReq: 1, xp: 6, output: 'pot_unfired', outputQty: 1, station: 'POTTERY_OVEN' },
    'pot': { id: 'pot', name: 'Pot', ingredients: [{ id: 'pot_unfired', qty: 1 }], skill: 'CRAFTING', levelReq: 1, xp: 6, output: 'pot', outputQty: 1, station: 'POTTERY_OVEN' },

    // TANNING
    'leather': { id: 'leather', name: 'Leather', ingredients: [{ id: 'cowhide', qty: 1 }], skill: 'CRAFTING', levelReq: 1, xp: 0, output: 'leather', outputQty: 1, station: 'TANNING_RACK' },

    // CRAFTING TABLE
    'leather_gloves': { id: 'leather_gloves', name: 'Leather Gloves', ingredients: [{ id: 'leather', qty: 1 }], skill: 'CRAFTING', levelReq: 1, xp: 13.8, output: 'leather_gloves', outputQty: 1, station: 'CRAFTING_TABLE' },
    'leather_boots': { id: 'leather_boots', name: 'Leather Boots', ingredients: [{ id: 'leather', qty: 1 }], skill: 'CRAFTING', levelReq: 7, xp: 16.25, output: 'leather_boots', outputQty: 1, station: 'CRAFTING_TABLE' },

    // FURNACE
    'bronze_bar': { id: 'bronze_bar', name: 'Bronze Bar', ingredients: [{ id: 'copper_ore', qty: 1 }, { id: 'tin_ore', qty: 1 }], skill: 'SMITHING', levelReq: 1, xp: 6.2, output: 'bronze_bar', outputQty: 1, station: 'FURNACE' },
    'iron_bar': { id: 'iron_bar', name: 'Iron Bar', ingredients: [{ id: 'iron_ore', qty: 1 }], skill: 'SMITHING', levelReq: 15, xp: 12.5, output: 'iron_bar', outputQty: 1, station: 'FURNACE' },

    // ANVIL - BRONZE
    'bronze_dagger': { id: 'bronze_dagger', name: 'Bronze Dagger', ingredients: [{ id: 'bronze_bar', qty: 1 }], skill: 'SMITHING', levelReq: 1, xp: 12.5, output: 'bronze_dagger', outputQty: 1, station: 'ANVIL' },
    'bronze_sword': { id: 'bronze_sword', name: 'Bronze Sword', ingredients: [{ id: 'bronze_bar', qty: 1 }], skill: 'SMITHING', levelReq: 1, xp: 12.5, output: 'bronze_sword', outputQty: 1, station: 'ANVIL' },
    'bronze_helm': { id: 'bronze_helm', name: 'Bronze Helm', ingredients: [{ id: 'bronze_bar', qty: 1 }], skill: 'SMITHING', levelReq: 3, xp: 12.5, output: 'bronze_helm', outputQty: 1, station: 'ANVIL' },
    'bronze_kiteshield': { id: 'bronze_kiteshield', name: 'Bronze Kiteshield', ingredients: [{ id: 'bronze_bar', qty: 3 }], skill: 'SMITHING', levelReq: 7, xp: 37.5, output: 'bronze_kiteshield', outputQty: 1, station: 'ANVIL' },
    'bronze_platelegs': { id: 'bronze_platelegs', name: 'Bronze Platelegs', ingredients: [{ id: 'bronze_bar', qty: 3 }], skill: 'SMITHING', levelReq: 11, xp: 37.5, output: 'bronze_platelegs', outputQty: 1, station: 'ANVIL' },
    'bronze_platebody': { id: 'bronze_platebody', name: 'Bronze Platebody', ingredients: [{ id: 'bronze_bar', qty: 5 }], skill: 'SMITHING', levelReq: 18, xp: 62.5, output: 'bronze_platebody', outputQty: 1, station: 'ANVIL' },

    // ANVIL - IRON
    'iron_dagger': { id: 'iron_dagger', name: 'Iron Dagger', ingredients: [{ id: 'iron_bar', qty: 1 }], skill: 'SMITHING', levelReq: 15, xp: 25, output: 'iron_dagger', outputQty: 1, station: 'ANVIL' },
    'iron_sword': { id: 'iron_sword', name: 'Iron Sword', ingredients: [{ id: 'iron_bar', qty: 1 }], skill: 'SMITHING', levelReq: 15, xp: 25, output: 'iron_sword', outputQty: 1, station: 'ANVIL' },
    'iron_helm': { id: 'iron_helm', name: 'Iron Helm', ingredients: [{ id: 'iron_bar', qty: 1 }], skill: 'SMITHING', levelReq: 18, xp: 25, output: 'iron_helm', outputQty: 1, station: 'ANVIL' },
    'iron_kiteshield': { id: 'iron_kiteshield', name: 'Iron Kiteshield', ingredients: [{ id: 'iron_bar', qty: 3 }], skill: 'SMITHING', levelReq: 22, xp: 75, output: 'iron_kiteshield', outputQty: 1, station: 'ANVIL' },
    'iron_platelegs': { id: 'iron_platelegs', name: 'Iron Platelegs', ingredients: [{ id: 'iron_bar', qty: 3 }], skill: 'SMITHING', levelReq: 26, xp: 75, output: 'iron_platelegs', outputQty: 1, station: 'ANVIL' },
    'iron_platebody': { id: 'iron_platebody', name: 'Iron Platebody', ingredients: [{ id: 'iron_bar', qty: 5 }], skill: 'SMITHING', levelReq: 33, xp: 125, output: 'iron_platebody', outputQty: 1, station: 'ANVIL' },

    // ANVIL - STEEL
    'steel_dagger': { id: 'steel_dagger', name: 'Steel Dagger', ingredients: [{ id: 'steel_bar', qty: 1 }], skill: 'SMITHING', levelReq: 30, xp: 37.5, output: 'steel_dagger', outputQty: 1, station: 'ANVIL' },
    'steel_sword': { id: 'steel_sword', name: 'Steel Sword', ingredients: [{ id: 'steel_bar', qty: 1 }], skill: 'SMITHING', levelReq: 30, xp: 37.5, output: 'steel_sword', outputQty: 1, station: 'ANVIL' },
    'steel_helm': { id: 'steel_helm', name: 'Steel Helm', ingredients: [{ id: 'steel_bar', qty: 1 }], skill: 'SMITHING', levelReq: 33, xp: 37.5, output: 'steel_helm', outputQty: 1, station: 'ANVIL' },
    'steel_kiteshield': { id: 'steel_kiteshield', name: 'Steel Kiteshield', ingredients: [{ id: 'steel_bar', qty: 3 }], skill: 'SMITHING', levelReq: 37, xp: 112.5, output: 'steel_kiteshield', outputQty: 1, station: 'ANVIL' },
    'steel_platelegs': { id: 'steel_platelegs', name: 'Steel Platelegs', ingredients: [{ id: 'steel_bar', qty: 3 }], skill: 'SMITHING', levelReq: 41, xp: 112.5, output: 'steel_platelegs', outputQty: 1, station: 'ANVIL' },
    'steel_platebody': { id: 'steel_platebody', name: 'Steel Platebody', ingredients: [{ id: 'steel_bar', qty: 5 }], skill: 'SMITHING', levelReq: 48, xp: 187.5, output: 'steel_platebody', outputQty: 1, station: 'ANVIL' },
};

// Helper function to create inventory items
export const createItem = (id: string, count: number = 1): InventoryItem => {
    // Base template
    const base: InventoryItem = {
        id,
        name: id.replace(/_/g, ' ').toUpperCase(),
        count,
        type: 'MISC',
        tags: ['TAG_STACKABLE'], // Default to stackable (Infinite Stacking Rule)
        icon: '📦'
    };

    // Helper to remove stackable tag for equipment (unless overridden)
    const makeUnstackable = (item: InventoryItem) => {
        item.tags = item.tags.filter(t => t !== 'TAG_STACKABLE');
        return item;
    };

    // Primitive ground items (Level 1 - no requirements)
    switch (id) {
        case 'coal': return { ...base, name: 'Coal', type: 'RESOURCE', tags: ['TAG_RESOURCE', 'TAG_ORE', 'TAG_STACKABLE'], icon: '⚫' };
        case 'flint': return { ...base, name: 'Flint', type: 'RESOURCE', tags: ['TAG_RESOURCE', 'TAG_STACKABLE'], icon: '🪨' };

        // Crafting Materials
        case 'wool': return { ...base, name: 'Wool', tags: ['TAG_CRAFTING', 'TAG_STACKABLE'], icon: '🐑' };
        case 'ball_of_wool': return { ...base, name: 'Ball of Wool', tags: ['TAG_CRAFTING', 'TAG_STACKABLE'], icon: '🧶' };
        case 'flax': return { ...base, name: 'Flax', tags: ['TAG_CRAFTING', 'TAG_STACKABLE'], icon: '🌿' };
        case 'bow_string': return { ...base, name: 'Bow String', tags: ['TAG_CRAFTING', 'TAG_STACKABLE'], icon: '〰️' };
        case 'cowhide': return { ...base, name: 'Cowhide', tags: ['TAG_CRAFTING', 'TAG_STACKABLE'], icon: '🐮' };
        case 'leather': return { ...base, name: 'Leather', tags: ['TAG_CRAFTING', 'TAG_STACKABLE'], icon: '🟫' };
        case 'soft_clay': return { ...base, name: 'Soft Clay', tags: ['TAG_CRAFTING', 'TAG_STACKABLE'], icon: '🧱' };
        case 'pot_unfired': return { ...base, name: 'Unfired Pot', tags: ['TAG_CRAFTING', 'TAG_STACKABLE'], icon: '🏺' };
        case 'pot': return { ...base, name: 'Pot', tags: ['TAG_CRAFTING', 'TAG_STACKABLE'], icon: '🏺' };
        case 'feather': return { ...base, name: 'Feather', tags: ['TAG_CRAFTING', 'TAG_STACKABLE'], icon: '🪶' };
        case 'arrow_shaft': return { ...base, name: 'Arrow Shaft', tags: ['TAG_CRAFTING', 'TAG_STACKABLE'], icon: '🥢' };
        case 'headless_arrow': return { ...base, name: 'Headless Arrow', tags: ['TAG_CRAFTING', 'TAG_STACKABLE'], icon: '🏹' };
        case 'cloth': return { ...base, name: 'Cloth', tags: ['TAG_CRAFTING', 'TAG_STACKABLE'], icon: '🧵' };

        // Bars
        case 'bronze_bar': return { ...base, name: 'Bronze Bar', type: 'RESOURCE', tags: ['TAG_RESOURCE_BAR', 'TAG_STACKABLE'], icon: '🧱' };
        case 'iron_bar': return { ...base, name: 'Iron Bar', type: 'RESOURCE', tags: ['TAG_RESOURCE_BAR', 'TAG_STACKABLE'], icon: '⬜' };

        // Equipment
        case 'shortbow': return makeUnstackable({ ...base, name: 'Shortbow', type: 'WEAPON', tags: ['TAG_WEAPON_RANGED', 'TAG_2H'], stats: { aim: 8, rangedPower: 10 }, icon: '🏹' });
        case 'bronze_dagger': return makeUnstackable({ ...base, name: 'Bronze Dagger', type: 'WEAPON', tags: ['TAG_WEAPON_MELEE'], stats: { power: 4 }, icon: '🗡️' });
        case 'bronze_sword': return makeUnstackable({ ...base, name: 'Bronze Sword', type: 'WEAPON', tags: ['TAG_WEAPON_MELEE'], stats: { power: 6 }, icon: '⚔️' });
        case 'leather_gloves': return makeUnstackable({ ...base, name: 'Leather Gloves', type: 'ARMOR', tags: ['TAG_ARMOR', 'TAG_SLOT_HANDS'], stats: { armor: 1 }, icon: '🧤' });
        case 'leather_boots': return makeUnstackable({ ...base, name: 'Leather Boots', type: 'ARMOR', tags: ['TAG_ARMOR', 'TAG_SLOT_FEET'], stats: { armor: 1 }, icon: '👢' });

        // Fish (replace shrimp with cavefish)
        case 'raw_cavefish': return { ...base, name: 'Raw Cavefish', type: 'FOOD', tags: ['TAG_FOOD', 'TAG_RAW', 'TAG_FISH', 'TAG_STACKABLE'], stats: { healAmount: 0 }, icon: '🐟' };
        case 'cooked_cavefish': return { ...base, name: 'Cooked Cavefish', type: 'FOOD', tags: ['TAG_FOOD', 'TAG_COOKED', 'TAG_STACKABLE'], stats: { healAmount: 5 }, icon: '🐟' };
        case 'raw_shrimp': return { ...base, name: 'Raw Shrimp', type: 'FOOD', tags: ['TAG_FOOD', 'TAG_RAW', 'TAG_FISH', 'TAG_STACKABLE'], stats: { healAmount: 0 }, icon: '🦐' };
        case 'cooked_shrimp': return { ...base, name: 'Cooked Shrimp', type: 'FOOD', tags: ['TAG_FOOD', 'TAG_COOKED', 'TAG_STACKABLE'], stats: { healAmount: 3 }, icon: '🍤' };

        // Other items
        case 'silk': return { ...base, name: 'Silk', tags: ['TAG_CRAFTING', 'TAG_STACKABLE'], icon: '🧣' };
        case 'rope': return { ...base, name: 'Rope', tags: ['TAG_CRAFTING', 'TAG_STACKABLE'], icon: '🪢' };
        case 'raw_meat': return { ...base, name: 'Raw Meat', type: 'FOOD', tags: ['TAG_FOOD', 'TAG_RAW', 'TAG_STACKABLE'], stats: { healAmount: 0 }, icon: '🥩' };
        case 'cooked_meat': return { ...base, name: 'Cooked Meat', type: 'FOOD', tags: ['TAG_FOOD', 'TAG_COOKED', 'TAG_STACKABLE'], stats: { healAmount: 3 }, icon: '🍖' };
        case 'bones': return { ...base, name: 'Bones', tags: ['TAG_PRAYER', 'TAG_STACKABLE'], icon: '🦴' };
        case 'coins': return { ...base, name: 'Coins', tags: ['TAG_CURRENCY', 'TAG_STACKABLE'], icon: '🪙' };

        // Bones
        case 'big_bones': return { ...base, name: 'Big Bones', type: 'MISC', tags: ['TAG_PRAYER', 'TAG_STACKABLE'], icon: '🦴' };
        case 'dragon_bones': return { ...base, name: 'Dragon Bones', type: 'MISC', tags: ['TAG_PRAYER', 'TAG_STACKABLE'], icon: '🐉' };

        // Smithing - Bronze
        case 'bronze_helm': return makeUnstackable({ ...base, name: 'Bronze Med Helm', type: 'ARMOR', tags: ['TAG_ARMOR', 'TAG_SLOT_HEAD'], stats: { armor: 3 }, icon: '🪖' });
        case 'bronze_platebody': return makeUnstackable({ ...base, name: 'Bronze Platebody', type: 'ARMOR', tags: ['TAG_ARMOR', 'TAG_SLOT_BODY'], stats: { armor: 8 }, icon: '👕' });
        case 'bronze_platelegs': return makeUnstackable({ ...base, name: 'Bronze Platelegs', type: 'ARMOR', tags: ['TAG_ARMOR', 'TAG_SLOT_LEGS'], stats: { armor: 5 }, icon: '👖' });
        case 'bronze_kiteshield': return makeUnstackable({ ...base, name: 'Bronze Kiteshield', type: 'ARMOR', tags: ['TAG_ARMOR', 'TAG_SLOT_OFFHAND'], stats: { armor: 6 }, icon: '🛡️' });

        // Smithing - Iron
        case 'iron_helm': return makeUnstackable({ ...base, name: 'Iron Med Helm', type: 'ARMOR', tags: ['TAG_ARMOR', 'TAG_SLOT_HEAD'], stats: { armor: 5 }, icon: '🪖' });
        case 'iron_platebody': return makeUnstackable({ ...base, name: 'Iron Platebody', type: 'ARMOR', tags: ['TAG_ARMOR', 'TAG_SLOT_BODY'], stats: { armor: 12 }, icon: '👕' });
        case 'iron_platelegs': return makeUnstackable({ ...base, name: 'Iron Platelegs', type: 'ARMOR', tags: ['TAG_ARMOR', 'TAG_SLOT_LEGS'], stats: { armor: 8 }, icon: '👖' });
        case 'iron_kiteshield': return makeUnstackable({ ...base, name: 'Iron Kiteshield', type: 'ARMOR', tags: ['TAG_ARMOR', 'TAG_SLOT_OFFHAND'], stats: { armor: 9 }, icon: '🛡️' });

        // Smithing - Steel
        case 'steel_helm': return makeUnstackable({ ...base, name: 'Steel Med Helm', type: 'ARMOR', tags: ['TAG_ARMOR', 'TAG_SLOT_HEAD'], stats: { armor: 8 }, icon: '🪖' });
        case 'steel_platebody': return makeUnstackable({ ...base, name: 'Steel Platebody', type: 'ARMOR', tags: ['TAG_ARMOR', 'TAG_SLOT_BODY'], stats: { armor: 18 }, icon: '👕' });
        case 'steel_platelegs': return makeUnstackable({ ...base, name: 'Steel Platelegs', type: 'ARMOR', tags: ['TAG_ARMOR', 'TAG_SLOT_LEGS'], stats: { armor: 12 }, icon: '👖' });
        case 'steel_kiteshield': return makeUnstackable({ ...base, name: 'Steel Kiteshield', type: 'ARMOR', tags: ['TAG_ARMOR', 'TAG_SLOT_OFFHAND'], stats: { armor: 13 }, icon: '🛡️' });

        // Smithing - Mithril
        case 'mithril_helm': return makeUnstackable({ ...base, name: 'Mithril Med Helm', type: 'ARMOR', tags: ['TAG_ARMOR', 'TAG_SLOT_HEAD'], stats: { armor: 12 }, icon: '🪖' });
        case 'mithril_platebody': return makeUnstackable({ ...base, name: 'Mithril Platebody', type: 'ARMOR', tags: ['TAG_ARMOR', 'TAG_SLOT_BODY'], stats: { armor: 26 }, icon: '👕' });
        case 'mithril_platelegs': return makeUnstackable({ ...base, name: 'Mithril Platelegs', type: 'ARMOR', tags: ['TAG_ARMOR', 'TAG_SLOT_LEGS'], stats: { armor: 18 }, icon: '👖' });
        case 'mithril_kiteshield': return makeUnstackable({ ...base, name: 'Mithril Kiteshield', type: 'ARMOR', tags: ['TAG_ARMOR', 'TAG_SLOT_OFFHAND'], stats: { armor: 19 }, icon: '🛡️' });

        // Smithing - Adamant
        case 'adamant_helm': return makeUnstackable({ ...base, name: 'Adamant Med Helm', type: 'ARMOR', tags: ['TAG_ARMOR', 'TAG_SLOT_HEAD'], stats: { armor: 18 }, icon: '🪖' });
        case 'adamant_platebody': return makeUnstackable({ ...base, name: 'Adamant Platebody', type: 'ARMOR', tags: ['TAG_ARMOR', 'TAG_SLOT_BODY'], stats: { armor: 38 }, icon: '👕' });
        case 'adamant_platelegs': return makeUnstackable({ ...base, name: 'Adamant Platelegs', type: 'ARMOR', tags: ['TAG_ARMOR', 'TAG_SLOT_LEGS'], stats: { armor: 26 }, icon: '👖' });
        case 'adamant_kiteshield': return makeUnstackable({ ...base, name: 'Adamant Kiteshield', type: 'ARMOR', tags: ['TAG_ARMOR', 'TAG_SLOT_OFFHAND'], stats: { armor: 28 }, icon: '🛡️' });

        // Smithing - Rune
        case 'rune_helm': return makeUnstackable({ ...base, name: 'Rune Med Helm', type: 'ARMOR', tags: ['TAG_ARMOR', 'TAG_SLOT_HEAD'], stats: { armor: 26 }, icon: '🪖' });
        case 'rune_platebody': return makeUnstackable({ ...base, name: 'Rune Platebody', type: 'ARMOR', tags: ['TAG_ARMOR', 'TAG_SLOT_BODY'], stats: { armor: 55 }, icon: '👕' });
        case 'rune_platelegs': return makeUnstackable({ ...base, name: 'Rune Platelegs', type: 'ARMOR', tags: ['TAG_ARMOR', 'TAG_SLOT_LEGS'], stats: { armor: 38 }, icon: '👖' });
        case 'rune_kiteshield': return makeUnstackable({ ...base, name: 'Rune Kiteshield', type: 'ARMOR', tags: ['TAG_ARMOR', 'TAG_SLOT_OFFHAND'], stats: { armor: 42 }, icon: '🛡️' });

        // Achievement Capes (Hans's Shop - Account Age Rewards)
        case 'cape_1year': return makeUnstackable({ ...base, name: '1 Year Cape', type: 'ARMOR', tags: ['TAG_SLOT_BACK', 'TAG_COSMETIC', 'TAG_ACHIEVEMENT'], price: 100, icon: '🧥', description: 'Marks 1 year of play.', tier: 1 });
        case 'cape_2year': return makeUnstackable({ ...base, name: '2 Year Cape', type: 'ARMOR', tags: ['TAG_SLOT_BACK', 'TAG_COSMETIC', 'TAG_ACHIEVEMENT'], price: 200, icon: '🧥', description: 'Marks 2 years of play.', tier: 2 });
        case 'cape_3year': return makeUnstackable({ ...base, name: '3 Year Cape', type: 'ARMOR', tags: ['TAG_SLOT_BACK', 'TAG_COSMETIC', 'TAG_ACHIEVEMENT'], price: 300, icon: '🧥', description: 'Marks 3 years of play.', tier: 3 });
        case 'cape_4year': return makeUnstackable({ ...base, name: '4 Year Cape', type: 'ARMOR', tags: ['TAG_SLOT_BACK', 'TAG_COSMETIC', 'TAG_ACHIEVEMENT'], price: 400, icon: '🧥', description: 'Marks 4 years of play.', tier: 4 });
        case 'cape_5year': return makeUnstackable({ ...base, name: '5 Year Cape', type: 'ARMOR', tags: ['TAG_SLOT_BACK', 'TAG_COSMETIC', 'TAG_ACHIEVEMENT'], price: 500, icon: '🧥', description: 'Marks 5 years of play.', tier: 5 });
        case 'cape_10year': return makeUnstackable({ ...base, name: '10 Year Veteran Cape', type: 'ARMOR', tags: ['TAG_SLOT_BACK', 'TAG_COSMETIC', 'TAG_ACHIEVEMENT'], price: 1000, icon: '🦸', description: 'A true veteran of 10 years.', tier: 10 });
        case 'cape_15year': return makeUnstackable({ ...base, name: '15 Year Veteran Cape', type: 'ARMOR', tags: ['TAG_SLOT_BACK', 'TAG_COSMETIC', 'TAG_ACHIEVEMENT'], price: 1500, icon: '🦸', description: 'A legendary player of 15 years.', tier: 15 });
        case 'cape_20year': return makeUnstackable({ ...base, name: '20 Year Veteran Cape', type: 'ARMOR', tags: ['TAG_SLOT_BACK', 'TAG_COSMETIC', 'TAG_ACHIEVEMENT'], price: 2000, icon: '👑', description: 'An icon who has played for 20 years!', tier: 20 });

        default: return base;
    }
};

// --- SLAYER DEFINITIONS ---

export interface SlayerTaskDefinition {
    monster: string;
    monsterType: string[];  // Which NPC names/IDs count
    minAmount: number;
    maxAmount: number;
    slayerLevelReq: number;
    xpPerKill: number;
    weight: number;  // For random selection
}

export interface SlayerMasterDefinition {
    id: string;
    name: string;
    combatLevelReq: number;
    slayerLevelReq: number;
    tasks: SlayerTaskDefinition[];
}

export const SLAYER_MASTERS: Record<string, SlayerMasterDefinition> = {
    novice: {
        id: 'slayer_master_novice',
        name: 'Slayer Master Snuts',
        combatLevelReq: 3,
        slayerLevelReq: 1,
        tasks: [
            { monster: 'Giant Rat', monsterType: ['Giant Rat', 'rat-'], minAmount: 15, maxAmount: 50, slayerLevelReq: 1, xpPerKill: 5, weight: 10 },
            { monster: 'Goblin', monsterType: ['Goblin', 'goblin-'], minAmount: 15, maxAmount: 50, slayerLevelReq: 1, xpPerKill: 5, weight: 10 },
            { monster: 'Chicken', monsterType: ['Chicken', 'chicken-'], minAmount: 15, maxAmount: 50, slayerLevelReq: 1, xpPerKill: 3, weight: 10 },
            { monster: 'Cow', monsterType: ['Cow', 'cow-'], minAmount: 15, maxAmount: 40, slayerLevelReq: 1, xpPerKill: 8, weight: 10 },
            { monster: 'Spider', monsterType: ['Spider', 'spider-'], minAmount: 15, maxAmount: 40, slayerLevelReq: 1, xpPerKill: 6, weight: 10 },
        ]
    }
};
