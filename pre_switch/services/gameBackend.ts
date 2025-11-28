
import { PlayerState, AIState, WorldState, ResourceEntity, GameResponse, InventoryItem, SkillMap, SkillName, GroundItem, NPC, Appearance, GlobeState, EquipmentSlots, Skill, QuestCompletion, MemoryEntry, Spell, SceneType, SkillGuideItem, ChatEvent, CombatStyle, Recipe, XPDrop, Route, Waypoint, AIMode, BotState, Path, ItemTag, Requirements, SkillDefinition, Prayer } from '../types';
import { soundManager } from './soundManager';

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
    ATTACK: { id: 'ATTACK', name: 'Attack', maxLevel: 120, eraUnlocked: 0, dependencies: [], items: ['Stone Hatchet', 'Bone Spear', 'Bronze Sword'] },
    DEFENSE: { id: 'DEFENSE', name: 'Defense', maxLevel: 120, eraUnlocked: 0, dependencies: [], items: ['Wooden Shield', 'Bone Shield'] },
    STRENGTH: { id: 'STRENGTH', name: 'Strength', maxLevel: 120, eraUnlocked: 0, dependencies: [], items: [] },
    HITS: { id: 'HITS', name: 'Hitpoints', maxLevel: 120, eraUnlocked: 0, dependencies: [], items: [] },
    RANGED: { id: 'RANGED', name: 'Ranged', maxLevel: 120, eraUnlocked: 1, dependencies: [], items: ['Slingshot', 'Shortbow'] },
    PRAYER: { id: 'PRAYER', name: 'Prayer', maxLevel: 120, eraUnlocked: 1, dependencies: [], items: ['Bones'] },
    MAGIC: { id: 'MAGIC', name: 'Magic', maxLevel: 120, eraUnlocked: 3, dependencies: ['CRAFTING', 'RUNECRAFTING'], items: ['Runes'] }, // Unlocked in Era 3 (Egypt)
    COOKING: { id: 'COOKING', name: 'Cooking', maxLevel: 120, eraUnlocked: 0, dependencies: ['FISHING'], items: ['Meat'] },
    WOODCUTTING: { id: 'WOODCUTTING', name: 'Woodcutting', maxLevel: 120, eraUnlocked: 0, dependencies: [], items: ['Logs'] },
    FLETCHING: { id: 'FLETCHING', name: 'Fletching', maxLevel: 120, eraUnlocked: 1, dependencies: ['WOODCUTTING'], items: ['Arrow Shaft'] },
    FISHING: { id: 'FISHING', name: 'Fishing', maxLevel: 120, eraUnlocked: 0, dependencies: [], items: ['Raw Shrimp'] },
    FIREMAKING: { id: 'FIREMAKING', name: 'Firemaking', maxLevel: 120, eraUnlocked: 0, dependencies: ['WOODCUTTING'], items: ['Fire'] },
    CRAFTING: { id: 'CRAFTING', name: 'Crafting', maxLevel: 120, eraUnlocked: 0, dependencies: [], items: ['Leather'] },
    SMITHING: { id: 'SMITHING', name: 'Smithing', maxLevel: 120, eraUnlocked: 3, dependencies: ['MINING'], items: ['Bronze Bar'] },
    MINING: { id: 'MINING', name: 'Mining', maxLevel: 120, eraUnlocked: 0, dependencies: [], items: ['Copper Ore'] },
    HERBLORE: { id: 'HERBLORE', name: 'Herblore', maxLevel: 120, eraUnlocked: 5, dependencies: ['FARMING'], items: ['Herbs'] },
    AGILITY: { id: 'AGILITY', name: 'Agility', maxLevel: 120, eraUnlocked: 1, dependencies: [], items: ['Shortcuts'] },
    THIEVING: { id: 'THIEVING', name: 'Thieving', maxLevel: 120, eraUnlocked: 2, dependencies: [], items: ['Coins'] },
    SLAYER: { id: 'SLAYER', name: 'Slayer', maxLevel: 120, eraUnlocked: 6, dependencies: ['ATTACK', 'STRENGTH', 'DEFENSE'], items: [] },
    FARMING: { id: 'FARMING', name: 'Farming', maxLevel: 120, eraUnlocked: 2, dependencies: [], items: ['Seeds'] },
    RUNECRAFTING: { id: 'RUNECRAFTING', name: 'Runecrafting', maxLevel: 120, eraUnlocked: 3, dependencies: ['MINING', 'MAGIC'], items: ['Runes'] },
    HUNTER: { id: 'HUNTER', name: 'Hunter', maxLevel: 120, eraUnlocked: 1, dependencies: [], items: ['Traps'] },
    CONSTRUCTION: { id: 'CONSTRUCTION', name: 'Construction', maxLevel: 120, eraUnlocked: 4, dependencies: ['WOODCUTTING', 'CRAFTING'], items: ['Planks'] },
    EVOLUTION: { id: 'EVOLUTION', name: 'Evolution', maxLevel: 120, eraUnlocked: 0, dependencies: [], items: ['New Eras', 'Technology'] }
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

