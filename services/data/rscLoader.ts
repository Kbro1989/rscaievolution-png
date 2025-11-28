// RSC Data Loader - Access 2003scape game definitions
import itemsData from './rsc/items.json';
import npcsData from './rsc/npcs.json';
import objectsData from './rsc/objects.json';
import spellsData from './rsc/spells.json';
import prayersData from './rsc/prayers.json';

// RSC Data Types (matching actual JSON structure)
export interface RSCItem {
    name: string;
    description: string;
    command: string;
    sprite: number;
    price: number;
    stackable: boolean;
    special: boolean;
    equip: string[] | null;
    colour: string | null;
    untradeable: boolean;
    members: boolean;
}

export interface RSCNPC {
    name: string;
    description: string;
    command: string;
    attack: number;
    strength: number;
    hits: number;
    defense: number;
    hostility: string; // "retreats", "fights back", "aggressive"
    animations: number[];
    hairColour: string;
    topColour: string;
    bottomColour: string;
    skinColour: string;
    width: number;
    combatLevel?: number;
    combatAnimation?: number;
}

export interface RSCObject {
    name: string;
    description: string;
    commands: string[];
    model: {
        name: string;
        id: number;
    };
    width: number;
    height: number;
    type: string;
    itemHeight: number;
}

export interface RSCSpell {
    name: string;
    description: string;
    level: number;
    runes: { id: number; amount: number }[];
    experience?: number;
    type?: string;
}

export interface RSCPrayer {
    name: string;
    description: string;
    level: number;
    drain: number; // Drain rate per minute
}

// Loaders
// RSC uses array index as ID for most things, or we search by name

export const getRSCItem = (index: number): RSCItem | undefined => {
    return (itemsData as RSCItem[])[index];
};

export const getRSCItemByName = (name: string): RSCItem | undefined => {
    return (itemsData as RSCItem[]).find(item =>
        item.name.toLowerCase() === name.toLowerCase()
    );
};

export const getRSCNPC = (index: number): RSCNPC | undefined => {
    return (npcsData as RSCNPC[])[index];
};

export const getRSCNPCByName = (name: string): RSCNPC | undefined => {
    return (npcsData as RSCNPC[]).find(npc =>
        npc.name.toLowerCase() === name.toLowerCase()
    );
};

export const getRSCObject = (index: number): RSCObject | undefined => {
    return (objectsData as RSCObject[])[index];
};

export const getRSCObjectByName = (name: string): RSCObject | undefined => {
    return (objectsData as RSCObject[]).find(obj =>
        obj.name.toLowerCase() === name.toLowerCase()
    );
};

export const getRSCSpell = (index: number): RSCSpell | undefined => {
    return (spellsData as RSCSpell[])[index];
};

export const getRSCPrayer = (index: number): RSCPrayer | undefined => {
    return (prayersData as RSCPrayer[])[index];
};

// Export all data
export const RSC_DATA = {
    items: itemsData as RSCItem[],
    npcs: npcsData as RSCNPC[],
    objects: objectsData as RSCObject[],
    spells: spellsData as RSCSpell[],
    prayers: prayersData as RSCPrayer[],
};

// Example mapping to your game format
export const mapRSCItemToGame = (rscItem: RSCItem) => {
    const isWearable = rscItem.equip !== null && rscItem.equip.length > 0;
    return {
        id: rscItem.name.toLowerCase().replace(/ /g, '_'),
        name: rscItem.name,
        description: rscItem.description,
        type: isWearable ? 'ARMOR' : 'MISC',
        tags: rscItem.stackable ? ['TAG_STACKABLE'] : [],
        price: rscItem.price,
        tradeable: !rscItem.untradeable,
        icon: '📦', // Default, sprite index available at rscItem.sprite
    };
};
