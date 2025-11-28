import React from 'react';
import { Canvas } from '@react-three/fiber';
import { Stars, Environment } from '@react-three/drei';

import { PlayerModel, WorldObjectRenderer, NPCRenderer, GroundItemRenderer } from '../WorldRenderers';
import * as THREE from 'three';

export const PrecambrianScene = ({
    playerState,
    worldObjects,
    npcs,
    groundItems,
    onMove,
    onInteract,
    onHover,
    onContextMenu,
    paths
}: any) => {
    const GLOBE_RADIUS = 500;
    const era = 0;

    // Use playerState position directly (or default to 0,0)
    const playerX = playerState?.position?.x || 0;
    const playerZ = playerState?.position?.z || 0;

    const handleGroundClick = (e: any) => {
        e.stopPropagation();
        // Convert world click position to game coordinates
        // We scaled world by 5, so divide by 5
        const gameX = e.point.x / 5;
        const gameZ = e.point.z / 5;

        if (onMove) {
            onMove(gameX, gameZ);
        }
    };

    return (
        <Canvas
            camera={{ position: [0, 100, 100], fov: 45 }} // Isometric-style view
            shadows
            style={{ width: '100%', height: '100%', background: '#000' }}
        >
            <ambientLight intensity={0.4} />
            <directionalLight
                position={[50, 100, 50]}
                intensity={0.8}
                castShadow
                shadow-mapSize-width={2048}
                shadow-mapSize-height={2048}
            />
            <pointLight position={[-50, 50, -50]} intensity={0.3} />
            <Stars radius={1500} depth={300} count={8000} factor={8} saturation={0} fade />
            <Environment preset="sunset" />

            {/* RSC WORLD - Flat plane */}
            <group>
                <mesh
                    rotation={[-Math.PI / 2, 0, 0]}
                    position={[0, -1, 0]}
                    receiveShadow
                    onClick={handleGroundClick}
                >
                    <planeGeometry args={[GLOBE_RADIUS * 10, GLOBE_RADIUS * 10, 100, 100]} />
                    <meshStandardMaterial
                        color="#2a3a2a"
                        roughness={0.8}
                        metalness={0.2}
                    />
                </mesh>
            </group>

            {/* PLAYER - Positioned on flat plane */}
            <group position={[playerX * 5, 0.5, playerZ * 5]}>
                <PlayerModel
                    evolutionLevel={playerState?.evolutionLevel || 0}
                    appearance={playerState?.appearance}
                    isMoving={false}
                />
            </group>

            {/* WORLD OBJECTS */}
            {(worldObjects || []).map((obj: any) => (
                <WorldObjectRenderer
                    key={obj.id}
                    data={obj}
                    era={era}
                    interactionProps={{
                        onClick: (e: any) => { e.stopPropagation(); onInteract(obj.id, 'OBJECT', obj.position); },
                        onPointerOver: (e: any) => { e.stopPropagation(); onHover(true, obj.name, 'cyan'); },
                        onPointerOut: (e: any) => { e.stopPropagation(); onHover(false); }
                    }}
                />
            ))}

            {/* NPCs */}
            {(npcs || []).map((n: any) => (
                <NPCRenderer
                    key={n.id}
                    npc={n}
                    era={era}
                    interactionProps={{
                        onClick: (e: any) => { e.stopPropagation(); onInteract(n.id, 'NPC', n.position); },
                        onPointerOver: (e: any) => { e.stopPropagation(); onHover(true, n.name, n.role === 'ENEMY' ? 'red' : 'yellow'); },
                        onPointerOut: (e: any) => { e.stopPropagation(); onHover(false); }
                    }}
                />
            ))}

            {/* GROUND ITEMS */}
            {(groundItems || []).map((g: any) => (
                <GroundItemRenderer
                    key={g.id}
                    item={g.item}
                    era={era}
                    interactionProps={{
                        position: [g.position.x * 5, 0, g.position.z * 5],
                        onClick: (e: any) => { e.stopPropagation(); onInteract(g.id, 'GROUND_ITEM', g.position); },
                        onContextMenu: (e: any) => {
                            e.stopPropagation();
                            onContextMenu({
                                x: e.nativeEvent.clientX,
                                y: e.nativeEvent.clientY,
                                title: g.item.name,
                                options: [
                                    { label: 'Take', action: () => onInteract(g.id, 'GROUND_ITEM', g.position) },
                                    { label: 'Examine', action: () => console.log('Examine:', g.item.name) }
                                ]
                            });
                        }
                    }}
                />
            ))}
        </Canvas>
    );
};
