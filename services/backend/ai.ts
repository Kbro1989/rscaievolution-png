import { lmStudioClient } from '../lmStudioClient';
import { PlayerState, WorldState, ResourceEntity, NPC, AIState, SkillName, ItemTag } from '../../types';
import { ERA_DATA, SKILL_DEFINITIONS, SKILL_REGISTRY } from './constants';
import { RESOURCE_NODES } from './resourceDefinitions';
import { IWorldEngine } from './interfaces';
import { errorLogger } from '../errorLogger';

// --- AI EVOLUTION MANAGER ---
export class AIEvolutionManager {
    private useLMStudio: boolean = true; // Use local LM Studio by default

    constructor() { }

    public async evolveWorld(apiKey: string, world: WorldState): Promise<{ resources: ResourceEntity[], npcs: NPC[] }> {
        // 1. Filter entities to evolve (limit to 20 to save tokens/latency)
        const resourcesToEvolve = world.resources.filter(r => r.active).slice(0, 15);
        const npcsToEvolve = world.npcs.filter(n => n.role !== 'PLAYER_BOT').slice(0, 5);

        if (resourcesToEvolve.length === 0 && npcsToEvolve.length === 0) return { resources: [], npcs: [] };

        // 2. Construct Prompt
        const prompt = `
        Analyze these game entities and the current biome/time.
        Biome: ${world.biome}, Time: ${world.timeOfDay}:00.
        
        Entities:
        ${JSON.stringify(resourcesToEvolve.map(r => ({ id: r.id, type: r.type, tier: r.tier })))}
        ${JSON.stringify(npcsToEvolve.map(n => ({ id: n.id, name: n.name, role: n.role })))}

        Return a JSON object mapping Entity ID to visual traits to make them look "evolved" or fitting for this specific biome/era.
        Format (return ONLY valid JSON, no markdown):
        {
            "entity_id": {
                "color": "#hex",
                "scale": [x, y, z],
                "roughness": 0.0-1.0,
                "emissive": "#hex",
                "description": "Short reason why"
            }
        }
        `;

        try {
            // Use LM Studio for local inference
            const response = await lmStudioClient.generateText(prompt, {
                systemPrompt: 'You are an AI Game Designer. Return only valid JSON without markdown.',
                temperature: 0.7,
                maxTokens: 2048,
            });

            // Clean markdown if present
            const jsonStr = response.replace(/```json/g, '').replace(/```/g, '');
            const visualMap = JSON.parse(jsonStr);

            // 3. Apply Changes
            const updatedResources = resourcesToEvolve.map(r => {
                if (visualMap[r.id]) {
                    r.aiVisuals = visualMap[r.id];
                }
                return r;
            });

            const updatedNpcs = npcsToEvolve.map(n => {
                if (visualMap[n.id]) {
                    n.aiVisuals = visualMap[n.id];
                }
                return n;
            });

            return { resources: updatedResources, npcs: updatedNpcs };

        } catch (error) {
            console.error("AI Evolution Failed:", error);
            errorLogger.logError('AI Evolution Failed', error, {
                biome: world.biome,
                timeOfDay: world.timeOfDay,
                resourceCount: resourcesToEvolve.length,
                npcCount: npcsToEvolve.length,
            });
            return { resources: [], npcs: [] };
        }
    }
}

// --- AI ARCHITECT MIDDLEWARE (THE BRAIN) ---
export class AIArchitect {
    private backend: IWorldEngine;

    // We now maintain state maps per player ID for persistent thought processes
    private playerStates: Map<string, 'IDLE' | 'BANKING' | 'GRINDING' | 'SURVIVAL' | 'EVOLVING' | 'LOOTING'> = new Map();
    private followerStates: Map<string, 'IDLE' | 'BANKING' | 'GRINDING' | 'SURVIVAL' | 'FOLLOWING' | 'LOOTING' | 'SCOUTING'> = new Map();
    private followerCommands: Map<string, 'FOLLOW' | 'STAY' | 'KILL' | 'BANK' | 'GATHER' | 'SCOUT' | 'IDLE'> = new Map();

    // Shared memory: Previous tasks to resume after interruptions
    private sharedMemory: Map<string, { lastCommand: string, lastTargetType: string }> = new Map();

