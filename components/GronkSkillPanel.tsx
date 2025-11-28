import React from 'react';
import { SkillName } from '../types';
import { SKILL_REGISTRY, SKILL_DEFINITIONS } from '../services/gameBackend';

interface SkillAction {
    label: string;
    cmd: string;
}

// Skill-specific action definitions for Gronk
const GRONK_SKILL_ACTIONS: Partial<Record<SkillName, SkillAction[]>> = {
    WOODCUTTING: [
        { label: 'Normal Trees', cmd: 'chop trees' },
        { label: 'Oak Trees', cmd: 'chop oak' },
        { label: 'Willow Trees', cmd: 'chop willow' },
        { label: 'Maple Trees', cmd: 'chop maple' },
        { label: 'Yew Trees', cmd: 'chop yew' },
        { label: '🤖 Auto (AI Decides)', cmd: 'gather wood' }
    ],
    MINING: [
        { label: 'Copper Ore', cmd: 'mine copper' },
        { label: 'Tin Ore', cmd: 'mine tin' },
        { label: 'Iron Ore', cmd: 'mine iron' },
        { label: 'Coal', cmd: 'mine coal' },
        { label: 'Mithril Ore', cmd: 'mine mithril' },
        { label: 'Adamant Ore', cmd: 'mine adamant' },
        { label: '🤖 Auto (AI Decides)', cmd: 'mine rocks' }
    ],
    FISHING: [
        { label: 'Net Fishing (Shrimp)', cmd: 'fish shrimp' },
        { label: 'Bait Fishing', cmd: 'fish bait' },
        { label: 'Cage Fishing', cmd: 'fish cage' },
        { label: 'Harpoon Fishing', cmd: 'fish harpoon' },
        { label: 'Shark Fishing', cmd: 'fish shark' },
        { label: '🤖 Auto (AI Decides)', cmd: 'fish' }
    ],
    ATTACK: [
        { label: 'Chickens', cmd: 'kill chickens' },
        { label: 'Cows', cmd: 'kill cows' },
        { label: 'Goblins', cmd: 'kill goblins' },
        { label: 'Giant Rats', cmd: 'kill rats' },
        { label: 'Guards', cmd: 'kill guards' },
        { label: '🤖 Auto (AI Decides)', cmd: 'hunt' }
    ],
    STRENGTH: [{ label: '🤖 Auto Combat', cmd: 'hunt' }],
    DEFENSE: [{ label: '🤖 Auto Combat', cmd: 'hunt' }],
    HITS: [{ label: '(Passive Skill)', cmd: '' }],
    PRAYER: [{ label: '(Use Bones in Inv)', cmd: '' }],
    COOKING: [{ label: '(Manual Crafting)', cmd: '' }],
    SMITHING: [{ label: '(Manual Crafting)', cmd: '' }],
    CRAFTING: [{ label: '(Manual Crafting)', cmd: '' }],
    FIREMAKING: [{ label: '(Manual Crafting)', cmd: '' }],
    MAGIC: [{ label: '🤖 Auto Casting', cmd: 'use magic' }],
    FLETCHING: [{ label: '(Manual Crafting)', cmd: '' }],
    EVOLUTION: [{ label: '(Passive XP)', cmd: '' }],
    RANGED: [{ label: '🤖 Auto Ranged', cmd: 'hunt' }],
    HERBLORE: [{ label: '(Manual Crafting)', cmd: '' }],
    AGILITY: [{ label: '(Future Feature)', cmd: '' }],
    THIEVING: [{ label: '(Future Feature)', cmd: '' }],
    SLAYER: [{ label: '🤖 Auto Slayer', cmd: 'hunt' }],
    FARMING: [{ label: '(Future Feature)', cmd: '' }]
};

interface GronkSkillPanelProps {
    currentLevel: Record<SkillName, number>;
    onCommandSkill: (command: string) => void;
}

export const GronkSkillPanel: React.FC<GronkSkillPanelProps> = ({ currentLevel, onCommandSkill }) => {
    return (
        <div className="grid grid-cols-2 gap-1 p-1">
            {SKILL_REGISTRY.map(skillName => {
                const def = SKILL_DEFINITIONS[skillName];
                const actions = GRONK_SKILL_ACTIONS[skillName] || [{ label: '(Not Available)', cmd: '' }];
                const level = currentLevel[skillName] || 1;

                return (
                    <div key={skillName} className="bg-[#332b22] border border-[#4e4336] p-1">
                        <div className="flex items-center justify-between mb-1">
                            <span className="text-[#ff981f] text-xs font-bold truncate">
                                {skillName === 'EVOLUTION' ? '🧬 ' : ''}{def.name}
                            </span>
                            <span className="text-yellow-200 text-xs font-bold">{level}</span>
                        </div>

                        {actions.length > 1 ? (
                            <select
                                onChange={(e) => onCommandSkill(e.target.value)}
                                className="w-full bg-[#2b2319] text-white text-[10px] border border-[#4e4336] p-1"
                                defaultValue=""
                            >
                                <option value="" disabled>Select Action...</option>
                                {actions.map((action, idx) => (
                                    <option key={idx} value={action.cmd} disabled={!action.cmd}>
                                        {action.label}
                                    </option>
                                ))}
                            </select>
                        ) : (
                            <div className="text-zinc-500 text-[9px] text-center italic">
                                {actions[0].label}
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
};
