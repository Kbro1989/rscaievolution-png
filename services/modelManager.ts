
// This service manages the external assets for the High-Fidelity evolution tier.
// In a real production build, you would likely use a robust asset pipeline.
// For now, we point to a public GLB as a placeholder for the "Level 98" Evolution.

// Using standard Three.js example model which is reliable via CDN
export const MODEL_URL = "https://cdn.jsdelivr.net/gh/mrdoob/three.js@master/examples/models/gltf/Soldier.glb";

// Fallback/Cache logic keys
export const MODEL_CACHE_KEY = 'rsc_evo_model_v1';

export const getModelUrl = (evolutionLevel: number) => {
    // You could switch models based on level here
    // e.g. if (level > 110) return "god_model.glb";
    return MODEL_URL;
};
