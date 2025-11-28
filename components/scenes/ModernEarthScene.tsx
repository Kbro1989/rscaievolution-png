import React from 'react';
import { Canvas } from '@react-three/fiber';
import { Stars, Environment } from '@react-three/drei';
import { PlayableGlobe } from '../globe/PlayableGlobe';
import { latLonToCartesian } from '../../src/utils/sphericalMath';
import { useSphericalMovement } from '../../src/hooks/useSphericalMovement';
import { PlayerModel, WorldObjectRenderer, NPCRenderer, GroundItemRenderer } from '../WorldRenderers';

export const ModernEarthScene = ({
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
    const { position, setPosition } = useSphericalMovement(100);
    const era = playerState?.evolutionLevel ? Math.floor(playerState.evolutionLevel / 10) : 1;

    // Sync player movement
    React.useEffect(() => {
        if (onMove) {
            onMove(position.lat, position.lon);
        }
    }, [position, onMove]);

    return (
        <Canvas
            camera={{ position: [0, 5, 10], fov: 60 }}
            shadows
            style={{ width: '100%', height: '100%', background: '#000' }}
        >
            <ambientLight intensity={0.5} />
            <directionalLight
                position={[10, 20, 10]}
                intensity={0.8}
                castShadow
                shadow-mapSize-width={2048}
                shadow-mapSize-height={2048}
            />
            <pointLight position={[-10, 10, -10]} intensity={0.3} />
            <Stars radius={300} depth={60} count={5000} factor={7} saturation={0} fade />
            <Environment preset="night" />

            {/* MODERN EARTH GLOBE */}
            <PlayableGlobe
                radius={100}
                playerPosition={position}
                onPlayerMove={(lat: number, lon: number) => setPosition({ lat, lon })}
                paths={paths || []}
                variant="EARTH"
            />

            {/* PLAYER */}
            <group position={latLonToCartesian(position.lat, position.lon, 100)}>
                <PlayerModel evolutionLevel={playerState?.evolutionLevel || 1} />
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
                        position: [g.position.x, 0, g.position.z],
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
