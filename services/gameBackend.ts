
import { PlayerState, AIState, WorldState, ResourceEntity, GameResponse, InventoryItem, SkillMap, SkillName, GroundItem, NPC, Appearance, GlobeState, EquipmentSlots, Skill, QuestCompletion, MemoryEntry, Spell, SceneType, SkillGuideItem, ChatEvent, CombatStyle, Recipe, XPDrop, Route, Waypoint, AIMode, BotState, Path, ItemTag, Requirements, SkillDefinition, Prayer } from '../types';
import { soundManager } from './soundManager';
import { ITEM_DEFINITIONS, ItemDefinition } from './backend/itemDefinitions';
import { RESOURCE_NODES, ResourceNodeDefinition, canGatherResource } from './backend/resourceDefinitions';
import { CRAFTING_RECIPES, CraftingRecipe, getRecipesForStation, canCraftRecipe } from './backend/craftingRecipes';
import { AIArchitect } from './backend/ai';
import { IWorldEngine } from './backend/interfaces';
import { rollHitChance, rollDamage, distributeCombatXP, calculateCombatLevel } from './backend/combatUtils';

const STORAGE_PREFIX = 'rsc_evo_gods_user_';
const WORLD_STORAGE_KEY = 'rsc_evo_gods_world_global_v2';
const USER_DB_KEY = 'rsc_evo_gods_user_db';

// --- XP TABLES & LEVELING CONSTANTS ---
const MAX_LEVEL = 120;

// Generate XP Table 1-120 (Standard RS Curve)
const generateXPTable = (max: number): number[] => {
    const xp = [0];
    let pts = 0;
    for (let lvl = 1; lvl <= max; lvl++) {
        pts += Math.floor(lvl + 300 * Math.pow(2, lvl / 7.0));
        xp[lvl] = Math.floor(pts / 4);
    }
    return xp;
};

const SKILL_XP_TABLE = generateXPTable(MAX_LEVEL);

