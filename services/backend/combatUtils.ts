import { PlayerState, SkillName, CombatStyle, SkillMap } from '../../types';

/**
 * RSC Combat Utilities
 * Implements RuneScape Classic combat formulas
 */

export interface CombatXPDistribution {
    HITS: number;
    ATTACK?: number;
    STRENGTH?: number;
    DEFENSE?: number;
    MAGIC?: number;
    RANGED?: number;
}

/**
 * Calculate combat level using RSC formula
 */
export function calculateCombatLevel(skills: SkillMap): number {
    const attack = skills.ATTACK?.level || 1;
    const strength = skills.STRENGTH?.level || 1;
    const defense = skills.DEFENSE?.level || 1;
    const hitpoints = skills.HITS?.level || 10;
    const prayer = skills.PRAYER?.level || 1;
    const magic = skills.MAGIC?.level || 1;
    const ranged = skills.RANGED?.level || 1;

    // Base level: (Defense + Hitpoints + floor(Prayer/2)) / 4
    const base = Math.floor((defense + hitpoints + Math.floor(prayer / 2)) / 4);

    // Melee contribution: (Attack + Strength) / 4
    const melee = Math.floor((attack + strength) / 4);

    // Ranged contribution: (Ranged * 1.5) / 4
    const rangedContrib = Math.floor((ranged * 1.5) / 4);

    // Magic contribution: (Magic * 1.5) / 4
    const magicContrib = Math.floor((magic * 1.5) / 4);

    // Combat level = base + highest contribution
    const combatLevel = Math.floor(base + Math.max(melee, rangedContrib, magicContrib));

    return combatLevel;
}

/**
 * Distribute combat XP based on damage dealt and combat style
 * RSC formula: 1.33 HP XP + 4 combat XP per damage point
 */
export function distributeCombatXP(
    damage: number,
    style: CombatStyle,
    attackType: 'MELEE' | 'RANGED' | 'MAGIC' = 'MELEE'
): CombatXPDistribution {
    const xp: CombatXPDistribution = {
        HITS: damage * 1.33, // Always 1.33 HP XP per damage
    };

    if (attackType === 'MELEE') {
        // Melee XP distribution based on combat style
        switch (style) {
            case 'ACCURATE':
                xp.ATTACK = damage * 4;
                break;
            case 'AGGRESSIVE':
                xp.STRENGTH = damage * 4;
                break;
            case 'DEFENSIVE':
                xp.DEFENSE = damage * 4;
                break;
            case 'CONTROLLED':
                xp.ATTACK = damage * 1.33;
                xp.STRENGTH = damage * 1.33;
                xp.DEFENSE = damage * 1.33;
                break;
        }
    } else if (attackType === 'RANGED') {
        // Ranged XP: 4 XP for rapid, or 2 Ranged + 2 Defense for long range
        // For now, default to rapid (4 Ranged XP)
        // TODO: Add ranged style selection
        if (style === 'DEFENSIVE') {
            xp.RANGED = damage * 2;
            xp.DEFENSE = damage * 2;
        } else {
            xp.RANGED = damage * 4;
        }
    } else if (attackType === 'MAGIC') {
        // Magic XP: 2 per damage + base XP per cast
        // Base XP is added separately in the attack handler
        if (style === 'DEFENSIVE') {
            xp.MAGIC = damage * 1.33;
            xp.DEFENSE = damage * 1;
        } else {
            xp.MAGIC = damage * 2;
        }
    }

    return xp;
}

/**
 * Calculate if an attack hits based on Attack level vs Defense level
 * Returns true if hit, false if miss
 */
export function rollHitChance(
    attackLevel: number,
    weaponAccuracy: number,
    defenseLevel: number,
    defenderArmor: number
): boolean {
    // Attacker's accuracy roll: Attack level + weapon accuracy bonus
    const attackRoll = attackLevel + Math.floor(weaponAccuracy / 2);
    // Defender's defense roll: Defense level + armor bonus
    const defenseRoll = defenseLevel + Math.floor(defenderArmor / 2);

    // Calculate hit chance (10% minimum, 90% maximum)
    const hitChance = Math.max(0.1, Math.min(0.9, attackRoll / (attackRoll + defenseRoll)));

    // Roll the dice!
    return Math.random() < hitChance;
}

/**
 * Calculate damage dealt if attack hits
 * Returns damage amount (1 to max hit)
 */
export function rollDamage(strengthLevel: number, weaponPower: number): number {
    const maxHit = calculateMaxHit(strengthLevel, weaponPower);
    // Random damage from 1 to maxHit
    return Math.floor(Math.random() * maxHit) + 1;
}

/**
 * Calculate damage dealt in combat (legacy wrapper for compatibility)
 * @deprecated Use rollHitChance and rollDamage separately for more control
 */
export function calculateDamage(
    attackLevel: number,
    weaponPower: number,
    defenderLevel: number,
    defenderArmor: number
): number {
    // Use attack level for hit chance
    if (!rollHitChance(attackLevel, weaponPower, defenderLevel, defenderArmor)) {
        return 0; // Miss
    }

    // Use attack level for damage (legacy behavior - should use Strength)
    return rollDamage(attackLevel, weaponPower);
}

/**
 * Calculate max hit for a player
 */
export function calculateMaxHit(strengthLevel: number, weaponPower: number): number {
    return Math.floor(1 + (strengthLevel * weaponPower) / 40);
}
