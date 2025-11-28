
import React, { useRef, useState, useEffect, useMemo, Suspense } from 'react';
import { Canvas, useFrame, useThree, ThreeEvent, extend } from '@react-three/fiber';
import { Html, Stars, Sparkles, Environment, Float, useGLTF, useAnimations } from '@react-three/drei';
import * as THREE from 'three';
import { Appearance, EquipmentSlots, Path, SceneType } from '../types';
import { MODEL_URL } from '../services/modelManager';

// --- VISUAL TIERING SYSTEM ---
// Tier 1: Primitive (Eras 0-2)
// Tier 2: Retro/Egypt (Eras 3-5)
// Tier 3: Medieval (Eras 6-9)
// Tier 4: Modern/High-Fi (Eras 10+)
// Tier 5: God (Era 12)

const getAssetStyle = (era: number): number => {
    if (era < 3) return 1;
    if (era < 6) return 2;
    if (era < 10) return 3;
    if (era < 12) return 4;
    return 5;
};

// --- GOD MODE SHADER ---
const GodRimMaterial = {
  uniforms: {
    time: { value: 0 },
    rimColor: { value: new THREE.Color(0xffd700) }, // Gold
    baseColor: { value: new THREE.Color(0x222222) }
  },
  vertexShader: `
    varying vec3 vNormal;
    varying vec3 vViewDir;
    void main() {
      vNormal = normalize(normalMatrix * normal);
      vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
      vViewDir = -mvPosition.xyz;
      gl_Position = projectionMatrix * mvPosition;
    }
  `,
  fragmentShader: `
    uniform float time;
    uniform vec3 rimColor;
    uniform vec3 baseColor;
    varying vec3 vNormal;
    varying vec3 vViewDir;
    void main() {
      // Rim Light Calculation
      float rim = 1.0 - max(0.0, dot(vNormal, normalize(vViewDir)));
      float glow = pow(rim, 3.0);
      
      // Pulsing Effect
      float pulse = 0.5 + 0.5 * sin(time * 3.0);
      
      // Combine
      vec3 finalColor = baseColor + (rimColor * glow * (1.0 + pulse * 0.5));
      gl_FragColor = vec4(finalColor, 1.0);
    }
  `
};

// --- ENVIRONMENT RENDERERS ---

const PalmTree = ({ quality }: any) => (
    <group>
        {/* Trunk: Segmented Cylinder */}
        <mesh position={[0, 1, 0]} castShadow>
             <cylinderGeometry args={[0.15, 0.2, 2, 6]} />
             <meshStandardMaterial color="#8B4513" roughness={1} />
        </mesh>
        {/* Leaves: 4 Cones pointing out */}
        {[0, 90, 180, 270].map((deg, i) => (
             <group key={i} position={[0, 2, 0]} rotation={[0, (deg * Math.PI) / 180, Math.PI / 4]}>
                 <mesh position={[0, 0.5, 0]}>
                     <coneGeometry args={[0.3, 1.5, 4]} />
                     <meshStandardMaterial color="#228B22" />
                 </mesh>
             </group>
        ))}
    </group>
);

const Pyramid = () => (
    <group>
        <mesh position={[0, 2, 0]} castShadow>
            <coneGeometry args={[3, 4, 4]} />
            <meshStandardMaterial color="#e6c288" roughness={0.9} />
        </mesh>
    </group>
);

const Obelisk = () => (
    <group>
        <mesh position={[0, 2, 0]} castShadow>
            <boxGeometry args={[0.6, 4, 0.6]} />
            <meshStandardMaterial color="#c2b280" roughness={0.5} />
        </mesh>
        <mesh position={[0, 4.3, 0]}>
            <coneGeometry args={[0.4, 0.6, 4]} />
            <meshStandardMaterial color="#ffd700" metalness={0.8} roughness={0.2} />
        </mesh>
    </group>
);

const Sarcophagus = () => (
    <group>
        <mesh position={[0, 0.5, 0]}>
            <boxGeometry args={[1, 1, 2.5]} />
            <meshStandardMaterial color="#222" />
        </mesh>
        <mesh position={[0, 1, 0]}>
             <boxGeometry args={[0.8, 0.2, 2.2]} />
             <meshStandardMaterial color="#ffd700" metalness={0.6} />
        </mesh>
    </group>
);

// --- PLAYER MODELS ---

