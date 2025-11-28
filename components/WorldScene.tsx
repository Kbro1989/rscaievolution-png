import React from 'react';
import { PrecambrianScene } from './scenes/PrecambrianScene';
import { ModernEarthScene } from './scenes/ModernEarthScene';

// --- MAIN WORLD SCENE ---
export const WorldScene = (props: any) => {
    const { sceneType, playerState } = props;

    // Determine which scene to render
    // If sceneType is explicitly passed, use it.
    // Otherwise, fallback to playerState.currentScene or default to MAINLAND_GLOBE (Modern Earth)

    const activeScene = sceneType || playerState?.currentScene || 'MAINLAND_GLOBE';

    if (activeScene === 'TUTORIAL_ISLAND') {
        return <PrecambrianScene {...props} />;
    }

    // Default to Modern Earth for all other scene types for now
    return <ModernEarthScene {...props} />;
};

export default WorldScene;