// --- AI ARCHITECT MIDDLEWARE (THE BRAIN) ---
class AIArchitect {
    private backend: WorldDurableObject;

    // We now maintain state maps per player ID for persistent thought processes
    private playerStates: Map<string, 'IDLE' | 'BANKING' | 'GRINDING' | 'SURVIVAL' | 'EVOLVING' | 'LOOTING'> = new Map();
    private followerStates: Map<string, 'IDLE' | 'BANKING' | 'GRINDING' | 'SURVIVAL' | 'FOLLOWING' | 'LOOTING'> = new Map();
    private followerCommands: Map<string, 'FOLLOW' | 'STAY' | 'KILL' | 'BANK' | 'GATHER'> = new Map();
    
    // Shared memory: Previous tasks to resume after interruptions
    private sharedMemory: Map<string, { lastCommand: string, lastTargetType: string }> = new Map();
    
    private currentTargetSkill: Map<string, SkillName> = new Map();
    private subTask: Map<string, string> = new Map();

    constructor(backend: WorldDurableObject) {
        this.backend = backend;
    }

    public handleChatCommand(playerId: string, text: string) {
        const lower = text.toLowerCase();
        let cmd: 'FOLLOW' | 'STAY' | 'KILL' | 'BANK' | 'GATHER' | null = null;
        let response = "";
        
        // Extended Natural Language Parsing
        if (lower.includes('follow') || lower.includes('come here') || lower.includes('to me')) {
            cmd = 'FOLLOW';
            response = "On my way, boss.";
        }
        else if (lower.includes('stay') || lower.includes('wait') || lower.includes('stop') || lower.includes('dont move')) {
            cmd = 'STAY';
            response = "Holding position.";
        }
        else if (lower.includes('kill') || lower.includes('attack') || lower.includes('fight') || lower.includes('hunt') || lower.includes('destroy')) {
            cmd = 'KILL';
            response = "Target acquired. Moving to engage.";
        }
        else if (lower.includes('bank') || lower.includes('deposit') || lower.includes('save items') || lower.includes('store this')) {
            cmd = 'BANK';
            response = "Heading to the nearest bank.";
        }
        else if (lower.includes('mine') || lower.includes('rock') || lower.includes('ore')) {
            cmd = 'GATHER';
            this.currentTargetSkill.set(playerId, 'MINING');
            response = "I'll find some rocks.";
        }
        else if (lower.includes('chop') || lower.includes('wood') || lower.includes('tree') || lower.includes('logs')) {
            cmd = 'GATHER';
            this.currentTargetSkill.set(playerId, 'WOODCUTTING');
            response = "Timber!";
        }
        else if (lower.includes('fish') || lower.includes('food') || lower.includes('shrimp') || lower.includes('catch')) {
            cmd = 'GATHER';
            this.currentTargetSkill.set(playerId, 'FISHING');
            response = "Gone fishing.";
        }
        else if (lower.includes('gather') || lower.includes('work') || lower.includes('help me')) {
            cmd = 'GATHER';
            // Default to Woodcutting if no context
            this.currentTargetSkill.set(playerId, 'WOODCUTTING');
            response = "Getting to work.";
        }

        if (cmd) {
            this.followerCommands.set(playerId, cmd);
            this.followerStates.set(playerId, 'IDLE'); // Reset to IDLE to pick up new command immediately
            
            // Update Shared Memory
            this.sharedMemory.set(playerId, { lastCommand: cmd, lastTargetType: this.currentTargetSkill.get(playerId) || '' });
            
            return response;
        }
        return null;
    }

    // Process a "Squad" (Player + Follower)
    public thinkSquad(player: PlayerState, world: WorldState): { action?: string, thought?: string } {
        const pState = this.playerStates.get(player.id) || 'IDLE';
        const fState = this.followerStates.get(player.id) || 'FOLLOWING';
        
        // 1. Player Logic (Only if AutoPilot)
        let playerThought = null;
        if (player.autoPilot) {
             const result = this.thinkEntity(player, world, false, pState, player.id);
             if (result.newState) this.playerStates.set(player.id, result.newState as any);
             playerThought = result.thought;
        }

        // 2. Follower Logic (Always active)
        const fResult = this.thinkEntity(player.follower, world, true, fState, player.id, player);
        if (fResult.newState) this.followerStates.set(player.id, fResult.newState as any);
        
        // Return thought priority: AI thought > Player thought
        return { action: fResult.action, thought: fResult.thought || playerThought || '' };
    }

