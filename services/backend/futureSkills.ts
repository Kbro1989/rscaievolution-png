/**
 * futureSkills.ts
 * 
 * This file serves as a repository for future skill ideas, mechanics, and definitions 
 * that are planned but not yet implemented.
 */

export const FUTURE_SKILL_IDEAS = {
    RUNECRAFTING: {
        description: "Crafting magical runes at mysterious altars.",
        mechanics: [
            "Locate hidden altars using a talisman.",
            "Mine rune essence.",
            "Imbue essence at altars to create runes.",
            "Higher levels allow crafting multiple runes per essence."
        ],
        items: ["Rune Essence", "Air Talisman", "Mind Talisman", "Water Talisman"],
        eras: ["Ancient Village", "Lost Civilization"]
    },
    CONSTRUCTION_EXPANSION: {
        description: "Building player-owned houses and guild halls.",
        mechanics: [
            "Purchase land deeds.",
            "Design room layouts.",
            "Build furniture using materials (planks, nails, cloth).",
            "Hire servants."
        ],
        items: ["Saw", "Hammer", "Limestone Brick", "Gold Leaf"],
        eras: ["Medieval Era", "Renaissance"]
    },
    ARCHAEOLOGY: {
        description: "Uncovering artifacts from past eras to learn about history and gain powers.",
        mechanics: [
            "Excavate dig sites.",
            "Clean finds at a screening station.",
            "Restore artifacts using materials.",
            "Donate to museum or use for buffs."
        ],
        items: ["Archaeology Journal", "Soil", "Broken Vase", "Restored Vase"],
        eras: ["Information Age", "Atomic Age"]
    },
    INVENTION: {
        description: "Disassembling items to get components and creating new devices.",
        mechanics: [
            "Disassemble unwanted items for parts.",
            "Discover blueprints.",
            "Manufacture devices (augmentors, siphons, machines).",
            "Augment weapons and armor with perks."
        ],
        items: ["Augmentor", "Weapon Gizmo", "Tool Gizmo"],
        eras: ["Industrial Era", "Atomic Age", "Information Age"]
    }
};
