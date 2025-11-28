
export type SkillName = 
    | 'ATTACK' | 'DEFENSE' | 'STRENGTH' | 'HITS' | 'RANGED' | 'PRAYER' | 'MAGIC' 
    | 'COOKING' | 'WOODCUTTING' | 'FLETCHING' | 'FISHING' | 'FIREMAKING' | 'CRAFTING' 
    | 'SMITHING' | 'MINING' | 'HERBLORE' | 'AGILITY' | 'THIEVING' | 'SLAYER' 
    | 'FARMING' | 'RUNECRAFTING' | 'HUNTER' | 'CONSTRUCTION' | 'EVOLUTION';

export type EraName = 
    | 'Caveman'               // Era 0
    | 'Prehistoric Human'     // Era 1
    | 'Ancient Village'       // Era 2
    | 'Lost Civilization'     // Era 3 (Egypt/Meso)
    | 'Bronze Age'            // Era 4
    | 'Iron Age'              // Era 5
    | 'Classical Era'         // Era 6
    | 'Medieval Era'          // Era 7
    | 'Renaissance'           // Era 8
    | 'Industrial Era'        // Era 9
    | 'Atomic Age'            // Era 10
    | 'Information Age'       // Era 11
    | 'Deity/Godhood';        // Era 12+

export interface SkillDefinition {
    id: SkillName;
    name: string;
    maxLevel: number;
    eraUnlocked: number; // 0-12
    dependencies: SkillName[];
    items: string[]; // Item IDs unlockable via this skill
}

export interface Skill {
    level: number;
    xp: number;
    unlocked: boolean;
    virtualLevel?: number; // For levels > 99
}

export type SkillMap = Record<SkillName, Skill>;

export interface ItemStats {
    power?: number;
    armor?: number;
    aim?: number;
    healAmount?: number;
    prayerXp?: number;
    value?: number; // Gold value
    magicPower?: number; // New for magic
    rangedPower?: number;
}

export interface Requirements {
    skills?: Partial<Record<SkillName, number>>;
    era?: number;
    evolutionLevel?: number;
    questStage?: number;
}

// --- Tag System ---
export type ItemTag = 
    | 'TAG_TOOL_AXE' 
    | 'TAG_TOOL_PICK' 
    | 'TAG_TOOL_NET' 
    | 'TAG_TOOL_SPEAR'
    | 'TAG_TOOL_KNIFE'
    | 'TAG_TOOL_FIRE'
    | 'TAG_TOOL_REST'
    | 'TAG_TOOL_HAMMER'
    | 'TAG_RESOURCE_WOOD' 
    | 'TAG_RESOURCE_ORE' 
    | 'TAG_RESOURCE_BAR'
    | 'TAG_RESOURCE_FISH' 
    | 'TAG_RESOURCE_HIDE'
    | 'TAG_RESOURCE_STONE'
    | 'TAG_RESOURCE_FIBER'
    | 'TAG_RESOURCE_CRYSTAL'
    | 'TAG_FOOD' 
    | 'TAG_COOKABLE'
    | 'TAG_FUEL'
    | 'TAG_HEAT_SOURCE'
    | 'TAG_WEAPON_MELEE'
    | 'TAG_WEAPON_MAGIC' 
    | 'TAG_WEAPON_RANGED'
    | 'TAG_2H' 
    | 'TAG_OFFHAND' 
    | 'TAG_SHIELD' 
    | 'TAG_ARMOR'
    | 'TAG_SLOT_HEAD'
    | 'TAG_SLOT_BODY'
    | 'TAG_SLOT_LEGS'
    | 'TAG_SLOT_FEET'
    | 'TAG_SLOT_HANDS'
    | 'TAG_SLOT_WRISTS'
    | 'TAG_SLOT_NECK'
    | 'TAG_SLOT_AMMO'
    | 'TAG_SLOT_AURA'
    | 'TAG_SLOT_RING'
    | 'TAG_CONSUMABLE'
    | 'TAG_CURRENCY'
    | 'TAG_PRAYER'
    | 'TAG_CRAFTABLE'
    | 'TAG_STACKABLE';

export interface InventoryItem {
    id: string;
    name: string;
    type: 'RESOURCE' | 'TOOL' | 'FOOD' | 'WEAPON' | 'ARMOR' | 'CONSUMABLE' | 'MISC';
    tags: ItemTag[];
    count: number;
    icon: string;
    stats?: ItemStats;
    requirements?: Requirements; 
    tier?: number;
    description?: string;
}

export interface GroundItem {
    id: string;
    item: InventoryItem;
    position: { x: number; z: number };
    despawnTime: number;
}

export interface EquipmentSlots {
    mainHand: InventoryItem | null;
    offHand?: InventoryItem | null;
    head?: InventoryItem | null;
    body?: InventoryItem | null;
    legs?: InventoryItem | null;
    feet?: InventoryItem | null;
    hands?: InventoryItem | null;
    wrists?: InventoryItem | null;
    neck?: InventoryItem | null;
    ammo?: InventoryItem | null;
    aura?: InventoryItem | null;
    // 8 Ring Slots
    ring1?: InventoryItem | null;
    ring2?: InventoryItem | null;
    ring3?: InventoryItem | null;
    ring4?: InventoryItem | null;
    ring5?: InventoryItem | null;
    ring6?: InventoryItem | null;
    ring7?: InventoryItem | null;
    ring8?: InventoryItem | null;
}