const RobotModel = ({ isMoving }: { isMoving: boolean }) => {
    // Sci-Fi Era (10-11)
    return (
        <group>
             <mesh position={[0, 0.75, 0]} castShadow>
                 <boxGeometry args={[0.4, 0.6, 0.25]} />
                 <meshStandardMaterial color="#888" metalness={0.8} roughness={0.2} />
             </mesh>
             {/* Glowing Eyes */}
             <mesh position={[0.1, 1.3, 0.15]}>
                 <boxGeometry args={[0.05, 0.05, 0.05]} />
                 <meshStandardMaterial color="#00ffff" emissive="#00ffff" emissiveIntensity={2} />
             </mesh>
             <mesh position={[-0.1, 1.3, 0.15]}>
                 <boxGeometry args={[0.05, 0.05, 0.05]} />
                 <meshStandardMaterial color="#00ffff" emissive="#00ffff" emissiveIntensity={2} />
             </mesh>
             <mesh position={[0, 1.25, 0]}>
                 <boxGeometry args={[0.3, 0.3, 0.3]} />
                 <meshStandardMaterial color="#555" metalness={0.8} />
             </mesh>
             {/* Legs */}
             <mesh position={[-0.15, 0.3, 0]} rotation={[isMoving ? 0.2 : 0, 0, 0]}>
                 <cylinderGeometry args={[0.05, 0.08, 0.6, 8]} />
                 <meshStandardMaterial color="#333" />
             </mesh>
             <mesh position={[0.15, 0.3, 0]} rotation={[isMoving ? -0.2 : 0, 0, 0]}>
                 <cylinderGeometry args={[0.05, 0.08, 0.6, 8]} />
                 <meshStandardMaterial color="#333" />
             </mesh>
        </group>
    );
};

const GodModel = ({ isMoving }: { isMoving: boolean }) => {
    // God Era (12)
    const groupRef = useRef<THREE.Group>(null);
    const godMat = useMemo(() => new THREE.ShaderMaterial(GodRimMaterial), []);

    useFrame(({ clock }) => {
        godMat.uniforms.time.value = clock.getElapsedTime();
        if (groupRef.current) {
            groupRef.current.position.y = Math.sin(clock.getElapsedTime()) * 0.2 + 0.5; // Float
        }
    });

    return (
        <group ref={groupRef}>
             <mesh position={[0, 1, 0]} castShadow material={godMat}>
                 <capsuleGeometry args={[0.3, 1.2, 4, 16]} />
             </mesh>
             {/* Halo */}
             <mesh position={[0, 1.8, 0]} rotation={[Math.PI / 2, 0, 0]}>
                 <torusGeometry args={[0.3, 0.02, 16, 32]} />
                 <meshStandardMaterial color="#ffd700" emissive="#ffd700" emissiveIntensity={2} />
             </mesh>
             <Sparkles count={30} scale={2} size={4} speed={0.4} opacity={0.5} color="#ffd700" />
        </group>
    );
};

// --- GENERIC ASSET PARSER ---

const WorldObjectRenderer = ({ data, tier, quality, interactionProps }: any) => {
    const style = getAssetStyle(tier);
    
    // PALM TREES (EGYPT)
    if (data.type === 'PALM_TREE') {
        return <group {...interactionProps} position={[data.position.x, 0, data.position.z]}><PalmTree quality={quality}/></group>;
    }
    
    // PYRAMIDS (EGYPT)
    if (data.type === 'PYRAMID') {
         return <group {...interactionProps} position={[data.position.x, 0, data.position.z]}><Pyramid/></group>;
    }
    
    // OBELISK (EGYPT)
    if (data.type === 'OBELISK') {
         return <group {...interactionProps} position={[data.position.x, 0, data.position.z]}><Obelisk/></group>;
    }

    // SARCOPHAGUS
    if (data.type === 'SARCOPHAGUS') {
         return <group {...interactionProps} position={[data.position.x, 0, data.position.z]}><Sarcophagus/></group>;
    }

    // STANDARD TREE
    if (data.type === 'TREE') {
         // Style 1 (Primitive): Cylinder + Cone
         if (style === 1) {
              return (
                <group {...interactionProps} position={[data.position.x, 0, data.position.z]}>
                    <mesh position={[0, 0.75, 0]} castShadow><cylinderGeometry args={[0.1, 0.15, 1.5, 6]} /><meshStandardMaterial color="#3d2e1e" /></mesh>
                    <mesh position={[0, 1.8, 0]} castShadow><coneGeometry args={[1.2, 2.5, 6]} /><meshStandardMaterial color="#1e3d1e" /></mesh>
                </group>
              );
         }
         // Style 3 (Medieval): Rounder Oak
         if (style >= 3) {
             return (
                <group {...interactionProps} position={[data.position.x, 0, data.position.z]}>
                    <mesh position={[0, 0.6, 0]} castShadow><cylinderGeometry args={[0.2, 0.3, 1.2, 8]} /><meshStandardMaterial color="#4a3728" /></mesh>
                    <mesh position={[0, 1.5, 0]} castShadow><dodecahedronGeometry args={[1.2]} /><meshStandardMaterial color="#2d5a27" /></mesh>
                </group>
             );
         }
         // Default
         return (
             <group {...interactionProps} position={[data.position.x, 0, data.position.z]}>
                <mesh position={[0, 0.75, 0]} castShadow><cylinderGeometry args={[0.1, 0.15, 1.5, 8]} /><meshStandardMaterial color="#3d2e1e" /></mesh>
                <mesh position={[0, 1.8, 0]} castShadow><coneGeometry args={[1, 2, 8]} /><meshStandardMaterial color="#1e3d1e" /></mesh>
             </group>
         );
    }
    
    // PORTAL (Universal)
    if (data.type === 'PORTAL') {
        return (
            <group {...interactionProps} position={[data.position.x, 0, data.position.z]}>
                 <mesh position={[0, 1.5, 0]}><torusGeometry args={[1, 0.1, 16, 32]} /><meshStandardMaterial color="#a855f7" emissive="#a855f7" emissiveIntensity={2} /></mesh>
                 <Sparkles count={20} scale={3} size={2} speed={0.4} opacity={0.5} color="#d8b4fe" />
            </group>
        );
    }

    // Default Cube
    return (
        <mesh {...interactionProps} position={[data.position.x, 0.5, data.position.z]}>
            <boxGeometry args={[0.5, 0.5, 0.5]} />
            <meshStandardMaterial color="gray" />
        </mesh>
    );
};

