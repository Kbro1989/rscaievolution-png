import { SKILL_DEFINITIONS, SKILL_REGISTRY } from './constants';
import { CRAFTING_RECIPES } from './craftingRecipes';
import { ITEM_DEFINITIONS } from './itemDefinitions';
import { RESOURCE_NODES } from './resourceDefinitions';
import { NPC_DEFINITIONS } from './npcDefinitions';

/**
 * Game Knowledge Base for AI Assistant
 * Provides comprehensive context about game mechanics, skills, recipes, etc.
 */

export function getGameKnowledge(): string {
    return `
# RuneScape Classic Evolution - Game Knowledge Base

## Skills System
${Object.entries(SKILL_DEFINITIONS).map(([key, skill]) =>
        `- **${skill.name}** (${key}): Max Level ${skill.maxLevel}, Era ${skill.eraUnlocked}, Dependencies: ${skill.dependencies.join(', ') || 'None'}`
    ).join('\n')}

## Crafting Recipes
${Object.values(CRAFTING_RECIPES).map(recipe =>
        `- **${recipe.name}**: ${recipe.ingredients.map(i => `${i.qty}x ${i.id}`).join(' + ')} → ${recipe.outputQty}x ${recipe.output} (Lvl ${recipe.levelReq} ${recipe.skill}, ${recipe.xp} XP, Station: ${recipe.station})`
    ).join('\n')}

## Items
- Evolution XP = 0.5x of all non-HITS skill XP

## Combat (RSC Accurate)
- Damage-based XP: 1.33 HP XP + 4 combat skill XP per damage
- Combat Styles: Accurate (Attack), Aggressive (Strength), Defensive (Defense), Controlled (1.33 each)
- Combat Level = Base + Max(Melee, Ranged, Magic)
  - Base = (Defense + Hitpoints + Prayer/2) / 4
  - Melee = (Attack + Strength) / 4
  - Ranged = (Ranged * 1.5) / 4
  - Magic = (Magic * 1.5) / 4

## Production Stations
- **FURNACE**: Smelting ores into bars (Smithing skill)
- **ANVIL**: Smithing bars into equipment (Smithing skill)
- **RANGE**: Cooking food (Cooking skill)
- **CRAFTING_TABLE**: General crafting (Crafting skill)
- **FLETCHING_TABLE**: Making bows/arrows (Fletching skill)
- **BANK_BOOTH**: Access bank storage

## Follower AI Commands
- "follow" / "come here" - Follow player
- "stay" / "wait" - Stay in position
- "kill" / "attack" - Attack nearby enemies
- "bank" / "deposit" - Bank items
- "mine" / "chop" / "fish" - Gather specific skill
- "scout" / "find" - Scout for resources/enemies

## Tips
- Start with woodcutting and mining for basic resources
- Bronze requires Copper + Tin ore at a Furnace
- Coal is a secondary ingredient for higher-tier bars
- All combat XP is damage-based (RSC authentic)
- Evolution XP is automatic (0.5x of other skills)
`;
}

/**
 * Create contextual prompt for AI chat
 */
export function createAIChatContext(playerState: any, message: string): string {
    const knowledge = getGameKnowledge();

    return `${knowledge}

## Player Status
- Level: Evolution ${playerState.evolutionStage || 1}
- Skills: ${Object.entries(playerState.skills || {})
            .map(([skill, data]: [string, any]) => `${skill} ${data.level}`)
            .join(', ')}
- HP: ${playerState.hp}/${playerState.maxHp}
- Combat Level: ${playerState.combatLevel}
- Inventory Items: ${playerState.inventory?.length || 0}/28

## User Message
${message}

## Instructions
You are a helpful RuneScape Classic AI companion. Answer the player's question using the game knowledge above. Be concise, friendly, and accurate. If they're asking about how to do something, give step-by-step instructions. If they're asking about stats or mechanics, refer to the knowledge base.`;
}
