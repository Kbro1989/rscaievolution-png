

// ============================================================================
// ## RSC CORE ##
// ============================================================================

export type SkillName =
    | 'ATTACK' | 'DEFENSE' | 'STRENGTH' | 'HITS' | 'RANGED' | 'PRAYER' | 'MAGIC'
    | 'COOKING' | 'WOODCUTTING' | 'FLETCHING' | 'FISHING' | 'FIREMAKING' | 'CRAFTING'
    | 'SMITHING' | 'MINING' | 'HERBLORE' | 'AGILITY' | 'THIEVING' | 'SLAYER'
    | 'FARMING' | 'HUNTER' | 'CONSTRUCTION' | 'EVOLUTION';

export type SkillType =
    | 'COMBAT'      // Attack, Defense, Strength, Hits, Ranged, Magic, Prayer
    | 'GATHERING'   // Mining, Woodcutting, Fishing, Farming, Hunter
    | 'ARTISAN'     // Smithing, Crafting, Fletching, Cooking, Firemaking, Herblore, Construction
    | 'SUPPORT'     // Agility, Thieving, Slayer
    | 'SPECIAL';    // Evolution (meta-progression)

export interface SkillDefinition {
    id: SkillName;
    name: string;
    skillType: SkillType;
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
    | 'TAG_SLOT_BACK'
    | 'TAG_CONSUMABLE'
    | 'TAG_CURRENCY'
    | 'TAG_PRAYER'
    | 'TAG_CRAFTABLE'
    | 'TAG_STACKABLE'
    | 'TAG_PRIMITIVE'
    | 'TAG_CRAFTING'
    | 'TAG_TINDER'
    | 'TAG_TOOL'
    | 'TAG_TOOL_BELT'
    | 'TAG_HATCHET'
    | 'TAG_SPEAR'
    | 'TAG_WEAPON'
    | 'TAG_RESOURCE'
    | 'TAG_WOOD'
    | 'TAG_ORE'
    | 'TAG_FOOD'
    | 'TAG_RAW'
    | 'TAG_FISH'
    | 'TAG_COOKED'
    | 'TAG_COSMETIC'
    | 'TAG_ACHIEVEMENT'
    | 'TAG_SLOT_OFFHAND';

export interface InventoryItem {
    id: string;
    name: string;
    type: 'WEAPON' | 'ARMOR' | 'TOOL' | 'RESOURCE' | 'FOOD' | 'JEWELRY' | 'MISC';
    tags: ItemTag[];
    count: number;
    icon: string;
    stats?: ItemStats;
    tier?: number;
    price?: number;
    requirements?: Requirements;
    description?: string;
    // Banking
    tabIndex?: number; // 0 = Main, 1+ = Custom Tabs
    isPlaceholder?: boolean; // If true, count is 0 but item remains in bank
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

export interface SlayerTask {
    monster: string;        // Monster name (e.g., "Giant Rat")
    monsterIds: string[];   // NPC IDs/names that count
    assigned: number;       // Total monsters to kill
    remaining: number;      // Monsters left to kill
    xpPerKill: number;      // Slayer XP per kill
    assignedBy: string;     // Slayer Master ID
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

export type CombatStyle = 'ACCURATE' | 'AGGRESSIVE' | 'DEFENSIVE' | 'CONTROLLED';

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
    evolutionStage: number; // 0-240
    activePrayers: string[]; // List of active prayer IDs

    // EVOLUTION SYSTEM
    era: number; // 0-12
    tutorialStep?: number;

    appearance: Appearance;
    inventory: InventoryItem[];
    toolBelt: string[]; // Hidden utility items (wrench, banking_tool, etc.)
    bank: InventoryItem[]; // Banking storage
    bankTabs?: number; // Number of active bank tabs (default 1)
    equipment: EquipmentSlots;
    position: { x: number; z: number };
    quest: QuestState;
    friends: Friend[];
    targetId?: string | null; // For combat tracking
    currentScene: SceneType;
    collectionLog: string[]; // IDs of unique items found
    slayerTask?: SlayerTask | null; // Active Slayer task