    private thinkEntity(entity: PlayerState | AIState, world: WorldState, isFollower: boolean, currentState: string, ownerId: string, ownerRef?: PlayerState): { action?: string, thought?: string, newState?: string } {
        const command = this.followerCommands.get(ownerId) || 'FOLLOW';
        
        // --- 0. FOLLOWER COMMAND OVERRIDE ---
        if (isFollower) {
            if (command === 'STAY') return { action: 'IDLE', thought: 'Staying put.', newState: 'IDLE' };
            if (command === 'FOLLOW' && ownerRef) {
                const dist = Math.sqrt(Math.pow(entity.position.x - ownerRef.position.x, 2) + Math.pow(entity.position.z - ownerRef.position.z, 2));
                if (dist > 3) {
                    this.moveTowards(entity, ownerRef.position.x, ownerRef.position.z, true);
                    return { action: 'FOLLOW', thought: 'Wait for me!', newState: 'FOLLOWING' };
                }
            }
        }

        // --- 1. SURVIVAL CHECK (Eating) ---
        // Followers check Player inventory if they are a follower
        const inventorySource = isFollower && ownerRef ? ownerRef.inventory : (entity as PlayerState).inventory;
        const hpSource = isFollower && ownerRef ? ownerRef.hp : (entity as PlayerState).hp;
        const maxHpSource = isFollower && ownerRef ? ownerRef.maxHp : (entity as PlayerState).maxHp;

        if (hpSource < maxHpSource * 0.4) {
            const food = inventorySource.find(i => i.tags.includes('TAG_FOOD'));
            if (food) {
                // If follower eats, they consume form player inventory
                if (isFollower && ownerRef) {
                    this.backend.router('/action/eat', { itemId: food.id }, true); // Eats for player? Or follower self?
                    // Simplified: Follower feeds player
                    return { action: 'EAT', thought: `Feeding master ${food.name}.` };
                } else {
                    this.backend.router('/action/eat', { itemId: food.id }, true);
                    return { action: 'EAT', thought: `Munching on ${food.name}.` };
                }
            } else {
                if(!isFollower) {
                    this.subTask.set(ownerId, 'WITHDRAW_FOOD');
                    return { newState: 'BANKING', action: 'PANIC', thought: 'Need food!' };
                }
            }
        }
        
        // --- 1.5 PRAYER CHECK ---
        const bones = inventorySource.find(i => i.tags.includes('TAG_PRAYER'));
        if (bones) {
             const idx = inventorySource.indexOf(bones);
             inventorySource.splice(idx, 1);
             // Credit XP to Owner
             const xpOwner = isFollower && ownerRef ? ownerRef : (entity as PlayerState);
             this.backend.addXP(xpOwner, 'PRAYER', 4.5);
             return { action: 'PRAY', thought: 'Offering bones...' };
        }

        // --- 2. LOOTING CHECK (The "Loot Goblin" ADHD) ---
        const loot = world.groundItems.find(g => {
            const d = Math.sqrt(Math.pow(entity.position.x - g.position.x, 2) + Math.pow(entity.position.z - g.position.z, 2));
            return d < 8; 
        });
        
        if (loot && inventorySource.length < 28) {
            const arrived = this.moveTowards(entity, loot.position.x, loot.position.z);
            if (arrived) {
                // Pickup goes to OWNER inventory if follower
                if (isFollower && ownerRef) {
                     ownerRef.inventory.push(loot.item);
                     const gIdx = world.groundItems.indexOf(loot);
                     if(gIdx > -1) world.groundItems.splice(gIdx, 1);
                     return { action: 'LOOT', thought: `Grabbed ${loot.item.name} for you!`, newState: 'LOOTING' };
                } else {
                    this.backend.router('/action/pickup', { groundItemId: loot.id }, true);
                    return { action: 'LOOT', thought: `Ooh! A ${loot.item.name}!`, newState: 'LOOTING' };
                }
            }
            return { action: 'MOVE_LOOT', thought: `Running to grab ${loot.item.name}.`, newState: 'LOOTING' };
        }

        // --- 3. INVENTORY FULL CHECK ---
        if ((inventorySource.length >= 28 && currentState !== 'BANKING') || (isFollower && command === 'BANK')) {
            this.subTask.set(ownerId, 'DEPOSIT_ALL');
            return { action: 'THINK', thought: 'Bags full. Banking.', newState: 'BANKING' };
        }

        // --- 4. EVOLUTION CHECK (Player Only) ---
        if (!isFollower) {
            const player = entity as PlayerState;
            const nextEra = ERA_DATA.find(e => e.id === player.era + 1);
            if (nextEra && player.skills['EVOLUTION'].level >= nextEra.minLvl && player.era < 12) {
                // Ensure the backend handles the Era update in addXP, this is just for force checking
                // But we can also trigger a visual 'Evolving...' state here
                return { action: 'EVOLVE', thought: `EVOLUTION: Advancing to ${nextEra.name}!` };
            }
        }

        // --- 5. STATE MACHINE ---
        switch (currentState) {
            case 'BANKING':
                return this.handleBanking(entity, world, isFollower, ownerId, ownerRef);
            case 'GRINDING':
                return this.handleGrinding(entity, world, isFollower, ownerId, ownerRef);
            case 'IDLE':
            case 'FOLLOWING':
                // For follower, if commanded, switch state
                if (isFollower) {
                    if (command === 'KILL' || command === 'GATHER') return { newState: 'GRINDING' };
                }
                return this.decideGoal(entity, isFollower, ownerId);
            case 'LOOTING':
                return { newState: 'IDLE' }; // Done looting
            default:
                return { newState: 'IDLE' };
        }
    }

