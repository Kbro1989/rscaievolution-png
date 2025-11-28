
export type AssetCategory = 'Structure' | 'Prop' | 'Nature' | 'Character' | 'Item';
export type AssetTheme = 'Medieval' | 'Jungle' | 'Cave' | 'Desert' | 'Generic';

export interface RSCAssetDefinition {
    model: string; // Filename without extension
    category: AssetCategory;
    theme: AssetTheme;
    scale?: number; // Optional scale adjustment
}

// Keywords to map filenames to categories/themes
const THEME_KEYWORDS: Record<string, AssetTheme> = {
    'jungle': 'Jungle',
    'tribal': 'Jungle',
    'palm': 'Jungle',
    'cave': 'Cave',
    'stalagmite': 'Cave',
    'stalactite': 'Cave',
    'desert': 'Desert',
    'cactus': 'Desert',
    'pyramid': 'Desert',
    'mummy': 'Desert',
    'gnome': 'Generic', // Or Fantasy
    'elf': 'Generic',
    'dwarf': 'Generic',
};

const CATEGORY_KEYWORDS: Record<string, AssetCategory> = {
    'wall': 'Structure',
    'door': 'Structure',
    'window': 'Structure',
    'roof': 'Structure',
    'floor': 'Structure',
    'fence': 'Structure',
    'gate': 'Structure',
    'pillar': 'Structure',
    'column': 'Structure',
    'arch': 'Structure',
    'tower': 'Structure',
    'stairs': 'Structure',
    'bridge': 'Structure',
    'ladder': 'Structure',
    'statue': 'Structure',
    'fountain': 'Structure',
    'well': 'Structure',
    'sign': 'Structure',
    'grave': 'Structure',
    'tomb': 'Structure',
    'altar': 'Structure',
    'throne': 'Structure',

    'tree': 'Nature',
    'plant': 'Nature',
    'bush': 'Nature',
    'flower': 'Nature',
    'rock': 'Nature',
    'stone': 'Nature',
    'fern': 'Nature',
    'mushroom': 'Nature',
    'wheat': 'Nature',
    'water': 'Nature',
    'lava': 'Nature',

    'table': 'Prop',
    'chair': 'Prop',
    'bed': 'Prop',
    'bench': 'Prop',
    'stool': 'Prop',
    'crate': 'Prop',
    'barrel': 'Prop',
    'chest': 'Prop',
    'book': 'Prop',
    'candle': 'Prop',
    'torch': 'Prop',
    'lamp': 'Prop',
    'pot': 'Prop',
    'jug': 'Prop',
    'bowl': 'Prop',
    'plate': 'Prop',
    'cup': 'Prop',
    'sword': 'Item',
    'shield': 'Item',
    'helm': 'Item',
    'armour': 'Item',
    'skeleton': 'Character',
    'demon': 'Character',
    'dragon': 'Character',
    'man': 'Character',
    'woman': 'Character',
};

export function categorizeAsset(filename: string): RSCAssetDefinition {
    const lowerName = filename.toLowerCase();
    let theme: AssetTheme = 'Medieval'; // Default
    let category: AssetCategory = 'Prop'; // Default

    // Determine Theme
    for (const [keyword, t] of Object.entries(THEME_KEYWORDS)) {
        if (lowerName.includes(keyword)) {
            theme = t;
            break;
        }
    }

    // Determine Category
    for (const [keyword, c] of Object.entries(CATEGORY_KEYWORDS)) {
        if (lowerName.includes(keyword)) {
            category = c;
            break;
        }
    }

    // Special cases
    if (category === 'Prop' && (lowerName.includes('house') || lowerName.includes('shop') || lowerName.includes('hut'))) {
        category = 'Structure';
    }

    return {
        model: filename,
        category,
        theme,
        scale: 0.05 // RSC models are huge compared to Three.js units usually
    };
}

// Helper to get assets for a specific theme and category
export function getAssets(assets: string[], theme?: AssetTheme, category?: AssetCategory): string[] {
    return assets.filter(asset => {
        const def = categorizeAsset(asset);
        if (theme && def.theme !== theme) return false;
        if (category && def.category !== category) return false;
        return true;
    });
}
