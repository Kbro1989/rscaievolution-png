
import React, { useMemo } from 'react';
import * as THREE from 'three';
import { Html } from '@react-three/drei';
import { RSCModelLoader } from './RSCModelLoader';
import { categorizeAsset, getAssets, AssetTheme } from '../../services/assets/rscAssetMap';
import { RSC_ASSET_LIST } from '../../services/assets/rscAssetList';

interface CityProps {
    lat: number;
    lng: number;
    name: string;
    population?: number;
    radius?: number; // Globe radius
    era?: number;
    onClick?: (e: any) => void;
    onPointerOver?: () => void;
    onPointerOut?: () => void;
    label?: string;
    isLocked?: boolean;
    isCurrentLocation?: boolean;
}

// Helper to get position on sphere
const getPosition = (lat: number, lng: number, radius: number) => {
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lng + 180) * (Math.PI / 180);
    const x = -(radius * Math.sin(phi) * Math.cos(theta));
    const z = (radius * Math.sin(phi) * Math.sin(theta));
    const y = (radius * Math.cos(phi));
    return new THREE.Vector3(x, y, z);
};

export const City: React.FC<CityProps> = ({
    lat,
    lng,
    name,
    population = 1000,
    radius = 5,
    era = 0,
    onClick,
    onPointerOver,
    onPointerOut,
    label,
    isLocked,
    isCurrentLocation
}) => {
    const cityCenter = useMemo(() => getPosition(lat, lng, radius), [lat, lng, radius]);

    // Determine theme based on location/name
    const theme: AssetTheme = useMemo(() => {
        const lowerName = name.toLowerCase();
        if (lowerName.includes('carthage') || lowerName.includes('egypt') || lowerName.includes('babylon') || (lat < 30 && lat > -30 && lng > 20)) return 'Desert';
        if (lowerName.includes('maya') || lowerName.includes('aztec') || (lat < 20 && lat > -20 && lng < -30)) return 'Jungle';
        return 'Medieval';
    }, [name, lat, lng]);

    // Generate buildings
    const buildings = useMemo(() => {
        const count = Math.min(Math.max(Math.floor(population / 1000), 3), 15); // 3 to 15 buildings
        const items: { model: string, position: [number, number, number], rotation: [number, number, number], scale: number }[] = [];

        // Filter assets for this theme
        const structureAssets = getAssets(RSC_ASSET_LIST, theme, 'Structure');
        const propAssets = getAssets(RSC_ASSET_LIST, theme, 'Prop');

        // Fallback if no specific assets found
        const availableStructures = structureAssets.length > 0 ? structureAssets : getAssets(RSC_ASSET_LIST, 'Medieval', 'Structure');

        // Seeded random (simple hash)
        let seed = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        const random = () => {
            const x = Math.sin(seed++) * 10000;
            return x - Math.floor(x);
        };

        // Place central building
        if (availableStructures.length > 0) {
            const centerModel = availableStructures[Math.floor(random() * availableStructures.length)];
            items.push({
                model: centerModel,
                position: [0, 0, 0], // Relative to city center group
                rotation: [0, random() * Math.PI * 2, 0],
                scale: 0.05
            });
        }

        // Place surrounding buildings
        for (let i = 0; i < count; i++) {
            const angle = (i / count) * Math.PI * 2 + random();
            const dist = 0.05 + random() * 0.05; // Distance from center (in globe units)

            // Position on tangent plane
            const x = Math.cos(angle) * dist * 10; // Scale up for local group
            const z = Math.sin(angle) * dist * 10;

            const modelList = random() > 0.7 ? propAssets : availableStructures;
            if (modelList.length === 0) continue;

            const model = modelList[Math.floor(random() * modelList.length)];

            items.push({
                model: model,
                position: [x, 0, z],
                rotation: [0, random() * Math.PI * 2, 0],
                scale: 0.03 + random() * 0.02
            });
        }

        return items;
    }, [name, population, theme]);

    // Orientation: Look away from globe center
    const quaternion = useMemo(() => {
        const dummy = new THREE.Object3D();
        dummy.position.copy(cityCenter);
        dummy.lookAt(0, 0, 0); // Look at center
        return dummy.quaternion;
    }, [cityCenter]);

    return (
        <group
            position={cityCenter}
            quaternion={quaternion}
            onClick={onClick}
            onPointerOver={onPointerOver}
            onPointerOut={onPointerOut}
        >
            {/* Rotate 90 deg X to align with surface if needed */}
            <group rotation={[-Math.PI / 2, 0, 0]}>
                {buildings.map((b, i) => (
                    <RSCModelLoader
                        key={i}
                        modelName={b.model}
                        position={b.position}
                        rotation={b.rotation}
                        scale={b.scale}
                    />
                ))}
            </group>

            {/* UI Labels */}
            {isCurrentLocation && (
                <Html distanceFactor={10} position={[0, 0.5, 0]}>
                    <div className="flex flex-col items-center animate-bounce">
                        <div className="text-green-500 fill-green-500/50" style={{ width: 32, height: 32 }}>
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" /></svg>
                        </div>
                        <span className="bg-green-900/80 text-white text-xs font-bold px-2 py-0.5 border border-green-500 whitespace-nowrap rounded">YOU ARE HERE</span>
                    </div>
                </Html>
            )}

            <Html distanceFactor={12} position={[0, 0.2, 0]}>
                <div className={`text-xs font-bold ${isLocked ? 'text-red-500 border-red-500/50' : 'text-cyan-300 border-cyan-500/50'} bg-black/80 px-2 py-0.5 border backdrop-blur-sm whitespace-nowrap rounded`}>
                    {label || name} {isLocked ? '(LOCKED)' : (!isCurrentLocation ? '[TRAVEL]' : '')}
                </div>
            </Html>
        </group>
    );
};