    private decideGoal(entity: PlayerState | AIState, isFollower: boolean, ownerId: string): { action?: string, thought?: string, newState?: string } {
        if (isFollower) return {}; // Follower waits for commands usually

        const player = entity as PlayerState;
        // Logic: Find lowest unlocked skill
        const unlockedSkills = SKILL_REGISTRY.filter(s => {
            const def = SKILL_DEFINITIONS[s];
            return def.eraUnlocked <= player.era && player.skills[s].unlocked && s !== 'EVOLUTION' && s !== 'HITS' && s !== 'PRAYER';
        });

        // "Maxing Drive": Prioritize skills that are close to a multiple of 10
        unlockedSkills.sort((a, b) => {
            const lvlA = player.skills[a].level;
            const lvlB = player.skills[b].level;
            const distA = 10 - (lvlA % 10);
            const distB = 10 - (lvlB % 10);
            if (distA !== distB) return distA - distB;
            return lvlA - lvlB;
        });

        const farmable = unlockedSkills.find(s => ['WOODCUTTING', 'MINING', 'FISHING', 'ATTACK', 'DEFENSE', 'STRENGTH'].includes(s));
        
        if (farmable) {
            this.currentTargetSkill.set(ownerId, farmable);
            this.subTask.set(ownerId, 'LOCATE_RESOURCE');
            return { action: 'PLAN', thought: `Goal: Train ${farmable} -> Lvl ${player.skills[farmable].level + 1}.`, newState: 'GRINDING' };
        }
        return { action: 'IDLE', thought: 'No valid skills.', newState: 'IDLE' };
    }

    private moveTowards(entity: PlayerState | AIState, targetX: number, targetZ: number, run: boolean = true) {
        const speed = run ? 2.5 : 1.0; 
        const dx = targetX - entity.position.x;
        const dz = targetZ - entity.position.z;
        const dist = Math.sqrt(dx*dx + dz*dz);
        
        if (dist <= speed) {
            entity.position.x = targetX;
            entity.position.z = targetZ;
            return true; 
        } else {
            const angle = Math.atan2(dz, dx);
            const nextX = entity.position.x + Math.cos(angle) * speed;
            const nextZ = entity.position.z + Math.sin(angle) * speed;
            entity.position.x = nextX;
            entity.position.z = nextZ;
            return false; 
        }
    }

    private handleBanking(entity: PlayerState | AIState, world: WorldState, isFollower: boolean, ownerId: string, ownerRef?: PlayerState): { action?: string, thought?: string, newState?: string } {
        const bank = world.resources.find(r => r.type === 'BANK_BOOTH');
        if (!bank) {
            world.resources.push({ id: 'sim-bank', type: 'BANK_BOOTH', tier: isFollower ? 0 : (entity as PlayerState).era, position: { x: entity.position.x + 2, z: entity.position.z + 2 }, active: true });
            return { action: 'SEARCH', thought: 'Looking for bank...' };
        }

        const arrived = this.moveTowards(entity, bank.position.x, bank.position.z);
        if (!arrived) return { action: 'MOVE', thought: 'Running to bank...' };

        // Shared Inventory logic
        const inventory = isFollower && ownerRef ? ownerRef.inventory : (entity as PlayerState).inventory;
        const bankStorage = isFollower && ownerRef ? ownerRef.bank : (entity as PlayerState).bank;
        
        // Deposit
        const toDeposit = inventory.filter(i => 
            !i.tags.includes('TAG_TOOL_AXE') && 
            !i.tags.includes('TAG_TOOL_PICK') && 
            !i.tags.includes('TAG_TOOL_NET') && 
            !i.tags.includes('TAG_WEAPON_MELEE') &&
            !i.tags.includes('TAG_TOOL_FIRE') &&
            !i.tags.includes('TAG_TOOL_KNIFE')
        );

        if (toDeposit.length === 0) {
            // Reset command if we were forced to bank
            if(isFollower) this.followerCommands.set(ownerId, 'FOLLOW');
            return { action: 'DONE', thought: 'Banking complete.', newState: 'IDLE' };
        }

        const item = toDeposit[0];
        const idx = inventory.indexOf(item);
        inventory.splice(idx, 1);
        bankStorage.push(item);
        
        return { action: 'DEPOSIT', thought: `Depositing ${item.name}.` };
    }