export interface QuestState {
    stage: number;
    name: string;
    description: string;
    targetSkill?: SkillName;
    targetLevel?: number;
}

export interface Friend {
    name: string;
    isOnline: boolean;
    world?: number;
}

export interface MemoryEntry {
    text: string;
    type: 'CHAT' | 'ACTION' | 'EVENT';
    timestamp: number;
    keywords?: string[];
}

export interface Appearance {
    gender: 'MALE' | 'FEMALE';
    skinColor: string;
    
    // HEAD
    hairStyle: number; // 0-9
    hairColor: string;
    
    // TORSO
    torsoStyle: number; // 0-9
    torsoColor: string;
    
    // ARMS
    sleevesStyle: number; // 0-9
    sleevesColor: string;
    cuffsStyle: number; // 0-9
    cuffsColor: string;
    
    // HANDS
    handsStyle: number; // 0-9
    handsColor: string;
    
    // LEGS
    legsStyle: number; // 0-9
    legsColor: string;
    
    // FEET
    shoesStyle: number; // 0-9
    shoesColor: string;
}

export type SceneType = 
    | 'TUTORIAL_ISLAND' 
    | 'MAINLAND_GLOBE' 
    | 'EGYPT' 
    | 'MEDIEVAL_KINGDOM'
    | 'MODERN_CITY' 
    | 'FUTURE_TECH'
    | 'NORTH'
    | 'ROME' 
    | 'ASIA' 
    | 'AMERICAS'
    | 'CELESTIAL_REALM'
    | 'CYBER_SLUMS';

export type CombatStyle = 'ACCURATE' | 'AGGRESSIVE' | 'DEFENSIVE';

export type AIMode = 'IDLE' | 'WANDER' | 'FOLLOW' | 'GATHER' | 'GUARD' | 'COMBAT' | 'STAY' | 'BEG' | 'BANKING' | 'FETCH_FOOD' | 'SHOPPING';

export interface AIState {
    id: string;
    ownerId: string;
    name: string;
    status: string;
    inventory: InventoryItem[];
    // Inventory is SHARED with player for now, or simplistic
    position: { x: number; z: number };
    lastThought: string;
    action: AIMode;
    mode: 'FOLLOW' | 'STAY' | 'GUARD' | 'GATHER' | 'BANKING' | 'COMBAT'; 
    targetId?: string | null;
    memory: MemoryEntry[];
    friendship: number; // 0-100
}

export interface PlayerState {
    id: string;
    name: string;
    isAdmin: boolean;
    combatLevel: number;
    hp: number;
    maxHp: number;
    skills: SkillMap;
    fatigue: number;
    combatStyle: CombatStyle;
    activePrayers: string[]; // List of active prayer IDs
    
    // EVOLUTION SYSTEM
    era: number; // 0-12
    
    appearance: Appearance;
    inventory: InventoryItem[];
    bank: InventoryItem[]; // Banking storage
    equipment: EquipmentSlots;
    position: { x: number; z: number };
    quest: QuestState;
    friends: Friend[];
    targetId?: string | null; // For combat tracking
    currentScene: SceneType;
    collectionLog: string[]; // IDs of unique items found
    
    // AI ARCHITECT STATE
    autoPilot?: boolean;
    currentGoal?: string;
    
    // THE FOLLOWER
    follower: AIState;
}

export interface Waypoint {
    x: number;
    z: number;
    wait?: number; // Seconds to wait
}

export interface Route {
    id: string;
    waypoints: Waypoint[];
    currentWaypointIndex: number;
    isLoop: boolean;
}

export type VoiceType = 'MALE' | 'FEMALE' | 'INHUMAN';

export interface BotState {
    state: 'IDLE' | 'MOVING' | 'GATHERING' | 'BANKING' | 'DEPOSITING' | 'TRADING' | 'COMBAT';
    targetId?: string;
    targetPos?: { x: number, z: number };
    inventory: InventoryItem[];
    skills: SkillMap;
    goal: 'WOODCUTTING' | 'MINING' | 'COMBAT' | 'BANKING';
    lastActionTime: number;
}

export interface NPC {
    id: string;
    name: string;
    role: 'GUIDE' | 'MERCHANT' | 'ENEMY' | 'PLAYER_BOT' | 'BANKER' | 'MOB' | 'MAKEOVER' | 'HAIRDRESSER' | 'CLOTHIER' | 'CIVILIAN' | 'GUARD';
    voice: VoiceType;
    position: { x: number; z: number };
    rotation?: number;
    dialogue?: string;
    equipment?: EquipmentSlots; 
    combatLevel?: number;
    hp?: number;
    maxHp?: number;
    shopStock?: InventoryItem[];
    appearance?: Appearance;
    lootTableId?: string;
    thievingLevel?: number;
    route?: Route; // Pathfinding
    botState?: BotState; // For simulated players
    followerName?: string; // Visual only for rendering follower of a bot
}