const getLevelForXP = (xp: number, table: number[]) => {
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
    ATTACK: { id: 'ATTACK', name: 'Attack', skillType: 'COMBAT', maxLevel: 120, eraUnlocked: 0, dependencies: [], items: ['Stone Hatchet', 'Bone Spear', 'Bronze Sword'] },
    DEFENSE: { id: 'DEFENSE', name: 'Defense', skillType: 'COMBAT', maxLevel: 120, eraUnlocked: 0, dependencies: [], items: ['Wooden Shield', 'Bone Shield'] },
    STRENGTH: { id: 'STRENGTH', name: 'Strength', skillType: 'COMBAT', maxLevel: 120, eraUnlocked: 0, dependencies: [], items: [] },
    HITS: { id: 'HITS', name: 'Hitpoints', skillType: 'COMBAT', maxLevel: 120, eraUnlocked: 0, dependencies: [], items: [] },
    RANGED: { id: 'RANGED', name: 'Ranged', skillType: 'COMBAT', maxLevel: 120, eraUnlocked: 1, dependencies: [], items: ['Slingshot', 'Shortbow'] },
    PRAYER: { id: 'PRAYER', name: 'Prayer', skillType: 'COMBAT', maxLevel: 120, eraUnlocked: 1, dependencies: [], items: ['Bones'] },
    MAGIC: { id: 'MAGIC', name: 'Magic', skillType: 'COMBAT', maxLevel: 120, eraUnlocked: 3, dependencies: ['CRAFTING'], items: ['Runes'] }, // Unlocked in Era 3 (Egypt)
    COOKING: { id: 'COOKING', name: 'Cooking', skillType: 'ARTISAN', maxLevel: 120, eraUnlocked: 0, dependencies: ['FISHING'], items: ['Meat'] },
    WOODCUTTING: { id: 'WOODCUTTING', name: 'Woodcutting', skillType: 'GATHERING', maxLevel: 120, eraUnlocked: 0, dependencies: [], items: ['Logs'] },
    FLETCHING: { id: 'FLETCHING', name: 'Fletching', skillType: 'ARTISAN', maxLevel: 120, eraUnlocked: 1, dependencies: ['WOODCUTTING'], items: ['Arrow Shaft'] },
    FISHING: { id: 'FISHING', name: 'Fishing', skillType: 'GATHERING', maxLevel: 120, eraUnlocked: 0, dependencies: [], items: ['Raw Shrimp'] },
    FIREMAKING: { id: 'FIREMAKING', name: 'Firemaking', skillType: 'ARTISAN', maxLevel: 120, eraUnlocked: 0, dependencies: ['WOODCUTTING'], items: ['Fire'] },
    CRAFTING: { id: 'CRAFTING', name: 'Crafting', skillType: 'ARTISAN', maxLevel: 120, eraUnlocked: 0, dependencies: [], items: ['Leather'] },
    SMITHING: { id: 'SMITHING', name: 'Smithing', skillType: 'ARTISAN', maxLevel: 120, eraUnlocked: 3, dependencies: ['MINING'], items: ['Bronze Bar'] },
    MINING: { id: 'MINING', name: 'Mining', skillType: 'GATHERING', maxLevel: 120, eraUnlocked: 0, dependencies: [], items: ['Copper Ore'] },
    HERBLORE: { id: 'HERBLORE', name: 'Herblore', skillType: 'ARTISAN', maxLevel: 120, eraUnlocked: 5, dependencies: ['FARMING'], items: ['Herbs'] },
    AGILITY: { id: 'AGILITY', name: 'Agility', skillType: 'SUPPORT', maxLevel: 120, eraUnlocked: 1, dependencies: [], items: ['Shortcuts'] },
    THIEVING: { id: 'THIEVING', name: 'Thieving', skillType: 'SUPPORT', maxLevel: 120, eraUnlocked: 2, dependencies: [], items: ['Coins'] },
    SLAYER: { id: 'SLAYER', name: 'Slayer', skillType: 'SUPPORT', maxLevel: 120, eraUnlocked: 6, dependencies: ['ATTACK', 'STRENGTH', 'DEFENSE'], items: [] },
    FARMING: { id: 'FARMING', name: 'Farming', skillType: 'GATHERING', maxLevel: 120, eraUnlocked: 2, dependencies: [], items: ['Seeds'] },

    HUNTER: { id: 'HUNTER', name: 'Hunter', skillType: 'GATHERING', maxLevel: 120, eraUnlocked: 1, dependencies: [], items: ['Traps'] },
    CONSTRUCTION: { id: 'CONSTRUCTION', name: 'Construction', skillType: 'ARTISAN', maxLevel: 120, eraUnlocked: 4, dependencies: ['WOODCUTTING', 'CRAFTING'], items: ['Planks'] },
    EVOLUTION: { id: 'EVOLUTION', name: 'Evolution', skillType: 'SPECIAL', maxLevel: 120, eraUnlocked: 0, dependencies: [], items: ['New Eras', 'Technology'] }
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

const getAINameForEra = (era: number): string => {
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

// AIArchitect moved to services/backend/ai.ts

export const SPELLS: Spell[] = [
    { id: 'wind_strike', name: 'Wind Strike', level: 1, xp: 5.5, icon: '💨', description: 'A basic air missile.', type: 'COMBAT' },
    { id: 'confuse', name: 'Confuse', level: 3, xp: 13, icon: '😵', description: 'Reduces enemy attack.', type: 'COMBAT' },
    { id: 'water_strike', name: 'Water Strike', level: 5, xp: 7.5, icon: '💧', description: 'A basic water missile.', type: 'COMBAT' },
    { id: 'lvl1_enchant', name: 'Lvl-1 Enchant', level: 7, xp: 17.5, icon: '✨', description: 'Enchant jewelry.', type: 'UTILITY' },
    { id: 'earth_strike', name: 'Earth Strike', level: 9, xp: 9.5, icon: '🪨', description: 'A basic earth missile.', type: 'COMBAT' },
    { id: 'varrock_tele', name: 'Home Teleport', level: 25, xp: 35, icon: '🏛️', description: 'Teleport to the hub.', type: 'TELEPORT' },
    { id: 'high_alchemy', name: 'High Alchemy', level: 55, xp: 65, icon: '💰', description: 'Convert items to gold.', type: 'UTILITY' },
];

export const RECIPES: Recipe[] = [
    { id: 'r_hatchet_stone', name: 'Stone Hatchet', ingredients: [{ id: 'stone_sharp', qty: 1 }, { id: 'twig', qty: 1 }], output: 'hatchet_stone', outputQty: 1, skill: 'CRAFTING', levelReq: 1, xp: 15, category: 'TOOL', station: 'CRAFTING_TABLE', era: 0 },
    { id: 'r_spear_stone', name: 'Stone Spear', ingredients: [{ id: 'hatchet_stone', qty: 1 }, { id: 'twig', qty: 1 }], output: 'spear_stone', outputQty: 1, skill: 'CRAFTING', levelReq: 5, xp: 20, category: 'WEAPON', station: 'CRAFTING_TABLE', era: 0 },
    { id: 'r_shafts', name: 'Arrow Shafts', ingredients: [{ id: 'logs', qty: 1 }], output: 'arrow_shaft', outputQty: 15, skill: 'FLETCHING', levelReq: 1, xp: 5, toolTag: 'TAG_TOOL_KNIFE', category: 'MISC', era: 1 },
    { id: 'r_fire', name: 'Fire', ingredients: [{ id: 'logs', qty: 1 }], output: 'fire', outputQty: 1, skill: 'FIREMAKING', levelReq: 1, xp: 40, toolTag: 'TAG_TOOL_FIRE', category: 'MISC', era: 0 },

    // FURNACE RECIPES
    { id: 'r_bronze_bar', name: 'Bronze Bar', ingredients: [{ id: 'copper_ore', qty: 1 }, { id: 'tin_ore', qty: 1 }], output: 'bronze_bar', outputQty: 1, skill: 'SMITHING', levelReq: 1, xp: 6, station: 'FURNACE', category: 'MATERIAL', era: 4 },
    { id: 'r_iron_bar', name: 'Iron Bar', ingredients: [{ id: 'iron_ore', qty: 1 }], output: 'iron_bar', outputQty: 1, skill: 'SMITHING', levelReq: 15, xp: 12, station: 'FURNACE', category: 'MATERIAL', era: 5 },
    { id: 'r_steel_bar', name: 'Steel Bar', ingredients: [{ id: 'iron_ore', qty: 1 }, { id: 'coal', qty: 2 }], output: 'steel_bar', outputQty: 1, skill: 'SMITHING', levelReq: 30, xp: 17, station: 'FURNACE', category: 'MATERIAL', era: 6 },
    { id: 'r_gold_bar', name: 'Gold Bar', ingredients: [{ id: 'gold_ore', qty: 1 }], output: 'gold_bar', outputQty: 1, skill: 'SMITHING', levelReq: 40, xp: 22, station: 'FURNACE', category: 'MATERIAL', era: 6 },
    { id: 'r_mithril_bar', name: 'Mithril Bar', ingredients: [{ id: 'mithril_ore', qty: 1 }, { id: 'coal', qty: 4 }], output: 'mithril_bar', outputQty: 1, skill: 'SMITHING', levelReq: 50, xp: 30, station: 'FURNACE', category: 'MATERIAL', era: 7 },

    // ANVIL RECIPES (Bronze)
    { id: 'r_bronze_dagger', name: 'Bronze Dagger', ingredients: [{ id: 'bronze_bar', qty: 1 }], output: 'bronze_dagger', outputQty: 1, skill: 'SMITHING', levelReq: 1, xp: 12, station: 'ANVIL', category: 'WEAPON', era: 4 },
    { id: 'r_bronze_sword', name: 'Bronze Sword', ingredients: [{ id: 'bronze_bar', qty: 1 }], output: 'bronze_sword', outputQty: 1, skill: 'SMITHING', levelReq: 1, xp: 12, station: 'ANVIL', category: 'WEAPON', era: 4 },
    { id: 'r_bronze_axe', name: 'Bronze Axe', ingredients: [{ id: 'bronze_bar', qty: 1 }], output: 'bronze_axe', outputQty: 1, skill: 'SMITHING', levelReq: 1, xp: 12, station: 'ANVIL', category: 'TOOL', era: 4 },
    { id: 'r_bronze_pickaxe', name: 'Bronze Pickaxe', ingredients: [{ id: 'bronze_bar', qty: 1 }], output: 'bronze_pickaxe', outputQty: 1, skill: 'SMITHING', levelReq: 1, xp: 12, station: 'ANVIL', category: 'TOOL', era: 4 },

    // RANGE RECIPES
    { id: 'r_cooked_meat', name: 'Cooked Meat', ingredients: [{ id: 'raw_meat', qty: 1 }], output: 'cooked_meat', outputQty: 1, skill: 'COOKING', levelReq: 1, xp: 30, station: 'RANGE', category: 'FOOD', era: 0 },
    { id: 'r_cooked_shrimp', name: 'Cooked Shrimp', ingredients: [{ id: 'raw_shrimp', qty: 1 }], output: 'cooked_shrimp', outputQty: 1, skill: 'COOKING', levelReq: 1, xp: 30, station: 'RANGE', category: 'FOOD', era: 0 },
    { id: 'r_cooked_anchovies', name: 'Cooked Anchovies', ingredients: [{ id: 'raw_anchovies', qty: 1 }], output: 'cooked_anchovies', outputQty: 1, skill: 'COOKING', levelReq: 1, xp: 30, station: 'RANGE', category: 'FOOD', era: 0 },
    { id: 'r_cooked_trout', name: 'Cooked Trout', ingredients: [{ id: 'raw_trout', qty: 1 }], output: 'cooked_trout', outputQty: 1, skill: 'COOKING', levelReq: 15, xp: 70, station: 'RANGE', category: 'FOOD', era: 1 },
];

const USER_DB = new Map<string, string>();
const OWNER_USER = "Pick Of Gods";
const OWNER_PASS = "Harvestmoon1";
USER_DB.set(OWNER_USER, OWNER_PASS);

class WorldDurableObject implements IWorldEngine {
    public db: {
        player: PlayerState;
        world: WorldState;
        globe: GlobeState;
    };

    // Store all active players in memory for the simulation
    private activePlayers: Map<string, PlayerState> = new Map();
    private xpDropsQueue: XPDrop[] = [];
    private architect: AIArchitect;

    constructor() {
        this.loadUserDB();
        this.db = {
            player: this.createDefaultPlayer('guest'),
            world: this.createDefaultWorld('TUTORIAL_ISLAND'),
            globe: this.createDefaultGlobe()
        };
        // Full AI system with LM Studio, memory, and personality
        this.architect = new AIArchitect(this);

        // Initialize "Botty McBotFace" - The persistent AI Player
        this.initBotty();
    }

    private initBotty() {
        if (!this.activePlayers.has('botty')) {
            const botty = this.createDefaultPlayer('Botty McBotFace');
            botty.id = 'botty';
            botty.autoPilot = true; // He is an AI
            botty.appearance.skinColor = '#00ffff'; // Special look
            botty.follower.name = 'Bitsy';
            botty.position = { x: 5, z: 5 };
            this.activePlayers.set('botty', botty);
        }
    }

    private ensureSkills(player: PlayerState) {
        SKILL_REGISTRY.forEach(skill => {
            if (!player.skills[skill]) {
                const def = SKILL_DEFINITIONS[skill];
                player.skills[skill] = {
                    level: skill === 'HITS' ? 10 : 1,
                    xp: skill === 'HITS' ? 1154 : 0,
                    unlocked: def.eraUnlocked === 0
                };
            }
        });
    }

    private createDefaultPlayer(id: string): PlayerState {
        const p: PlayerState = {
            id: `player-${id}`, name: id, isAdmin: (id === OWNER_USER),
            combatLevel: 3, hp: 10, maxHp: 10,
            skills: {} as SkillMap,
            fatigue: 0, combatStyle: 'ACCURATE',
            era: 0, evolutionStage: 0, activePrayers: [],
            appearance: { gender: 'MALE', skinColor: '#8d5524', hairStyle: 0, hairColor: '#000', torsoStyle: 0, torsoColor: '#5e4b35', sleevesStyle: 0, sleevesColor: '#5e4b35', cuffsStyle: 0, cuffsColor: '#3a3a3a', handsStyle: 0, handsColor: '#8d5524', legsStyle: 0, legsColor: '#3a3a3a', shoesStyle: 0, shoesColor: '#8d5524' },
            inventory: [],
            toolBelt: ['wrench', 'banking_tool'], // Hidden utility items
            bank: [],
            equipment: { mainHand: null },
            position: { x: 0, z: 0 },
            friends: [], targetId: null,
            currentScene: 'TUTORIAL_ISLAND',
            quest: { stage: 0, name: 'Survival', description: 'Survive the first era.' },
            collectionLog: [],
            autoPilot: false,
            // Follower Init
            follower: {
                id: `ai-${id}`, ownerId: `player-${id}`, name: getAINameForEra(0),
                status: "IDLE", inventory: [],
                toolBelt: ['wrench', 'banking_tool'], // Hidden utility items
                position: { x: -2, z: -2 },
                lastThought: "Ready.", action: 'IDLE', mode: 'FOLLOW', memory: [],
                friendship: 10,
                equipment: { mainHand: null },
                aiEquipmentSwitch: {
                    mainHand: true, offHand: true, head: true, body: true, legs: true,
                    feet: true, hands: true, wrists: true, neck: true, ammo: true,
                    aura: true, ring1: true, ring2: true, ring3: true, ring4: true,
                    ring5: true, ring6: true, ring7: true, ring8: true
                },
                prayerEnabled: false
            }
        };
        this.ensureSkills(p);
        this.seedBankForEra(p);
        return p;
    }

    private seedBankForEra(p: PlayerState) {
        const items = [];
        // Era 0-3
        items.push({ id: 'logs', name: 'Logs', type: 'RESOURCE', tags: ['TAG_RESOURCE_WOOD', 'TAG_FUEL'], count: 100, icon: '🪵' });
        items.push({ id: 'flint', name: 'Flint', type: 'RESOURCE', tags: ['TAG_RESOURCE', 'TAG_STACKABLE'], count: 50, icon: '🪨' });
        items.push({ id: 'raw_meat', name: 'Raw Meat', type: 'FOOD', tags: ['TAG_COOKABLE', 'TAG_FOOD'], count: 20, icon: '🥩' });

        p.bank = items as any;
    }

    private createDefaultWorld(sceneType: SceneType = 'TUTORIAL_ISLAND'): WorldState {
        // Procedurally generate based on Scene Type
        const resources: ResourceEntity[] = [];
        const npcs: NPC[] = [];

        // --- SCENE GENERATION LOGIC ---
        if (sceneType === 'EGYPT') {
            // DESERT BIOME
            for (let i = 0; i < 20; i++) {
                resources.push({ id: `palm-${i}`, type: 'PALM_TREE', tier: 3, position: { x: Math.random() * 40 - 20, z: Math.random() * 40 - 20 }, active: true });
                resources.push({ id: `sandstone-${i}`, type: 'ROCK', tier: 3, position: { x: Math.random() * 40 - 20, z: Math.random() * 40 - 20 }, active: true });
            }
            // Pyramids & Structures
            resources.push({ id: 'great-pyramid', type: 'PYRAMID', tier: 4, position: { x: 15, z: 15 }, active: true });
            resources.push({ id: 'obelisk-1', type: 'OBELISK', tier: 4, position: { x: -5, z: 10 }, active: true });
            resources.push({ id: 'sarcophagus-king', type: 'SARCOPHAGUS', tier: 4, position: { x: 0, z: 20 }, active: true });

            // NPCs
            npcs.push({ id: 'guide-sphinx', name: 'Sphinx', role: 'GUIDE', position: { x: 2, z: 2 }, voice: 'FEMALE', dialogue: 'Answer my riddle to enter the tomb.' });
            npcs.push({ id: 'mummy-1', name: 'Mummy', role: 'ENEMY', hp: 40, maxHp: 40, combatLevel: 25, position: { x: -10, z: -10 }, voice: 'INHUMAN' });

        } else if (sceneType === 'MEDIEVAL_KINGDOM') {
            // MEDIEVAL BIOME
            for (let i = 0; i < 30; i++) {
                resources.push({ id: `oak-${i}`, type: 'TREE', tier: 6, position: { x: Math.random() * 50 - 25, z: Math.random() * 50 - 25 }, active: true });
            }
            // Castle / Walls
            resources.push({ id: 'castle-bank', type: 'BANK_BOOTH', tier: 7, position: { x: 0, z: 5 }, active: true });
            resources.push({ id: 'anvil-smith', type: 'ANVIL', tier: 6, position: { x: 5, z: 5 }, active: true });
            resources.push({ id: 'stall-silk', type: 'STALL', tier: 6, position: { x: -5, z: 5 }, active: true });

            npcs.push({ id: 'guard-1', name: 'City Guard', role: 'GUARD', hp: 50, maxHp: 50, combatLevel: 30, position: { x: 0, z: 0 }, voice: 'MALE' });
            npcs.push({ id: 'merch-1', name: 'Silk Merchant', role: 'MERCHANT', position: { x: -5, z: 4 }, voice: 'FEMALE' });

        } else {
            // PRECAMBRIAN TUTORIAL ISLAND (Era 0)

            // === PRECAMBRIAN RESOURCES ===
            // Saplings (Twigs)
            for (let i = 0; i < 15; i++) {
                resources.push({ id: `sapling-${i}`, type: 'SAPLING', tier: 0, position: { x: Math.random() * 30 - 15, z: Math.random() * 30 - 15 }, active: true });
            }

            // Flint Rocks
            for (let i = 0; i < 10; i++) {
                resources.push({ id: `flint-rock-${i}`, type: 'FLINT_ROCK', tier: 0, position: { x: Math.random() * 30 - 15, z: Math.random() * 30 - 15 }, active: true });
            }

            // === SERVICES ===
            // Portal to Modern Earth (Requires Era 1 or Quest Completion)
            resources.push({ id: 'portal-main', type: 'PORTAL', tier: 10, position: { x: 8, z: 8 }, active: true });

            // No Bank in Era 0? Or maybe a primitive stash?
            // Keeping Bank Booth for gameplay convenience for now, but maybe should be a "Stash"
            resources.push({ id: 'bank-1', type: 'BANK_BOOTH', tier: 1, position: { x: -4, z: -4 }, active: true });

            // === NPCs ===
            npcs.push({ id: 'guide', name: 'Survival Guide', role: 'GUIDE', position: { x: 2, z: 2 }, voice: 'MALE', dialogue: 'Welcome to the dawn of time. Gather twigs and flint to survive.' });

            // Mammoths (instead of Rats)
            npcs.push({ id: 'mammoth-1', name: 'Young Mammoth', role: 'ENEMY', hp: 20, maxHp: 20, combatLevel: 5, position: { x: 10, z: -10 }, voice: 'INHUMAN' });
            npcs.push({ id: 'mammoth-2', name: 'Young Mammoth', role: 'ENEMY', hp: 20, maxHp: 20, combatLevel: 5, position: { x: 12, z: -8 }, voice: 'INHUMAN' });
        }

        return {
            seed: Date.now(),
            biome: sceneType === 'EGYPT' ? 'DESERT' : sceneType === 'MEDIEVAL_KINGDOM' ? 'TEMPERATE' : 'JUNGLE',
            timeOfDay: 12,
            resources,
            groundItems: [],
            npcs,
            paths: []
        };
    }

    private createDefaultGlobe(): GlobeState {
        return {
            connectionCount: 1,
            players: [],
            markers: [
                { id: 'loc-tutorial', lat: 0, lng: 0, type: 'CITY', label: 'ORIGIN POINT', eraRequired: 0, sceneTarget: 'TUTORIAL_ISLAND' },
                { id: 'loc-egypt', lat: 25, lng: 30, type: 'CITY', label: 'ANCIENT EGYPT', eraRequired: 3, sceneTarget: 'EGYPT' },
                { id: 'loc-medieval', lat: 50, lng: 0, type: 'CITY', label: 'KINGDOM OF KANDARIN', eraRequired: 6, sceneTarget: 'MEDIEVAL_KINGDOM' },
                { id: 'loc-north', lat: 80, lng: 0, type: 'RESOURCE', label: 'FROZEN WASTES', eraRequired: 8, sceneTarget: 'NORTH' },
                { id: 'loc-rome', lat: 41, lng: 12, type: 'CITY', label: 'ETERNAL CITY', eraRequired: 6, sceneTarget: 'ROME' }
            ]
        };
    }

    private loadUserDB() {
        const stored = localStorage.getItem(USER_DB_KEY);
        if (stored) {
            const parsed = JSON.parse(stored);
            Object.keys(parsed).forEach(k => USER_DB.set(k, parsed[k]));
        }
    }

    private saveUserDB() {
        const obj: any = {};
        USER_DB.forEach((v, k) => obj[k] = v);
        localStorage.setItem(USER_DB_KEY, JSON.stringify(obj));
    }

    public async post(path: string, body: any): Promise<GameResponse> {
        return new Promise((resolve) => {
            // Simulate async nature
            setTimeout(() => {
                resolve(this.router(path, body));
            }, 10);
        });
    }

    private getFilteredWorldState(player: PlayerState): WorldState {
        const era = player.era;

        // Filter Resources
        const filteredResources = this.db.world.resources.filter(res => {
            const def = RESOURCE_NODES[res.type];
            if (!def) return true; // Keep if no definition (fallback)
            if (def.era !== undefined && def.era > era) return false;
            return true;
        });

        return {
            ...this.db.world,
            resources: filteredResources
        };
    }

    // --- PUBLIC ROUTER ---
    public async router(path: string, body: any, isSimulated: boolean = false): Promise<GameResponse> {
        const { username, pass, apiKey } = body;

        // AUTH
        if (path === '/auth/login') {
            if (USER_DB.get(username) === pass) {
                // Load or Create Player State
                let p = this.activePlayers.get(username);
                if (!p) {
                    const stored = localStorage.getItem(STORAGE_PREFIX + username);
                    if (stored) p = JSON.parse(stored);
                    else p = this.createDefaultPlayer(username);
                    this.activePlayers.set(username, p!);
                }
                // Migration: Ensure evolutionStage exists
                if (p!.evolutionStage === undefined) p!.evolutionStage = (p!.era || 0) * 20;

                this.db.player = p!;
                // Update Globe
                const existingGlobeP = this.db.globe.players.find(x => x.id === p!.id);
                if (!existingGlobeP) this.db.globe.players.push({ id: p!.id, name: p!.name, lat: 0, lng: 0, era: p!.era });

                return { status: 'SUCCESS', state: p, world: this.getFilteredWorldState(p) };
            }
            return { status: 'FAIL', msg: 'Invalid Credentials' };
        }

        if (path === '/auth/register') {
            if (USER_DB.has(username)) return { status: 'FAIL', msg: 'User Exists' };
            USER_DB.set(username, pass);
            this.saveUserDB();
            const p = this.createDefaultPlayer(username);
            this.activePlayers.set(username, p);
            localStorage.setItem(STORAGE_PREFIX + username, JSON.stringify(p));
            return { status: 'SUCCESS', state: p, world: this.getFilteredWorldState(p) };
        }

        if (path === '/auth/create_char') {
            if (this.db.player) {
                this.db.player.appearance = body.appearance;
                return { status: 'SUCCESS', state: this.db.player };
            }
        }

        if (path === '/auth/gps') {
            // Re-seed world based on GPS? For now just ack.
            return { status: 'SUCCESS', state: this.db.player, world: this.getFilteredWorldState(this.db.player) };
        }

        // --- GAME ACTIONS ---
        const player = this.db.player;
        if (!player) return { status: 'FAIL', msg: 'No Session' };

        // AUTO SAVE MIDDLEWARE
        if (Math.random() > 0.9) localStorage.setItem(STORAGE_PREFIX + player.name, JSON.stringify(player));

        if (path === '/action/move') {
            player.position.x = body.x;
            player.position.z = body.z;
            return { status: 'OK' };
        }

        if (path === '/action/travel') {
            const marker = this.db.globe.markers.find(m => m.id === body.targetId);
            if (!marker) return { status: 'FAIL', msg: "Invalid Destination" };

            if (player.era < (marker.eraRequired || 0)) {
                return { status: 'FAIL', msg: `Era ${marker.eraRequired} Required.` };
            }

            // Switch Scene
            player.currentScene = marker.sceneTarget || 'TUTORIAL_ISLAND';
            player.position = { x: 0, z: 0 }; // Reset pos at spawn
            this.db.world = this.createDefaultWorld(player.currentScene);

            return { status: 'SCENE_CHANGE', state: player, world: this.getFilteredWorldState(player), msg: `Welcome to ${marker.label}` };
        }

        if (path === '/action/gather') {
            const { targetId, type } = body;
            console.log(`[GATHER] Player ${player.name} interacting with ${type} (ID: ${targetId})`);

            // PORTAL LOGIC
            if (type === 'PORTAL') {
                if (player.era >= 3) {
                    // Check if already in Egypt, if so maybe go back or go to Medieval?
                    // Simple Toggle for Prototype: Tutorial <-> Egypt
                    const targetScene = player.currentScene === 'TUTORIAL_ISLAND' ? 'EGYPT' : 'TUTORIAL_ISLAND';
                    player.currentScene = targetScene;
                    player.position = { x: 0, z: 0 };
                    this.db.world = this.createDefaultWorld(targetScene);
                    return { status: 'SCENE_CHANGE', state: player, world: this.getFilteredWorldState(player), msg: "Entering Portal..." };
                } else {
                    return { status: 'FAIL', msg: "The Portal is dormant. You must Evolve to Era 3." };
                }
            }

            // Resource logic
            const res = this.db.world.resources.find(r => r.id === targetId);
            if (res && res.active) {
                // Check if resource type is in RESOURCE_NODES
                const resourceDef = RESOURCE_NODES[type];

                if (!resourceDef) {
                    // Not a valid gatherable resource - check if it's a station
                    if (type === 'BANK_BOOTH') {
                        this.architect.notifyAction(player.id, 'BANK', {});
                        return { status: 'OPEN_BANK', msg: "Bank Open" };
                    }
                    if (type === 'FURNACE') {
                        const furnaceRecipes = RECIPES.filter(r => r.station === 'FURNACE' && (r.era === undefined || r.era <= player.era));
                        return { status: 'OPEN_CRAFTING', station: 'FURNACE', availableRecipes: furnaceRecipes, skillName: 'Smithing', msg: 'Opening Furnace...' };
                    }
                    if (type === 'ANVIL') {
                        const anvilRecipes = RECIPES.filter(r => r.station === 'ANVIL' && (r.era === undefined || r.era <= player.era));
                        return { status: 'OPEN_CRAFTING', station: 'ANVIL', availableRecipes: anvilRecipes, skillName: 'Smithing', msg: 'Opening Anvil...' };
                    }
                    if (type === 'RANGE') {
                        const rangeRecipes = RECIPES.filter(r => r.station === 'RANGE' && (r.era === undefined || r.era <= player.era));
                        return { status: 'OPEN_CRAFTING', station: 'RANGE', availableRecipes: rangeRecipes, skillName: 'Cooking', msg: 'Opening Range...' };
                    }

                    // Other non-gatherable objects
                    const otherStations = ['PORTAL', 'ALTAR', 'STATUE', 'OBELISK'];
                    if (otherStations.some(s => type.includes(s))) {
                        return { status: 'FAIL', msg: 'You cannot gather from this object.' };
                    }
                    return { status: 'FAIL', msg: 'Nothing interesting happens.' };
                }

                // Validate player level
                const playerLevel = player.skills[resourceDef.skill]?.level || 1;
                const canGather = canGatherResource(type, playerLevel);

                if (!canGather.canGather) {
                    return { status: 'FAIL', msg: canGather.reason || 'You cannot gather from this resource.' };
                }

                // Determine drop and XP based on resource definition
                const dropId = resourceDef.drops[0]; // Use first drop from definition
                const qty = 1;
                const xp = resourceDef.xpReward;
                const skill = resourceDef.skill;

                // Play appropriate sound
                if (skill === 'WOODCUTTING') soundManager.play('CHOP');
                else if (skill === 'MINING') soundManager.play('MINE');
                else if (skill === 'FISHING') soundManager.play('SPLASH');

                this.addXP(player, skill, xp);
                player.inventory.push(this.createItem(dropId, qty));

                // Respawn timer
                if (resourceDef.respawnTime > 0) {
                    res.active = false;
                    setTimeout(() => res.active = true, resourceDef.respawnTime);
                }

                // Notify AI to mimic
                this.architect.notifyAction(player.id, 'GATHER', { skill });

                return { status: 'SUCCESS', msg: `You gather ${dropId}.`, state: player, xpDrops: this.flushXPDrops() };
            }
            return { status: 'FAIL', msg: 'Nothing to gather.' };
        }

        if (path === '/action/attack') {
            const target = this.db.world.npcs.find(n => n.id === body.targetId);
            if (target && target.hp && target.hp > 0) {
                // Get player combat stats
                const attackLevel = player.skills.ATTACK?.level || 1;
                const strengthLevel = player.skills.STRENGTH?.level || 1;
                const defenseLevel = player.skills.DEFENSE?.level || 1;
                const weaponPower = player.equipment.mainHand?.stats?.power || 1;

                console.log(`[COMBAT] ${player.name} vs ${target.name} | Atk: ${attackLevel}, Str: ${strengthLevel}, Def: ${defenseLevel}, WepPow: ${weaponPower}, EnemyDef: ${target.combatLevel}`);

                // Get defender stats
                const enemyDefenseLevel = target.combatLevel || 1;
                const enemyArmor = 0;

                // Step 1: Roll for hit chance (Attack vs Defense)
                const didHit = rollHitChance(attackLevel, weaponPower, enemyDefenseLevel, enemyArmor);
                console.log(`[COMBAT] Hit Roll: ${didHit}`);

                let damage = 0;
                if (didHit) {
                    // Step 2: Roll for damage (Strength-based)
                    damage = rollDamage(strengthLevel, weaponPower);
                }

                // Apply damage
                target.hp -= damage;

                // Distribute combat XP using RSC formula
                if (damage > 0) {
                    const xpDist = distributeCombatXP(damage, player.combatStyle, 'MELEE');
                    this.addXP(player, 'HITS', xpDist.HITS);
                    if (xpDist.ATTACK) this.addXP(player, 'ATTACK', xpDist.ATTACK);
                    if (xpDist.STRENGTH) this.addXP(player, 'STRENGTH', xpDist.STRENGTH);
                    if (xpDist.DEFENSE) this.addXP(player, 'DEFENSE', xpDist.DEFENSE);
                }

                soundManager.play('COMBAT_HIT');

                // Notify AI to mimic
                this.architect.notifyAction(player.id, 'ATTACK', { targetId: target.id });

                if (target.hp <= 0) {
                    // Kill
                    player.targetId = null;
                    this.db.world.npcs = this.db.world.npcs.filter(n => n.id !== target.id);
                    soundManager.play('DEATH');
                    // Loot
                    this.db.world.groundItems.push({
                        id: `loot-${Date.now()}`,
                        item: this.createItem('bones', 1),
                        position: { ...target.position },
                        despawnTime: Date.now() + 60000
                    });

                    // Quest Trigger
                    if (player.quest.stage === 3 && target.name === 'Giant Rat') {
                        player.quest.stage = 4;
                        player.quest.name = "Tools of War";
                        player.quest.description = "Craft a Bone Spear.";
                        return { status: 'SUCCESS', state: player, msg: "Enemy defeated!", world: this.getFilteredWorldState(player), questComplete: { title: "First Blood", description: "You have slain the beast.", rewards: ["Bone Shaft", "Rathide"] }, xpDrops: this.flushXPDrops() };
                    }

                    return { status: 'SUCCESS', state: player, msg: "Enemy defeated!", world: this.getFilteredWorldState(player), xpDrops: this.flushXPDrops() };
                }
                return { status: 'SUCCESS', state: player, msg: damage > 0 ? `You hit a ${damage}!` : 'You miss!', xpDrops: this.flushXPDrops() };
            }
        }

        if (path === '/action/pickup') {
            const itemIdx = this.db.world.groundItems.findIndex(g => g.id === body.groundItemId);
            if (itemIdx > -1) {
                const groundItem = this.db.world.groundItems[itemIdx];
                player.inventory.push(groundItem.item);
                this.db.world.groundItems.splice(itemIdx, 1);
                return { status: 'SUCCESS', state: player, world: this.getFilteredWorldState(player), msg: `Picked up ${groundItem.item.name}.` };
            }
        }

        if (path === '/action/use') {
            // Crafting Logic
            const { itemId, targetId, targetType } = body;

            // Log on Fire
            if (itemId === 'logs' && targetType === 'GROUND_ITEM') {
                // Firemaking
                const fire = this.createItem('fire', 1);
                // Need Tinderbox?
                this.addXP(player, 'FIREMAKING', 40);
                soundManager.play('COOK');
                return { status: 'SUCCESS', state: player, msg: "You light a fire.", xpDrops: this.flushXPDrops() };
            }

            // Crafting UI
            if (targetType === 'INVENTORY_ITEM' || targetType === 'ANVIL' || targetType === 'FURNACE') {
                // Return list of recipes
                return { status: 'OPEN_SKILL', availableRecipes: RECIPES.filter(r => r.era === undefined || r.era <= player.era), skillName: 'Crafting' };
            }
        }

        if (path === '/action/craft') {
            const recipe = RECIPES.find(r => r.id === body.recipeId);
            if (recipe) {
                // Check materials
                const hasMats = recipe.ingredients.every(mat => {
                    const item = player.inventory.find(i => i.id === mat.id);
                    return item && item.count >= mat.qty;
                });
                if (hasMats) {
                    recipe.ingredients.forEach(mat => {
                        const idx = player.inventory.findIndex(i => i.id === mat.id);
                        if (player.inventory[idx].count > mat.qty) {
                            player.inventory[idx].count -= mat.qty;
                        } else {
                            player.inventory.splice(idx, 1);
                        }
                    });
                    player.inventory.push(this.createItem(recipe.output, recipe.outputQty));
                    this.addXP(player, recipe.skill, recipe.xp);

                    // Notify AI
                    this.architect.notifyAction(player.id, 'CRAFT', { skill: recipe.skill });

                    return { status: 'SUCCESS', state: player, msg: `Crafted ${recipe.output}`, xpDrops: this.flushXPDrops() };
                }
            }
            return { status: 'FAIL', msg: "Missing materials." };
        }

        if (path === '/action/equip') {
            const item = player.inventory.find(i => i.id === body.itemId);
            if (item) {
                // Simple logic: MainHand
                const old = player.equipment.mainHand;
                player.equipment.mainHand = item;
                player.inventory.splice(player.inventory.indexOf(item), 1);
                if (old) player.inventory.push(old);
                return { status: 'SUCCESS', state: player, msg: `Equipped ${item.name}.` };
            }
        }

        if (path === '/ai/tick') {
            // 1. Process Architect (AI brains for player's follower)
            const aiAction = this.architect.thinkSquad(player, this.db.world);

            // 2. Process Botty McBotFace (Autonomous AI Player)
            const botty = this.activePlayers.get('botty');
            if (botty && botty.currentScene === player.currentScene) {
                // Run Botty's autonomous agent
                if (!botty.autonomousAgent) {
                    const { AutonomousAgent } = await import('./backend/autonomousAgent');
                    botty.autonomousAgent = new AutonomousAgent(botty);
                }

                await botty.autonomousAgent.tick(this.db.world);

                // Ensure Botty is visible in the NPC list
                const existingNpcBot = this.db.world.npcs.find(n => n.id === 'botty-npc');
                if (!existingNpcBot) {
                    this.db.world.npcs.push({
                        id: 'botty-npc',
                        name: botty.name,
                        role: 'PLAYER_BOT',
                        position: botty.position,
                        voice: 'MALE',
                        appearance: botty.appearance,
                        equipment: botty.equipment,
                        botState: {
                            state: botty.autonomousAgent?.getStatus() || 'IDLE',
                            inventory: botty.inventory,
                            skills: botty.skills,
                            goal: 'AUTONOMOUS',
                            lastActionTime: Date.now()
                        }
                    });
                } else {
                    // Update position and state
                    existingNpcBot.position = botty.position;
                    if (existingNpcBot.botState) {
                        existingNpcBot.botState.state = botty.autonomousAgent?.getStatus() || 'IDLE';
                        existingNpcBot.botState.inventory = botty.inventory;
                    }
                }
            }

            return { status: 'OK', world: this.getFilteredWorldState(player), state: player, aiAction: aiAction.action, aiThought: aiAction.thought, xpDrops: this.flushXPDrops() };
        }

        // CHAT ENDPOINTS
        if (path === '/action/chat') {
            // Public chat - broadcasts to all players in current scene
            const { text, channel } = body;
            return {
                status: 'SUCCESS',
                msg: text,
                chatEvents: [{
                    id: Math.random().toString(),
                    sourceId: player.id,
                    text: `${player.name}: ${text}`,
                    color: '#ffffff'
                }]
            };
        }

        if (path === '/action/whisper') {
            // Private message - parse /w username message format
            const { text } = body;
            const match = text.match(/^\/w\s+(\S+)\s+(.+)$/);
            if (!match) {
                return { status: 'FAIL', msg: 'Usage: /w username message' };
            }
            const [, targetName, message] = match;
            return {
                status: 'SUCCESS',
                msg: `To ${targetName}: ${message}`,
                chatEvents: [{
                    id: Math.random().toString(),
                    sourceId: player.id,
                    text: `[Private to ${targetName}] ${message}`,
                    color: '#ff00ff'
                }]
            };
        }

        if (path === '/action/friends_chat') {
            // Friends channel - visible only to friends list members
            const { text } = body;
            return {
                status: 'SUCCESS',
                msg: text,
                chatEvents: [{
                    id: Math.random().toString(),
                    sourceId: player.id,
                    text: `[Friends] ${player.name}: ${text}`,
                    color: '#00ffff'
                }]
            };
        }

        if (path === '/action/ai_command') {
            // AI command channel - sends commands to follower AI
            const { text } = body;
            const command = text.replace(/^\/ai\s+/, '');

            // Use async handler with full AI capabilities
            const response = await this.architect.handleChatCommand(player.id, command, player);

            // Speak the response with voice
            if (response) {
                const voiceType = player.era <= 2 ? 'INHUMAN' : 'MALE';
                soundManager.speak(response, voiceType);
            }

            return {
                status: 'SUCCESS',
                msg: `[AI] ${player.follower.name}: ${response}`,
                state: player,
                chatEvents: [{
                    id: Math.random().toString(),
                    sourceId: player.follower.id,
                    text: response,
                    color: '#ffaa00'
                }]
            };
        }

        // NPC INTERACTION ENDPOINTS
        if (path === '/action/talk') {
            const { npcId } = body;
            const npc = this.db.world.npcs.find(n => n.id === npcId);

            if (!npc) {
                return { status: 'FAIL', msg: 'NPC not found.' };
            }

            const dialogue = npc.dialogue || `Hello, I'm ${npc.name}.`;

            return {
                status: 'SUCCESS',
                dialogue,
                msg: dialogue,
                npc: { name: npc.name, role: npc.role },
                voiceType: npc.voice || 'MALE'
            };
        }

        if (path === '/action/trade') {
            const { npcId } = body;
            const npc = this.db.world.npcs.find(n => n.id === npcId);

            if (!npc) {
                return { status: 'FAIL', msg: 'NPC not found.' };
            }

            if (npc.role !== 'MERCHANT') {
                return { status: 'FAIL', msg: `${npc.name} is not a merchant.` };
            }

            // Generate shop stock based on NPC
            const shopStock: InventoryItem[] = [
                this.createItem('bronze_sword', 1, 10),
                this.createItem('bronze_pickaxe', 1, 15),
                this.createItem('bronze_axe', 1, 15),
                this.createItem('cooked_shrimp', 10, 5),
            ];

            return {
                status: 'OPEN_SHOP',
                shopStock,
                msg: `${npc.name} opens their shop.`
            };
        }

        // RESOURCE GATHERING
        if (path === '/action/gather') {
            const { targetId, type } = body;
            const resource = this.db.world.resources.find(r => r.id === targetId);

            if (!resource) {
                return { status: 'FAIL', msg: 'Resource not found.' };
            }

            if (!resource.active) {
                return { status: 'FAIL', msg: 'Resource is depleted.' };
            }

            // Check if it's a crafting station
            if (['FURNACE', 'ANVIL', 'RANGE', 'CRAFTING_TABLE'].includes(resource.type)) {
                const recipes = getRecipesForStation(resource.type as any);
                return {
                    status: 'OPEN_SKILL',
                    skillName: resource.type === 'RANGE' ? 'Cooking' : 'Smithing',
                    availableRecipes: recipes,
                    msg: `Opening ${resource.type.toLowerCase()}...`
                };
            }

            // Check gathering requirements
            const check = canGatherResource(resource.type, player.skills[RESOURCE_NODES[resource.type]?.skill || 'WOODCUTTING']?.level || 1);
            if (!check.canGather) {
                return { status: 'FAIL', msg: check.reason || "You can't gather this." };
            }

            const def = RESOURCE_NODES[resource.type];
            if (!def) return { status: 'FAIL', msg: "Unknown resource type." };

            // Success! Give items and XP
            const dropId = def.drops[Math.floor(Math.random() * def.drops.length)];
            const item = this.createItem(dropId, 1);
            player.inventory.push(item);
            this.addXP(player, def.skill as SkillName, def.xpReward);

            // Deplete resource
            if (def.respawnTime > 0) {
                resource.active = false;
                setTimeout(() => {
                    resource.active = true;
                }, def.respawnTime);
            }

            // Sound effects
            if (def.skill === 'WOODCUTTING') soundManager.play('CHOP');
            if (def.skill === 'MINING') soundManager.play('MINE');
            if (def.skill === 'FISHING') soundManager.play('SPLASH');

            return {
                status: 'SUCCESS',
                msg: `You get some ${item.name}.`,
                state: player,
                xpDrops: this.flushXPDrops()
            };
        }

        // === Rest of endpoints below ===

        // CRAFTING
        if (path === '/action/craft') {
            const { recipeId } = body;
            const recipe = CRAFTING_RECIPES[recipeId];

            if (!recipe) {
                return { status: 'FAIL', msg: 'Recipe not found.' };
            }

            const check = canCraftRecipe(recipe, player.skills[recipe.skill as SkillName]?.level || 1, player.inventory);
            if (!check.canCraft) {
                return { status: 'FAIL', msg: check.reason || "You can't craft this." };
            }

            // Consume ingredients
            recipe.ingredients.forEach(ing => {
                let remaining = ing.qty;
                // Remove items from inventory (prioritize smaller stacks or just first found)
                // Simple implementation: find and decrement
                for (let i = 0; i < player.inventory.length; i++) {
                    if (player.inventory[i].id === ing.id) {
                        const take = Math.min(player.inventory[i].count, remaining);
                        player.inventory[i].count -= take;
                        remaining -= take;
                        if (player.inventory[i].count <= 0) {
                            player.inventory.splice(i, 1);
                            i--;
                        }
                        if (remaining <= 0) break;
                    }
                }
            });

            // Add output
            const outputItem = this.createItem(recipe.output, recipe.outputQty);
            player.inventory.push(outputItem);

            // Award XP
            this.addXP(player, recipe.skill as SkillName, recipe.xp);

            // Sound
            if (recipe.skill === 'SMITHING') soundManager.play('SMITH');
            if (recipe.skill === 'COOKING') soundManager.play('COOK');

            return {
                status: 'SUCCESS',
                msg: `You craft a ${outputItem.name}.`,
                state: player,
                xpDrops: this.flushXPDrops()
            };
        }

        if (path === '/action/ai_toggle_equipment') {
            const { slot, enabled } = body;

            if (!player.follower.aiEquipmentSwitch) {
                player.follower.aiEquipmentSwitch = {
                    mainHand: true, offHand: true, head: true, body: true, legs: true,
                    feet: true, hands: true, wrists: true, neck: true, ammo: true,
                    aura: true, ring1: true, ring2: true, ring3: true, ring4: true,
                    ring5: true, ring6: true, ring7: true, ring8: true
                };
            }

            player.follower.aiEquipmentSwitch[slot as keyof typeof player.follower.aiEquipmentSwitch] = enabled;

            return {
                status: 'SUCCESS',
                msg: `AI auto-equip ${slot}: ${enabled ? 'ON' : 'OFF'}`,
                state: player
            };
        }

        // ADMIN
        if (path === '/admin/action') {
            const { action } = body;
            if (action === 'HEAL') { player.hp = player.maxHp; }
            if (action === 'FORCE_EVO') { this.addXP(player, 'EVOLUTION', 5000); }
            if (action === 'MAX_OUT') {
                SKILL_REGISTRY.forEach(s => {
                    player.skills[s].level = 120;
                    player.skills[s].xp = 104000000; // 120 xp
                    player.skills[s].unlocked = true;
                });
                player.era = 12;
                player.combatLevel = 138;
                player.era = 12;
                player.combatLevel = 138;
            }
            if (action === 'RESET') {
                const newPlayer = this.createDefaultPlayer(player.name);
                // Update memory
                this.activePlayers.set(player.name, newPlayer);
                this.db.player = newPlayer;

                // Reset Globe
                const globeP = this.db.globe.players.find(x => x.id === newPlayer.id);
                if (globeP) {
                    globeP.lat = 0;
                    globeP.lng = 0;
                    globeP.era = 0;
                }

                // Persist
                localStorage.setItem(STORAGE_PREFIX + player.name, JSON.stringify(newPlayer));

                return { status: 'SUCCESS', state: newPlayer, msg: "Player Reset Complete. Welcome back!", world: this.createDefaultWorld('TUTORIAL_ISLAND') };
            }
            return { status: 'SUCCESS', state: player, msg: "Admin Command Executed" };
        }

        return { status: 'OK' };
    }

    // --- HELPERS ---

    public addXP(player: PlayerState, skill: SkillName, amount: number) {
        if (!player.skills[skill]) player.skills[skill] = { level: 1, xp: 0, unlocked: true };

        player.skills[skill].xp += amount;

        // Check Level Up
        const curLvl = player.skills[skill].level;
        const newLvl = getLevelForXP(player.skills[skill].xp, SKILL_XP_TABLE);

        if (newLvl > curLvl) {
            player.skills[skill].level = newLvl;
            soundManager.play('LEVEL_UP');
            // Add to queue for UI
            this.xpDropsQueue.push({ skill, amount: 0 });

            // Check Evolution Era & Stage
            if (skill === 'EVOLUTION') {
                // Granular Stages: Level * 2 (120 Levels -> 240 Stages)
                player.evolutionStage = newLvl * 2;

                // Era is derived from Stage (20 Stages per Era)
                const newEra = Math.floor(player.evolutionStage / 20);
                if (newEra > player.era) {
                    player.era = newEra;
                    player.follower.name = getAINameForEra(player.era);
                }
            }
        }

        // Passive Evolution XP
        if (skill !== 'EVOLUTION') {
            // Old Rate: 50% (0.5)
            // New Rate: (0.5 / 4) * 3 = 0.375 (37.5%)
            this.addXP(player, 'EVOLUTION', amount * 0.375);
        } else {
            // Only add to queue if it was direct evo xp
            this.xpDropsQueue.push({ skill, amount });
        }

        if (skill !== 'EVOLUTION') this.xpDropsQueue.push({ skill, amount });
    }

    private flushXPDrops() {
        const d = [...this.xpDropsQueue];
        this.xpDropsQueue = [];
        return d;
    }

    private createItem(id: string, count: number, price?: number): InventoryItem {
        const def = ITEM_DEFINITIONS[id];
        if (def) {
            return {
                id: def.id,
                name: def.name,
                type: def.category as any,
                tags: [], // TODO: Map category to tags if needed
                count,
                icon: def.icon,
                tier: def.tier,
                price: price || 0,
                stats: {
                    power: def.stats?.power,
                    armor: def.stats?.armor,
                    aim: def.stats?.aim,
                    magicPower: def.stats?.magicPower,
                    healAmount: def.stats?.healAmount,
                }
            };
        }

        // Fallback for old items or mocks
        const fallback = { id, name: id.toUpperCase(), type: 'MISC' as any, tags: [], count, icon: '📦', price: price || 0 };
        return fallback as InventoryItem;
    }
}

export const backend = new WorldDurableObject();
