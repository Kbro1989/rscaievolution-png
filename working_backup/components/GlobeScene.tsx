
import React, { useRef, useEffect, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Html, Stars, Sparkles } from '@react-three/drei';
import * as THREE from 'three';
import { GlobeState, SceneType } from '../types';
import { X, MapPin } from 'lucide-react';

interface GlobeSceneProps {
    globeState: GlobeState;
    currentEra: number;
    currentScene?: SceneType;
    onTravel?: (targetId: string) => void;
    onClose?: () => void;
    isOverlay?: boolean;
}

// Helper to convert Lat/Lng to Vector3
const getPosition = (lat: number, lng: number, radius: number) => {
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lng + 180) * (Math.PI / 180);
    const x = -(radius * Math.sin(phi) * Math.cos(theta));
    const z = (radius * Math.sin(phi) * Math.sin(theta));
    const y = (radius * Math.cos(phi));
    return new THREE.Vector3(x, y, z);
};

const Globe = ({ globeState, currentEra, onTravel, currentScene }: GlobeSceneProps) => {
    const groupRef = useRef<THREE.Group>(null);
    const earthRadius = 5;

    // Auto-rotate to specific location if in a scene
    useEffect(() => {
        if (!groupRef.current || !currentScene || currentScene === 'MAINLAND_GLOBE' || currentScene === 'TUTORIAL_ISLAND') return;
        
        // Find marker for current scene
        const marker = globeState.markers.find(m => m.sceneTarget === currentScene);
        if (marker) {
            // Simple approach: Point camera towards marker or rotate globe
            // Since orbit controls handle camera, we rotate globe inverse to bring point to front (z+)
            // This is complex math, simplifying to just highlighting the marker
        }
    }, [currentScene, globeState.markers]);

    useFrame(() => {
        if (groupRef.current) {
            // Slow auto-rotation like the template
            groupRef.current.rotation.y += 0.001; 
        }
    });

    // Create points for a "Digital/Holographic" feel instead of a solid mesh
    const points = React.useMemo(() => {
        const pts = [];
        for (let i = 0; i < 2000; i++) {
            const lat = (Math.random() * 180) - 90;
            const lng = (Math.random() * 360) - 180;
            pts.push(getPosition(lat, lng, earthRadius));
        }
        return pts;
    }, []);

    const connectionCount = globeState.connectionCount || 1;

    return (
        <group ref={groupRef}>
            {/* Core Sphere (Dark/Solid) */}
            <mesh>
                <sphereGeometry args={[earthRadius - 0.1, 64, 64]} />
                <meshBasicMaterial color="#000000" />
            </mesh>

            {/* Dot Cloud (Simulating Cobe aesthetic) */}
            <points>
                <bufferGeometry>
                    <bufferAttribute
                        attach="attributes-position"
                        count={points.length}
                        array={new Float32Array(points.flatMap(v => [v.x, v.y, v.z]))}
                        itemSize={3}
                    />
                </bufferGeometry>
                <pointsMaterial size={0.05} color="#555555" />
            </points>

            {/* Wireframe Overlay (Tech Feel) */}
            <mesh>
                <sphereGeometry args={[earthRadius, 32, 32]} />
                <meshBasicMaterial color="#1a1a2e" wireframe transparent opacity={0.15} />
            </mesh>

            {/* Glow */}
            <mesh scale={[1.1, 1.1, 1.1]}>
                <sphereGeometry args={[earthRadius, 32, 32]} />
                <meshBasicMaterial color="#0f3460" transparent opacity={0.05} side={THREE.BackSide} />
            </mesh>

            {/* Player Markers (Red/Gold dots) */}
            {globeState.players.map(p => {
                const pos = getPosition(p.lat, p.lng, earthRadius);
                return (
                    <mesh key={p.id} position={pos}>
                        <sphereGeometry args={[0.08, 8, 8]} />
                        <meshBasicMaterial color={p.id.includes('#1') ? 'gold' : '#ef4444'} />
                        {p.id === '#1' && (
                            <Html distanceFactor={15}>
                                <div className="text-[8px] text-gold bg-black/50 px-1 whitespace-nowrap border border-gold/20">
                                    {p.name}
                                </div>
                            </Html>
                        )}
                    </mesh>
                );
            })}

            {/* Points of Interest (City/Dungeon Markers) */}
            {globeState.markers.map(m => {
                const pos = getPosition(m.lat, m.lng, earthRadius);
                const isLocked = (m.eraRequired || 0) > currentEra;
                const isCurrentLocation = m.sceneTarget === currentScene;
                const color = isCurrentLocation ? '#00ff00' : (isLocked ? '#ff0000' : (m.type === 'DUNGEON' ? '#ff00ff' : '#00ffff'));
                
                return (
                    <group 
                        key={m.id} 
                        position={pos}
                        onClick={(e) => { e.stopPropagation(); if(!isLocked && onTravel) onTravel(m.id); }}
                        onPointerOver={() => { document.body.style.cursor = isLocked ? 'not-allowed' : 'pointer'; }}
                        onPointerOut={() => { document.body.style.cursor = 'default'; }}
                    >
                        <mesh>
                            <boxGeometry args={[0.15, 0.15, 0.15]} />
                            <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5} />
                        </mesh>
                        <mesh position={[0, 0.5, 0]}>
                            <cylinderGeometry args={[0.02, 0.02, 1]} />
                            <meshBasicMaterial color={color} transparent opacity={0.3} />
                        </mesh>
                        
                        {isCurrentLocation && (
                             <Html distanceFactor={10} position={[0, 1.5, 0]}>
                                <div className="flex flex-col items-center animate-bounce">
                                    <MapPin size={24} className="text-green-500 fill-green-500/50" />
                                    <span className="bg-green-900/80 text-white text-[10px] px-1 border border-green-500 whitespace-nowrap">YOU ARE HERE</span>
                                </div>
                             </Html>
                        )}

                        <Html distanceFactor={12}>
                            <div className={`text-[10px] ${isLocked ? 'text-red-500 border-red-500/50' : 'text-cyan-300 border-cyan-500/50'} bg-black/80 px-1 border backdrop-blur-sm whitespace-nowrap`}>
                                {m.label} {isLocked ? `(ERA ${m.eraRequired})` : (!isCurrentLocation ? '[TRAVEL]' : '')}
                            </div>
                        </Html>
                    </group>
                );
            })}
        </group>
    );
};