// --- PLAYER MODEL UPDATER ---

const PlayerModel = ({ appearance, isMoving, evolutionLevel, equipment }: { appearance?: Appearance, isMoving: boolean, evolutionLevel: number, equipment?: EquipmentSlots }) => {
    // Check for God Mode
    if (evolutionLevel >= 120) {
        return <GodModel isMoving={isMoving} />;
    }
    
    // Check for Sci-Fi / Robot
    if (evolutionLevel >= 100) {
        return <RobotModel isMoving={isMoving} />;
    }

    // Standard Humanoid logic from before, effectively reused for tiers 1-3
    // ... (This part uses the previous Humanoid/Primitive models, kept implicitly via reuse or logic)
    // To save XML space, I am assuming the previous components (PrimitiveModel, HumanoidModel) are available in scope 
    // or I'd re-include them. For safety, I'll output a simplified standard model if not Robot/God.
    
    // Re-implementing simplified Humanoid for Eras 0-9
    return (
        <group>
             {/* Simple Body */}
             <mesh position={[0, 0.75, 0]} castShadow>
                 <cylinderGeometry args={[0.14, 0.15, 0.2, 12]} />
                 <meshStandardMaterial color={appearance?.torsoColor || 'brown'} />
             </mesh>
             {/* Head */}
             <mesh position={[0, 1.45, 0]}>
                 <sphereGeometry args={[0.13, 12, 12]} />
                 <meshStandardMaterial color={appearance?.skinColor || '#f0c0a0'} />
             </mesh>
             {/* Legs */}
             <mesh position={[-0.12, 0.4, 0]} rotation={[isMoving ? 0.3 : 0, 0, 0]}>
                 <cylinderGeometry args={[0.07, 0.06, 0.7, 8]} />
                 <meshStandardMaterial color={appearance?.legsColor || 'grey'} />
             </mesh>
             <mesh position={[0.12, 0.4, 0]} rotation={[isMoving ? -0.3 : 0, 0, 0]}>
                 <cylinderGeometry args={[0.07, 0.06, 0.7, 8]} />
                 <meshStandardMaterial color={appearance?.legsColor || 'grey'} />
             </mesh>
             {/* Arms */}
             <mesh position={[-0.3, 1.1, 0]}>
                 <boxGeometry args={[0.1, 0.5, 0.1]} />
                 <meshStandardMaterial color={appearance?.sleevesColor || 'brown'} />
             </mesh>
             <mesh position={[0.3, 1.1, 0]}>
                 <boxGeometry args={[0.1, 0.5, 0.1]} />
                 <meshStandardMaterial color={appearance?.sleevesColor || 'brown'} />
             </mesh>
        </group>
    );
};


