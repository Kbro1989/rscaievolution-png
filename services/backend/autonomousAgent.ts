import { PlayerState, WorldState, SkillName, ResourceEntity, NPC } from '../../types';
import { lmStudioClient } from '../lmStudioClient';
import { blenderGenerator } from './blenderIntegration';

/**
 * Autonomous Agent States
 */
enum AgentState {
    IDLE = 'IDLE',
    THINKING = 'THINKING',          // Using LM Studio to decide next action
    SCANNING = 'SCANNING',           // Looking for resources/targets
    MOVING = 'MOVING',               // Moving to target
    GATHERING = 'GATHERING',         // Mining/woodcutting/fishing
    FIGHTING = 'FIGHTING',           // In combat
    LOOTING = 'LOOTING',            // Picking up drops
    BANKING = 'BANKING',            // Depositing/withdrawing
    CRAFTING = 'CRAFTING',          // At crafting station
    GENERATING_CONTENT = 'GENERATING_CONTENT', // Calling Blender
}

/**
 * Task types that Botty can autonomously pursue
 */
interface AutonomousTask {
    id: string;
    type: 'SKILL' | 'COMBAT' | 'CRAFT' | 'EXPLORE';
    goal: string;
    targetSkill?: SkillName;
    targetLevel?: number;
    resourceType?: string;
    targetNPC?: string;
    priority: number;
    status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETE' | 'FAILED';
}

/**
 * Decision made by LM Studio
 */
interface AgentDecision {
    action: AgentState;
    reasoning: string;
    target?: string;
    shouldGenerateContent?: boolean;
}

/**
 * Decision source tracking
 */
enum DecisionSource {
    LM_STUDIO = 'LM Studio',
    ANTIGRAVITY = 'Antigravity',
    RULE_BASED = 'Rule-based',
}

/**
 * Autonomous Agent for Botty McBotface
 * 
 * Botty is a fully autonomous AI player that:
 * - Decides own goals using AI (LM Studio or Antigravity)
 * - Falls back to rule-based logic when AI unavailable
 * - Executes workflows independently
 * - Uses Blender to generate missing content
 * - Has own bank, inventory, stats
 */
export class AutonomousAgent {
    private bottyPlayer: PlayerState;
    private currentState: AgentState = AgentState.IDLE;
    private currentTask: AutonomousTask | null = null;
    private lastDecisionTime: number = 0;
    private decisionInterval: number = 5000; // Think every 5 seconds
    private targetPosition: { x: number; z: number } | null = null;
    private lastDecisionSource: DecisionSource = DecisionSource.RULE_BASED;
    private lmStudioFailCount: number = 0;

    constructor(bottyPlayer: PlayerState) {
        this.bottyPlayer = bottyPlayer;
    }

    /**
     * Main tick function - called every game loop iteration
     */
    async tick(world: WorldState): Promise<void> {
        const now = Date.now();

        // Make decisions periodically
        if (now - this.lastDecisionTime > this.decisionInterval) {
            await this.makeDecision(world);
            this.lastDecisionTime = now;
        }

        // Execute current action
        await this.executeCurrentAction(world);
    }