    private currentTargetSkill: Map<string, SkillName> = new Map();
    private subTask: Map<string, string> = new Map();
    private scoutTarget: Map<string, string> = new Map(); // Target type to scout for

    constructor(backend: IWorldEngine) {
        this.backend = backend;
    }

    /**
     * Handle chat commands with full AI intelligence and game knowledge
     * Personality evolves with player's era (Gronk → Sophisticated)
     */
    public async handleChatCommand(playerId: string, text: string, playerState?: PlayerState): Promise<string> {
        const lower = text.toLowerCase();
        let cmd: 'FOLLOW' | 'STAY' | 'KILL' | 'BANK' | 'GATHER' | 'SCOUT' | 'IDLE' | null = null;
        let response = "";

        // Context-aware parsing
        const isSelf = lower.includes('my') || lower.includes('me') || lower.includes('i need');
        const isCompanion = lower.includes('your') || lower.includes('you');

        // Simple command parsing (for immediate actions)
        if (lower.includes('follow') || lower.includes('come here') || lower.includes('to me')) {
            cmd = 'FOLLOW';
            response = this.getEraResponse(playerState?.era || 0, "On my way, boss.");
        }
        else if (lower.includes('stay') || lower.includes('wait') || lower.includes('dont move')) {
            cmd = 'STAY';
            response = this.getEraResponse(playerState?.era || 0, "Holding position.");
        }
        else if (lower.includes('idle') || lower.includes('stop working') || lower.includes('do nothing') || lower.includes('relax')) {
            cmd = 'IDLE';
            response = this.getEraResponse(playerState?.era || 0, "Taking a break.");
        }
        else if (lower.includes('kill') || lower.includes('attack') || lower.includes('fight') || lower.includes('hunt') || lower.includes('destroy')) {
            cmd = 'KILL';
            response = this.getEraResponse(playerState?.era || 0, "Target acquired. Moving to engage.");
        }
        else if (lower.includes('bank') || lower.includes('deposit') || lower.includes('save items') || lower.includes('store this')) {
            cmd = 'BANK';
            response = this.getEraResponse(playerState?.era || 0, "Heading to the nearest bank.");
        }
        else if (lower.includes('mine') || lower.includes('rock') || lower.includes('ore')) {
            cmd = 'GATHER';
            this.currentTargetSkill.set(playerId, 'MINING');
            response = this.getEraResponse(playerState?.era || 0, "I'll find some rocks.");
        }
        else if (lower.includes('chop') || lower.includes('wood') || lower.includes('tree') || lower.includes('logs')) {
            cmd = 'GATHER';
            this.currentTargetSkill.set(playerId, 'WOODCUTTING');
            response = this.getEraResponse(playerState?.era || 0, "Timber!");
        }
        else if (lower.includes('fish') || lower.includes('food') || lower.includes('shrimp') || lower.includes('catch')) {
            cmd = 'GATHER';
            this.currentTargetSkill.set(playerId, 'FISHING');
            response = this.getEraResponse(playerState?.era || 0, "Gone fishing.");
        }
        else if (lower.includes('create') || lower.includes('make') || lower.includes('craft') || lower.includes('smith')) {
            // Basic crafting intent - for now just acknowledge
            response = this.getEraResponse(playerState?.era || 0, "I can't craft complex items yet, but I can gather the materials for you.");
            if (lower.includes('fire')) {
                // Special case for firemaking if we had it
                response = "I'll light a fire.";
            }
        }
        else if (lower.includes('gather') || lower.includes('work') || lower.includes('help me')) {
            cmd = 'GATHER';
            this.currentTargetSkill.set(playerId, 'WOODCUTTING');
            response = this.getEraResponse(playerState?.era || 0, "Getting to work.");
        }
        else if (lower.includes('scout') || lower.includes('find') || lower.includes('locate') || lower.includes('search')) {
            cmd = 'SCOUT';
            let target = 'TREE';
            if (lower.includes('rock') || lower.includes('ore')) target = 'ROCK';
            if (lower.includes('fish') || lower.includes('water')) target = 'FISHING_SPOT';
            if (lower.includes('mob') || lower.includes('enemy')) target = 'NPC';

            this.scoutTarget.set(playerId, target);
            response = this.getEraResponse(playerState?.era || 0, `Scouting for ${target.toLowerCase()}s...`);
        }
        else if (playerState) {
            // Use AI for complex questions/conversations with memory
            try {
                const { lmStudioClient } = await import('../lmStudioClient');
                const { createAIChatContext } = await import('./gameKnowledge');
                const { companionMemory } = await import('./companionMemory');

                // Get memory context
                const memoryContext = companionMemory.getConversationContext(playerId, playerState.name);

                // Update player preferences
                companionMemory.updatePlayerPreferences(playerId, playerState);

                // Create full context with memory
                const gameContext = createAIChatContext(playerState, text);
                const fullContext = gameContext + memoryContext;

                const aiResponse = await lmStudioClient.generateText(fullContext, {
                    temperature: 0.8, // Slightly higher for more personality
                    maxTokens: 200,
                });

                response = this.getEraResponse(playerState.era, aiResponse.trim());

                // Record this conversation
                companionMemory.recordConversation(playerId, playerState.name, text, response, playerState.era);
            } catch (error) {
                console.error('AI chat failed:', error);
                errorLogger.logError('AI Chat Failed', error, {
                    playerId,
                    playerName: playerState.name,
                    playerEra: playerState.era,
                    userMessage: text,
                    lmStudioURL: 'http://172.16.0.2:1234/v1',
                });
                response = this.getEraResponse(playerState?.era || 0, "Gronk confused. Try simpler words?");
            }
        }

        if (cmd) {
            this.followerCommands.set(playerId, cmd);
            this.followerStates.set(playerId, 'IDLE');
            this.sharedMemory.set(playerId, { lastCommand: cmd, lastTargetType: this.currentTargetSkill.get(playerId) || '' });
        }

        return response || this.getEraResponse(playerState?.era || 0, "Gronk not understand.");
    }