    private handleGrinding(entity: PlayerState | AIState, world: WorldState, isFollower: boolean, ownerId: string, ownerRef?: PlayerState): { action?: string, thought?: string, newState?: string } {
        // Determine Goal
        let skill = this.currentTargetSkill.get(ownerId);
        
        // Follower Command Overrides
        if (isFollower) {
            const cmd = this.followerCommands.get(ownerId);
            if (cmd === 'KILL') skill = 'ATTACK';
            else if (cmd === 'GATHER') {
                // If not set specifically by natural language, check memory or default
                if (!skill) {
                    const mem = this.sharedMemory.get(ownerId);
                    skill = (mem && mem.lastTargetType) ? (mem.lastTargetType as SkillName) : 'MINING';
                }
            }
        }

        if (!skill) return { newState: 'IDLE' };

        const inventory = isFollower && ownerRef ? ownerRef.inventory : (entity as PlayerState).inventory;
        const equipment = isFollower && ownerRef ? ownerRef.equipment : (entity as PlayerState).equipment;

        // 1. Tool Check
        let neededToolTag: ItemTag | null = null;
        if (skill === 'WOODCUTTING') neededToolTag = 'TAG_TOOL_AXE';
        if (skill === 'MINING') neededToolTag = 'TAG_TOOL_PICK';
        if (skill === 'FISHING') neededToolTag = 'TAG_TOOL_NET';

        if (neededToolTag) {
            const hasTool = inventory.some(i => i.tags.includes(neededToolTag!) || equipment.mainHand?.tags.includes(neededToolTag!));
            if (!hasTool) {
                // Cheat: Obtain tool if missing
                const toolId = neededToolTag === 'TAG_TOOL_AXE' ? 'hatchet_stone' : neededToolTag === 'TAG_TOOL_PICK' ? 'pickaxe_bronze' : 'net_fishing';
                inventory.push({ id: toolId, name: 'Simulated Tool', type: 'TOOL', tags: [neededToolTag], count: 1, icon: '🔧' }); 
                return { action: 'ACQUIRE', thought: `Found a tool for ${skill}.` };
            }
        }

        // 2. Find Resource
        let targetType = '';
        if (skill === 'WOODCUTTING') targetType = 'TREE'; // Also handles PALM_TREE
        if (skill === 'MINING') targetType = 'ROCK';
        if (skill === 'FISHING') targetType = 'FISHING_SPOT';
        if (['ATTACK', 'STRENGTH', 'DEFENSE'].includes(skill)) targetType = 'NPC';

        let target: ResourceEntity | NPC | undefined;
        if (targetType === 'NPC') {
            const enemies = world.npcs.filter(n => (n.role === 'MOB' || n.role === 'ENEMY') && n.hp && n.hp > 0);
            if (enemies.length > 0) {
                 enemies.sort((a,b) => {
                     const distA = Math.hypot(a.position.x - entity.position.x, a.position.z - entity.position.z);
                     const distB = Math.hypot(b.position.x - entity.position.x, b.position.z - entity.position.z);
                     return distA - distB;
                 });
                 target = enemies[0];
            } else {
                 // Spawn logic for simulation consistency
                const lvl = ownerRef ? ownerRef.combatLevel : 3;
                const name = lvl < 5 ? 'Giant Rat' : lvl < 10 ? 'Goblin' : lvl < 20 ? 'Mugger' : 'Guard';
                world.npcs.push({ id: `sim-mob-${Date.now()}`, name, role: 'ENEMY', hp: lvl * 4, maxHp: lvl * 4, position: { x: entity.position.x + 4, z: entity.position.z - 4 }, voice: 'INHUMAN', combatLevel: lvl });
                return { action: 'SEARCH', thought: 'Hunting...' };
            }
        } else {
            const resources = world.resources.filter(r => (r.type === targetType || r.type.includes(targetType)) && r.active);
            if (resources.length > 0) {
                 resources.sort((a,b) => {
                     const distA = Math.hypot(a.position.x - entity.position.x, a.position.z - entity.position.z);
                     const distB = Math.hypot(b.position.x - entity.position.x, b.position.z - entity.position.z);
                     return distA - distB;
                 });
                 target = resources[0];
            } else {
                return { action: 'WAIT', thought: 'Waiting for respawn...' };
            }
        }

        // 3. Move & Interact
        if (target) {
            const arrived = this.moveTowards(entity, target.position.x, target.position.z);
            if (!arrived) {
                const tName = 'name' in target ? target.name : target.type;
                return { action: 'MOVE', thought: `Moving to ${tName}.` };
            } else {
                if (targetType === 'NPC') {
                    // Redirect attack to backend logic to handle HP/Loot
                    // If follower, XP goes to owner
                    if (isFollower && ownerRef) {
                        this.backend.router('/action/attack', { targetId: target.id, attacker: 'FOLLOWER' }, true);
                    } else {
                        this.backend.router('/action/attack', { targetId: target.id }, true);
                    }
                    return { action: 'COMBAT', thought: `Fighting!` };
                } else {
                    const res = target as ResourceEntity;
                    // Gather logic
                    if (isFollower && ownerRef) {
                        // Simulate gather for owner
                        if (skill === 'WOODCUTTING') {
                             this.backend.addXP(ownerRef, 'WOODCUTTING', 25);
                             ownerRef.inventory.push({ id: 'logs', name: 'Logs', count: 1, type: 'RESOURCE', tags: ['TAG_RESOURCE_WOOD'], icon: '🪵' });
                             res.active = false; setTimeout(() => res.active = true, 5000);
                        }
                        if (skill === 'MINING') {
                             this.backend.addXP(ownerRef, 'MINING', 35);
                             ownerRef.inventory.push({ id: 'copper_ore', name: 'Copper Ore', count: 1, type: 'RESOURCE', tags: ['TAG_RESOURCE_ORE'], icon: '🪨' });
                             res.active = false; setTimeout(() => res.active = true, 5000);
                        }
                        if (skill === 'FISHING') {
                            this.backend.addXP(ownerRef, 'FISHING', 25);
                            ownerRef.inventory.push({ id: 'raw_shrimp', name: 'Raw Shrimp', count: 1, type: 'FOOD', tags: ['TAG_COOKABLE', 'TAG_FOOD'], icon: '🦐' });
                            res.active = false; setTimeout(() => res.active = true, 5000);
                        }
                        return { action: 'GATHER', thought: `Gathering for you!` };
                    } else {
                        this.backend.router('/action/gather', { targetId: res.id, type: res.type }, true);
                        return { action: 'GATHER', thought: `Training ${skill}...` };
                    }
                }
            }
        }
        return {};
    }
}

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
    { id: 'r_hatchet_stone', inputs: ['stone_sharp', 'branch'], output: 'hatchet_stone', count: 1, skill: 'CRAFTING', level: 1, xp: 15, category: 'TOOL' },
    { id: 'r_spear_stone', inputs: ['hatchet_stone', 'branch'], output: 'spear_stone', count: 1, skill: 'CRAFTING', level: 5, xp: 20, category: 'WEAPON' },
    { id: 'r_shafts', inputs: ['logs'], output: 'arrow_shaft', count: 15, skill: 'FLETCHING', level: 1, xp: 5, toolTag: 'TAG_TOOL_KNIFE', category: 'MISC' },
    { id: 'r_fire', inputs: ['logs'], output: 'fire', count: 1, skill: 'FIREMAKING', level: 1, xp: 40, toolTag: 'TAG_TOOL_FIRE', category: 'MISC' },
];