    /**
     * Use AI or rules to decide what to do next
     * Tries: LM Studio → Antigravity → Rule-based fallback
     */
    private async makeDecision(world: WorldState): Promise<void> {
        this.currentState = AgentState.THINKING;

        let decision: AgentDecision | null = null;
        let source: DecisionSource = DecisionSource.RULE_BASED;

        // Try LM Studio first (fast local AI)
        if (this.lmStudioFailCount < 3) {
            try {
                const prompt = this.buildDecisionPrompt(world);
                const response = await lmStudioClient.generateText(prompt, {
                    temperature: 0.7,
                    maxTokens: 150,
                });

                decision = this.parseDecision(response);
                source = DecisionSource.LM_STUDIO;
                this.lmStudioFailCount = 0; // Reset on success

                console.log(`✅ [Botty] ${source}: ${decision.action} - ${decision.reasoning}`);
            } catch (error) {
                this.lmStudioFailCount++;
                console.warn(`⚠️ [Botty] LM Studio unavailable (attempt ${this.lmStudioFailCount}/3):`, error.message);
            }
        }

        // Try Antigravity API if LM Studio failed (smart cloud AI)
        if (!decision) {
            try {
                decision = await this.makeAntigravityDecision(world);
                source = DecisionSource.ANTIGRAVITY;
                console.log(`✅ [Botty] ${source}: ${decision.action} - ${decision.reasoning}`);
            } catch (error) {
                console.warn(`⚠️ [Botty] Antigravity API unavailable:`, error.message);
            }
        }

        // Fallback to rule-based logic (always works)
        if (!decision) {
            decision = this.makeRuleBasedDecision(world);
            source = DecisionSource.RULE_BASED;
            console.log(`🤖 [Botty] ${source}: ${decision.action} - ${decision.reasoning}`);
        }

        this.lastDecisionSource = source;
        this.applyDecision(decision);
    }

    /**
     * Build LM Studio prompt for decision making
     */
    private buildDecisionPrompt(world: WorldState): string {
        const nearbyResources = this.findNearbyResources(world);
        const nearbyNPCs = this.findNearbyNPCs(world);

        return `You are Botty McBotface, an autonomous AI player in RSC Evolution.

**Current Status:**
- Position: (${this.bottyPlayer.position.x}, ${this.bottyPlayer.position.z})
- Inventory: ${this.bottyPlayer.inventory.length}/28 items
- Lowest Skill: ${this.getLowestSkill()}
- Current Goal: ${this.currentTask?.goal || 'None'}

**Nearby:**
- Resources: ${nearbyResources.map(r => r.type).join(', ') || 'None'}
- NPCs: ${nearbyNPCs.map(n => n.name).join(', ') || 'None'}

**What should you do next?**
Choose ONE action and explain why:
1. SKILL - Train your lowest skill
2. COMBAT - Attack nearby enemies
3. BANK - Deposit items if inventory near full
4. EXPLORE - Move to find new resources
5. IDLE - Rest and think

Format: ACTION|REASONING
Example: SKILL|My woodcutting is lowest, I should train it`;
    }

    /**
     * Parse LM Studio response into decision
     */
    private parseDecision(response: string): AgentDecision {
        const parts = response.split('|');
        const action = parts[0]?.trim().toUpperCase();
        const reasoning = parts[1]?.trim() || 'No reasoning provided';

        let agentState = AgentState.IDLE;
        if (action?.includes('SKILL')) agentState = AgentState.SCANNING;
        else if (action?.includes('COMBAT')) agentState = AgentState.SCANNING;
        else if (action?.includes('BANK')) agentState = AgentState.BANKING;
        else if (action?.includes('EXPLORE')) agentState = AgentState.MOVING;

        return {
            action: agentState,
            reasoning,
        };
    }

    /**
     * Use Antigravity API for complex strategic decisions
     * TODO: Implement actual API integration
     */
    private async makeAntigravityDecision(world: WorldState): Promise<AgentDecision> {
        // Placeholder for future Antigravity API integration
        // For now, throw error to fall back to rule-based
        throw new Error('Antigravity API integration pending');

        // Future implementation:
        // const context = this.buildDecisionPrompt(world);
        // const response = await fetch('https://antigravity-api/decide', {
        //     method: 'POST',
        //     body: JSON.stringify({ context, player: this.bottyPlayer })
        // });
        // return await response.json();
    }