    /**
     * Transform AI response based on player's evolution era
     * Era 0-2: Gronk speak (caveman)
     * Era 3-5: Simple speech
     * Era 6-8: Normal speech
     * Era 9+: Sophisticated speech
     */
    private getEraResponse(era: number, modernResponse: string): string {
        if (era <= 2) {
            // Caveman era: Gronk speak
            return this.convertToGronk(modernResponse);
        } else if (era <= 5) {
            // Ancient era: Simple but grammatical
            return modernResponse.replace(/I'll|I will/g, 'I').replace(/won't|will not/g, 'not');
        } else if (era <= 8) {
            // Medieval/Renaissance: Normal speech
            return modernResponse;
        } else {
            // Modern/Future: Sophisticated
            return modernResponse.replace(/boss/g, 'commander').replace(/gonna/g, 'going to');
        }
    }

    /**
     * Convert modern English to Gronk speak
     */
    private convertToGronk(text: string): string {
        let gronk = text
            .replace(/I'll|I will|I am going to/gi, 'Gronk')
            .replace(/I'm|I am/gi, 'Gronk')
            .replace(/you|your/gi, 'you')
            .replace(/the/gi, '')
            .replace(/going to|gonna/gi, 'go')
            .replace(/heading to/gi, 'go to')
            .replace(/position/gi, 'spot')
            .replace(/acquired/gi, 'found')
            .replace(/engage/gi, 'smash')
            .replace(/moving to/gi, 'go')
            .replace(/target/gi, 'prey')
            .replace(/nearest/gi, '')
            .replace(/scouting/gi, 'look')
            .replace(/holding/gi, 'stay')
            .replace(/on my way/gi, 'Gronk come')
            .replace(/\s+/g, ' ') // Clean up extra spaces
            .trim();

        // Add "Gronk" prefix if not present
        if (!gronk.toLowerCase().startsWith('gronk')) {
            gronk = 'Gronk ' + gronk.toLowerCase();
        }

        // Remove articles and simplify
        gronk = gronk.replace(/\s+a\s+/gi, ' ').replace(/\s+an\s+/gi, ' ');

        return gronk.charAt(0).toUpperCase() + gronk.slice(1) + '!';
    }

    /**
     * Notify AI of player actions so it can mimic or react ("Monkey See, Monkey Do")
     */
    public notifyAction(playerId: string, action: string, data: any) {
        if (action === 'GATHER') {
            const currentCmd = this.followerCommands.get(playerId);
            // Only switch if not already doing it or if explicitly told to stay/idle
            if (currentCmd !== 'GATHER' && currentCmd !== 'STAY' && currentCmd !== 'IDLE') {
                this.followerCommands.set(playerId, 'GATHER');
                this.currentTargetSkill.set(playerId, data.skill);
                this.sharedMemory.set(playerId, { lastCommand: 'GATHER', lastTargetType: data.skill });
            }
        }
        else if (action === 'ATTACK') {
            const currentCmd = this.followerCommands.get(playerId);
            if (currentCmd !== 'KILL' && currentCmd !== 'STAY' && currentCmd !== 'IDLE') {
                this.followerCommands.set(playerId, 'KILL');
                this.sharedMemory.set(playerId, { lastCommand: 'KILL', lastTargetType: 'NPC' });
            }
        }
        else if (action === 'CRAFT') {
            // If crafting, just stay close/follow
            this.followerCommands.set(playerId, 'FOLLOW');
        }
        else if (action === 'BANK') {
            this.followerCommands.set(playerId, 'BANK');
        }
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
            if (command === 'IDLE') return { action: 'IDLE', thought: 'Resting.', newState: 'IDLE' };
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
                if (!isFollower) {
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
                    if (gIdx > -1) world.groundItems.splice(gIdx, 1);
                    return { action: 'LOOT', thought: `Grabbed ${loot.item.name} for you!`, newState: 'LOOTING' };
                } else {
                    this.backend.router('/action/pickup', { groundItemId: loot.id }, true);
                    return { action: 'LOOT', thought: `Ooh! A ${loot.item.name}!`, newState: 'LOOTING' };
                }
            }
            return { action: 'MOVE_LOOT', thought: `Running to grab ${loot.item.name}.`, newState: 'LOOTING' };
        }

        // --- 3. INVENTORY FULL CHECK ---
        // Follower checks HIS OWN inventory, not the player's
        const followerInv = isFollower ? (entity as AIState).inventory : inventorySource;
        if ((followerInv.length >= 28 && currentState !== 'BANKING') || (isFollower && command === 'BANK')) {
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
            case 'SCOUTING':
                return this.handleScouting(entity, world, isFollower, ownerId);
            case 'IDLE':
            case 'FOLLOWING':
                // For follower, if commanded, switch state
                if (isFollower) {
                    if (command === 'KILL' || command === 'GATHER') return { newState: 'GRINDING' };
                    if (command === 'SCOUT') return { newState: 'SCOUTING' };
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
        const dist = Math.sqrt(dx * dx + dz * dz);

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

        // Banking logic: Follower deposits HIS items to PLAYER'S bank
        const inventory = isFollower ? (entity as AIState).inventory : (entity as PlayerState).inventory;
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
            if (isFollower) this.followerCommands.set(ownerId, 'FOLLOW');
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
                    skill = (mem && mem.lastTargetType && ['WOODCUTTING', 'MINING', 'FISHING'].includes(mem.lastTargetType)) ? (mem.lastTargetType as SkillName) : 'MINING';
                }
            }
        }

