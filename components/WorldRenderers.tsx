import React, { useMemo, Suspense } from 'react';
import { useLoader } from '@react-three/fiber';
import { Html, useGLTF, Gltf } from '@react-three/drei';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader.js';
import * as THREE from 'three';
import { latLonToCartesian, getSphericalRotation } from '../src/utils/sphericalMath';
import { ASSET_REGISTRY } from '../src/services/assets/AssetRegistry';
import { RSCPlayerSprite } from './RSCPlayerSprite';

// --- ERROR BOUNDARY FOR MODELS ---
export class ModelErrorBoundary extends React.Component<{ fallback: React.ReactNode, children: React.ReactNode }, { hasError: boolean }> {
    constructor(props: any) { super(props); this.state = { hasError: false }; }
    static getDerivedStateFromError(error: any) { return { hasError: true }; }
    componentDidCatch(error: any, errorInfo: any) { 
        // Suppress 404 errors (HTML response) from spamming console
        if (error.message && (error.message.includes('Unexpected token') || error.message.includes('JSON'))) {
            // Silent fail
        } else {
            console.warn("Model load failed:", error); 
        }
    }
    render() {
        if (this.state.hasError) return this.props.fallback;
        return this.props.children;
    }
}

const FallbackModel = () => (
    <mesh castShadow receiveShadow>
        <boxGeometry args={[0.5, 0.5, 0.5]} />
        <meshStandardMaterial color="red" wireframe />
    </mesh>
);

// --- RSC MODEL LOADERS ---
export const RSCModelGLB = ({ path, scale = 1 }: { path: string, scale?: number }) => {
    const { scene } = useGLTF(path);
    const clonedScene = useMemo(() => scene.clone(), [scene]);
    return <primitive object={clonedScene} scale={scale} castShadow receiveShadow />;
};

export const RSCModelOBJ = ({ path, scale = 1 }: { path: string, scale?: number }) => {
    const mtlPath = path.replace('.obj', '.mtl');
    const materials = useLoader(MTLLoader, mtlPath);
    const object = useLoader(OBJLoader, path, (loader) => {
        materials.preload();
        loader.setMaterials(materials);
    });

    const clonedObject = useMemo(() => {
        const clone = object.clone();
        clone.traverse((child) => {
            if ((child as THREE.Mesh).isMesh) {
                const mesh = child as THREE.Mesh;
                if (mesh.material) {
                    if (Array.isArray(mesh.material)) {
                        mesh.material.forEach(m => m.side = THREE.DoubleSide);
                    } else {
                        (mesh.material as THREE.Material).side = THREE.DoubleSide;
                    }
                }
                mesh.castShadow = true;
                mesh.receiveShadow = true;
            }
        });
        return clone;
    }, [object]);

    return <primitive object={clonedObject} scale={scale} />;
};

export const RSCModel = ({ path, scale = 1, fallback }: { path: string, scale?: number, fallback: React.ReactNode }) => {
    const isObj = path.toLowerCase().endsWith('.obj');
    return (
        <Suspense fallback={fallback}>
            {isObj ? (
                <RSCModelOBJ path={path} scale={scale} />
            ) : (
                <RSCModelGLB path={path} scale={scale} />
            )}
        </Suspense>
    );
};

// --- RENDERERS ---

export const WorldObjectRenderer = ({ data, interactionProps, era = 0 }: any) => {
    // Flat RSC world - direct X,Z positioning
    const pos = [data.position.x * 5, 0, data.position.z * 5];

    const assetId = data.type.toLowerCase();
    const asset = ASSET_REGISTRY[assetId];
    const modelPath = asset?.modelPath || `/models/${assetId}.glb`;

    return (
        <group position={pos as any} {...interactionProps}>
            <Suspense fallback={<FallbackModel />}>
                <ModelErrorBoundary fallback={<FallbackModel />}>
                    {asset?.modelPath ? (
                        <RSCModel path={asset.modelPath} scale={asset.scale || 0.05} fallback={<FallbackModel />} />
                    ) : (
                        <Gltf src={modelPath} castShadow receiveShadow />
                    )}
                </ModelErrorBoundary>
            </Suspense>
        </group>
    );
};

// RSC Player Model - uses RSCPlayerSprite component
export const PlayerModel = ({ evolutionLevel, appearance, isMoving }: { evolutionLevel: number, appearance?: any, isMoving?: boolean }) => {
    return <RSCPlayerSprite appearance={appearance} isMoving={isMoving} />;
};

export const NPCRenderer = ({ npc, interactionProps, era = 0 }: any) => {
    // Flat RSC world - direct X,Z positioning
    const pos = [npc.position.x * 5, 0, npc.position.z * 5];

    const assetId = npc.name.toLowerCase().replace(/ /g, '_');
    const asset = ASSET_REGISTRY[assetId];
    const modelPath = asset?.modelPath || `/models/npcs/${assetId}.glb`;

    return (
        <group position={pos as any} {...interactionProps}>
            <Suspense fallback={<FallbackModel />}>
                <ModelErrorBoundary fallback={<FallbackModel />}>
                    {asset?.modelPath ? (
                        <RSCModel path={asset.modelPath} scale={asset.scale || 0.05} fallback={<FallbackModel />} />
                    ) : (
                        <Gltf src={modelPath} castShadow receiveShadow />
                    )}
                </ModelErrorBoundary>
            </Suspense>
        </group>
    );
};

export const GroundItemRenderer = ({ item, interactionProps, era = 0 }: any) => {
    const name = item.name.toLowerCase();
    const assetId = name.replace(/ /g, '_');
    const asset = ASSET_REGISTRY[assetId];
    const modelPath = asset?.modelPath || `/models/items/${assetId}.glb`;

    return (
        <group {...interactionProps}>
            <Suspense fallback={<FallbackModel />}>
                <ModelErrorBoundary fallback={<FallbackModel />}>
                    {asset?.modelPath ? (
                        <RSCModel path={asset.modelPath} scale={asset.scale || 0.02} fallback={<FallbackModel />} />
                    ) : (
                        <Gltf src={modelPath} castShadow receiveShadow />
                    )}
                </ModelErrorBoundary>
            </Suspense>
        </group>
    );
};

export const EntityOverlay = ({ name, title, text, status, color = 'white', isCombat = false }: any) => (
    <Html position={[0, 2.5, 0]} center style={{ pointerEvents: 'none' }}>
        <div style={{
            background: 'rgba(0,0,0,0.7)',
            color: color,
            padding: '4px 8px',
            borderRadius: '4px',
            fontSize: '12px',
            fontFamily: 'monospace',
            whiteSpace: 'nowrap',
            border: isCombat ? '1px solid red' : '1px solid gray'
        }}>
            {title && <div style={{ fontWeight: 'bold', marginBottom: '2px' }}>{title}</div>}
            {name && <div>{name}</div>}
            {text && <div>{text}</div>}
            {status && <div style={{ fontSize: '10px', opacity: 0.8 }}>{status}</div>}
        </div>
    </Html>
);