    /**
     * Simple rule-based decision making (always works, no AI needed)
     */
    private makeRuleBasedDecision(world: WorldState): AgentDecision {
        // Rule 1: Bank if inventory almost full
        if (this.bottyPlayer.inventory.length >= 26) {
            return {
                action: AgentState.BANKING,
                reasoning: 'Inventory nearly full (26/28), banking items',
            };
        }

        // Rule 2: Train lowest skill if possible
        const lowestSkill = this.getLowestSkill();
        const resourceType = this.getResourceTypeForSkill(lowestSkill);
        const nearbyResources = this.findNearbyResources(world);
        const hasMatchingResource = nearbyResources.some(r => r.type === resourceType);

        if (hasMatchingResource) {
            return {
                action: AgentState.SCANNING,
                reasoning: `Training ${lowestSkill} (lowest skill) with nearby ${resourceType}`,
            };
        }

        // Rule 3: Attack nearby NPCs if resources unavailable
        const nearbyNPCs = this.findNearbyNPCs(world);
        if (nearbyNPCs.length > 0 && this.bottyPlayer.skills.ATTACK?.level > 1) {
            return {
                action: AgentState.SCANNING,
                reasoning: `No resources nearby, attacking ${nearbyNPCs[0].name} for combat XP`,
            };
        }

        // Rule 4: Explore to find resources
        if (nearbyResources.length === 0) {
            return {
                action: AgentState.MOVING,
                reasoning: 'No resources or NPCs nearby, exploring the area',
            };
        }

        // Default: Idle and observe
        return {
            action: AgentState.IDLE,
            reasoning: 'Observing surroundings, waiting for opportunity',
        };
    }

    /**
     * Apply the decision
     */
    private applyDecision(decision: AgentDecision): void {
        this.currentState = decision.action;

        // Log to Botty's "thoughts"
        if (this.bottyPlayer.follower) {
            this.bottyPlayer.follower.action = decision.action as any; // AgentState → AIMode
        }
    }

    /**
     * Execute the current action
     */
    private async executeCurrentAction(world: WorldState): Promise<void> {
        switch (this.currentState) {
            case AgentState.SCANNING:
                await this.executeScan(world);
                break;
            case AgentState.MOVING:
                this.executeMove();
                break;
            case AgentState.GATHERING:
                await this.executeGather(world);
                break;
            case AgentState.BANKING:
                this.executeBank();
                break;
            case AgentState.GENERATING_CONTENT:
                await this.executeContentGeneration(world);
                break;
        }
    }

    /**
     * Scan for resources - if none found, generate with Blender
     */
    private async executeScan(world: WorldState): Promise<void> {
        const lowestSkill = this.getLowestSkill();
        const resourceType = this.getResourceTypeForSkill(lowestSkill);

        const matching = world.resources.filter(r => r.type === resourceType);

        if (matching.length === 0) {
            console.log(`[Botty] No ${resourceType} found. Generating with Blender...`);
            this.currentState = AgentState.GENERATING_CONTENT;
        } else {
            // Move to nearest resource
            const nearest = matching[0];
            this.targetPosition = { x: nearest.position.x, z: nearest.position.z };
            this.currentState = AgentState.MOVING;
        }
    }

    /**
     * Generate missing content with Blender
     */
    private async executeContentGeneration(world: WorldState): Promise<void> {
        try {
            const resourceType = this.getResourceTypeForSkill(this.getLowestSkill());

            // Generate model
            let modelPath: string;
            if (resourceType.includes('TREE')) {
                modelPath = await blenderGenerator.generateTree('oak');
            } else if (resourceType.includes('ROCK')) {
                modelPath = await blenderGenerator.generateRock('copper');
            } else {
                console.log(`[Botty] Don't know how to generate ${resourceType}`);
                this.currentState = AgentState.IDLE;
                return;
            }

            // Spawn resources in world
            for (let i = 0; i < 5; i++) {
                const randomPos = {
                    x: Math.random() * 40 - 20,
                    z: Math.random() * 40 - 20,
                };

                world.resources.push({
                    id: `${resourceType}-generated-${Date.now()}-${i}`,
                    type: resourceType as any,
                    tier: 1,
                    position: randomPos,
                    active: true,
                });
            }

            console.log(`[Botty] Generated 5x ${resourceType} at various positions`);
            this.currentState = AgentState.SCANNING;
        } catch (error) {
            console.error('[Botty] Content generation failed:', error);
            this.currentState = AgentState.IDLE;
        }
    }