        if (!skill) return { newState: 'IDLE' };

        const inventory = isFollower && ownerRef ? ownerRef.inventory : (entity as PlayerState).inventory;
        const equipment = isFollower && ownerRef ? ownerRef.equipment : (entity as PlayerState).equipment;

        // 1. Determine Target Type based on Level and Preference
        let targetType = '';

        if (['WOODCUTTING', 'MINING', 'FISHING'].includes(skill)) {
            const level = (isFollower && ownerRef) ? ownerRef.skills[skill].level : (entity as PlayerState).skills[skill].level;

            // Get all valid nodes for this skill that we can harvest
            const validNodes = Object.values(RESOURCE_NODES)
                .filter(node => node.skill === skill && node.levelReq <= level)
                .sort((a, b) => b.levelReq - a.levelReq); // Highest level first

            if (validNodes.length > 0) {
                // Default to highest level node
                targetType = validNodes[0].type;

                // Check if we have a specific preference (e.g. from "Chop Oak" command)
                const mem = this.sharedMemory.get(ownerId);
                // If the stored target is a valid resource type (e.g. 'OAK_TREE') and we can harvest it
                if (mem?.lastTargetType && validNodes.find(n => n.type === mem.lastTargetType)) {
                    targetType = mem.lastTargetType;
                }
            } else {
                // Fallback if no definitions found (shouldn't happen)
                if (skill === 'WOODCUTTING') targetType = 'TREE';
                if (skill === 'MINING') targetType = 'COPPER_ROCK';
                if (skill === 'FISHING') targetType = 'FISHING_SPOT_NET';
            }
        } else if (['ATTACK', 'STRENGTH', 'DEFENSE'].includes(skill)) {
            targetType = 'NPC';
        }

