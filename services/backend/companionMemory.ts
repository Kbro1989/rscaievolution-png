import { PlayerState } from '../../types';

/**
 * AI Companion Memory System
 * Stores conversation history and relationship data for the "friend effect"
 */

export interface ConversationMemory {
    timestamp: number;
    playerMessage: string;
    companionResponse: string;
    era: number;
}

export interface CompanionMemory {
    playerId: string;
    playerName: string;
    conversationHistory: ConversationMemory[];
    relationshipLevel: number; // 0-100
    firstMet: number; // timestamp
    lastInteraction: number; // timestamp
    totalConversations: number;
    playerPreferences: {
        favoriteSkill?: string;
        playstyle?: 'combat' | 'skilling' | 'social' | 'exploration';
        personalityNotes: string[];
    };
}

export class CompanionMemoryManager {
    private memories: Map<string, CompanionMemory> = new Map();
    private readonly MAX_HISTORY = 20; // Keep last 20 conversations
    private readonly STORAGE_KEY = 'companion_memories';

    constructor() {
        this.loadFromStorage();
    }

    /**
     * Get or create memory for a player
     */
    getMemory(playerId: string, playerName: string): CompanionMemory {
        if (!this.memories.has(playerId)) {
            this.memories.set(playerId, {
                playerId,
                playerName,
                conversationHistory: [],
                relationshipLevel: 0,
                firstMet: Date.now(),
                lastInteraction: Date.now(),
                totalConversations: 0,
                playerPreferences: {
                    personalityNotes: [],
                },
            });
        }
        return this.memories.get(playerId)!;
    }

    /**
     * Record a conversation
     */
    recordConversation(
        playerId: string,
        playerName: string,
        playerMessage: string,
        companionResponse: string,
        era: number
    ) {
        const memory = this.getMemory(playerId, playerName);

        memory.conversationHistory.push({
            timestamp: Date.now(),
            playerMessage,
            companionResponse,
            era,
        });

        // Keep only recent conversations
        if (memory.conversationHistory.length > this.MAX_HISTORY) {
            memory.conversationHistory.shift();
        }

        memory.lastInteraction = Date.now();
        memory.totalConversations++;

        // Increase relationship based on conversation
        this.increaseRelationship(memory, 2);

        this.saveToStorage();
    }

    /**
     * Get conversation context for AI
     */
    getConversationContext(playerId: string, playerName: string): string {
        const memory = this.getMemory(playerId, playerName);
        const timeSinceFirst = Date.now() - memory.firstMet;
        const daysSinceFirst = Math.floor(timeSinceFirst / (1000 * 60 * 60 * 24));

        let context = `\n## Companion Memory\n`;
        context += `- Player Name: ${playerName}\n`;
        context += `- Relationship Level: ${memory.relationshipLevel}/100 (${this.getRelationshipStatus(memory.relationshipLevel)})\n`;
        context += `- Days Together: ${daysSinceFirst}\n`;
        context += `- Total Conversations: ${memory.totalConversations}\n`;

        if (memory.playerPreferences.favoriteSkill) {
            context += `- Player's Favorite: ${memory.playerPreferences.favoriteSkill}\n`;
        }

        if (memory.playerPreferences.personalityNotes.length > 0) {
            context += `- Player Notes: ${memory.playerPreferences.personalityNotes.join(', ')}\n`;
        }

        // Recent conversation history
        if (memory.conversationHistory.length > 0) {
            context += `\n### Recent Conversations:\n`;
            const recentConvos = memory.conversationHistory.slice(-5);
            recentConvos.forEach((convo, i) => {
                const timeAgo = this.getTimeAgo(Date.now() - convo.timestamp);
                context += `${i + 1}. [${timeAgo}] Player: "${convo.playerMessage.substring(0, 50)}..."  You: "${convo.companionResponse.substring(0, 50)}..."\n`;
            });
        }

        context += `\n**Instructions**: Use this memory to be more personal and friendly. Reference past conversations when relevant. Show that you remember ${playerName} and care about their progress.\n`;

        return context;
    }

    /**
     * Increase relationship level
     */
    private increaseRelationship(memory: CompanionMemory, amount: number) {
        memory.relationshipLevel = Math.min(100, memory.relationshipLevel + amount);
    }

    /**
     * Get relationship status text
     */
    private getRelationshipStatus(level: number): string {
        if (level < 10) return 'Stranger';
        if (level < 25) return 'Acquaintance';
        if (level < 50) return 'Friend';
        if (level < 75) return 'Good Friend';
        if (level < 90) return 'Best Friend';
        return 'Soulmate';
    }

    /**
     * Format time ago
     */
    private getTimeAgo(ms: number): string {
        const seconds = Math.floor(ms / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        if (days > 0) return `${days}d ago`;
        if (hours > 0) return `${hours}h ago`;
        if (minutes > 0) return `${minutes}m ago`;
        return 'just now';
    }

    /**
     * Detect and record player preferences
     */
    updatePlayerPreferences(playerId: string, playerState: PlayerState) {
        const memory = this.getMemory(playerId, playerState.name);

        // Detect favorite skill (highest level)
        let highestSkill = '';
        let highestLevel = 0;
        Object.entries(playerState.skills).forEach(([skill, data]) => {
            if (data.level > highestLevel && skill !== 'EVOLUTION') {
                highestLevel = data.level;
                highestSkill = skill;
            }
        });

        if (highestSkill) {
            memory.playerPreferences.favoriteSkill = highestSkill;
        }
    }

    /**
     * Save to localStorage
     */
    private saveToStorage() {
        try {
            const data = Array.from(this.memories.entries());
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
        } catch (error) {
            console.error('Failed to save companion memories:', error);
        }
    }

    /**
     * Load from localStorage
     */
    private loadFromStorage() {
        try {
            const stored = localStorage.getItem(this.STORAGE_KEY);
            if (stored) {
                const data = JSON.parse(stored);
                this.memories = new Map(data);
            }
        } catch (error) {
            console.error('Failed to load companion memories:', error);
        }
    }
}

// Singleton instance
export const companionMemory = new CompanionMemoryManager();