    /**
     * Move toward target
     */
    private executeMove(): void {
        if (!this.targetPosition) {
            this.currentState = AgentState.IDLE;
            return;
        }

        const dx = this.targetPosition.x - this.bottyPlayer.position.x;
        const dz = this.targetPosition.z - this.bottyPlayer.position.z;
        const distance = Math.sqrt(dx * dx + dz * dz);

        if (distance < 2) {
            // Arrived
            this.currentState = AgentState.GATHERING;
            this.targetPosition = null;
        } else {
            // Move toward target
            const speed = 0.1;
            this.bottyPlayer.position.x += (dx / distance) * speed;
            this.bottyPlayer.position.z += (dz / distance) * speed;
        }
    }

    /**
     * Gather resources
     */
    private async executeGather(world: WorldState): Promise<void> {
        // Simulate gathering
        if (Math.random() > 0.9) { // 10% chance per tick
            const lowestSkill = this.getLowestSkill();
            // Award XP
            if (!this.bottyPlayer.skills[lowestSkill]) {
                this.bottyPlayer.skills[lowestSkill] = { level: 1, xp: 0, unlocked: true };
            }
            this.bottyPlayer.skills[lowestSkill].xp += 10;

            // Check if inventory full
            if (this.bottyPlayer.inventory.length >= 28) {
                this.currentState = AgentState.BANKING;
            }
        }
    }

    /**
     * Bank items
     */
    private executeBank(): void {
        // Move items to bank
        this.bottyPlayer.bank.push(...this.bottyPlayer.inventory);
        this.bottyPlayer.inventory = [];
        console.log('[Botty] Banked items');
        this.currentState = AgentState.IDLE;
    }

    /**
     * Helper: Get lowest skill
     */
    private getLowestSkill(): SkillName {
        const skills = Object.keys(this.bottyPlayer.skills) as SkillName[];
        return skills.reduce((lowest, skill) => {
            const currentLevel = this.bottyPlayer.skills[skill]?.level || 1;
            const lowestLevel = this.bottyPlayer.skills[lowest]?.level || 1;
            return currentLevel < lowestLevel ? skill : lowest;
        }, skills[0]);
    }

    /**
     * Helper: Get resource type for skill
     */
    private getResourceTypeForSkill(skill: SkillName): string {
        const mapping: Record<string, string> = {
            'WOODCUTTING': 'TREE',
            'MINING': 'COPPER_ROCK',
            'FISHING': 'FISHING_SPOT_NET',
        };
        return mapping[skill] || 'TREE';
    }

    /**
     * Helper: Find nearby resources
     */
    private findNearbyResources(world: WorldState, radius: number = 10): ResourceEntity[] {
        return world.resources.filter(r => {
            const dx = r.position.x - this.bottyPlayer.position.x;
            const dz = r.position.z - this.bottyPlayer.position.z;
            return Math.sqrt(dx * dx + dz * dz) < radius;
        });
    }

    /**
     * Helper: Find nearby NPCs
     */
    private findNearbyNPCs(world: WorldState, radius: number = 10): NPC[] {
        return world.npcs.filter(n => {
            const dx = n.position.x - this.bottyPlayer.position.x;
            const dz = n.position.z - this.bottyPlayer.position.z;
            return Math.sqrt(dx * dx + dz * dz) < radius;
        });
    }

    /**
     * Get current state for debugging
     */
    public getStatus(): string {
        return `State: ${this.currentState} | Decision: ${this.lastDecisionSource} | Task: ${this.currentTask?.goal || 'None'}`;
    }
}