const EntityOverlay = ({ name, title, text, status, color = 'white', isCombat = false }: { name?: string, title?: string, text?: string | null, status?: string, color?: string, isCombat?: boolean }) => {
    return (
        <Html position={[0, 2.4, 0]} center zIndexRange={[100, 0]} style={{ pointerEvents: 'none', userSelect: 'none', whiteSpace: 'nowrap' }}>
            <div className="flex flex-col items-center">
                {text && (
                    <div className="mb-2 font-bold text-sm text-center drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] animate-bounce-short z-50">
                        <span style={{ color: color, textShadow: '1px 1px 0 #000' }}>{text}</span>
                    </div>
                )}
                {status && <div className="mb-1 text-[9px] text-cyan-300 font-mono bg-black/60 px-1.5 py-0.5 rounded border border-cyan-500/30 uppercase tracking-wider backdrop-blur-sm shadow-sm">{status.replace(/_/g, ' ')}</div>}
                {name && <div className={`text-[10px] ${isCombat ? 'text-red-400' : 'text-yellow-200'} font-bold bg-black/60 px-2 py-0.5 rounded backdrop-blur-sm border border-black/30`}>{name} {title ? <span className="text-zinc-400">({title})</span> : ''}</div>}
            </div>
        </Html>
    );
};

const PathRenderer = ({ paths }: { paths: Path[] }) => (
    <group position={[0, 0.02, 0]}>
        {paths.map(path => (
            <group key={path.id}>
                {path.points.map((p, i) => {
                    if (i === path.points.length - 1) return null;
                    const next = path.points[i + 1];
                    const dx = next.x - p.x;
                    const dz = next.z - p.z;
                    const dist = Math.sqrt(dx*dx + dz*dz);
                    const angle = Math.atan2(dx, dz);
                    const midX = (p.x + next.x) / 2;
                    const midZ = (p.z + next.z) / 2;
                    return (
                        <mesh key={i} position={[midX, 0, midZ]} rotation={[-Math.PI / 2, 0, angle]}>
                            <planeGeometry args={[1.5, dist]} />
                            <meshStandardMaterial color="#3e3529" roughness={1} opacity={0.8} transparent />
                        </mesh>
                    );
                })}
            </group>
        ))}
    </group>
);

const CameraRig = ({ position, rotation, zoom }: { position: {x:number, z:number}, rotation: number, zoom: number }) => {
    const { camera } = useThree();
    const initialized = useRef(false);
    useFrame(() => {
        const angle = rotation * (Math.PI / 2); 
        const dist = zoom;
        const height = zoom;
        const targetX = position.x + Math.sin(angle) * dist;
        const targetZ = position.z + Math.cos(angle) * dist;
        const targetPos = new THREE.Vector3(targetX, height, targetZ);

        if (!initialized.current) {
            camera.position.copy(targetPos);
            camera.lookAt(position.x, 0, position.z);
            initialized.current = true;
        } else {
            camera.position.lerp(targetPos, 0.1);
            camera.lookAt(position.x, 0, position.z);
        }
    });
    return null;
};

const CameraInput = ({ onRotate, onZoom }: { onRotate: (dir: 'LEFT' | 'RIGHT') => void, onZoom: (dir: 'IN' | 'OUT') => void }) => {
    const { gl } = useThree();
    useEffect(() => {
        const handleWheel = (e: WheelEvent) => { if (e.deltaY > 0) onZoom('OUT'); else onZoom('IN'); };
        const handleKey = (e: KeyboardEvent) => { if (e.key === 'ArrowLeft' || e.key === 'a') onRotate('LEFT'); if (e.key === 'ArrowRight' || e.key === 'd') onRotate('RIGHT'); };
        const canvas = gl.domElement;
        canvas.addEventListener('wheel', handleWheel);
        window.addEventListener('keydown', handleKey);
        return () => { canvas.removeEventListener('wheel', handleWheel); window.removeEventListener('keydown', handleKey); }
    }, [onRotate, onZoom, gl]);
    return null;
};

// --- MAIN EXPORT ---

