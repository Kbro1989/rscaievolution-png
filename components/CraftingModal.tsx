import React, { useState, useEffect } from 'react';
import { Recipe, InventoryItem } from '../types';
import { X, Hammer, Flame, ChefHat } from 'lucide-react';
import { soundManager } from '../services/soundManager';

interface CraftingModalProps {
    skillName: string;
    recipes: Recipe[];
    onClose: () => void;
    onCraft: (recipeId: string) => void;
    inventory: InventoryItem[];
    level: number;
}

export const CraftingModal: React.FC<CraftingModalProps> = ({ skillName, recipes, onClose, onCraft, inventory, level }) => {
    const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);

    useEffect(() => {
        soundManager.init();
        soundManager.play('UI_CLICK');
    }, []);

    // Group recipes by category or just list them
    // For now, simple grid

    const getIcon = () => {
        if (skillName === 'Smithing') return <Hammer size={20} />;
        if (skillName === 'Cooking') return <ChefHat size={20} />;
        return <Flame size={20} />;
    };

    const hasIngredients = (recipe: Recipe) => {
        return recipe.ingredients.every(ing => {
            const item = inventory.find(i => i.id === ing.id);
            return item && item.count >= ing.qty;
        });
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="w-[600px] h-[500px] bg-[#3e3529] border-[3px] border-[#1a1510] rounded-lg shadow-2xl flex flex-col overflow-hidden relative">
                {/* Header */}
                <div className="h-12 bg-[#2b2319] border-b border-[#5b5247] flex items-center justify-between px-4">
                    <div className="flex items-center gap-2 text-[#ff981f] font-bold text-xl">
                        {getIcon()}
                        <span className="drop-shadow-md">{skillName}</span>
                    </div>
                    <button onClick={onClose} className="text-[#9eaab6] hover:text-white transition-colors">
                        <X size={24} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 flex overflow-hidden">
                    {/* Recipe List */}
                    <div className="w-1/2 bg-[#1a1510]/30 overflow-y-auto p-2 border-r border-[#5b5247]">
                        <div className="grid grid-cols-4 gap-2">
                            {recipes.map(recipe => {
                                const canCraft = hasIngredients(recipe) && level >= recipe.levelReq;
                                const isSelected = selectedRecipe?.id === recipe.id;

                                return (
                                    <div
                                        key={recipe.id}
                                        onClick={() => setSelectedRecipe(recipe)}
                                        className={`aspect-square rounded border-2 flex items-center justify-center cursor-pointer relative group transition-all
                                            ${isSelected ? 'border-[#ffff00] bg-white/10' : 'border-[#3e3529] bg-[#2b2319]'}
                                            ${!canCraft ? 'opacity-50 grayscale' : 'hover:border-[#ff981f]'}
                                        `}
                                    >
                                        <span className="text-2xl filter drop-shadow-md">
                                            {/* We don't have item icons easily accessible here without ITEM_DEFINITIONS, 
                                                but recipes usually have an output item ID. 
                                                For now, we'll use a generic icon or try to infer. 
                                                Actually, we can pass a helper or just use emoji if available.
                                                Wait, Recipe interface doesn't have icon. 
                                                But the output item usually corresponds to something.
                                                Let's use a placeholder or the skill icon for now if we can't get the item icon.
                                                Actually, let's assume we can get it from the recipe output name/id mapping or pass it.
                                                For now, just show the name in tooltip.
                                            */}
                                            📦
                                        </span>
                                        {/* Tooltip */}
                                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-black/90 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none z-10 border border-[#5b5247]">
                                            {recipe.name} (Lvl {recipe.levelReq})
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Details Panel */}
                    <div className="w-1/2 p-4 flex flex-col bg-[#2b2319]">
                        {selectedRecipe ? (
                            <>
                                <div className="text-center mb-4">
                                    <h3 className="text-[#ff981f] font-bold text-lg mb-1">{selectedRecipe.name}</h3>
                                    <div className="text-[#9eaab6] text-sm">Requires Level {selectedRecipe.levelReq} {skillName}</div>
                                    <div className="text-[#ffff00] text-xs mt-1">{selectedRecipe.xp} XP</div>
                                </div>

                                <div className="flex-1">
                                    <h4 className="text-[#cecece] font-bold text-sm mb-2 border-b border-[#5b5247] pb-1">Ingredients</h4>
                                    <div className="space-y-2">
                                        {selectedRecipe.ingredients.map((ing, idx) => {
                                            const item = inventory.find(i => i.id === ing.id);
                                            const has = item ? item.count : 0;
                                            const hasEnough = has >= ing.qty;

                                            return (
                                                <div key={idx} className="flex items-center justify-between text-sm bg-[#1a1510] p-2 rounded border border-[#3e3529]">
                                                    <span className="text-[#cecece]">{ing.id}</span>
                                                    <span className={hasEnough ? 'text-green-400' : 'text-red-400'}>
                                                        {has}/{ing.qty}
                                                    </span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                <button
                                    onClick={() => {
                                        soundManager.play(skillName === 'Smithing' ? 'SMITH' : skillName === 'Cooking' ? 'COOK' : 'UI_CLICK');
                                        onCraft(selectedRecipe.id);
                                    }}
                                    disabled={!hasIngredients(selectedRecipe) || level < selectedRecipe.levelReq}
                                    className={`w-full py-3 font-bold text-lg rounded border-b-4 active:border-b-0 active:translate-y-1 transition-all
                                        ${hasIngredients(selectedRecipe) && level >= selectedRecipe.levelReq
                                            ? 'bg-[#005f00] border-[#003f00] text-white hover:bg-[#007f00]'
                                            : 'bg-[#3e3529] border-[#1a1510] text-[#5b5247] cursor-not-allowed'}
                                    `}
                                >
                                    Craft
                                </button>
                            </>
                        ) : (
                            <div className="flex-1 flex items-center justify-center text-[#5b5247] italic">
                                Select a recipe
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
