import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { cartesianToLatLon } from '../../src/utils/sphericalMath';

interface PlayableGlobeProps {
    radius?: number;
    segments?: number;
    treeCount?: number;
    onPlayerMove?: (lat: number, lon: number) => void;
    onClick?: (e: any) => void;
    paths?: any[];
    playerPosition?: { lat: number; lon: number };
    variant?: 'TUTORIAL' | 'EARTH';
    mapTexture?: THREE.Texture | null;
}

const TerrainShader = {
    uniforms: {
        uTime: { value: 0 },
        uRadius: { value: 100 },
    },
    vertexShader: `
        varying vec2 vUv;
        varying vec3 vPosition;
        varying vec3 vNormal;
        varying float vElevation;

        uniform float uTime;
        uniform float uRadius;
        uniform float uVariant;

        // Simplex 3D Noise 
        float hash(vec3 p) {
            p = fract(p * 0.3183099 + .1);
            p *= 17.0;
            return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
        }

        float noise(vec3 x) {
            vec3 i = floor(x);
            vec3 f = fract(x);
            f = f * f * (3.0 - 2.0 * f);
            return mix(mix(mix(hash(i + vec3(0,0,0)), hash(i + vec3(1,0,0)), f.x),
                        mix(hash(i + vec3(0,1,0)), hash(i + vec3(1,1,0)), f.x), f.y),
                    mix(mix(hash(i + vec3(0,0,1)), hash(i + vec3(1,0,1)), f.x),
                        mix(hash(i + vec3(0,1,1)), hash(i + vec3(1,1,1)), f.x), f.y), f.z);
        }

        void main() {
            vUv = uv;
            vNormal = normalize(normalMatrix * normal);
            vec3 pos = position;

            // Generate elevation based on noise
            float scale = uVariant > 0.5 ? 0.08 : 0.05; 
            float offset = uVariant > 0.5 ? 100.0 : 0.0;
            
            float n = noise((pos + offset) * scale) * 2.0 + noise((pos + offset) * (scale * 2.0)) * 1.0;
            vElevation = n;

            // Displace vertices for terrain
            float displacement = 0.0;
            
            if (uVariant < 0.5) {
                // Earth: Add terrain displacement
                displacement = max(0.0, n - 1.2) * 2.0; // Mountains
                float waterLevel = 0.8;
                if (n < waterLevel) displacement = -0.2; // Water dip
            }
            // TUTORIAL: displacement stays 0.0 (flat sphere for RSC grid)

            vec3 newPos = pos + normal * displacement;
            vPosition = newPos;

            gl_Position = projectionMatrix * modelViewMatrix * vec4(newPos, 1.0);
        }
    `,
    fragmentShader: `
        uniform float uTime;
        uniform float uVariant;
        uniform sampler2D uMapTexture;

        varying vec2 vUv;
        varying vec3 vPosition;
        varying vec3 vNormal;
        varying float vElevation;

        void main() {
            vec3 color;
            float alpha = 1.0;
            
            if (uVariant > 0.5) {
                // TUTORIAL (RSC): Map texture overlay
                vec4 texColor = texture2D(uMapTexture, vUv);
                
                if (texColor.a > 0.0) {
                    color = texColor.rgb;
                } else {
                    color = vec3(0.2, 0.25, 0.2); // Fallback
                }
            } else {
                // EARTH: Procedural terrain coloring
                vec3 grassColor = vec3(0.2, 0.5, 0.2);
                vec3 waterColor = vec3(0.0, 0.3, 0.6);
                vec3 rockColor = vec3(0.5, 0.5, 0.5);
                vec3 sandColor = vec3(0.76, 0.70, 0.50);
                
                float waterLevel = 0.8;
                color = grassColor;
                
                if (vElevation < waterLevel) {
                    float wave = sin(vUv.x * 20.0 + uTime) * 0.05;
                    color = waterColor + vec3(wave * 0.2);
                } else if (vElevation > (waterLevel + 1.0)) {
                    color = rockColor;
                } else if (vElevation > (waterLevel + 0.7)) {
                    color = mix(grassColor, rockColor, (vElevation - (waterLevel + 0.7)) / 0.3);
                } else if (vElevation < (waterLevel + 0.1)) {
                    color = sandColor;
                }
            }

            // Simple lighting
            vec3 lightDir = normalize(vec3(1.0, 1.0, 1.0));
            float diff = max(dot(vNormal, lightDir), 0.0);
            vec3 ambient = vec3(0.3);
            
            gl_FragColor = vec4(color * (diff + ambient), alpha);
        }
    `
};

export const PlayableGlobe: React.FC<PlayableGlobeProps> = ({
    radius = 100,
    segments = 48,
    treeCount = 300,
    onPlayerMove,
    onClick,
    variant = 'EARTH',
    mapTexture
}) => {
    const meshRef = useRef<THREE.Mesh>(null);
    const materialRef = useRef<THREE.ShaderMaterial>(null);

    useFrame((state) => {
        if (materialRef.current) {
            materialRef.current.uniforms.uTime.value = state.clock.getElapsedTime();
        }
    });

    const shaderArgs = useMemo(() => {
        const isTutorial = variant === 'TUTORIAL';
        return {
            uniforms: {
                uTime: { value: 0 },
                uRadius: { value: radius },
                uVariant: { value: isTutorial ? 1.0 : 0.0 },
                uMapTexture: { value: mapTexture || null }
            },
            vertexShader: TerrainShader.vertexShader,
            fragmentShader: TerrainShader.fragmentShader
        };
    }, [radius, variant, mapTexture]);

    const handleClick = (e: any) => {
        if (onClick) onClick(e);

        if (onPlayerMove && e.point) {
            const { lat, lon } = cartesianToLatLon(e.point, radius);
            onPlayerMove(lat, lon);
        }
    };

    return (
        <group>
            <mesh ref={meshRef} onClick={handleClick}>
                <sphereGeometry args={[radius, segments, segments]} />
                <shaderMaterial
                    ref={materialRef}
                    attach="material"
                    args={[shaderArgs]}
                    transparent={true}
                />
            </mesh>
            {/* Atmosphere Glow */}
            <mesh scale={[1.05, 1.05, 1.05]}>
                <sphereGeometry args={[radius, Math.max(32, segments / 2), Math.max(32, segments / 2)]} />
                <meshBasicMaterial color={variant === 'TUTORIAL' ? '#FF5722' : '#4FC3F7'} transparent opacity={0.1} side={THREE.BackSide} />
            </mesh>
        </group>
    );
};