const USER_DB = new Map<string, string>(); 
const OWNER_USER = "Pick Of Gods";
const OWNER_PASS = "Harvestmoon1";
USER_DB.set(OWNER_USER, OWNER_PASS);

class WorldDurableObject {
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
            era: 0, activePrayers: [],
            appearance: { gender: 'MALE', skinColor: '#8d5524', hairStyle: 0, hairColor: '#000', torsoStyle:0, torsoColor:'#5e4b35', sleevesStyle:0, sleevesColor:'#5e4b35', cuffsStyle:0, cuffsColor:'#3a3a3a', handsStyle:0, handsColor:'#8d5524', legsStyle:0, legsColor:'#3a3a3a', shoesStyle:0, shoesColor:'#8d5524' },
            inventory: [], bank: [],
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
                position: { x: -2, z: -2 }, 
                lastThought: "Ready.", action: 'IDLE', mode: 'FOLLOW', memory: [],
                friendship: 10
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
        items.push({ id: 'stone', name: 'Stone', type: 'RESOURCE', tags: ['TAG_RESOURCE_STONE'], count: 50, icon: '🪨' });
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
            // TUTORIAL ISLAND / PRIMITIVE
            for (let i = 0; i < 15; i++) {
                resources.push({ id: `tree-${i}`, type: 'TREE', tier: 0, position: { x: Math.random() * 30 - 15, z: Math.random() * 30 - 15 }, active: true });
                resources.push({ id: `rock-${i}`, type: 'ROCK', tier: 0, position: { x: Math.random() * 30 - 15, z: Math.random() * 30 - 15 }, active: true });
            }
            resources.push({ id: 'portal-main', type: 'PORTAL', tier: 10, position: { x: 8, z: 8 }, active: true });
            resources.push({ id: 'bank-1', type: 'BANK_BOOTH', tier: 1, position: { x: -4, z: -4 }, active: true });
            
