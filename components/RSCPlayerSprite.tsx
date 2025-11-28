import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';

// Billboard sprite player using RSC sprites from public/sprites/rsc/
export const RSCPlayerSprite = ({ appearance, isMoving }: { appearance?: any, isMoving?: boolean }) => {
    const meshRef = useRef<THREE.Mesh>(null);

    // Billboard rotation - always face camera
    useFrame(({ camera }) => {
        if (meshRef.current) {
            meshRef.current.quaternion.copy(camera.quaternion);
        }
    });

    // For now, use front-facing sprite (angle 0)
    // RSC sprites have 18 angles: 0-14 for walking, 15-17 for combat
    const angle = 0;

    // Map appearance to sprite paths
    // Default to male body (body1), head1, legs1
    const bodySprite = `/sprites/rsc/body1/${angle}.png`;
    const headSprite = `/sprites/rsc/head1/${angle}.png`;
    const legsSprite = `/sprites/rsc/legs1/${angle}.png`;

    try {
        // Load the sprite textures
        const textures = useTexture([bodySprite, headSprite, legsSprite]);

        return (
            <group>
                {/* Render each sprite layer as billboard */}
                <mesh ref={meshRef} position={[0, 0.5, 0]}>
                    <planeGeometry args={[2, 3]} />
                    <meshBasicMaterial
                        map={textures[0]}
                        transparent={true}
                        alphaTest={0.5}
                        side={THREE.DoubleSide}
                    />
                </mesh>
            </group>
        );
    } catch (e) {
        // Fallback if sprites fail to load
        const skinColor = appearance?.skinColor || '#d4a574';
        const hairColor = appearance?.hairColor || '#3d2817';
        const torsoColor = appearance?.torsoColor || '#0066cc';
        const legsColor = appearance?.legsColor || '#2d2d2d';

        return (
            <group>
                {/* Temporary blocky fallback */}
                <mesh position={[0, 1.5, 0]} castShadow receiveShadow>
                    <boxGeometry args={[0.4, 0.4, 0.4]} />
                    <meshStandardMaterial color={skinColor} />
                </mesh>
                <mesh position={[0, 1.7, 0]} castShadow receiveShadow>
                    <boxGeometry args={[0.42, 0.15, 0.42]} />
                    <meshStandardMaterial color={hairColor} />
                </mesh>
                <mesh position={[0, 0.9, 0]} castShadow receiveShadow>
                    <boxGeometry args={[0.5, 0.7, 0.3]} />
                    <meshStandardMaterial color={torsoColor} />
                </mesh>
                <mesh position={[-0.35, 0.9, 0]} castShadow receiveShadow>
                    <boxGeometry args={[0.2, 0.7, 0.2]} />
                    <meshStandardMaterial color={torsoColor} />
                </mesh>
                <mesh position={[0.35, 0.9, 0]} castShadow receiveShadow>
                    <boxGeometry args={[0.2, 0.7, 0.2]} />
                    <meshStandardMaterial color={torsoColor} />
                </mesh>
                <mesh position={[-0.35, 0.4, 0]} castShadow receiveShadow>
                    <boxGeometry args={[0.18, 0.2, 0.18]} />
                    <meshStandardMaterial color={skinColor} />
                </mesh>
                <mesh position={[0.35, 0.4, 0]} castShadow receiveShadow>
                    <boxGeometry args={[0.18, 0.2, 0.18]} />
                    <meshStandardMaterial color={skinColor} />
                </mesh>
                <mesh position={[-0.15, 0.15, 0]} castShadow receiveShadow>
                    <boxGeometry args={[0.2, 0.6, 0.2]} />
                    <meshStandardMaterial color={legsColor} />
                </mesh>
                <mesh position={[0.15, 0.15, 0]} castShadow receiveShadow>
                    <boxGeometry args={[0.2, 0.6, 0.2]} />
                    <meshStandardMaterial color={legsColor} />
                </mesh>
                <mesh position={[-0.15, -0.2, 0.05]} castShadow receiveShadow>
                    <boxGeometry args={[0.2, 0.1, 0.3]} />
                    <meshStandardMaterial color={'#1a1a1a'} />
                </mesh>
                <mesh position={[0.15, -0.2, 0.05]} castShadow receiveShadow>
                    <boxGeometry args={[0.2, 0.1, 0.3]} />
                    <meshStandardMaterial color={'#1a1a1a'} />
                </mesh>
            </group>
        );
    }
};