        let target: ResourceEntity | NPC | undefined;
        if (targetType === 'NPC') {
            const enemies = world.npcs.filter(n => (n.role === 'MOB' || n.role === 'ENEMY') && n.hp && n.hp > 0);
            if (enemies.length > 0) {
                enemies.sort((a, b) => {
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
            // Find resources of the specific target type
            const resources = world.resources.filter(r => (r.type === targetType) && r.active);

            if (resources.length > 0) {
                // Find nearest
                resources.sort((a, b) => {
                    const distA = Math.hypot(a.position.x - entity.position.x, a.position.z - entity.position.z);
                    const distB = Math.hypot(b.position.x - entity.position.x, b.position.z - entity.position.z);
                    return distA - distB;
                });
                target = resources[0];
            } else {
                // If specific target not found, try any valid target for this skill as fallback?
                // For now, just wait.
                return { action: 'WAIT', thought: `Waiting for ${targetType.toLowerCase().replace(/_/g, ' ')}...` };
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
                    // Gather logic - FOLLOWER USES HIS OWN INVENTORY
                    if (isFollower && ownerRef) {
                        // XP still goes to owner, but items go to follower's inventory
                        const followerInv = (entity as AIState).inventory;

                        // Calculate drops based on resource definition
                        const nodeDef = RESOURCE_NODES[res.type];
                        if (nodeDef) {
                            this.backend.addXP(ownerRef, nodeDef.skill, nodeDef.xpReward);

                            // Add drops
                            nodeDef.drops.forEach(dropId => {
                                // Simple item creation (mock) - ideally use createItem from constants but we don't have access here easily without circular dep
                                // We'll manually construct for now or rely on backend router if we switch to it.
                                // Actually, let's use the backend router for gathering to ensure consistency!
                                // But the prompt asked for "logic in ai.ts".
                                // Let's stick to manual for now to avoid breaking the existing pattern, but make it data-driven.

                                // We need item details. For now, basic mock.
                                followerInv.push({
                                    id: dropId,
                                    name: dropId.replace(/_/g, ' '),
                                    count: 1,
                                    type: 'RESOURCE',
                                    tags: ['TAG_RESOURCE'],
                                    icon: '📦'
                                });
                            });

                            res.active = false;
                            setTimeout(() => res.active = true, nodeDef.respawnTime);
                            return { action: 'GATHER', thought: `Gathering ${nodeDef.type}...` };
                        } else {
                            // Fallback for unknown nodes
                            return { action: 'IDLE', thought: `Unknown resource ${res.type}` };
                        }
                    } else {
                        this.backend.router('/action/gather', { targetId: res.id, type: res.type }, true);
                        return { action: 'GATHER', thought: `Training ${skill}...` };
                    }
                }
            }
        }
        return {};
    }

    private handleScouting(entity: PlayerState | AIState, world: WorldState, isFollower: boolean, ownerId: string): { action?: string, thought?: string, newState?: string } {
        const targetType = this.scoutTarget.get(ownerId) || 'TREE';

        let target: ResourceEntity | NPC | undefined;
        if (targetType === 'NPC') {
            target = world.npcs.find(n => n.role === 'ENEMY' || n.role === 'MOB');
        } else {
            target = world.resources.find(r => r.type.includes(targetType) && r.active);
        }

        if (target) {
            const arrived = this.moveTowards(entity, target.position.x, target.position.z);
            if (arrived) {
                this.followerCommands.set(ownerId, 'FOLLOW'); // Return to follow
                return { action: 'SCOUT_FOUND', thought: `Found ${targetType} at ${Math.round(target.position.x)}, ${Math.round(target.position.z)}!`, newState: 'FOLLOWING' };
            }
            return { action: 'SCOUT_MOVE', thought: `Scouting for ${targetType}...` };
        } else {
            this.followerCommands.set(ownerId, 'FOLLOW');
            return { action: 'SCOUT_FAIL', thought: `Couldn't find any ${targetType}.`, newState: 'FOLLOWING' };
        }
    }
}