            npcs.push({ id: 'guide', name: 'Survival Guide', role: 'GUIDE', position: { x: 2, z: 2 }, voice: 'MALE', dialogue: 'Welcome to the simulation.' });
            npcs.push({ id: 'rat-1', name: 'Giant Rat', role: 'ENEMY', hp: 8, maxHp: 8, combatLevel: 3, position: { x: 5, z: -5 }, voice: 'INHUMAN' });
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

    // --- PUBLIC ROUTER ---
    public router(path: string, body: any, isSimulated: boolean = false): GameResponse {
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
                this.db.player = p!;
                // Update Globe
                const existingGlobeP = this.db.globe.players.find(x => x.id === p!.id);
                if (!existingGlobeP) this.db.globe.players.push({ id: p!.id, name: p!.name, lat: 0, lng: 0, era: p!.era });
                
                return { status: 'SUCCESS', state: p, world: this.db.world };
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
            return { status: 'SUCCESS', state: p, world: this.db.world };
        }
        
        if (path === '/auth/create_char') {
            if (this.db.player) {
                this.db.player.appearance = body.appearance;
                return { status: 'SUCCESS', state: this.db.player };
            }
        }
        
        if (path === '/auth/gps') {
             // Re-seed world based on GPS? For now just ack.
             return { status: 'SUCCESS', state: this.db.player, world: this.db.world };
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
            
            return { status: 'SCENE_CHANGE', state: player, world: this.db.world, msg: `Welcome to ${marker.label}` };
        }

        if (path === '/action/gather') {
            const { targetId, type } = body;
            
            // PORTAL LOGIC
            if (type === 'PORTAL') {
                if (player.era >= 3) {
                     // Check if already in Egypt, if so maybe go back or go to Medieval?
                     // Simple Toggle for Prototype: Tutorial <-> Egypt
                     const targetScene = player.currentScene === 'TUTORIAL_ISLAND' ? 'EGYPT' : 'TUTORIAL_ISLAND';
                     player.currentScene = targetScene;
                     player.position = { x: 0, z: 0 };
                     this.db.world = this.createDefaultWorld(targetScene);
                     return { status: 'SCENE_CHANGE', state: player, world: this.db.world, msg: "Entering Portal..." };
                } else {
                     return { status: 'FAIL', msg: "The Portal is dormant. You must Evolve to Era 3." };
                }
            }
            
            // Resource logic
            const res = this.db.world.resources.find(r => r.id === targetId);
            if (res && res.active) {
                // Drop Table
                let dropId = 'stone'; let qty = 1; let xp = 10; let skill: SkillName = 'MINING';
                
                if (type === 'TREE' || type === 'PALM_TREE') { 
                    dropId = 'logs'; skill = 'WOODCUTTING'; xp = 25; 
                    if (Math.random() > 0.5) soundManager.play('CHOP');
                }
                else if (type === 'ROCK') { 
                    dropId = 'copper_ore'; skill = 'MINING'; xp = 35; soundManager.play('MINE'); 
                }
                else if (type === 'FISHING_SPOT') {
                    dropId = 'raw_shrimp'; skill = 'FISHING'; xp = 20; soundManager.play('SPLASH');
                }
                else if (type === 'BANK_BOOTH') {
                    return { status: 'OPEN_BANK', msg: "Bank Open" };
                }
                
                this.addXP(player, skill, xp);
                player.inventory.push(this.createItem(dropId, qty));
                res.active = false;
                setTimeout(() => res.active = true, 10000); // Respawn

                return { status: 'SUCCESS', msg: `You gather ${dropId}.`, state: player, xpDrops: this.flushXPDrops() };
            }
            return { status: 'FAIL', msg: 'Nothing to gather.' };
        }