export const GlobeScene: React.FC<GlobeSceneProps> = ({ globeState, currentEra, onTravel, onClose, isOverlay, currentScene }) => {
    return (
        <div className="w-full h-full relative bg-black">
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10 text-center pointer-events-none">
                <h1 className="text-white text-2xl font-bold tracking-wider drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]">
                    GLOBAL UPLINK
                </h1>
                <div className="mt-2 bg-zinc-900/80 border border-zinc-700 px-4 py-2 rounded-full inline-flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-zinc-300 text-sm font-mono">
                        <b>{globeState.connectionCount || 1}</b> NODES ACTIVE
                    </span>
                </div>
            </div>

            {isOverlay && onClose && (
                <div className="absolute top-4 right-4 z-50 pointer-events-auto">
                    <button 
                        onClick={onClose}
                        className="bg-red-900/80 hover:bg-red-800 border-2 border-red-500 text-white font-bold py-2 px-6 flex items-center gap-2 rounded shadow-lg backdrop-blur-md"
                    >
                        <X size={20} />
                        RETURN TO GAME
                    </button>
                </div>
            )}

            <Canvas camera={{ position: [0, 0, 12], fov: 45 }}>
                <color attach="background" args={['#000000']} />
                <ambientLight intensity={0.5} />
                <pointLight position={[20, 20, 20]} intensity={1} />
                <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade />
                
                <Globe globeState={globeState} currentEra={currentEra} onTravel={onTravel} currentScene={currentScene} />
                
                <OrbitControls enablePan={false} minDistance={7} maxDistance={20} autoRotate autoRotateSpeed={0.5} />
                
                <Html fullscreen style={{ pointerEvents: 'none' }}>
                    <div className="absolute bottom-4 left-4 font-vt323 text-zinc-500 text-sm">
                        ERA: {currentEra >= 2 ? 'DARK AGES' : 'PRIMITIVE'} // SERVER: GLOBAL_01
                    </div>
                </Html>
            </Canvas>
        </div>
    );
};
