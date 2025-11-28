// NPC Definitions
export const NPC_DEFINITIONS = {
    guide: {
        id: 'guide',
        name: 'Survival Guide',
        role: 'GUIDE' as const,
        tags: ['GUIDE', 'NPC', 'FRIENDLY', 'TUTORIAL', 'HELPFUL', 'AI_CONVERSATIONAL', 'STATIONARY', 'QUEST_GIVER'],
        actions: ['Talk-to', 'Examine'],
        examine: 'A helpful guide showing you the ropes.',
        dialogue: 'Welcome to the simulation. Click around to gather resources and evolve!'
    },
    hans: {
        id: 'hans',
        name: 'Hans',
        role: 'MERCHANT' as const,
        tags: ['MERCHANT', 'TRADER', 'NPC', 'FRIENDLY', 'AI_MERCHANT', 'STATIONARY', 'SHOP_KEEPER', 'BUYS_ITEMS', 'SELLS_ITEMS'],
        actions: ['Talk-to', 'Trade', 'Examine'],
        examine: 'The legendary cape merchant. He has been walking around here for ages.',
        dialogue: 'Hello! Would you like to buy a cape?'
    },
    giant_rat: {
        id: 'giant_rat',
        name: 'Giant Rat',
        role: 'ENEMY' as const,
        tags: ['ENEMY', 'MONSTER', 'HOSTILE', 'AI_AGGRESSIVE', 'AI_WANDERS', 'DROPS_LOOT', 'ATTACKABLE', 'LOW_LEVEL'],
        actions: ['Attack', 'Examine'],
        examine: 'A large aggressive rat. Level 3.',
        combatLevel: 3,
        hp: 8,
        maxHp: 8
    },
    chicken: {
        id: 'chicken',
        name: 'Chicken',
        role: 'PASSIVE' as const,
        tags: ['PASSIVE', 'ANIMAL', 'NEUTRAL', 'AI_FLEES', 'AI_WANDERS', 'DROPS_LOOT', 'ATTACKABLE', 'FARMABLE'],
        actions: ['Attack', 'Examine'],
        examine: 'A chicken. They drop feathers and raw chicken.',
        combatLevel: 1,
        hp: 3,
        maxHp: 3
    },
    goblin: {
        id: 'goblin',
        name: 'Goblin',
        role: 'ENEMY' as const,
        tags: ['ENEMY', 'MONSTER', 'HUMANOID', 'HOSTILE', 'AI_AGGRESSIVE', 'AI_PATROLS', 'DROPS_LOOT', 'ATTACKABLE', 'MID_LEVEL'],
        actions: ['Attack', 'Examine'],
        examine: 'An ugly green creature. Level 5.',
        combatLevel: 5,
        hp: 12,
        maxHp: 12
    },
    banker: {
        id: 'banker',
        name: 'Banker',
        role: 'BANKER' as const,
        tags: ['BANKER', 'NPC', 'FRIENDLY', 'AI_SERVICE', 'STATIONARY', 'OPENS_BANK', 'PROTECTED', 'ESSENTIAL'],
        actions: ['Talk-to', 'Bank', 'Examine'],
        examine: 'A banker. They can help you manage your items.',
        dialogue: 'Good day! Would you like to access your bank?'
    },
    shopkeeper: {
        id: 'shopkeeper',
        name: 'Shop Keeper',
        role: 'MERCHANT' as const,
        tags: ['MERCHANT', 'TRADER', 'NPC', 'FRIENDLY', 'AI_MERCHANT', 'STATIONARY', 'GENERAL_STORE', 'BUYS_ITEMS', 'SELLS_ITEMS'],
        actions: ['Talk-to', 'Trade', 'Examine'],
        examine: 'The local shopkeeper. They buy and sell general goods.',
        dialogue: 'Welcome to my shop!'
    },
    guard: {
        id: 'guard',
        name: 'Guard',
        role: 'GUARD' as const,
        tags: ['GUARD', 'NPC', 'NEUTRAL', 'AI_PATROLS', 'AI_DEFENSIVE', 'PROTECTED', 'LAW_ENFORCEMENT', 'ATTACKS_CRIMINALS', 'THIEVABLE'],
        actions: ['Talk-to', 'Pickpocket', 'Examine'],
        examine: 'A town guard. They protect the citizens.',
        dialogue: 'Move along, citizen.'
    },
    mammoth: {
        id: 'mammoth',
        name: 'Woolly Mammoth',
        role: 'ENEMY' as const,
        tags: ['ENEMY', 'MONSTER', 'ANIMAL', 'HOSTILE', 'AI_WANDERS', 'DROPS_LOOT', 'ATTACKABLE', 'HIGH_HP', 'BOSS'],
        actions: ['Attack', 'Examine'],
        examine: 'A massive prehistoric beast.',
        combatLevel: 10,
        hp: 40,
        maxHp: 40
    }
} as const;

export type NPCDefinitionId = keyof typeof NPC_DEFINITIONS;
