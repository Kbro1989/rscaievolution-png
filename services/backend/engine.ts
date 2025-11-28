import { PlayerState, WorldState, GlobeState, GameResponse, InventoryItem, SkillName, SkillMap, SceneType, XPDrop, ResourceEntity, NPC, GlobeMarker, GroundItem, EquipmentSlots, Recipe } from '../../types';
import { HANS_DEFINITION } from '../assets/definitions/hans';
import { soundManager } from '../soundManager';
import { AIArchitect, AIEvolutionManager } from './ai';
import { ERA_DATA, SKILL_DEFINITIONS, SKILL_REGISTRY, SKILL_XP_TABLE, getLevelForXP, getAINameForEra, createItem, SLAYER_MASTERS } from './constants';
import { RECIPES } from '../gameBackend';
import { CRAFTING_RECIPES } from './craftingRecipes';
import { ALL_LOCATIONS_WITH_SUBS } from '../../data/historicalLocations_1000BCE_500CE';
import { calculateDamage, distributeCombatXP, calculateCombatLevel, rollHitChance, rollDamage } from './combatUtils';
import { RESOURCE_NODES, canGatherResource } from './resourceDefinitions';
import { TUTORIAL_ISLAND_REGION } from '../../src/data/tutorialIslandRegion';

const STORAGE_PREFIX = 'rsc_evo_gods_user_';
const WORLD_STORAGE_KEY = 'rsc_evo_gods_world_global_v2';
const USER_DB_KEY = 'rsc_evo_gods_user_db';

const USER_DB = new Map<string, string>();
const OWNER_USER = "Pick Of Gods";
const OWNER_PASS = "Harvestmoon1";
USER_DB.set(OWNER_USER, OWNER_PASS);

// Simplified interface for our game engine
export interface IWorldEngine {
    post(path: string, body: any): Promise<GameResponse>;
}

/**
 * WorldDurableObject
 * Single source of truth for the game world simulation.
 * Manages player state, world entities, progression, quests, and AI.
 */
export class WorldDurableObject implements IWorldEngine {
    public db: {
        player: PlayerState;
        world: WorldState;
        globe: GlobeState;
    };
    // Store all active players in memory for the simulation
    private activePlayers: Map<string, PlayerState> = new Map();
    private xpDropsQueue: XPDrop[] = [];
    private architect: AIArchitect;
    private evolutionManager: AIEvolutionManager;