    // AI ARCHITECT STATE
    autoPilot?: boolean;
    currentGoal?: string;
    autonomousAgent?: any; // For Botty McBotface - fully autonomous AI agent

    // THE FOLLOWER
    follower: AIState;
}

export type VoiceType = 'MALE' | 'FEMALE' | 'INHUMAN';

export type ShopType = 'SPECIFIC' | 'GENERAL' | 'LOCAL';

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
    shopType?: ShopType; // SPECIFIC=fixed items, GENERAL=global shared, LOCAL=area shared
    appearance?: Appearance;
    lootTableId?: string;
    thievingLevel?: number;
    route?: Route; // Pathfinding
    botState?: BotState; // For simulated players
    aiVisuals?: any;
    followerName?: string; // Visual only for rendering follower of a bot
    tags?: string[];
    actions?: string[];
    examine?: string;
}

export interface ResourceEntity {
    id: string;
    type: 'TREE' | 'OAK_TREE' | 'WILLOW_TREE' | 'MAPLE_TREE' | 'YEW_TREE' |
    'ROCK' | 'COPPER_ROCK' | 'TIN_ROCK' | 'IRON_ROCK' | 'COAL_ROCK' | 'MITHRIL_ROCK' | 'ADAMANT_ROCK' | 'RUNE_ROCK' |
    'FISHING_SPOT' | 'FISHING_SPOT_NET' | 'FISHING_SPOT_BAIT' | 'FISHING_SPOT_CAGE' | 'FISHING_SPOT_HARPOON' | 'FISHING_SPOT_SHARK' |
    'FLAX' | 'PORTAL' | 'BANK_BOOTH' | 'FURNACE' | 'ANVIL' | 'RANGE' | 'FIRE' | 'ALTAR' |
    'FLETCHING_TABLE' | 'POTTERY_OVEN' | 'LOOM' | 'SPINNING_WHEEL' | 'TANNING_RACK' | 'CRAFTING_TABLE' |
    'CACTUS' | 'PALM_TREE' | 'COLUMN' | 'BAMBOO' | 'TOTEM' | 'ICE_SPIKE' | 'STALL' | 'OBELISK' | 'PYRAMID' | 'SARCOPHAGUS' | 'COMPUTER_TERMINAL' |
    'SAPLING' | 'FLINT_ROCK';
    tier: number;
    position: { x: number; z: number };
    active: boolean;
    despawnTime?: number; // For fires
    requirements?: Requirements;
    aiVisuals?: any;
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
    generalStore?: InventoryItem[]; // Global shop inventory
    localStores?: Record<string, InventoryItem[]>; // Area-based shop inventories
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

export type RecipeCategory = 'WEAPON' | 'ARMOR' | 'TOOL' | 'RESOURCE' | 'FOOD' | 'JEWELRY' | 'MISC' | 'MATERIAL';

export interface Recipe {
    id: string;
    name: string;
    ingredients: { id: string; qty: number }[];
    output: string;
    outputQty: number;
    skill: SkillName;
    levelReq: number;
    xp: number;
    toolTag?: ItemTag;
    category?: RecipeCategory;
    station?: string;
    era?: number; // 0 = Precambrian
}

export interface XPDrop {
    skill: SkillName;
    amount: number;
}

export interface GameResponse {
    status: 'SUCCESS' | 'FAIL' | 'OK' | 'PORTAL_ACTIVE' | 'OPEN_BANK' | 'OPEN_SHOP' | 'OPEN_TRADE' | 'OPEN_MAKEOVER' | 'CREATED' | 'SCENE_CHANGE' | 'OPEN_SKILL' | 'OPEN_CRAFTING' | 'OPEN_FURNACE' | 'ANVIL' | 'OPEN_RANGE' | 'TRIGGER_ACTION' | 'OPEN_LOOM' | 'OPEN_SPINNING' | 'OPEN_TANNING' | 'DEATH';
    msg?: string;
    action?: string; // For TRIGGER_ACTION status
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
    // NPC Interaction
    dialogue?: string;
    npc?: { name: string; role: string };
    // Skill Interface
    availableRecipes?: Recipe[];
    skillName?: string;
    station?: 'FURNACE' | 'ANVIL' | 'RANGE' | 'CRAFTING_TABLE' | 'FLETCHING_TABLE' | 'POTTERY_OVEN' | 'LOOM' | 'SPINNING_WHEEL' | 'TANNING_RACK';
    // Rewards
    xpDrops?: XPDrop[];
}

export type ChatChannel = 'PUBLIC' | 'PRIVATE' | 'FRIENDS' | 'AI-CMD' | 'SYSTEM' | 'ERROR' | 'INFO';

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

// ============================================================================
// ## AI & EVOLUTION ##
// ============================================================================

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

export interface MemoryEntry {
    text: string;
    type: 'CHAT' | 'ACTION' | 'EVENT';
    timestamp: number;
    keywords?: string[];
}

export type AIMode = 'IDLE' | 'WANDER' | 'FOLLOW' | 'GATHER' | 'GUARD' | 'COMBAT' | 'STAY' | 'BEG' | 'BANKING' | 'FETCH_FOOD' | 'SHOPPING';

export interface AIEquipment {
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
    ring1?: InventoryItem | null;
    ring2?: InventoryItem | null;
    ring3?: InventoryItem | null;
    ring4?: InventoryItem | null;
    ring5?: InventoryItem | null;
    ring6?: InventoryItem | null;
    ring7?: InventoryItem | null;
    ring8?: InventoryItem | null;
}

export interface AIState {
    id: string;
    ownerId: string;
    name: string;
    status: string;
    inventory: InventoryItem[];
    toolBelt: string[]; // Hidden utility items (wrench, banking_tool, etc.)
    position: { x: number; z: number };
    lastThought: string;
    action: AIMode;
    mode: 'FOLLOW' | 'STAY' | 'GUARD' | 'GATHER' | 'BANKING' | 'COMBAT';
    targetId?: string | null;
    memory: MemoryEntry[];
    friendship: number; // 0-100
    equipment: AIEquipment;
    aiEquipmentSwitch: Record<keyof AIEquipment, boolean>;
    prayerEnabled: boolean;
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

export interface BotState {
    state: 'IDLE' | 'MOVING' | 'GATHERING' | 'BANKING' | 'DEPOSITING' | 'TRADING' | 'COMBAT';
    targetId?: string;
    targetPos?: { x: number, z: number };
    inventory: InventoryItem[];
    skills: SkillMap;
    goal: 'WOODCUTTING' | 'MINING' | 'COMBAT' | 'BANKING' | 'AUTONOMOUS';
    lastActionTime: number;
}

// ============================================================================
// ## SIDEBAR GLOBES ##
// ============================================================================

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
    | 'CYBER_SLUMS'
    | 'JUNGLE';

export interface GlobeMarker {
    id: string;
    lat: number;
    lng: number;
    type: 'CITY' | 'DUNGEON' | 'RESOURCE' | 'PLAYER' | 'ANCIENT_SITE';
    label: string;
    eraRequired?: number;
    sceneTarget?: SceneType;
    icon?: string;
    zoomLevel?: number; // 1=major hubs, 2=sub-locations, 3=micro content
    discoverable?: boolean; // Hidden until player visits
    shopType?: ShopType; // If this location has a shop
    hasBank?: boolean; // Banking available
}

export interface GlobeState {
    connectionCount: number;
    players: { id: string; lat: number; lng: number; name: string; era: number }[];
    markers: GlobeMarker[];
}