        if (path === '/action/attack') {
             const target = this.db.world.npcs.find(n => n.id === body.targetId);
             if (target && target.hp && target.hp > 0) {
                 const hit = Math.floor(Math.random() * (player.skills.ATTACK.level / 2));
                 target.hp -= hit;
                 this.addXP(player, 'HITS', hit * 1.3);
                 this.addXP(player, 'ATTACK', hit * 4);
                 soundManager.play('COMBAT_HIT');
                 
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
                         return { status: 'SUCCESS', state: player, msg: "Enemy defeated!", world: this.db.world, questComplete: { title: "First Blood", description: "You have slain the beast.", rewards: ["Bone Shaft", "Rathide"] } };
                     }
                     
                     return { status: 'SUCCESS', state: player, msg: "Enemy defeated!", world: this.db.world, xpDrops: this.flushXPDrops() };
                 }
                 return { status: 'SUCCESS', state: player, msg: `You hit a ${hit}!`, xpDrops: this.flushXPDrops() };
             }
        }
        
        if (path === '/action/pickup') {
            const itemIdx = this.db.world.groundItems.findIndex(g => g.id === body.groundItemId);
            if (itemIdx > -1) {
                const groundItem = this.db.world.groundItems[itemIdx];
                player.inventory.push(groundItem.item);
                this.db.world.groundItems.splice(itemIdx, 1);
                return { status: 'SUCCESS', state: player, world: this.db.world, msg: `Picked up ${groundItem.item.name}.` };
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
                return { status: 'OPEN_SKILL', availableRecipes: RECIPES, skillName: 'Crafting' };
            }
        }
        
        if (path === '/action/craft') {
            const recipe = RECIPES.find(r => r.id === body.recipeId);
            if (recipe) {
                // Check materials
                const hasMats = recipe.inputs.every(mat => player.inventory.find(i => i.id === mat));
                if (hasMats) {
                    recipe.inputs.forEach(mat => {
                        const idx = player.inventory.findIndex(i => i.id === mat);
                        player.inventory.splice(idx, 1);
                    });
                    player.inventory.push(this.createItem(recipe.output, recipe.count));
                    this.addXP(player, recipe.skill, recipe.xp);
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
                 if(old) player.inventory.push(old);
                 return { status: 'SUCCESS', state: player, msg: `Equipped ${item.name}.` };
            }
        }

        if (path === '/ai/tick') {
             // 1. Process Architect (AI brains)
             const aiAction = this.architect.thinkSquad(player, this.db.world);
             
             // 2. Process Botty (The NPC Player)
             const botty = this.activePlayers.get('botty');
             if (botty && botty.currentScene === player.currentScene) {
                  this.architect.thinkSquad(botty, this.db.world);
                  // Ensure Botty is in the NPC list for rendering
                  const existingNpcBot = this.db.world.npcs.find(n => n.id === 'botty-npc');
                  if (!existingNpcBot) {
                       this.db.world.npcs.push({
                           id: 'botty-npc', name: botty.name, role: 'PLAYER_BOT', 
                           position: botty.position, voice: 'MALE', 
                           appearance: botty.appearance, equipment: botty.equipment,
                           botState: { state: 'MOVING', inventory: botty.inventory, skills: botty.skills, goal: 'WOODCUTTING', lastActionTime: Date.now() }
                       });
                  } else {
                       existingNpcBot.position = botty.position;
                       existingNpcBot.botState!.state = this.activePlayers.get('botty')?.follower.action === 'GATHER' ? 'GATHERING' : 'MOVING';
                  }
             }

             return { status: 'OK', world: this.db.world, state: player, aiAction: aiAction.action, aiThought: aiAction.thought, xpDrops: this.flushXPDrops() };
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
            this.xpDropsQueue.push({ skill, amount: 0 }); // Just to trigger update, real drops handled per action
            
            // Check Evolution Era
            if (skill === 'EVOLUTION') {
                const nextEra = ERA_DATA.find(e => e.id === player.era + 1);
                if (nextEra && newLvl >= nextEra.minLvl) {
                     player.era++;
                     player.follower.name = getAINameForEra(player.era);
                     // Announce?
                }
            }
        }
        
        // Passive Evolution XP
        if (skill !== 'EVOLUTION') {
             // 50% of all XP goes to Evolution
             this.addXP(player, 'EVOLUTION', amount * 0.5);
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

    private createItem(id: string, count: number): InventoryItem {
        const def = { id, name: id.toUpperCase(), type: 'MISC' as any, tags: [], count, icon: '📦' };
        // Mocks
        if (id === 'logs') { def.name = 'Logs'; def.type = 'RESOURCE'; def.tags = ['TAG_RESOURCE_WOOD', 'TAG_FUEL']; def.icon = '🪵'; }
        if (id === 'copper_ore') { def.name = 'Copper Ore'; def.type = 'RESOURCE'; def.tags = ['TAG_RESOURCE_ORE']; def.icon = '🪨'; }
        if (id === 'stone_sharp') { def.name = 'Sharp Stone'; def.type = 'RESOURCE'; def.tags = ['TAG_CRAFTABLE']; def.icon = '🪨'; }
        if (id === 'hatchet_stone') { def.name = 'Stone Hatchet'; def.type = 'TOOL'; def.tags = ['TAG_TOOL_AXE', 'TAG_WEAPON_MELEE']; def.icon = '🪓'; }
        if (id === 'fire') { def.name = 'Fire'; def.type = 'MISC'; def.tags = ['TAG_HEAT_SOURCE']; def.icon = '🔥'; }
        if (id === 'raw_shrimp') { def.name = 'Raw Shrimp'; def.type = 'FOOD'; def.tags = ['TAG_COOKABLE']; def.icon = '🦐'; }
        
        return def as InventoryItem;
    }
}

export const backend = new WorldDurableObject();