    constructor() {
        this.loadUserDB();
        this.db = {
            player: this.createDefaultPlayer('guest'),
            world: this.createDefaultWorld('TUTORIAL_ISLAND'),
            globe: this.createDefaultGlobe()
        };
        this.architect = new AIArchitect(this);
        this.evolutionManager = new AIEvolutionManager();
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
            id: `player-${id}`,
            name: id,
            isAdmin: (id === OWNER_USER),
            combatLevel: 3,
            hp: 10,
            maxHp: 10,
            skills: {} as SkillMap,
            fatigue: 0,
            combatStyle: 'ACCURATE',
            era: 0,
            evolutionStage: 0,
            activePrayers: [],
            appearance: { gender: 'MALE', skinColor: '#8d5524', hairStyle: 0, hairColor: '#000', torsoStyle: 0, torsoColor: '#5e4b35', sleevesStyle: 0, sleevesColor: '#5e4b35', cuffsStyle: 0, cuffsColor: '#3a3a3a', handsStyle: 0, handsColor: '#8d5524', legsStyle: 0, legsColor: '#3a3a3a', shoesStyle: 0, shoesColor: '#8d5524' },
            inventory: [],
            toolBelt: ['wrench', 'banking_tool'], // Hidden utility items
            bank: [],
            equipment: { mainHand: null },
            position: { x: 0, z: 0 },
            friends: [],
            targetId: null,
            currentScene: 'TUTORIAL_ISLAND',
            quest: { stage: 0, name: 'Survival', description: 'Survive the first era.' },
            collectionLog: [],
            autoPilot: false,
            tutorialStep: 0,
            follower: {
                id: `ai-${id}`,
                ownerId: `player-${id}`,
                name: getAINameForEra(0),
                status: "IDLE",
                inventory: [],
                toolBelt: ['wrench', 'banking_tool'], // Hidden utility items
                position: { x: -2, z: -2 },
                lastThought: "Ready.",
                action: 'IDLE',
                mode: 'FOLLOW',
                memory: [],
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
        items.push({ id: 'logs', name: 'Logs', type: 'RESOURCE', tags: ['TAG_RESOURCE_WOOD', 'TAG_FUEL'], count: 100, icon: '🪵' });
        items.push({ id: 'flint', name: 'Flint', type: 'RESOURCE', tags: ['TAG_RESOURCE', 'TAG_STACKABLE'], count: 50, icon: '🪨' });
        items.push({ id: 'raw_meat', name: 'Raw Meat', type: 'FOOD', tags: ['TAG_COOKABLE', 'TAG_FOOD'], count: 20, icon: '🥩' });
        p.bank = items as any;
    }

    private createDefaultWorld(sceneType: SceneType = 'TUTORIAL_ISLAND'): WorldState {
        const resources: ResourceEntity[] = [];
        const npcs: NPC[] = [];

        // RSC Tutorial Island - Load from region data
        if (sceneType === 'TUTORIAL_ISLAND') {
            // Load RSC Tutorial Island resources
            resources.push(...TUTORIAL_ISLAND_REGION.resources);

            // Load RSC Tutorial Island NPCs  
            npcs.push(...TUTORIAL_ISLAND_REGION.npcs);

            // Add bank and portal (common to all scenes)
            resources.push({ id: 'bank-1', type: 'BANK_BOOTH', tier: 1, position: { x: -4, z: -4 }, active: true });
            resources.push({ id: 'portal-main', type: 'PORTAL', tier: 10, position: { x: 8, z: 8 }, active: true });
        } else if (sceneType === 'EGYPT') {
            for (let i = 0; i < 20; i++) {
                resources.push({ id: `palm-${i}`, type: 'PALM_TREE', tier: 3, position: { x: Math.random() * 40 - 20, z: Math.random() * 40 - 20 }, active: true });
                resources.push({ id: `sandstone-${i}`, type: 'ROCK', tier: 3, position: { x: Math.random() * 40 - 20, z: Math.random() * 40 - 20 }, active: true });
            }
            resources.push({ id: 'portal-main', type: 'PORTAL', tier: 10, position: { x: 8, z: 8 }, active: true });
            resources.push({ id: 'bank-1', type: 'BANK_BOOTH', tier: 1, position: { x: -4, z: -4 }, active: true });
            npcs.push({ id: 'guide', name: 'Survival Guide', role: 'GUIDE', position: { x: 2, z: 2 }, voice: 'MALE', dialogue: 'Welcome to the simulation.', tags: ['GUIDE', 'NPC'], actions: ['Talk-to', 'Examine'], examine: 'A helpful guide showing you the ropes.' });
            npcs.push({ id: 'rat-1', name: 'Giant Rat', role: 'ENEMY', hp: 8, maxHp: 8, combatLevel: 3, position: { x: 5, z: -5 }, voice: 'INHUMAN', tags: ['ENEMY', 'MONSTER'], actions: ['Attack', 'Examine'], examine: 'A large aggressive rat. Level 3.' });
            npcs.push({ id: 'hans', name: HANS_DEFINITION.name, role: 'MERCHANT', hp: 100, maxHp: 100, combatLevel: 0, position: { x: 5, z: 5 }, voice: 'MALE', actions: ['Talk-to', 'Trade', 'Examine'], tags: ['MERCHANT', 'TRADER'], examine: `Hans has been here since the beginning. He will tell you how long you have played.`, shopStock: [createItem('cape_1year', 1), createItem('cape_2year', 1), createItem('cape_3year', 1), createItem('cape_4year', 1), createItem('cape_5year', 1), createItem('cape_10year', 1), createItem('cape_15year', 1), createItem('cape_20year', 1), createItem('raw_shrimp', 50)] });
        } else {
            for (let i = 0; i < 15; i++) {
                resources.push({ id: `tree-${i}`, type: 'TREE', tier: 0, position: { x: Math.random() * 30 - 15, z: Math.random() * 30 - 15 }, active: true });
                resources.push({ id: `rock-${i}`, type: 'ROCK', tier: 0, position: { x: Math.random() * 30 - 15, z: Math.random() * 30 - 15 }, active: true });
            }
            resources.push({ id: 'portal-main', type: 'PORTAL', tier: 10, position: { x: 8, z: 8 }, active: true });
            resources.push({ id: 'bank-1', type: 'BANK_BOOTH', tier: 1, position: { x: -4, z: -4 }, active: true });
            resources.push({ id: 'furnace-1', type: 'FURNACE', tier: 1, position: { x: -8, z: -8 }, active: true });
            resources.push({ id: 'anvil-1', type: 'ANVIL', tier: 1, position: { x: -8, z: -6 }, active: true });
            resources.push({ id: 'fletching-1', type: 'FLETCHING_TABLE', tier: 1, position: { x: -6, z: -8 }, active: true });
            resources.push({ id: 'pottery-1', type: 'POTTERY_OVEN', tier: 1, position: { x: -6, z: -6 }, active: true });
            resources.push({ id: 'loom-1', type: 'LOOM', tier: 1, position: { x: -4, z: -8 }, active: true });
            resources.push({ id: 'spinning-1', type: 'SPINNING_WHEEL', tier: 1, position: { x: -4, z: -6 }, active: true });
            resources.push({ id: 'tanning-1', type: 'TANNING_RACK', tier: 1, position: { x: -2, z: -8 }, active: true });
            resources.push({ id: 'crafting-1', type: 'CRAFTING_TABLE', tier: 1, position: { x: -2, z: -6 }, active: true });
            npcs.push({ id: 'guide', name: 'Survival Guide', role: 'GUIDE', position: { x: 2, z: 2 }, voice: 'MALE', dialogue: 'Welcome to the simulation.', tags: ['GUIDE', 'NPC'], actions: ['Talk-to', 'Examine'], examine: 'A helpful guide showing you the ropes.' });
            npcs.push({ id: 'rat-1', name: 'Giant Rat', role: 'ENEMY', hp: 8, maxHp: 8, combatLevel: 3, position: { x: 5, z: -5 }, voice: 'INHUMAN', tags: ['ENEMY', 'MONSTER'], actions: ['Attack', 'Examine'], examine: 'A large aggressive rat. Level 3.' });
            npcs.push({ id: 'hans', name: HANS_DEFINITION.name, role: 'MERCHANT', hp: 100, maxHp: 100, combatLevel: 0, position: { x: 5, z: 5 }, voice: 'MALE', actions: ['Talk-to', 'Trade', 'Examine'], tags: ['MERCHANT', 'TRADER'], shopType: 'GENERAL', examine: `Hans has been here since the beginning. He will tell you how long you have played.`, shopStock: [createItem('cape_1year', 1), createItem('cape_2year', 1), createItem('cape_3year', 1), createItem('cape_4year', 1), createItem('cape_5year', 1), createItem('cape_10year', 1), createItem('cape_15year', 1), createItem('cape_20year', 1), createItem('raw_shrimp', 50)] });
            npcs.push({
                id: 'slayer_master_novice',
                name: 'Slayer Master Snuts',
                role: 'GUIDE',
                position: { x: -10, z: 5 },
                voice: 'MALE',
                tags: ['SLAYER_MASTER', 'NPC'],
                actions: ['Talk-to', 'Get-task', 'Cancel-task', 'Examine'],
                examine: 'A Slayer Master who assigns tasks to beginners.'
            });
        }
        const groundItems: GroundItem[] = [];
        if (sceneType === 'TUTORIAL_ISLAND' || sceneType === 'JUNGLE') {
            for (let i = 0; i < 20; i++) {
                groundItems.push({ id: `twig-${i}`, item: createItem('twig', 1), position: { x: Math.random() * 30 - 15, z: Math.random() * 30 - 15 }, despawnTime: Date.now() + 300000 });
                groundItems.push({ id: `flint-${i}`, item: createItem('flint', 1), position: { x: Math.random() * 30 - 15, z: Math.random() * 30 - 15 }, despawnTime: Date.now() + 300000 });
                if (Math.random() > 0.7) {
                    groundItems.push({ id: `twigs-${i}`, item: createItem('twigs', 1), position: { x: Math.random() * 30 - 15, z: Math.random() * 30 - 15 }, despawnTime: Date.now() + 300000 });
                }
            }
        }
        return {
            seed: Date.now(),
            biome: sceneType === 'EGYPT' ? 'DESERT' : sceneType === 'MEDIEVAL_KINGDOM' ? 'TEMPERATE' : 'JUNGLE',
            timeOfDay: 12,
            resources,
            groundItems,
            npcs,
            paths: [],
            generalStore: [], // Initialize empty global shop
            localStores: {} // Initialize empty local shops
        };
    }

    private createDefaultGlobe(): GlobeState {
        return {
            connectionCount: 1,
            players: [],
            markers: ALL_LOCATIONS_WITH_SUBS
        };
    }

    private getIconForCategory(category: string): string {
        const icons: Record<string, string> = {
            'CITY': '🏛️',
            'TEMPLE': '⛩️',
            'ZIGGURAT': '🗼',
            'PYRAMID': '🔺',
            'MEGALITH': '🗿',
            'SETTLEMENT': '🏘️',
            'SACRED_SITE': '✨'
        };
        return icons[category] || '📍';
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
        return new Promise(resolve => {
            setTimeout(() => {
                resolve(this.router(path, body));
            }, 10);
        });
    }

    // --- PUBLIC ROUTER ---
    public async router(path: string, body: any, isSimulated: boolean = false): Promise<GameResponse> {
        const { username, pass, apiKey } = body;
        // AUTH
        if (path === '/auth/login') {
            if (USER_DB.get(username) === pass) {
                let p = this.activePlayers.get(username);
                if (!p) {
                    const stored = localStorage.getItem(STORAGE_PREFIX + username);
                    if (stored) p = JSON.parse(stored);
                    else p = this.createDefaultPlayer(username);
                    this.activePlayers.set(username, p!);
                }
                this.db.player = p!;
                const existingGlobeP = this.db.globe.players.find(x => x.id === p!.id);
                if (!existingGlobeP) this.db.globe.players.push({ id: p!.id, name: p!.name, lat: 0, lng: 0, era: p!.era });
                return { status: 'SUCCESS', state: p, world: this.db.world, globe: this.db.globe };
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
            return { status: 'SUCCESS', state: p, world: this.db.world, globe: this.db.globe };
        }
        if (path === '/auth/create_char') {
            if (this.db.player) {
                this.db.player.appearance = body.appearance;
                return { status: 'SUCCESS', state: this.db.player };
            }
        }
        if (path === '/auth/gps') {
            return { status: 'SUCCESS', state: this.db.player, world: this.db.world, globe: this.db.globe };
        }
        // GAME ACTIONS
        const player = this.db.player;
        if (!player) return { status: 'FAIL', msg: 'No Session' };
        // AUTO SAVE MIDDLEWARE
        if (Math.random() > 0.9) localStorage.setItem(STORAGE_PREFIX + player.name, JSON.stringify(player));
        if (path === '/action/move') {
            player.position.x = body.x;
            player.position.z = body.z;
            return { status: 'OK' };
        }
        if (path === '/action/chat') {
            const { text } = body;
            const response = await this.architect.handleChatCommand(player.id, text, player);
            const chatEvents: any[] = [{ id: `chat-${Date.now()}-1`, sourceId: player.id, text, color: '#ffffff' }];
            if (response) {
                chatEvents.push({ id: `chat-${Date.now()}-2`, sourceId: player.follower.id, text: response, color: '#ffff00' });

                // Add voice synthesis based on era
                const voiceType = this.getVoiceForEra(player.era);
                soundManager.speak(response, voiceType);
            }
            return { status: 'OK', msg: text, aiThought: response, chatEvents };
        }
        if (path === '/action/npc_interaction') {
            const { npcId, action } = body;
            const npc = this.db.world.npcs.find(n => n.id === npcId);
            if (npc) {
                if (action === 'Examine') {
                    const examineText = npc.examine || `It's a ${npc.name}.`;
                    return { status: 'OK', msg: examineText };
                }
                if ((action === 'Buy capes' || action === 'Trade') && npc.shopStock) {
                    return { status: 'OPEN_SHOP', shopStock: npc.shopStock, shopMode: 'BUY', msg: `Welcome to ${npc.name}'s shop!` };
                }
                if (action === 'Talk-to') {
                    if (npc.tags.includes('SLAYER_MASTER')) {
                        return { status: 'OK', msg: `${npc.name}: "Do you need a task? Use 'Get-task' to start slaying!"` };
                    }
                    const dialogue = npc.dialogue || `${npc.name}: Hello there!`;
                    return { status: 'OK', msg: dialogue };
                }
                if (action === 'Get-task' && npc.tags.includes('SLAYER_MASTER')) {
                    // Trigger request task logic via client redirect or handle here directly
                    // For simplicity, we'll handle it via the /action/slayer/request_task endpoint call from client
                    // But since this is an interaction, we can just call the logic directly or return a special status
                    // Let's return a special status to prompt the client to call the endpoint
                    return { status: 'TRIGGER_ACTION', action: 'slayer/request_task', msg: 'Requesting task...' };
                }
                if (action === 'Cancel-task' && npc.tags.includes('SLAYER_MASTER')) {
                    return { status: 'TRIGGER_ACTION', action: 'slayer/cancel_task', msg: 'Cancelling task...' };
                }
                if (action === 'Pickpocket') {
                    const success = Math.random() > 0.5;
                    if (success) {
                        const coins = Math.floor(Math.random() * 10) + 1;
                        player.inventory.push(createItem('coins', coins));
                        this.addXP(player, 'THIEVING', 8);
                        return { status: 'SUCCESS', state: player, msg: `You pickpocket ${coins} coins.`, xpDrops: this.flushXPDrops() };
                    } else {
                        return { status: 'FAIL', msg: `You fail to pickpocket ${npc.name}.` };
                    }
                }
            }
            return { status: 'FAIL', msg: 'Interaction failed.' };
        }

        if (path === '/action/slayer/request_task') {
            // Check if player already has a task
            if (player.slayerTask) {
                return { status: 'FAIL', msg: `You already have a task: Kill ${player.slayerTask.remaining} ${player.slayerTask.monster}.` };
            }

            const combatLevel = player.combatLevel;
            const slayerLevel = player.skills.SLAYER?.level || 1;

            // Find appropriate Slayer Master (for now, use novice)
            const master = SLAYER_MASTERS.novice;

            // Check requirements
            if (combatLevel < master.combatLevelReq) {
                return { status: 'FAIL', msg: `You need combat level ${master.combatLevelReq}.` };
            }

            // Select random task
            const availableTasks = master.tasks.filter(t => slayerLevel >= t.slayerLevelReq);
            if (availableTasks.length === 0) {
                return { status: 'FAIL', msg: 'No tasks available for your level.' };
            }

            // Weighted random selection
            const totalWeight = availableTasks.reduce((sum, t) => sum + t.weight, 0);
            let random = Math.random() * totalWeight;
            let selectedTask = availableTasks[0];

            for (const task of availableTasks) {
                random -= task.weight;
                if (random <= 0) {
                    selectedTask = task;
                    break;
                }
            }

            // Assign task
            const amount = Math.floor(Math.random() * (selectedTask.maxAmount - selectedTask.minAmount + 1)) + selectedTask.minAmount;
            player.slayerTask = {
                monster: selectedTask.monster,
                monsterIds: selectedTask.monsterType,  // Will match against NPC names
                assigned: amount,
                remaining: amount,
                xpPerKill: selectedTask.xpPerKill,
                assignedBy: master.id
            };

            return {
                status: 'SUCCESS',
                state: player,
                msg: `Your task is to kill ${amount} ${selectedTask.monster}.`
            };
        }

        if (path === '/action/slayer/cancel_task') {
            if (!player.slayerTask) {
                return { status: 'FAIL', msg: 'You have no active task.' };
            }

            player.slayerTask = null;
            return { status: 'SUCCESS', state: player, msg: 'Slayer task cancelled.' };
        }

        if (path === '/action/shop_buy') {
            const { itemId, quantity } = body;
            const qty = quantity || 1;

            // Find NPC with shop stock (assuming player is near a merchant)
            const merchant = this.db.world.npcs.find(n => n.shopStock && n.shopStock.some(i => i.id === itemId));
            if (!merchant || !merchant.shopStock) return { status: 'FAIL', msg: 'No shop available.' };

            const shopItem = merchant.shopStock.find(i => i.id === itemId);
            if (!shopItem) return { status: 'FAIL', msg: 'Item not in stock.' };
            if (shopItem.count < qty) return { status: 'FAIL', msg: 'Not enough in stock.' };

            // Calculate cost (use item price or default pricing)
            const costPer = shopItem.price || 1;
            const totalCost = costPer * qty;

            // Check if player has enough coins
            const coinItem = player.inventory.find(i => i.id === 'coins');
            if (!coinItem || coinItem.count < totalCost) {
                return { status: 'FAIL', msg: `You need ${totalCost} coins.` };
            }

            // Deduct coins
            coinItem.count -= totalCost;
            if (coinItem.count <= 0) {
                const idx = player.inventory.indexOf(coinItem);
                player.inventory.splice(idx, 1);
            }

            // Add item to inventory
            const existingItem = player.inventory.find(i => i.id === itemId && i.tags.includes('TAG_STACKABLE'));
            if (existingItem) {
                existingItem.count += qty;
            } else {
                player.inventory.push(createItem(itemId, qty));
            }

            // Reduce shop stock
            shopItem.count -= qty;

            soundManager.play('UI_CLICK');
            return { status: 'SUCCESS', state: player, world: this.db.world, msg: `Bought ${qty}x ${shopItem.name} for ${totalCost} coins.` };
        }
        if (path === '/action/shop_sell') {
            const { itemId, quantity } = body;
            const qty = quantity || 1;

            const item = player.inventory.find(i => i.id === itemId);
            if (!item) return { status: 'FAIL', msg: 'Item not found in inventory.' };
            if (item.count < qty) return { status: 'FAIL', msg: 'Not enough to sell.' };

            // Calculate sell value (typically 60% of item price or default)
            const sellValue = Math.floor((item.price || 1) * 0.6);
            const totalValue = sellValue * qty;

            // Remove item from inventory
            item.count -= qty;
            if (item.count <= 0) {
                const idx = player.inventory.indexOf(item);
                player.inventory.splice(idx, 1);
            }

            // Add coins to inventory
            const coinItem = player.inventory.find(i => i.id === 'coins');
            if (coinItem) {
                coinItem.count += totalValue;
            } else {
                player.inventory.push(createItem('coins', totalValue));
            }

            soundManager.play('UI_CLICK');
            return { status: 'SUCCESS', state: player, msg: `Sold ${qty}x ${item.name} for ${totalValue} coins.` };
        }
        if (path === '/action/travel') {
            const marker = this.db.globe.markers.find(m => m.id === body.targetId);
            if (!marker) return { status: 'FAIL', msg: "Invalid Destination" };
            if (player.era < (marker.eraRequired || 0)) {
                return { status: 'FAIL', msg: `Era ${marker.eraRequired} Required.` };
            }
            player.position.x = marker.lat;
            player.position.z = marker.lng;
            if (marker.sceneTarget) player.currentScene = marker.sceneTarget;
            this.addXP(player, 'AGILITY', 5);
            return { status: 'SUCCESS', state: player, msg: `Traveled to ${marker.label}.` };
        }

        if (path === '/action/ai_command') {
            const { text } = body;
            const response = await this.architect.handleChatCommand(player.id, text, player);
            return { status: 'OK', msg: `Command sent: ${text}`, aiThought: response };
        }

        if (path === '/action/attack') {
            const { targetId } = body;
            const targetNPC = this.db.world.npcs.find(n => n.id === targetId);

            if (!targetNPC) return { status: 'FAIL', msg: 'Target not found.' };
            if (!targetNPC.hp || targetNPC.hp <= 0) return { status: 'FAIL', msg: 'Target is already dead.' };

            // Get attacker stats
            const attackLevel = player.skills.ATTACK?.level || 1;
            const strengthLevel = player.skills.STRENGTH?.level || 1;
            const defenseLevel = player.skills.DEFENSE?.level || 1;
            const weaponPower = player.equipment.mainHand?.stats?.power || 1;

            // Get defender stats (use defense level for both accuracy and armor)
            const enemyDefenseLevel = targetNPC.combatLevel || 1;
            const enemyArmor = 0; // NPCs don't have armor for now

            // Step 1: Roll for hit chance (Attack vs Defense)
            const didHit = rollHitChance(attackLevel, weaponPower, enemyDefenseLevel, enemyArmor);

            let damage = 0;
            if (didHit) {
                // Step 2: Roll for damage (Strength-based)
                damage = rollDamage(strengthLevel, weaponPower);
            }

            // Apply damage to NPC
            targetNPC.hp = Math.max(0, (targetNPC.hp || 0) - damage);

            // Distribute combat XP using RSC formula
            const xpDist = distributeCombatXP(damage, player.combatStyle, 'MELEE');

            // Award XP
            if (damage > 0) {
                this.addXP(player, 'HITS', xpDist.HITS);
                if (xpDist.ATTACK) this.addXP(player, 'ATTACK', xpDist.ATTACK);
                if (xpDist.STRENGTH) this.addXP(player, 'STRENGTH', xpDist.STRENGTH);
                if (xpDist.DEFENSE) this.addXP(player, 'DEFENSE', xpDist.DEFENSE);
            }

            // Check if NPC died
            if (targetNPC.hp <= 0) {
                // Check if this kill counts for Slayer task
                let slayerMsg = '';
                if (player.slayerTask) {
                    const taskMatch = player.slayerTask.monsterIds.some(id =>
                        targetNPC.name === id || targetNPC.id.startsWith(id.toLowerCase())
                    );

                    if (taskMatch) {
                        player.slayerTask.remaining--;

                        // Award Slayer XP
                        this.addXP(player, 'SLAYER', player.slayerTask.xpPerKill);

                        // Check if task complete
                        if (player.slayerTask.remaining <= 0) {
                            slayerMsg = ` Task complete!`;
                            player.slayerTask = null;
                            soundManager.play('LEVEL_UP');
                        }
                    }
                }

                // Drop loot
                const loot = createItem('bones', 1);
                this.db.world.groundItems.push({
                    id: `loot-${Date.now()}`,
                    item: loot,
                    position: { ...targetNPC.position },
                    despawnTime: Date.now() + 120000
                });

                // Remove dead NPC
                const npcIdx = this.db.world.npcs.indexOf(targetNPC);
                if (npcIdx > -1) {
                    this.db.world.npcs.splice(npcIdx, 1);
                }

                soundManager.play('LEVEL_UP');
                return {
                    status: 'SUCCESS',
                    state: player,
                    world: this.db.world,
                    msg: `You defeated ${targetNPC.name}! (${damage} damage)${slayerMsg}`,
                    xpDrops: this.flushXPDrops()
                };
            }

            soundManager.play('COMBAT_HIT');
            return {
                status: 'SUCCESS',
                state: player,
                world: this.db.world,
                msg: damage > 0 ? `You hit ${damage} damage!` : `You missed!`,
                xpDrops: this.flushXPDrops()
            };
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
        if (path === '/action/gather') {
            const { targetId, type } = body;
            const res = this.db.world.resources.find(r => r.id === targetId);

            // Helper to map resource to proper drop item
            // Returns null if resource is invalid or not gatherable
            const getGatherDrop = (resource: any): string | null => {
                if (!resource) return null; // No resource = no drop

                // Trees
                if (resource.type.includes('TREE')) {
                    if (resource.id.startsWith('oak-')) return 'oak_logs';
                    if (resource.id.startsWith('willow-')) return 'willow_logs';
                    if (resource.id.startsWith('maple-')) return 'maple_logs';
                    if (resource.id.startsWith('yew-')) return 'yew_logs';
                    return 'logs'; // Generic logs for other trees
                }

                // Rocks / Ores
                if (resource.type.includes('ROCK')) {
                    if (resource.id.startsWith('copper-')) return 'copper_ore';
                    if (resource.id.startsWith('tin-')) return 'tin_ore';
                    if (resource.id.startsWith('iron-')) return 'iron_ore';
                    if (resource.id.startsWith('coal-')) return 'coal';
                    if (resource.id.startsWith('mithril-')) return 'mithril_ore';
                    if (resource.id.startsWith('adamant-')) return 'adamant_ore';
                    if (resource.id.startsWith('runite-')) return 'runite_ore';
                    if (resource.id.startsWith('flint-')) return 'flint';
                    return 'copper_ore'; // Default ore for generic rocks
                }

                // Flax
                if (resource.type === 'FLAX') return 'flax';

                // Fishing spots
                if (resource.type.includes('FISHING_SPOT')) return 'raw_shrimp';

                // Not a gatherable resource - return null
                return null;
            };

            // Handle Stations
            if (type === 'FURNACE') {
                // Furnace recipes: all smelting recipes
                const furnaceRecipes = Object.values(RECIPES).filter(r => r.station === 'FURNACE');
                return { status: 'OPEN_CRAFTING', station: 'FURNACE', availableRecipes: furnaceRecipes, skillName: 'Smithing', msg: `Opening Furnace...` };
            }
            if (type === 'ANVIL') {
                const anvilRecipes = Object.values(RECIPES).filter(r => r.station === 'ANVIL');
                return { status: 'OPEN_CRAFTING', station: 'ANVIL', availableRecipes: anvilRecipes, skillName: 'Smithing', msg: `Opening Anvil...` };
            }
            if (type === 'RANGE') {
                const rangeRecipes = Object.values(RECIPES).filter(r => r.station === 'RANGE');
                return { status: 'OPEN_CRAFTING', station: 'RANGE', availableRecipes: rangeRecipes, skillName: 'Cooking', msg: `Opening Range...` };
            }
            if (['CRAFTING_TABLE', 'FLETCHING_TABLE', 'POTTERY_OVEN', 'LOOM', 'SPINNING_WHEEL', 'TANNING_RACK'].includes(type)) {
                const stationRecipes = Object.values(RECIPES).filter(r => r.station === type);
                return { status: 'OPEN_CRAFTING', station: type as any, availableRecipes: stationRecipes, skillName: 'Crafting', msg: `Opening ${type}...` };
            }
            if (type === 'BANK_BOOTH') {
                soundManager.play('BANK');
                return { status: 'OPEN_BANK', msg: 'Bank Open' };
            }
            if (type === 'PORTAL') {
                if (res && res.requirements) {
                    // Check requirements (e.g. quest, level)
                    // For now, just allow
                }
                // Portals usually warp to a new scene. Logic depends on portal data.
                // Assuming portal resource has a 'targetScene' property or similar in a real impl.
                // For now, hardcode a return to MAINLAND if on tutorial, or vice versa for testing.
                return { status: 'SCENE_CHANGE', state: player, msg: "Warping..." };
            }

            // GATHERING: Validate resource is actually gatherable
            if (res && res.active) {
                // Check if this resource type is actually defined as gatherable
                const resourceDef = RESOURCE_NODES[res.type];
                if (!resourceDef) {
                    // Not a valid resource - check if it's a special object or crafting station
                    const nonGatherableTypes = [
                        'ALTAR', 'STATUE', 'OBELISK', 'PORTAL',
                        'FURNACE', 'ANVIL', 'RANGE', 'BANK_BOOTH',
                        'CRAFTING_TABLE', 'FLETCHING_TABLE', 'POTTERY_OVEN',
                        'LOOM', 'SPINNING_WHEEL', 'TANNING_RACK'
                    ];

                    if (nonGatherableTypes.some(t => type.includes(t))) {
                        return { status: 'FAIL', msg: 'You cannot gather from this object.' };
                    }
                    return { status: 'FAIL', msg: 'Nothing interesting happens.' };
                }

                // Validate player level for this resource
                const skillLevel = player.skills[resourceDef.skill]?.level || 1;
                const canGather = canGatherResource(res.type, skillLevel);
                if (!canGather.canGather) {
                    return { status: 'FAIL', msg: canGather.reason || 'You cannot gather from this resource.' };
                }

                // WOODCUTTING
                if (res.type.includes('TREE')) {
                    const axe = player.inventory.find(i => i.tags.includes('TAG_TOOL_AXE')) || player.equipment.mainHand?.tags.includes('TAG_TOOL_AXE');
                    if (!axe) return { status: 'FAIL', msg: "You need an axe." };

                    const logItem = getGatherDrop(res);
                    if (!logItem) return { status: 'FAIL', msg: 'Nothing to gather here.' };

                    player.inventory.push(createItem(logItem, 1));
                    this.addXP(player, 'WOODCUTTING', resourceDef.xpReward);
                    soundManager.play('CHOP');
                    return { status: 'SUCCESS', state: player, msg: "You get some logs.", xpDrops: this.flushXPDrops() };
                }
                // MINING
                if (res.type.includes('ROCK')) {
                    const pick = player.inventory.find(i => i.tags.includes('TAG_TOOL_PICK')) || player.equipment.mainHand?.tags.includes('TAG_TOOL_PICK');
                    if (!pick) return { status: 'FAIL', msg: "You need a pickaxe." };

                    const oreItem = getGatherDrop(res);
                    if (!oreItem) return { status: 'FAIL', msg: 'Nothing to gather here.' };

                    player.inventory.push(createItem(oreItem, 1));
                    this.addXP(player, 'MINING', resourceDef.xpReward);
                    soundManager.play('MINE');
                    return { status: 'SUCCESS', state: player, msg: "You mine some ore.", xpDrops: this.flushXPDrops() };
                }
                // FISHING
                if (res.type.includes('FISHING_SPOT')) {
                    const fishItem = getGatherDrop(res);
                    if (!fishItem) return { status: 'FAIL', msg: 'Nothing to gather here.' };

                    player.inventory.push(createItem(fishItem, 1));
                    this.addXP(player, 'FISHING', resourceDef.xpReward);
                    soundManager.play('SPLASH');
                    return { status: 'SUCCESS', state: player, msg: "You catch a fish.", xpDrops: this.flushXPDrops() };
                }
                // FLAX
                if (res.type === 'FLAX') {
                    player.inventory.push(createItem('flax', 1));
                    this.addXP(player, 'FARMING', 1); // or Crafting?
                    return { status: 'SUCCESS', state: player, msg: "You pick some flax." };
                }
            }
            return { status: 'FAIL', msg: "Nothing to gather." };
        }
        if (path === '/action/use') {
            const { itemId, targetId, targetType } = body;

            // Firemaking
            if ((itemId === 'flint' && (targetId === 'logs' || targetId.includes('logs'))) ||
                ((itemId === 'logs' || itemId.includes('logs')) && targetId === 'flint')) {

                // Check if logs are in inventory or ground
                if (targetType === 'INVENTORY_ITEM' || targetType === 'GROUND_ITEM' || itemId === 'flint') {
                    // Consume logs
                    const logId = itemId === 'flint' ? targetId : itemId;

                    if (targetType === 'INVENTORY_ITEM' || (itemId === 'logs' && targetType === 'INVENTORY_ITEM')) {
                        const logIdx = player.inventory.findIndex(i => i.id === logId);
                        if (logIdx > -1) player.inventory.splice(logIdx, 1);
                    } else if (targetType === 'GROUND_ITEM') {
                        // If using flint on ground logs, remove ground item
                        const gIdx = this.db.world.groundItems.findIndex(g => g.id === body.targetId); // Note: targetId in body is usually item ID, but for ground items we need the unique ID. 
                        // Wait, the body.targetId for GROUND_ITEM is the unique ground item ID, not the item ID.
                        // We need to fetch the ground item to check its ID.
                        // Let's simplify: Only support Inventory Firemaking for now as per standard RSC, 
                        // or if targetType is GROUND_ITEM, we assume the body.targetId is the ground item GUID.
                    }

                    // For simplicity in this MVP: Only Inventory Firemaking
                    // If user meant "use flint on log" (inventory), we consume log and spawn fire object? 
                    // Or just "You light a fire" and maybe spawn a fire object in the world?
                    // RSC: You light a fire -> Fire appears on ground, you move 1 tile west.

                    // Let's implement: Consume log from inventory, spawn Fire object at player position.

                    // 1. Find and remove logs from inventory
                    const logItem = player.inventory.find(i => i.id === 'logs' || i.id.includes('_logs'));
                    if (logItem) {
                        const idx = player.inventory.indexOf(logItem);
                        player.inventory.splice(idx, 1);

                        // 2. Spawn Fire Object
                        this.db.world.resources.push({
                            id: `fire-${Date.now()}`,
                            type: 'FIRE',
                            tier: 1,
                            position: { ...player.position },
                            active: true,
                            despawnTime: Date.now() + 60000 // 1 min fire
                        });

                        // 3. Move player (optional, but good for anti-stuck)
                        player.position.x -= 1;

                        this.addXP(player, 'FIREMAKING', 40);
                        soundManager.play('COOK');
                        return { status: 'SUCCESS', state: player, world: this.db.world, msg: "You strike the flint and light a fire.", xpDrops: this.flushXPDrops() };
                    } else {
                        return { status: 'FAIL', msg: "You need logs to light a fire." };
                    }
                }
            }

            // Cooking
            if (targetType === 'FIRE' || targetType === 'RANGE') {
                const item = player.inventory.find(i => i.id === itemId);
                if (item && item.tags.includes('TAG_COOKABLE')) {
                    const idx = player.inventory.indexOf(item);
                    player.inventory.splice(idx, 1);
                    const success = Math.random() > 0.2; // 80% success rate
                    if (success) {
                        const cookedId = itemId.replace('raw_', 'cooked_');
                        player.inventory.push(createItem(cookedId, 1));
                        this.addXP(player, 'COOKING', 30);
                        soundManager.play('COOK');
                        return { status: 'SUCCESS', state: player, msg: `You cook the ${item.name}.`, xpDrops: this.flushXPDrops() };
                    } else {
                        player.inventory.push(createItem('burnt_food', 1));
                        return { status: 'FAIL', state: player, msg: `You accidentally burn the ${item.name}.` };
                    }
                }
            }

            // Generic Station Open
            if (targetType === 'INVENTORY_ITEM' || targetType === 'CRAFTING_TABLE' || targetType === 'FLETCHING_TABLE' || targetType === 'POTTERY_OVEN' || targetType === 'LOOM' || targetType === 'SPINNING_WHEEL' || targetType === 'TANNING_RACK') {
                const stationRecipes = Object.values(RECIPES).filter(r => r.station === targetType || (!r.station && targetType === 'INVENTORY_ITEM'));
                return { status: 'OPEN_SKILL', availableRecipes: stationRecipes, skillName: 'Crafting' };
            }
        }

        if (path === '/action/bury') {
            const { itemId } = body;
            const itemIdx = player.inventory.findIndex(i => i.id === itemId && i.tags.includes('TAG_PRAYER'));
            if (itemIdx > -1) {
                player.inventory.splice(itemIdx, 1);
                this.addXP(player, 'PRAYER', 4.5);
                soundManager.play('PRAYER');
                return { status: 'SUCCESS', state: player, msg: "You bury the bones.", xpDrops: this.flushXPDrops() };
            }
            return { status: 'FAIL', msg: "Nothing to bury." };
        }

        if (path === '/action/craft') {
            const { recipeId } = body;
            const recipe = CRAFTING_RECIPES[recipeId] || RECIPES.find(r => r.id === recipeId);
            if (!recipe) return { status: 'FAIL', msg: "Unknown recipe." };

            // Check Level
            const skill = player.skills[recipe.skill];
            if (skill.level < recipe.levelReq) return { status: 'FAIL', msg: `You need level ${recipe.levelReq} ${recipe.skill} to craft this.` };

            // Check Ingredients
            const missing = [];
            for (const ing of recipe.ingredients) {
                const has = player.inventory.filter(i => i.id === ing.id).reduce((a, b) => a + b.count, 0);
                if (has < ing.qty) missing.push(`${ing.qty}x ${ing.id}`);
            }

            if (missing.length > 0) return { status: 'FAIL', msg: `Missing: ${missing.join(', ')}` };

            // Consume Ingredients
            for (const ing of recipe.ingredients) {
                let remaining = ing.qty;
                while (remaining > 0) {
                    const idx = player.inventory.findIndex(i => i.id === ing.id);
                    if (idx === -1) break;
                    const item = player.inventory[idx];
                    if (item.count > remaining) {
                        item.count -= remaining;
                        remaining = 0;
                    } else {
                        remaining -= item.count;
                        player.inventory.splice(idx, 1);
                    }
                }
            }

            // Add Output
            player.inventory.push(createItem(recipe.output, recipe.outputQty));
            this.addXP(player, recipe.skill, recipe.xp);
            soundManager.play('SMITH');

            return { status: 'SUCCESS', state: player, msg: `Crafted ${recipe.outputQty}x ${recipe.name}.`, xpDrops: this.flushXPDrops() };
        }

        if (path === '/action/fletch') {
            const { itemId } = body;
            if (itemId === 'logs') {
                const idx = player.inventory.findIndex(i => i.id === 'logs');
                if (idx > -1) {
                    player.inventory.splice(idx, 1);
                    player.inventory.push(createItem('arrow_shaft', 15));
                    this.addXP(player, 'FLETCHING', 5);
                    return { status: 'SUCCESS', state: player, msg: "You cut the logs into arrow shafts.", xpDrops: this.flushXPDrops() };
                }
            }
            if (itemId === 'arrow_shaft') {
                const shaftIdx = player.inventory.findIndex(i => i.id === 'arrow_shaft');
                const featherIdx = player.inventory.findIndex(i => i.id === 'feather');
                if (shaftIdx > -1 && featherIdx > -1) {
                    player.inventory.splice(shaftIdx, 1);
                    player.inventory.splice(featherIdx, 1);
                    player.inventory.push(createItem('headless_arrow', 1));
                    this.addXP(player, 'FLETCHING', 1);
                    return { status: 'SUCCESS', state: player, msg: "You attach a feather to the shaft.", xpDrops: this.flushXPDrops() };
                }
            }
            return { status: 'FAIL', msg: "Cannot fletch that." };
        }

        if (path === '/action/clean_herb') {
            const idx = player.inventory.findIndex(i => i.id === 'herb_grimy');
            if (idx > -1) {
                player.inventory.splice(idx, 1);
                player.inventory.push(createItem('herb_clean', 1));
                this.addXP(player, 'HERBLORE', 2.5);
                return { status: 'SUCCESS', state: player, msg: "You clean the herb.", xpDrops: this.flushXPDrops() };
            }
            return { status: 'FAIL', msg: "No grimy herbs to clean." };
        }

        if (path === '/action/make_potion') {
            const vialIdx = player.inventory.findIndex(i => i.id === 'vial_water');
            const herbIdx = player.inventory.findIndex(i => i.id === 'herb_clean');
            if (vialIdx > -1 && herbIdx > -1) {
                player.inventory.splice(vialIdx, 1);
                player.inventory.splice(herbIdx, 1);
                player.inventory.push(createItem('potion_strength', 1));
                this.addXP(player, 'HERBLORE', 15);
                soundManager.play('UI_CLICK');
                return { status: 'SUCCESS', state: player, msg: "You create a strength potion.", xpDrops: this.flushXPDrops() };
            }
            return { status: 'FAIL', msg: "Missing ingredients." };
        }

        if (path === '/action/plant') {
            const { seedId } = body;
            const idx = player.inventory.findIndex(i => i.id === seedId);
            if (idx > -1) {
                player.inventory.splice(idx, 1);
                this.addXP(player, 'FARMING', 8.5);
                return { status: 'SUCCESS', state: player, msg: "You plant the seed.", xpDrops: this.flushXPDrops() };
            }
            return { status: 'FAIL', msg: "No seeds to plant." };
        }

        if (path === '/action/harvest') {
            player.inventory.push(createItem('herb_grimy', Math.floor(Math.random() * 3) + 1));
            this.addXP(player, 'FARMING', 12);
            return { status: 'SUCCESS', state: player, msg: "You harvest the herbs.", xpDrops: this.flushXPDrops() };
        }
        if (path === '/action/equip') {
            const item = player.inventory.find(i => i.id === body.itemId);
            if (!item) return { status: 'FAIL', msg: "Item not found in inventory." };

            // Determine slot based on item tags
            let slot: keyof EquipmentSlots | null = null;
            let oldItem: InventoryItem | null | undefined = null;

            if (item.tags.includes('TAG_SLOT_HEAD')) slot = 'head';
            else if (item.tags.includes('TAG_SLOT_BODY')) slot = 'body';
            else if (item.tags.includes('TAG_SLOT_LEGS')) slot = 'legs';
            else if (item.tags.includes('TAG_SLOT_FEET')) slot = 'feet';
            else if (item.tags.includes('TAG_SLOT_HANDS')) slot = 'hands';
            else if (item.tags.includes('TAG_SLOT_NECK')) slot = 'neck';
            else if (item.tags.includes('TAG_SLOT_AMMO')) slot = 'ammo';
            else if (item.tags.includes('TAG_SLOT_AURA')) slot = 'aura';
            else if (item.tags.includes('TAG_SLOT_RING')) {
                // Find first empty ring slot
                for (let i = 1; i <= 8; i++) {
                    const ringSlot = `ring${i}` as keyof EquipmentSlots;
                    if (!player.equipment[ringSlot]) {
                        slot = ringSlot;
                        break;
                    }
                }
                if (!slot) return { status: 'FAIL', msg: "All ring slots are full!" };
            }
            else if (item.tags.includes('TAG_SHIELD') || item.tags.includes('TAG_OFFHAND')) slot = 'offHand';
            else if (item.tags.includes('TAG_WEAPON_MELEE') || item.tags.includes('TAG_WEAPON_RANGED') || item.tags.includes('TAG_WEAPON_MAGIC') || item.type === 'WEAPON') {
                slot = 'mainHand';
            } else if (item.type === 'ARMOR') {
                // Fallback: guess based on item name if no tag
                const name = item.name.toLowerCase();
                if (name.includes('helm') || name.includes('hat') || name.includes('hood')) slot = 'head';
                else if (name.includes('body') || name.includes('chest') || name.includes('torso') || name.includes('shirt')) slot = 'body';
                else if (name.includes('leg') || name.includes('pant') || name.includes('skirt')) slot = 'legs';
                else if (name.includes('boot') || name.includes('shoe') || name.includes('feet')) slot = 'feet';
                else if (name.includes('glove') || name.includes('gaunt')) slot = 'hands';
            }

            if (!slot) return { status: 'FAIL', msg: "Cannot equip this item." };

            // Swap: unequip old item, equip new one
            oldItem = player.equipment[slot];
            player.equipment[slot] = item;
            player.inventory.splice(player.inventory.indexOf(item), 1);
            if (oldItem) player.inventory.push(oldItem);

            return { status: 'SUCCESS', state: player, msg: `Equipped ${item.name} to ${String(slot)}.` };
        }
        if (path === '/action/unequip') {
            const { slot } = body;
            const item = player.equipment[slot as keyof EquipmentSlots];
            if (!item) return { status: 'FAIL', msg: "No item equipped in that slot." };
            if (player.inventory.length >= 28) return { status: 'FAIL', msg: "Inventory full!" };

            player.equipment[slot as keyof EquipmentSlots] = null;
            player.inventory.push(item);
            return { status: 'SUCCESS', state: player, msg: `Unequipped ${item.name}.` };
        }

        if (path === '/action/bank') {
            const { action, itemId, amount, placeholderMode, fromTab, toTab, fromIndex, toIndex } = body;
            if (!player.bank) player.bank = [];
            if (!player.bankTabs) player.bankTabs = 1;

            if (action === 'DEPOSIT') {
                const item = player.inventory.find(i => i.id === itemId);
                if (!item) return { status: 'FAIL', msg: "Item not found." };

                let depositQty = amount === 'ALL' ? item.count : (amount || 1);
                if (depositQty > item.count) depositQty = item.count;

                // Remove from inventory
                if (depositQty >= item.count) {
                    const idx = player.inventory.indexOf(item);
                    player.inventory.splice(idx, 1);
                } else {
                    item.count -= depositQty;
                }

                // Add to bank (Universal Stacking)
                const existing = player.bank.find(b => b.id === itemId);
                if (existing) {
                    if (existing.isPlaceholder) {
                        existing.count = depositQty;
                        existing.isPlaceholder = false;
                    } else {
                        existing.count += depositQty;
                    }
                } else {
                    const newItem = createItem(itemId, depositQty);
                    newItem.tabIndex = 0;
                    player.bank.push(newItem);
                }
                return { status: 'SUCCESS', state: player, msg: `Deposited ${depositQty}x ${item.name}.` };
            }

            if (action === 'WITHDRAW') {
                const item = player.bank.find(i => i.id === itemId);
                if (!item) return { status: 'FAIL', msg: "Item not found in bank." };
                if (item.isPlaceholder) return { status: 'FAIL', msg: "That is just a placeholder." };

                const invItem = player.inventory.find(i => i.id === itemId);
                const willStack = invItem && invItem.tags.includes('TAG_STACKABLE');
                if (!willStack && player.inventory.length >= 28) return { status: 'FAIL', msg: "Inventory full." };

                let withdrawQty = amount === 'ALL' ? item.count : (amount || 1);
                if (withdrawQty > item.count) withdrawQty = item.count;

                // Add to inventory
                if (willStack && invItem) {
                    invItem.count += withdrawQty;
                } else {
                    const qtyToAdd = willStack ? 1 : withdrawQty;
                    const countPerItem = willStack ? withdrawQty : 1;
                    for (let k = 0; k < qtyToAdd; k++) {
                        if (player.inventory.length >= 28) break;
                        player.inventory.push(createItem(itemId, countPerItem));
                        if (!willStack) withdrawQty--;
                    }
                }

                item.count -= withdrawQty;

                // Placeholder Logic
                if (item.count <= 0) {
                    if (placeholderMode) {
                        item.count = 0;
                        item.isPlaceholder = true;
                    } else {
                        const bIdx = player.bank.indexOf(item);
                        player.bank.splice(bIdx, 1);
                    }
                }
                return { status: 'SUCCESS', state: player, msg: `Withdrew ${withdrawQty}x ${item.name}.` };
            }

            if (action === 'ADD_TAB') {
                player.bankTabs++;
                return { status: 'SUCCESS', state: player, msg: "Bank tab added." };
            }

            if (action === 'MOVE_ITEM') {
                const item = player.bank.find(i => i.id === itemId);
                if (item && toTab !== undefined) {
                    item.tabIndex = toTab;
                    return { status: 'SUCCESS', state: player, msg: "Item moved." };
                }
            }
        }

        if (path === '/action/transfer_item') {
            const { from, itemId, amount } = body;
            const isPlayerSource = from === 'PLAYER' || from === 'player';
            const sourceInv = isPlayerSource ? player.inventory : player.follower.inventory;
            const destInv = isPlayerSource ? player.follower.inventory : player.inventory;

            const item = sourceInv.find(i => i.id === itemId);
            if (!item) return { status: 'FAIL', msg: 'Item not found in source inventory.' };

            const transferQty = amount === 'ALL' ? item.count : (amount || 1);
            if (transferQty > item.count) return { status: 'FAIL', msg: 'Not enough items to transfer.' };

            item.count -= transferQty;
            if (item.count <= 0) {
                const idx = sourceInv.indexOf(item);
                sourceInv.splice(idx, 1);
            }

            const existing = destInv.find(i => i.id === itemId && i.tags.includes('TAG_STACKABLE'));
            if (existing) {
                existing.count += transferQty;
            } else {
                destInv.push(createItem(itemId, transferQty));
            }
            soundManager.play('UI_CLICK');
            return { status: 'SUCCESS', state: player, msg: `Transferred ${transferQty}x ${item.name}.` };
        }
        if (path === '/action/shop_buy') {
            const { npcId, itemId, quantity } = body;
            const npc = this.db.world.npcs.find(n => n.id === npcId);
            if (!npc || !npc.shopStock) return { status: 'FAIL', msg: 'Shop not found.' };

            const shopType = npc.shopType || 'SPECIFIC';
            let shopInventory: InventoryItem[] = [];

            // Get shop inventory based on shop type
            if (shopType === 'SPECIFIC') {
                shopInventory = npc.shopStock;
            } else if (shopType === 'GENERAL') {
                if (!this.db.world.generalStore) this.db.world.generalStore = [];
                shopInventory = [...npc.shopStock, ...this.db.world.generalStore];
            } else if (shopType === 'LOCAL') {
                const areaId = player.currentScene;
                if (!this.db.world.localStores) this.db.world.localStores = {};
                if (!this.db.world.localStores[areaId]) this.db.world.localStores[areaId] = [];
                shopInventory = [...npc.shopStock, ...this.db.world.localStores[areaId]];
            }

            const shopItem = shopInventory.find(i => i.id === itemId);
            if (!shopItem) return { status: 'FAIL', msg: 'Item not available.' };

            // Determine quantity to buy
            let buyQty = quantity === 'ALL' ? shopItem.count : (quantity || 1);
            if (buyQty > shopItem.count) buyQty = shopItem.count;

            const totalCost = (shopItem.price || 10) * buyQty;

            // Check if player has enough coins
            const coinItem = player.inventory.find(i => i.id === 'coins');
            if (!coinItem || coinItem.count < totalCost) {
                return { status: 'FAIL', msg: `You need ${totalCost} coins.` };
            }

            // Deduct coins
            coinItem.count -= totalCost;
            if (coinItem.count <= 0) {
                const idx = player.inventory.indexOf(coinItem);
                player.inventory.splice(idx, 1);
            }

            // Add item to inventory
            const existingItem = player.inventory.find(i => i.id === itemId && i.tags.includes('TAG_STACKABLE'));
            if (existingItem) {
                existingItem.count += buyQty;
            } else {
                player.inventory.push(createItem(itemId, buyQty));
            }

            // Reduce shop stock (only for non-SPECIFIC shops)
            if (shopType !== 'SPECIFIC') {
                shopItem.count -= buyQty;
                if (shopItem.count <= 0) {
                    if (shopType === 'GENERAL') {
                        const idx = this.db.world.generalStore!.findIndex(i => i.id === itemId);
                        if (idx > -1) this.db.world.generalStore!.splice(idx, 1);
                    } else if (shopType === 'LOCAL') {
                        const areaId = player.currentScene;
                        const idx = this.db.world.localStores![areaId].findIndex(i => i.id === itemId);
                        if (idx > -1) this.db.world.localStores![areaId].splice(idx, 1);
                    }
                }
            }

            soundManager.play('UI_CLICK');
            return { status: 'SUCCESS', state: player, world: this.db.world, msg: `Bought ${buyQty}x ${shopItem.name} for ${totalCost} coins.` };
        }
        if (path === '/action/shop_sell') {
            const { npcId, itemId, quantity } = body;
            const npc = this.db.world.npcs.find(n => n.id === npcId);
            if (!npc || !npc.shopStock) return { status: 'FAIL', msg: 'Shop not found.' };

            const item = player.inventory.find(i => i.id === itemId);
            if (!item) return { status: 'FAIL', msg: 'Item not found in inventory.' };

            const shopType = npc.shopType || 'SPECIFIC';

            // SPECIFIC shops only buy items in their stock
            if (shopType === 'SPECIFIC') {
                const canBuy = npc.shopStock.some(i => i.id === itemId);
                if (!canBuy) return { status: 'FAIL', msg: "This shop doesn't buy that item." };
            }

            // Determine quantity to sell
            let sellQty = quantity === 'ALL' ? item.count : (quantity || 1);
            if (sellQty > item.count) sellQty = item.count;

            // Calculate sell value (60% of item price or default)
            const sellValue = Math.floor((item.price || 10) * 0.6);
            const totalValue = sellValue * sellQty;

            // Remove item from inventory
            item.count -= sellQty;
            if (item.count <= 0) {
                const idx = player.inventory.indexOf(item);
                player.inventory.splice(idx, 1);
            }

            // Add coins to inventory
            const coinItem = player.inventory.find(i => i.id === 'coins');
            if (coinItem) {
                coinItem.count += totalValue;
            } else {
                player.inventory.push(createItem('coins', totalValue));
            }

            // Add to shop inventory (only for non-SPECIFIC shops)
            if (shopType === 'GENERAL') {
                if (!this.db.world.generalStore) this.db.world.generalStore = [];
                const existing = this.db.world.generalStore.find(i => i.id === itemId);
                if (existing && existing.tags.includes('TAG_STACKABLE')) {
                    existing.count += sellQty;
                } else {
                    this.db.world.generalStore.push(createItem(itemId, sellQty));
                }
            } else if (shopType === 'LOCAL') {
                const areaId = player.currentScene;
                if (!this.db.world.localStores) this.db.world.localStores = {};
                if (!this.db.world.localStores[areaId]) this.db.world.localStores[areaId] = [];
                const existing = this.db.world.localStores[areaId].find(i => i.id === itemId);
                if (existing && existing.tags.includes('TAG_STACKABLE')) {
                    existing.count += sellQty;
                } else {
                    this.db.world.localStores[areaId].push(createItem(itemId, sellQty));
                }
            }

            soundManager.play('UI_CLICK');
            return { status: 'SUCCESS', state: player, world: this.db.world, msg: `Sold ${sellQty}x ${item.name} for ${totalValue} coins.` };
        }
        if (path === '/ai/tick') {
            const aiAction = this.architect.thinkSquad(player, this.db.world);
            const botty = this.activePlayers.get('botty');
            if (botty && botty.currentScene === player.currentScene) {
                this.architect.thinkSquad(botty, this.db.world);
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
        if (path === '/admin/action') {
            const { action, apiKey } = body;
            if (action === 'HEAL') { player.hp = player.maxHp; }
            if (action === 'FORCE_EVO') { this.addXP(player, 'EVOLUTION', 5000); }
            if (action === 'RESET_SKILLS') {
                SKILL_REGISTRY.forEach(s => {
                    player.skills[s] = { level: 1, xp: 0, unlocked: true };
                });
                player.era = 0;
                player.combatLevel = 3;
                return { status: 'SUCCESS', state: player, msg: "All skills reset to level 1!" };
            }
            if (action === 'MAX_OUT') {
                SKILL_REGISTRY.forEach(s => {
                    player.skills[s].level = 120;
                    player.skills[s].xp = 104000000;
                    player.skills[s].unlocked = true;
                });
                player.era = 12;
                player.combatLevel = 138;
            }
            if (action === 'AI_EVOLVE_WORLD' && apiKey) {
                return this.evolutionManager.evolveWorld(apiKey, this.db.world).then(res => {
                    this.db.world.resources = this.db.world.resources.map(r => {
                        const updated = res.resources.find(u => u.id === r.id);
                        return updated || r;
                    });
                    this.db.world.npcs = this.db.world.npcs.map(n => {
                        const updated = res.npcs.find(u => u.id === n.id);
                        return updated || n;
                    });
                    return { status: 'SUCCESS', state: player, msg: "World Evolved by AI!", world: this.db.world } as GameResponse;
                }) as any;
            }
            return { status: 'SUCCESS', state: player, msg: "Admin Command Executed" };
        }
        return { status: 'OK' };
    }

    // --- HELPERS ---
    public addXP(player: PlayerState, skill: SkillName, amount: number) {
        if (!player.skills[skill]) player.skills[skill] = { level: 1, xp: 0, unlocked: true };
        player.skills[skill].xp += amount;
        const curLvl = player.skills[skill].level;
        const newLvl = getLevelForXP(player.skills[skill].xp, SKILL_XP_TABLE);
        if (newLvl > curLvl) {
            player.skills[skill].level = newLvl;
            soundManager.play('LEVEL_UP');
            // this.xpDropsQueue.push({ skill, amount: 0 }); // Removed 0-amount drop

            // Recalculate combat level on any combat skill level up
            if (['ATTACK', 'STRENGTH', 'DEFENSE', 'HITS', 'PRAYER', 'MAGIC', 'RANGED'].includes(skill)) {
                player.combatLevel = calculateCombatLevel(player.skills);
            }

            if (skill === 'EVOLUTION') {
                const nextEra = ERA_DATA.find(e => e.id === player.era + 1);
                if (nextEra && newLvl >= nextEra.minLvl) {
                    player.era++;
                    player.follower.name = getAINameForEra(player.era);
                }
            }
        }

        // Evolution XP: 0.5x of all XP gained except HITS and EVOLUTION itself
        if (skill !== 'EVOLUTION' && skill !== 'HITS') {
            this.addXP(player, 'EVOLUTION', amount * 0.5);
        }

        // Always push the XP drop for the current skill
        this.xpDropsQueue.push({ skill, amount });
    }

    private flushXPDrops() {
        const d = [...this.xpDropsQueue];
        this.xpDropsQueue = [];
        return d;
    }

    // Tutorial progression helper
    private checkTutorialProgress(player: PlayerState, actionType: string) {
        const step = player.tutorialStep || 0;
        switch (step) {
            case 0:
                // Welcome step handled elsewhere
                break;
            case 1:
                if (['TREE', 'ROCK', 'FISHING_SPOT'].includes(actionType)) {
                    player.tutorialStep = 2;
                }
                break;
            case 2:
                if (actionType === 'FISHING_SPOT') {
                    player.tutorialStep = 3;
                }
                break;
            case 3:
                if (actionType === 'ROCK') {
                    player.tutorialStep = 4;
                }
                break;
            case 4:
                if (actionType === 'ROCK') {
                    player.tutorialStep = 5;
                }
                break;
            default:
                break;
        }
    }

    /**
     * Get voice type based on player's evolution era
     * Era 0-2: Deep/inhuman (Gronk)
     * Era 3-8: Male (normal)
     * Era 9+: Male (refined)
     */
    private getVoiceForEra(era: number): 'MALE' | 'FEMALE' | 'INHUMAN' {
        if (era <= 2) {
            return 'INHUMAN'; // Deep,slow voice for caveman Gronk
        } else {
            return 'MALE'; // Normal voice for evolved eras
        }
    }
}
