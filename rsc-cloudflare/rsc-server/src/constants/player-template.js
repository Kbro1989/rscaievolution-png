/**
 * Unified Player Template for RSC Server
 * This serves as the single source of truth for new player account initialization.
 */

const DEFAULT_PLAYER = {
    username: '',
    password: '',
    group: 0, // 0=player, 2=mod, 3=admin
    x: 207, // Authentic spawn location
    y: 441,
    fatigue: 32,
    combatStyle: 0,
    blockChat: 0,
    blockPrivateChat: 0,
    blockTrade: 0,
    blockDuel: 0,
    cameraAuto: true,
    oneMouseButton: 0,
    soundOn: 1,
    hairColour: 9,
    topColour: 9,
    trouserColour: 11,
    skinColour: 0,
    headSprite: 7,
    bodySprite: 2,
    skulled: 0,
    friends: [],
    ignores: [],
    inventory: [{ "id": 10, "amount": 3 }], // Default items
    bank: [],
    questPoints: 0,
    questStages: {},
    skills: {
        attack: { current: 1, experience: 0, base: 1 },
        defense: { current: 1, experience: 0, base: 1 },
        strength: { current: 1, experience: 0, base: 1 },
        hits: { current: 6, experience: 2304, base: 6 },
        ranged: { current: 1, experience: 0, base: 1 },
        prayer: { current: 1, experience: 0, base: 1 },
        magic: { current: 1, experience: 0, base: 1 },
        cooking: { current: 1, experience: 0, base: 1 },
        woodcutting: { current: 1, experience: 0, base: 1 },
        fletching: { current: 1, experience: 0, base: 1 },
        fishing: { current: 1, experience: 0, base: 1 },
        firemaking: { current: 1, experience: 0, base: 1 },
        crafting: { current: 1, experience: 0, base: 1 },
        smithing: { current: 1, experience: 0, base: 1 },
        mining: { current: 1, experience: 0, base: 1 },
        herblaw: { current: 1, experience: 0, base: 1 },
        agility: { current: 1, experience: 0, base: 1 },
        thieving: { current: 1, experience: 8, base: 1 }
    },
    cache: {},
    loginIP: null,
    world: 0,
    id: 0,
    loginDate: 0
};

module.exports = { DEFAULT_PLAYER };

// For ESM (Durable Objects)
export { DEFAULT_PLAYER };
