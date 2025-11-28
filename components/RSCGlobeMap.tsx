import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Stars, OrbitControls, useTexture } from '@react-three/drei';
import { PlayableGlobe } from './globe/PlayableGlobe';
import { latLonToCartesian } from '../src/utils/sphericalMath';
import * as THREE from 'three';

interface RSCGlobeMapProps {
    playerLat: number;
    playerLon: number;
    onClose: () => void;
}

const RotatingGlobe = ({ playerLat, playerLon }: { playerLat: number; playerLon: number }) => {
    const globeRef = useRef<THREE.Group>(null);
    const GLOBE_RADIUS = 500;

    // Load RSC world map texture
    const mapTexture = useTexture('/textures/rsc_world_map_placeholder.png');

    useFrame(() => {
        if (globeRef.current) {
            globeRef.current.rotation.y += 0.001; // Slow rotation
        }
    });

    const playerPos = latLonToCartesian(playerLat, playerLon, GLOBE_RADIUS);

    return (
        <group ref={globeRef}>
            <PlayableGlobe
                radius={GLOBE_RADIUS}
                playerPosition={{ lat: playerLat, lon: playerLon }}
                onPlayerMove={() => { }}
                paths={[]}
                variant="TUTORIAL"
                mapTexture={mapTexture}
            />

            {/* "You are here" Marker */}
            <group position={playerPos}>
                {/* Blinking dot */}
                <mesh>
                    <sphereGeometry args={[5, 16, 16]} />
                    <meshBasicMaterial color="red" />
                </mesh>
                {/* Label */}
                <group position={[0, 10, 0]} rotation={[0, Math.PI, 0]}>
                    {/* Simple billboard text could go here, for now just a marker */}
                </group>
            </group>
        </group>
    );
};

export const RSCGlobeMap: React.FC<RSCGlobeMapProps> = ({ playerLat, playerLon, onClose }) => {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
            <div className="relative w-[80vw] h-[80vh] bg-[#1a1a1a] border-2 border-[#5d5244] rounded-lg overflow-hidden shadow-2xl">
                {/* Header */}
                <div className="absolute top-0 left-0 right-0 h-12 bg-[#2b2b2b] border-b border-[#5d5244] flex items-center justify-between px-4 z-10">
                    <h2 className="text-[#ff981f] font-bold text-xl font-rsc-font">World Map</h2>
                    <button
                        onClick={onClose}
                        className="text-[#ff981f] hover:text-white font-bold text-xl"
                    >
                        X
                    </button>
                </div>

                {/* Globe View */}
                <div className="w-full h-full pt-12">
                    <Canvas camera={{ position: [0, 0, 1200], fov: 45 }}>
                        <ambientLight intensity={0.5} />
                        <pointLight position={[1000, 1000, 1000]} intensity={1} />
                        <Stars radius={2000} count={5000} factor={4} fade />

                        <RotatingGlobe playerLat={playerLat} playerLon={playerLon} />

                        <OrbitControls
                            enablePan={false}
                            minDistance={600}
                            maxDistance={1500}
                            autoRotate={false}
                        />
                    </Canvas>
                </div>

                {/* Legend / Info */}
                <div className="absolute bottom-4 left-4 bg-[#2b2b2b]/90 p-4 border border-[#5d5244] rounded text-[#ff981f] font-rsc-font text-sm">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse"></div>
                        <span>You are here</span>
                    </div>
                    <p>Click and drag to rotate view</p>
                </div>
            </div>
        </div>
    );
};