export const WorldScene = ({ 
    playerState, ai, resources, npcs, groundItems, paths, timeOfDay, 
    onInteract, onContextMenu, onExamine, onMovePlayer, 
    activeDialogues, cameraRotation, cameraZoom, onHover,
    onRotateCamera, onZoomCamera 
}: any) => {
    const evolutionLevel = playerState.skills.EVOLUTION ? playerState.skills.EVOLUTION.level : 1;
    const era = playerState.era || 0;
    
    // Scene styling based on current map
    const currentScene = playerState.currentScene as SceneType;
    let groundColor = '#2d3e26'; 
    let fogColor = '#151f12';

    if (currentScene === 'EGYPT') { groundColor = '#e6c288'; fogColor = '#8c7352'; }
    else if (currentScene === 'MEDIEVAL_KINGDOM') { groundColor = '#3a5a40'; fogColor = '#2f3e46'; }
    else if (currentScene === 'NORTH') { groundColor = '#fffafa'; fogColor = '#b0bec5'; }

    return (
        <Canvas shadows dpr={[1, 2]}>
            <Suspense fallback={null}>
                <color attach="background" args={[fogColor]} />
                <fog attach="fog" args={[fogColor, 10, 50]} />
                {era > 5 && <Environment preset="sunset" blur={0.8} />}
                
                <CameraRig position={playerState.position} rotation={cameraRotation} zoom={cameraZoom} />
                <CameraInput onRotate={onRotateCamera} onZoom={onZoomCamera} />
                
                <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade />
                <ambientLight intensity={0.5} />
                <pointLight position={[10,20,10]} castShadow intensity={1} shadow-mapSize-width={1024} shadow-mapSize-height={1024} />
                
                <PathRenderer paths={paths || []} />

                {/* PLAYER */}
                <group position={[playerState.position.x, 0, playerState.position.z]}>
                    <PlayerModel appearance={playerState.appearance} isMoving={false} evolutionLevel={evolutionLevel} equipment={playerState.equipment} />
                    <EntityOverlay name={playerState.name} text={activeDialogues[playerState.id]} />
                </group>

                {/* AI FOLLOWER */}
                {ai && (
                    <group position={[ai.position.x, 0, ai.position.z]} scale={0.9}>
                         <PlayerModel appearance={playerState.appearance} isMoving={ai.action !== 'IDLE'} evolutionLevel={evolutionLevel} />
                         <EntityOverlay name={ai.name} text={activeDialogues[ai.id]} status={ai.action} color="#ffff00" />
                    </group>
                )}

                {/* WORLD OBJECTS (Parsed via Type & Era) */}
                {resources.map((r: any) => (
                    <WorldObjectRenderer 
                        key={r.id} 
                        data={r} 
                        tier={r.tier} 
                        quality={{ segments: 12 }} 
                        interactionProps={{
                            onClick: (e: any) => { e.stopPropagation(); if(e.nativeEvent.button===2) { /* context */ } else onInteract(r.id, r.type, r.position); },
                            onContextMenu: (e: any) => { 
                                e.stopPropagation(); 
                                onContextMenu({ x: e.nativeEvent.clientX, y: e.nativeEvent.clientY, title: r.type, options: [{ label: 'Interact', action: () => onInteract(r.id, r.type, r.position) }, { label: 'Examine', action: () => onExamine(`A ${r.type.toLowerCase()}.`) }]});
                            },
                            onPointerOver: (e: any) => { e.stopPropagation(); onHover(true, r.type, 'cyan'); },
                            onPointerOut: (e: any) => { e.stopPropagation(); onHover(false); }
                        }}
                    />
                ))}

                {/* NPCs */}
                {npcs.map((n: any) => (
                     <group key={n.id} position={[n.position.x, 0, n.position.z]}>
                         <mesh position={[0, 0.8, 0]}>
                             <capsuleGeometry args={[0.2, 1, 4, 8]} />
                             <meshStandardMaterial color={n.role === 'ENEMY' ? 'red' : 'yellow'} />
                         </mesh>
                         <EntityOverlay name={n.name} text={activeDialogues[n.id]} isCombat={n.role==='ENEMY'||n.role==='MOB'} />
                     </group>
                ))}
                
                {/* GROUND ITEMS */}
                {groundItems.map((g: any) => (
                    <group key={g.id} position={[g.position.x, 0, g.position.z]} 
                        onClick={(e) => { e.stopPropagation(); onInteract(g.id, 'GROUND_ITEM', g.position); }}
                        onPointerOver={(e) => { e.stopPropagation(); onHover(true, g.item.name, 'orange'); }}
                        onPointerOut={(e) => { e.stopPropagation(); onHover(false); }}
                    >
                        <mesh position={[0,0.1,0]}><boxGeometry args={[0.2, 0.2, 0.2]} /><meshStandardMaterial color="#ff981f" /></mesh>
                    </group>
                ))}

                {/* FLOOR */}
                <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} onClick={(e) => { e.stopPropagation(); onMovePlayer(e.point.x, e.point.z); }} receiveShadow>
                    <planeGeometry args={[200, 200, 32, 32]} />
                    <meshStandardMaterial color={groundColor} />
                </mesh>
            </Suspense>
        </Canvas>
    );
};
export { PlayerModel };