export interface ResourceEntity {
    id: string;
    type: 'TREE' | 'ROCK' | 'FLAX' | 'FISHING_SPOT' | 'PORTAL' | 'BANK_BOOTH' | 'FURNACE' | 'ANVIL' | 'FIRE' | 'ALTAR' | 'CACTUS' | 'PALM_TREE' | 'COLUMN' | 'BAMBOO' | 'TOTEM' | 'ICE_SPIKE' | 'STALL' | 'OBELISK' | 'PYRAMID' | 'SARCOPHAGUS' | 'COMPUTER_TERMINAL';
    tier: number;
    position: { x: number; z: number };
    active: boolean;
    despawnTime?: number; // For fires
    requirements?: Requirements;
}

export interface Path {
    id: string;
    points: { x: number, z: number }[];
    type: 'DIRT' | 'STONE' | 'PAVED';
}

export interface WorldState {
    seed: number;
    biome: 'UNKNOWN' | 'JUNGLE' | 'TEMPERATE' | 'TUNDRA' | 'DESERT' | 'URBAN' | 'ASIAN' | 'SWAMP';
    timeOfDay: number; // 0 - 24
    resources: ResourceEntity[];
    groundItems: GroundItem[];
    npcs: NPC[];
    paths: Path[];
}

export interface GlobeMarker {
    id: string;
    lat: number;
    lng: number;
    type: 'CITY' | 'DUNGEON' | 'RESOURCE' | 'PLAYER';
    label: string;
    eraRequired?: number;
    sceneTarget?: SceneType;
}

export interface GlobeState {
    connectionCount: number;
    players: { id: string; lat: number; lng: number; name: string; era: number }[];
    markers: GlobeMarker[];
}

export interface QuestCompletion {
    title: string;
    description: string;
    rewards: string[];
}

export interface ChatEvent {
    id: string;
    sourceId: string;
    text: string;
    color: string; // Hex
}

export type RecipeCategory = 'WEAPON' | 'ARMOR' | 'TOOL' | 'RESOURCE' | 'FOOD' | 'JEWELRY' | 'MISC';

export interface Recipe {
    id: string;
    inputs: string[]; // Item IDs required
    output: string; // Item ID produced
    count: number; // Output count
    skill: SkillName;
    level: number;
    xp: number;
    toolTag?: ItemTag; // Optional tool requirement
    category?: RecipeCategory;
}

export interface XPDrop {
    skill: SkillName;
    amount: number;
}

export interface GameResponse {
    status: 'SUCCESS' | 'FAIL' | 'OK' | 'PORTAL_ACTIVE' | 'OPEN_BANK' | 'OPEN_SHOP' | 'OPEN_TRADE' | 'OPEN_MAKEOVER' | 'CREATED' | 'SCENE_CHANGE' | 'OPEN_SKILL' | 'DEATH';
    msg?: string;
    item?: InventoryItem;
    state?: PlayerState;
    evolved?: boolean;
    aiAction?: string;
    aiThought?: string;
    world?: WorldState;
    globe?: GlobeState;
    examinedPlayer?: PlayerState;
    shopStock?: InventoryItem[];
    activeTrade?: InventoryItem[];
    shopMode?: 'BUY' | 'SELL';
    makeoverType?: 'ALL' | 'HAIR' | 'CLOTHES' | 'SKIN';
    targetScene?: SceneType;
    voiceType?: VoiceType;
    questComplete?: QuestCompletion;
    chatEvents?: ChatEvent[]; 
    // Skill Interface
    availableRecipes?: Recipe[];
    skillName?: string;
    // Rewards
    xpDrops?: XPDrop[];
}

export type ChatChannel = 'LOCAL' | 'WORLD' | 'FRIENDS' | 'AI' | 'SYSTEM' | 'ERROR' | 'INFO';

export interface LogMessage {
    id: string;
    text: string;
    type: ChatChannel | 'CHAT_USER' | 'NPC' | 'COMBAT' | 'AI';
    channel?: ChatChannel;
    sender?: string;
    timestamp: number;
}

export type ContainerType = 'PLAYER_INV' | 'AI_INV' | 'PLAYER_EQUIP' | 'AI_EQUIP' | 'BANK' | 'SHOP' | 'TRADE_OFFER';

// --- Context Menu Types ---

export interface ContextMenuOption {
    label: string;
    action: () => void;
    variant?: 'default' | 'danger' | 'primary';
}

export interface ContextMenuState {
    x: number;
    y: number;
    title: string;
    options: ContextMenuOption[];
}

export interface Spell {
    id: string;
    name: string;
    level: number;
    icon: string;
    xp: number;
    description: string;
    type: 'COMBAT' | 'UTILITY' | 'TELEPORT';
}

export interface Prayer {
    id: string;
    name: string;
    level: number;
    description: string;
    icon: string;
    drainRate: number;
}

export interface SkillGuideItem {
    level: number;
    name: string;
    icon: string; // Emoji or Asset ID
    description?: string;
    era?: number; // Era requirement
}
