import React, { useRef, useEffect, useMemo, useLayoutEffect } from 'react';
import { Canvas, useFrame, extend } from '@react-three/fiber';
import { OrbitControls, Html, Stars, Sparkles } from '@react-three/drei';
import * as THREE from 'three';
import { Perlin } from '../src/utils/noise';
import { GlobeState, SceneType } from '../types';
import { X, MapPin } from 'lucide-react';
import { CONTINENT_BOUNDARIES } from '../data/continentBoundaries';
import { isPointInPolygon } from 'geolib';
import { City } from './globe/City';
import { PlayableGlobe } from './globe/PlayableGlobe';
import { useState } from 'react';

interface GlobeSceneProps {
    globeState: GlobeState;
    currentEra: number;
    currentEvo?: number;
    currentScene?: SceneType;
    onTravel?: (targetId: string) => void;
    onClose?: () => void;
    isOverlay?: boolean;
    onQuestTrigger?: (id: string) => void;
}

// --- P0 ENHANCEMENT: ATMOSPHERE LAYER (Scaled for Radius 5) ---
const AtmosphereLayer = ({ radius, color, opacity, falloff }: { radius: number; color: string; opacity: number; falloff: number }) => {
    const shader = useMemo(() => ({
        uniforms: {
            fresnelBias: { value: 0.1 },
            fresnelScale: { value: 1.0 },
            fresnelPower: { value: falloff },
            color: { value: new THREE.Color(color) },
            opacity: { value: opacity }
        },
        vertexShader: `
            varying vec3 vNormal;
            varying vec3 vViewPosition;
            void main() {
                vNormal = normalize(normalMatrix * normal);
                vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
                vViewPosition = -mvPosition.xyz;
                gl_Position = projectionMatrix * mvPosition;
            }
        `,
        fragmentShader: `
            uniform float fresnelBias;
            uniform float fresnelScale;
            uniform float fresnelPower;
            uniform vec3 color;
            uniform float opacity;
            varying vec3 vNormal;
            varying vec3 vViewPosition;
            
            void main() {
                vec3 normal = normalize(vNormal);
                vec3 viewDir = normalize(vViewPosition);
                float fresnel = fresnelBias + fresnelScale * pow(1.0 + dot(viewDir, normal), fresnelPower);
                gl_FragColor = vec4(color, fresnel * opacity);
            }
        `
    }), [falloff, color, opacity]);

    return (
        <mesh>
            <sphereGeometry args={[radius, 64, 64]} />
            <shaderMaterial
                transparent
                depthWrite={false}
                side={THREE.BackSide}
                {...shader}
            />
        </mesh>
    );
};

// --- P0 ENHANCEMENT: ANIMATED OCEAN SHADER (Scaled for Radius 5) ---
const createOceanShader = (evolutionLevel: number) => {
    const deepColor = evolutionLevel >= 99 ? new THREE.Color('#003040') :
        evolutionLevel >= 60 ? new THREE.Color('#020518') :
            new THREE.Color('#010312');

    const surfaceColor = evolutionLevel >= 99 ? new THREE.Color('#105060') :
        evolutionLevel >= 60 ? new THREE.Color('#050C25') :
            new THREE.Color('#030820');

    return {
        uniforms: {
            time: { value: 0 },
            deepColor: { value: deepColor },
            surfaceColor: { value: surfaceColor },
            cameraPosition: { value: new THREE.Vector3() },
            evolutionLevel: { value: evolutionLevel }
        },
        vertexShader: `
            varying vec2 vUv;
            varying vec3 vPosition;
            varying vec3 vNormal;
            uniform float time;
            
            // Simplex noise function
            vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
            vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
            vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
            vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
            float snoise(vec3 v) {
                const vec2 C = vec2(1.0/6.0, 1.0/3.0);
                const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
                vec3 i  = floor(v + dot(v, C.yyy) );
                vec3 x0 = v - i + dot(i, C.xxx) ;
                vec3 g = step(x0.yzx, x0.xyz);
                vec3 l = 1.0 - g;
                vec3 i1 = min( g.xyz, l.zxy );
                vec3 i2 = max( g.xyz, l.zxy );
                vec3 x1 = x0 - i1 + C.xxx;
                vec3 x2 = x0 - i2 + C.yyy;
                vec3 x3 = x0 - D.yyy;
                i = mod289(i);
                vec4 p = permute( permute( permute( 
                        i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
                        + i.y + vec4(0.0, i1.y, i2.y, 1.0 )) 
                        + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));
                float n_ = 0.142857142857;
                vec3  ns = n_ * D.wyz - D.xzx;
                vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
                vec4 x_ = floor(j * ns.z);
                vec4 y_ = floor(j - 7.0 * x_ );
                vec4 x = x_ *ns.x + ns.yyyy;
                vec4 y = y_ *ns.x + ns.yyyy;
                vec4 h = 1.0 - abs(x) - abs(y);
                vec4 b0 = vec4( x.xy, y.xy );
                vec4 b1 = vec4( x.zw, y.zw );
                vec4 s0 = floor(b0)*2.0 + 1.0;
                vec4 s1 = floor(b1)*2.0 + 1.0;
                vec4 sh = -step(h, vec4(0.0));
                vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
                vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;
                vec3 p0 = vec3(a0.xy,h.x);
                vec3 p1 = vec3(a0.zw,h.y);
                vec3 p2 = vec3(a1.xy,h.z);
                vec3 p3 = vec3(a1.zw,h.w);
                vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
                p0 *= norm.x;
                p1 *= norm.y;
                p2 *= norm.z;
                p3 *= norm.w;
                vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
                m = m * m;
                return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3) ) );
            }

            void main() {
                vUv = uv;
                vNormal = normalize(normalMatrix * normal);
                
                // Animated waves (Scaled down for radius 5)
                float wave = snoise(vec3(position.x * 2.0, position.y * 2.0, time * 0.1));
                vec3 newPos = position + normal * wave * 0.05; // Reduced amplitude
                
                vPosition = newPos;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(newPos, 1.0);
            }
        `,
        fragmentShader: `
            uniform vec3 deepColor;
            uniform vec3 surfaceColor;
            uniform float time;
            uniform vec3 cameraPosition;
            uniform float evolutionLevel;
            
            varying vec3 vPosition;
            varying vec3 vNormal;
            
            void main() {
                vec3 viewDir = normalize(cameraPosition - vPosition);
                vec3 normal = normalize(vNormal);
                
                // Fresnel effect
                float fresnel = pow(1.0 - dot(viewDir, normal), 2.0);
                
                // Specular highlight
                vec3 lightDir = normalize(vec3(1.0, 1.0, 1.0));
                vec3 reflectDir = reflect(-lightDir, normal);
                float spec = pow(max(dot(viewDir, reflectDir), 0.0), 32.0);
                
                // Mix colors
                vec3 color = mix(deepColor, surfaceColor, fresnel);
                color += vec3(1.0) * spec * 0.5;
                
                // Godhood glow
                if (evolutionLevel >= 99.0) {
                    color += vec3(0.0, 0.2, 0.3) * fresnel;
                }
                
                gl_FragColor = vec4(color, 0.9);
            }
        `
    };
};

// --- GRID LINES ---
const GridLines = ({ radius }: { radius: number }) => {
    const linesRef = useRef<THREE.Group>(null);

    const gridGeometry = useMemo(() => {
        const geometry = new THREE.BufferGeometry();
        const vertices: number[] = [];

        // Latitude lines (every 15 degrees)
        for (let lat = -75; lat <= 75; lat += 15) {
            const points: THREE.Vector3[] = [];
            for (let lng = -180; lng <= 180; lng += 5) {
                const phi = (90 - lat) * (Math.PI / 180);
                const theta = (lng + 180) * (Math.PI / 180);
                const x = -(radius * Math.sin(phi) * Math.cos(theta));
                const z = (radius * Math.sin(phi) * Math.sin(theta));
                const y = (radius * Math.cos(phi));
                points.push(new THREE.Vector3(x, y, z));
            }
            points.forEach(p => vertices.push(p.x, p.y, p.z));
        }

        // Longitude lines (every 15 degrees)
        for (let lng = -180; lng < 180; lng += 15) {
            const points: THREE.Vector3[] = [];
            for (let lat = -90; lat <= 90; lat += 5) {
                const phi = (90 - lat) * (Math.PI / 180);
                const theta = (lng + 180) * (Math.PI / 180);
                const x = -(radius * Math.sin(phi) * Math.cos(theta));
                const z = (radius * Math.sin(phi) * Math.sin(theta));
                const y = (radius * Math.cos(phi));
                points.push(new THREE.Vector3(x, y, z));
            }
            points.forEach(p => vertices.push(p.x, p.y, p.z));
        }

        geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
        return geometry;
    }, [radius]);

    return (
        <group ref={linesRef}>
            <lineSegments geometry={gridGeometry}>
                <lineBasicMaterial color="#5a9cb8" opacity={0.6} transparent linewidth={2} />
            </lineSegments>
        </group>
    );
};

// --- OCEAN HEXAGONS ---
const OceanVoxels = ({ radius }: { radius: number }) => {
    const meshRef = useRef<THREE.InstancedMesh>(null);
    const count = 30000; // Original stable density
    const tempObj = new THREE.Object3D();

    const oceanPoints = useMemo(() => {
        const points: THREE.Vector3[] = [];
        const phi = Math.PI * (3 - Math.sqrt(5));

        for (let i = 0; i < count; i++) {
            const y = 1 - (i / (count - 1)) * 2;
            const radiusAtY = Math.sqrt(1 - y * y);
            const theta = phi * i;

            const x = Math.cos(theta) * radiusAtY;
            const z = Math.sin(theta) * radiusAtY;

            const lat = Math.asin(y) * (180 / Math.PI);
            const lng = Math.atan2(z, -x) * (180 / Math.PI);

            // Check if NOT on land (ocean only)
            let isLand = false;
            for (const [name, continent] of Object.entries(CONTINENT_BOUNDARIES)) {
                if (isPointInPolygon({ latitude: lat, longitude: lng }, continent.map(p => ({ latitude: p.lat, longitude: p.lng })))) {
                    isLand = true;
                    break;
                }
            }

            if (!isLand) {
                points.push(new THREE.Vector3(x * radius, y * radius, z * radius));
            }
        }
        return points;
    }, [radius]);

    // Material ref for uniform updates
    const materialRef = useRef<THREE.ShaderMaterial>(null);

    useFrame((state) => {
        if (materialRef.current) {
            materialRef.current.uniforms.time.value = state.clock.elapsedTime;
        }
    });

    useLayoutEffect(() => {
        if (!meshRef.current) return;

        oceanPoints.forEach((point, i) => {
            const surfacePos = point.clone().normalize().multiplyScalar(radius);
            const normal = surfacePos.clone().normalize();
            // Position ocean hexagons at same base height as land (0.015 offset)
            const offsetPos = surfacePos.clone().add(normal.clone().multiplyScalar(0.015));

            tempObj.position.copy(offsetPos);
            tempObj.lookAt(0, 0, 0);
            tempObj.rotateX(Math.PI / 2);
            tempObj.scale.set(1, 0.03, 1); // Match land base height

            tempObj.updateMatrix();
            meshRef.current!.setMatrixAt(i, tempObj.matrix);
        });

        meshRef.current.instanceMatrix.needsUpdate = true;
    }, [oceanPoints, radius]);

    const oceanShader = useMemo(() => ({
        uniforms: {
            time: { value: 0 }
        },
        vertexShader: `
            varying vec3 vPosition;
            varying vec3 vNormal;
            void main() {
                vPosition = position;
                vNormal = normal;
                gl_Position = projectionMatrix * modelViewMatrix * instanceMatrix * vec4(position, 1.0);
            }
        `,
        fragmentShader: `
            varying vec3 vPosition;
            varying vec3 vNormal;
            uniform float time;
            
            vec3 getWaterTexture(vec3 pos) {
                // Animated waves
                float wave1 = sin(pos.x * 20.0 + time * 2.0) * sin(pos.z * 20.0 + time * 1.5);
                float wave2 = sin(pos.x * 10.0 - time) * sin(pos.z * 10.0 + time * 0.5);
                float combined = (wave1 + wave2) * 0.5;
                
                vec3 deep = vec3(0.0, 0.1, 0.3);
                vec3 shallow = vec3(0.0, 0.4, 0.8);
                vec3 highlight = vec3(0.4, 0.7, 1.0);
                
                vec3 col = mix(deep, shallow, 0.5 + combined * 0.2);
                col = mix(col, highlight, smoothstep(0.8, 1.0, combined)); // Specular-ish highlights
                return col;
            }

            void main() {
                vec3 color = getWaterTexture(vPosition);
                
                // Lighting
                vec3 lightDir = normalize(vec3(1.0, 1.0, 1.0));
                float diff = dot(vNormal, lightDir) * 0.5 + 0.5;
                
                // Specular highlight for "plastic" model look
                vec3 viewDir = normalize(vec3(0.0, 0.0, 1.0) - vPosition); // Approx view dir
                vec3 reflectDir = reflect(-lightDir, vNormal);
                float spec = pow(max(dot(viewDir, reflectDir), 0.0), 32.0);
                
                gl_FragColor = vec4(color * diff + vec3(spec * 0.4), 0.65); // Semi-transparent
            }
        `,
        transparent: true
    }), []);

    return (
        <instancedMesh ref={meshRef} args={[undefined, undefined, oceanPoints.length]}>
            <cylinderGeometry args={[0.04, 0.04, 1, 6]} />
            <shaderMaterial ref={materialRef} {...oceanShader} />
        </instancedMesh>
    );
};

// --- POLAR CAPS ---
const PolarCaps = ({ radius }: { radius: number }) => {
    const northCapRef = useRef<THREE.Mesh>(null);
    const southCapRef = useRef<THREE.Mesh>(null);

    // Arctic (North) - ice floating on ocean, thin layer
    const arcticGeometry = useMemo(() => {
        return new THREE.SphereGeometry(
            radius + 0.05, // Just above ocean surface
            32,
            32,
            0, // phiStart
            Math.PI * 2, // phiLength (full circle)
            0, // thetaStart
            Math.PI * 0.20 // thetaLength (~72° latitude)
        );
    }, [radius]);

    // Antarctica (South) - landmass with ice
    // Real Antarctica: ~2km avg ice on ~200m avg rock = ~2.2km total
    // 2.2km / 6371km = 0.000345 * 5 = 0.0017 units
    const antarcticaGeometry = useMemo(() => {
        return new THREE.SphereGeometry(
            radius + 0.003, // True-to-scale ice sheet elevation
            32,
            32,
            0, // phiStart
            Math.PI * 2, // phiLength (full circle)
            0, // thetaStart
            Math.PI * 0.15 // thetaLength (~63° latitude)
        );
    }, [radius]);

    return (
        <>
            {/* Arctic (North Pole) - Thin ice sheet */}
            <mesh ref={northCapRef} geometry={arcticGeometry}>
                <meshStandardMaterial
                    color="#e8f4f8"
                    transparent
                    opacity={0.75}
                    roughness={0.8}
                    metalness={0.05}
                />
            </mesh>

            {/* Antarctica (South Pole) - Thick ice on landmass */}
            <mesh ref={southCapRef} geometry={antarcticaGeometry} rotation={[Math.PI, 0, 0]}>
                <meshStandardMaterial
                    color="#ffffff"
                    transparent
                    opacity={0.95}
                    roughness={0.9}
                    metalness={0.1}
                />
            </mesh>
        </>
    );
};

import { INLAND_LAKES, RIVER_PATHS } from '../data/geologicalFeatures';

// Helper to check if point is in a water body - returns 0.0 (land) to 1.0 (water)
const getWaterBodyFactor = (lat: number, lng: number): number => {
    // Check Lakes - solid water
    for (const lake of INLAND_LAKES) {
        const dist = Math.sqrt(Math.pow(lat - lake.lat, 2) + Math.pow(lng - lake.lng, 2));
        if (dist < lake.radius) return 1.0;
    }

    // Check Rivers (distance to line segments)
    // Use a soft threshold to allow partial water voxels
    // Voxel spacing is approx 0.8 degrees. 
    // River width is ~0.3-0.5 degrees.
    // We want to detect if the river passes through the voxel's influence area.
    const voxelInfluence = 0.6; // Slightly less than full spacing to avoid too much blur

    let maxWaterFactor = 0.0;

    for (const river of RIVER_PATHS) {
        for (let i = 0; i < river.path.length - 1; i++) {
            const p1 = river.path[i];
            const p2 = river.path[i + 1];

            // Project point onto line segment
            const l2 = Math.pow(p2[0] - p1[0], 2) + Math.pow(p2[1] - p1[1], 2);
            if (l2 === 0) continue;

            let t = ((lat - p1[0]) * (p2[0] - p1[0]) + (lng - p1[1]) * (p2[1] - p1[1])) / l2;
            t = Math.max(0, Math.min(1, t));

            const projLat = p1[0] + t * (p2[0] - p1[0]);
            const projLng = p1[1] + t * (p2[1] - p1[1]);

            const dist = Math.sqrt(Math.pow(lat - projLat, 2) + Math.pow(lng - projLng, 2));

            // Calculate blend factor
            // If inside river width -> 1.0
            // If within width + influence -> linear falloff
            const fullWaterDist = river.width * 0.5; // Radius
            const maxDist = fullWaterDist + voxelInfluence;

            if (dist < fullWaterDist) return 1.0; // Center of river
            if (dist < maxDist) {
                const factor = 1.0 - ((dist - fullWaterDist) / voxelInfluence);
                maxWaterFactor = Math.max(maxWaterFactor, factor);
            }
        }
    }
    return maxWaterFactor;
};

// --- P0 ENHANCEMENT: HEIGHT-MAPPED TERRAIN (Scaled for Radius 5) ---
const ContinentVoxels = ({ radius, currentEvo }: { radius: number; currentEvo: number }) => {
    const meshRef = useRef<THREE.InstancedMesh>(null);
    const count = 50000; // Original stable density
    const tempObj = new THREE.Object3D();
    const perlin = useMemo(() => new Perlin(Math.random()), []);

    // Generate points and filter for continents with ELEVATION
    const validPoints = useMemo(() => {
        const points: { pos: THREE.Vector3, lat: number, height: number, elevation: number, isWater: number }[] = [];
        const phi = Math.PI * (3 - Math.sqrt(5)); // Golden angle

        for (let i = 0; i < count; i++) {
            const y = 1 - (i / (count - 1)) * 2; // y goes from 1 to -1
            const radiusAtY = Math.sqrt(1 - y * y);
            const theta = phi * i;

            const x = Math.cos(theta) * radiusAtY;
            const z = Math.sin(theta) * radiusAtY;

            // Convert to Lat/Lng
            const lat = Math.asin(y) * (180 / Math.PI);
            const lng = Math.atan2(z, -x) * (180 / Math.PI);

            // Check if inside any continent
            let isLand = false;
            for (const [name, continent] of Object.entries(CONTINENT_BOUNDARIES)) {
                // geolib expects {latitude, longitude} format
                if (isPointInPolygon({ latitude: lat, longitude: lng }, continent.map(p => ({ latitude: p.lat, longitude: p.lng })))) {
                    isLand = true;
                    break;
                }
            }

            if (isLand) {
                // Check for systematic inland water (Lakes/Rivers) - returns 0.0 to 1.0
                const waterFactor = getWaterBodyFactor(lat, lng);

                // TRUE 1:1 EARTH SCALE ELEVATION (with 10x visibility scaling)
                const elevation = perlin.get2(new THREE.Vector2(lat * 0.1, lng * 0.1));

                // Mountain regions (30-60° latitude)
                const inMountainZone = Math.abs(lat) > 30 && Math.abs(lat) < 60;
                const maxElevation = inMountainZone ? 0.007 : 0.003; // Everest-scale vs hills

                // True Earth-scale elevation
                const trueElevation = Math.max(0, elevation * maxElevation);

                // POSITIONING RELATIVE TO OCEAN SURFACE
                const oceanSurfaceLevel = 0.045;

                // Land baseline: slightly above ocean for coastlines
                const coastlineBase = oceanSurfaceLevel + 0.002; // Just 2km above water (flush appearance)

                // Scale elevation 10x for visibility (still proportional)
                const visibleElevation = trueElevation * 10;

                // Calculate land height
                const landHeight = coastlineBase + visibleElevation;

                // Blend height based on water factor
                // If 100% water -> oceanSurfaceLevel
                // If 0% water -> landHeight
                // If 50% water -> average (creates sloping river banks)
                const voxelHeight = (landHeight * (1.0 - waterFactor)) + (oceanSurfaceLevel * waterFactor);

                // Blend elevation for shader (0 for water)
                const finalElevation = trueElevation * (1.0 - waterFactor);

                points.push({
                    pos: new THREE.Vector3(x * radius, y * radius, z * radius),
                    lat: Math.abs(Math.asin(y)),
                    height: voxelHeight,
                    elevation: finalElevation,
                    isWater: waterFactor
                });
            }
        }
        return points;
    }, [radius]);

    useLayoutEffect(() => {
        if (!meshRef.current) return;

        const latArray = new Float32Array(validPoints.length);
        const elevArray = new Float32Array(validPoints.length);
        const isWaterArray = new Float32Array(validPoints.length);

        validPoints.forEach((point, i) => {
            const surfacePos = point.pos.clone().normalize().multiplyScalar(radius);
            const normal = surfacePos.clone().normalize();
            const offsetPos = surfacePos.clone().add(normal.clone().multiplyScalar(point.height));

            tempObj.position.copy(offsetPos);
            tempObj.lookAt(0, 0, 0);
            tempObj.rotateX(Math.PI / 2);

            // If water, scale down slightly to avoid z-fighting if flush
            // Blend scale based on water factor
            const landScale = 0.02 + point.elevation * 100;
            const waterScale = 0.03;
            const scaleY = (landScale * (1.0 - point.isWater)) + (waterScale * point.isWater);

            tempObj.scale.set(1, scaleY, 1);

            tempObj.updateMatrix();
            meshRef.current!.setMatrixAt(i, tempObj.matrix);

            latArray[i] = point.lat;
            elevArray[i] = point.elevation;
            isWaterArray[i] = point.isWater;
        });

        meshRef.current.instanceMatrix.needsUpdate = true;

        // Update custom attributes
        meshRef.current.geometry.setAttribute('aLat', new THREE.InstancedBufferAttribute(latArray, 1));
        meshRef.current.geometry.setAttribute('aElevation', new THREE.InstancedBufferAttribute(elevArray, 1));
        meshRef.current.geometry.setAttribute('aIsWater', new THREE.InstancedBufferAttribute(isWaterArray, 1));

    }, [validPoints, radius]);

    // Material ref for uniform updates
    const materialRef = useRef<THREE.ShaderMaterial>(null);

    useFrame((state) => {
        if (materialRef.current) {
            materialRef.current.uniforms.time.value = state.clock.elapsedTime;
        }
    });

    // Enhanced biome shader with elevation awareness and PROCEDURAL TEXTURES
    const enhancedBiomeShader = useMemo(() => ({
        uniforms: {
            time: { value: 0 },
            evolutionLevel: { value: currentEvo }
        },
        vertexShader: `
            attribute float aLat;
            attribute float aElevation;
            attribute float aIsWater;
            varying vec3 vPosition;
            varying vec3 vNormal;
            varying float vLat;
            varying float vElevation;
            varying float vIsWater;
            void main() {
                vPosition = position;
                vNormal = normal;
                vLat = aLat;
                vElevation = aElevation;
                vIsWater = aIsWater;
                gl_Position = projectionMatrix * modelViewMatrix * instanceMatrix * vec4(position, 1.0);
            }
        `,
        fragmentShader: `
            varying vec3 vPosition;
            varying vec3 vNormal;
            varying float vLat;
            varying float vElevation;
            varying float vIsWater;
            uniform float evolutionLevel;
            uniform float time;
            
            // Simplex-like noise
            float hash(vec2 p) {
                return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
            }
            
            float noise(vec2 p) {
                vec2 i = floor(p);
                vec2 f = fract(p);
                f = f * f * (3.0 - 2.0 * f);
                return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x),
                           mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x), f.y);
            }

            // PROCEDURAL TEXTURE FUNCTIONS
            
            vec3 getWaterTexture(vec3 pos) {
                // Animated waves
                float wave1 = sin(pos.x * 20.0 + time * 2.0) * sin(pos.z * 20.0 + time * 1.5);
                float wave2 = sin(pos.x * 10.0 - time) * sin(pos.z * 10.0 + time * 0.5);
                float combined = (wave1 + wave2) * 0.5;
                
                vec3 deep = vec3(0.0, 0.1, 0.3);
                vec3 shallow = vec3(0.0, 0.4, 0.8);
                vec3 highlight = vec3(0.4, 0.7, 1.0);
                
                vec3 col = mix(deep, shallow, 0.5 + combined * 0.2);
                col = mix(col, highlight, smoothstep(0.8, 1.0, combined)); // Specular-ish highlights
                return col;
            }

            vec3 getGrassTexture(vec3 pos) {
                float n = noise(pos.xy * 50.0); // Fine grain
                vec3 dark = vec3(0.05, 0.25, 0.05);
                vec3 light = vec3(0.15, 0.5, 0.1);
                return mix(dark, light, n);
            }

            vec3 getForestTexture(vec3 pos) {
                float n = noise(pos.xy * 30.0);
                vec3 dark = vec3(0.02, 0.15, 0.02);
                vec3 light = vec3(0.05, 0.25, 0.05);
                return mix(dark, light, n);
            }

            vec3 getSandTexture(vec3 pos) {
                float ripples = sin(pos.x * 40.0 + sin(pos.z * 20.0)) * 0.1;
                float grain = noise(pos.xy * 100.0) * 0.05;
                vec3 base = vec3(0.76, 0.7, 0.5); // Sand color
                return base + vec3(ripples + grain);
            }

            vec3 getRockTexture(vec3 pos) {
                float strata = noise(vec2(pos.y * 10.0, pos.x * 2.0));
                float detail = noise(pos.xz * 40.0);
                vec3 dark = vec3(0.3, 0.25, 0.2);
                vec3 light = vec3(0.45, 0.4, 0.35);
                return mix(dark, light, strata * 0.7 + detail * 0.3);
            }

            vec3 getSnowTexture(vec3 pos) {
                float sparkle = noise(pos.xy * 80.0);
                vec3 base = vec3(0.9, 0.9, 0.95);
                return base + vec3(sparkle * 0.1);
            }

            void main() {
                float lat = vLat;
                float elev = vElevation;
                
                vec3 color;
                
                if (vIsWater > 0.5) {
                    color = getWaterTexture(vPosition);
                } else {
                    // Biome selection based on lat/elev
                    vec3 biomeColor;
                    
                    if (elev > 0.5) {
                        // Mountain/Snow
                        float t = smoothstep(0.5, 0.8, elev);
                        biomeColor = mix(getRockTexture(vPosition), getSnowTexture(vPosition), t);
                    } else if (lat > 0.8) {
                        // Polar/Tundra
                        float t = smoothstep(0.8, 0.9, lat);
                        biomeColor = mix(getRockTexture(vPosition), getSnowTexture(vPosition), t);
                    } else if (lat > 0.6) {
                        // Boreal Forest
                        biomeColor = mix(getForestTexture(vPosition), getSnowTexture(vPosition), smoothstep(0.6, 0.8, lat));
                    } else if (lat > 0.35) {
                        // Temperate
                        biomeColor = getGrassTexture(vPosition);
                    } else if (lat > 0.15) {
                        // Desert/Savanna
                        float t = noise(vPosition.xy * 4.0); // Patchy transition
                        biomeColor = mix(getGrassTexture(vPosition), getSandTexture(vPosition), 0.5 + t * 0.5);
                    } else {
                        // Jungle
                        biomeColor = getForestTexture(vPosition);
                    }
                    
                    color = biomeColor;
                }
                
                // Partial water blending (River banks)
                if (vIsWater > 0.0 && vIsWater < 0.5) {
                    // Muddy bank texture
                    vec3 mud = vec3(0.35, 0.25, 0.15); 
                    vec3 water = getWaterTexture(vPosition);
                    
                    // Blend: Land -> Mud -> Water
                    float waterFactor = vIsWater * 2.0; // 0.0-1.0 range for this half
                    color = mix(color, water, waterFactor);
                }
                
                // Evolution-based enhancements
                if (evolutionLevel >= 99.0) {
                    // Godhood: Crystalline iridescence
                    vec3 rainbow = vec3(
                        0.5 + 0.5 * sin(vPosition.x * 2.0 + time),
                        0.5 + 0.5 * sin(vPosition.y * 2.0 + time + 2.0),
                        0.5 + 0.5 * sin(vPosition.z * 2.0 + time + 4.0)
                    );
                    color = mix(color, rainbow, 0.3);
                }
                
                // Lighting (Plastic/Model look)
                vec3 lightDir = normalize(vec3(1.0, 1.0, 1.0));
                float diff = dot(vNormal, lightDir) * 0.5 + 0.5;
                
                // Specular highlight for "plastic" model look
                vec3 viewDir = normalize(vec3(0.0, 0.0, 1.0) - vPosition); // Approx view dir
                vec3 reflectDir = reflect(-lightDir, vNormal);
                float spec = pow(max(dot(viewDir, reflectDir), 0.0), 32.0);
                
                gl_FragColor = vec4(color * diff + vec3(spec * 0.2), 1.0);
            }
        `
    }), [currentEvo]);

    return (
        <instancedMesh ref={meshRef} args={[undefined, undefined, validPoints.length]}>
            {/* Original proven hexagon size */}
            <cylinderGeometry args={[0.04, 0.04, 1, 6]} />
            <shaderMaterial ref={materialRef} {...enhancedBiomeShader} />
        </instancedMesh>
    );
};

// Helper to convert Lat/Lng to Vector3
const getPosition = (lat: number, lng: number, radius: number) => {
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lng + 180) * (Math.PI / 180);
    const x = -(radius * Math.sin(phi) * Math.cos(theta));
    const z = (radius * Math.sin(phi) * Math.sin(theta));
    const y = (radius * Math.cos(phi));
    return new THREE.Vector3(x, y, z);
};

const Globe = ({ globeState, currentEra, currentEvo = 0, onTravel, onQuestTrigger, currentScene }: GlobeSceneProps) => {
    const groupRef = useRef<THREE.Group>(null);
    const oceanMaterialRef = useRef<THREE.ShaderMaterial>(null);
    const earthRadius = 5; // Original scale

    // Auto-rotate to specific location if in a scene
    useEffect(() => {
        if (!groupRef.current || !currentScene || currentScene === 'MAINLAND_GLOBE' || currentScene === 'TUTORIAL_ISLAND') return;
        // Marker logic preserved
    }, [currentScene, globeState.markers]);

    useFrame((state) => {
        if (groupRef.current) {
            groupRef.current.rotation.y += 0.0005;
        }

        if (oceanMaterialRef.current) {
            oceanMaterialRef.current.uniforms.time.value = state.clock.getElapsedTime();
            oceanMaterialRef.current.uniforms.cameraPosition.value.copy(state.camera.position);
        }
    });

    const oceanShader = useMemo(() => createOceanShader(currentEvo), [currentEvo]);

    return (
        <group ref={groupRef}>
            {/* 1. ATMOSPHERE GLOW LAYERS (Scaled) */}
            <AtmosphereLayer radius={earthRadius + 0.2} color="#4FC3F7" opacity={currentEvo >= 99 ? 0.25 : 0.15} falloff={3.0} />
            <AtmosphereLayer radius={earthRadius + 0.4} color="#0288D1" opacity={currentEvo >= 99 ? 0.15 : 0.1} falloff={2.0} />

            {/* 2. SOLID DARK BLUE OCEAN BASE (DEEPER) */}
            <mesh>
                <sphereGeometry args={[earthRadius - 0.1, 64, 64]} />
                <meshBasicMaterial color="#001a33" />
            </mesh>

            {/* 3. OCEAN SURFACE HEXAGONS */}
            <OceanVoxels radius={earthRadius} />

            {/* 4. LAT/LONG GRID LINES (ON WATER SURFACE) */}
            <GridLines radius={earthRadius + 0.05} />

            {/* 5. CONTINENTS (LAND VOXELS) */}
            <ContinentVoxels radius={earthRadius} currentEvo={currentEvo} />

            {/* 6. POLAR ICE CAPS */}
            <PolarCaps radius={earthRadius} />

            {/* Player Markers (Preserved Logic) */}
            {globeState.players.map(p => {
                const pos = getPosition(p.lat, p.lng, earthRadius + 0.15);
                return (
                    <mesh key={p.id} position={pos}>
                        <sphereGeometry args={[0.08, 8, 8]} />
                        <meshBasicMaterial color={p.id.includes('#1') ? 'gold' : '#ef4444'} />
                        {p.id === '#1' && (
                            <Html distanceFactor={15}>
                                <div className="text-[12px] font-bold text-gold bg-black/50 px-2 py-0.5 whitespace-nowrap border border-gold/20 rounded">
                                    {p.name}
                                </div>
                            </Html>
                        )}
                    </mesh>
                );
            })}

            {/* Points of Interest (Markers) */}
            {globeState.markers.map(m => {
                const pos = getPosition(m.lat, m.lng, earthRadius + 0.15);
                const isLocked = (m.eraRequired || 0) > currentEra;
                const isCurrentLocation = m.sceneTarget === currentScene;
                const color = isCurrentLocation ? '#00ff00' : (isLocked ? '#ff0000' : (m.type === 'DUNGEON' ? '#ff00ff' : '#00ffff'));

                return (
                    <group
                        key={m.id}
                        position={pos}
                        onClick={(e) => {
                            e.stopPropagation();
                            if (!isLocked) {
                                if (onTravel) onTravel(m.id);
                                if (onQuestTrigger) onQuestTrigger(m.id);
                            }
                        }}
                        onPointerOver={() => { document.body.style.cursor = isLocked ? 'not-allowed' : 'pointer'; }}
                        onPointerOut={() => { document.body.style.cursor = 'default'; }}
                    >
                        <mesh>
                            <boxGeometry args={[0.15, 0.15, 0.15]} />
                            <meshStandardMaterial color={color} emissive={color} emissiveIntensity={currentEvo >= 60 ? 1.0 : 0.5} />
                        </mesh>
                        <mesh position={[0, 0.5, 0]}>
                            <cylinderGeometry args={[0.02, 0.02, 1]} />
                            <meshBasicMaterial color={color} transparent opacity={0.3} />
                        </mesh>

                        {isCurrentLocation && (
                            <Html distanceFactor={10} position={[0, 1.5, 0]}>
                                <div className="flex flex-col items-center animate-bounce">
                                    <MapPin size={32} className="text-green-500 fill-green-500/50" />
                                    <span className="bg-green-900/80 text-white text-xs font-bold px-2 py-0.5 border border-green-500 whitespace-nowrap rounded">YOU ARE HERE</span>
                                </div>
                            </Html>
                        )}

                        <Html distanceFactor={12}>
                            <div className={`text-xs font-bold ${isLocked ? 'text-red-500 border-red-500/50' : 'text-cyan-300 border-cyan-500/50'} bg-black/80 px-2 py-0.5 border backdrop-blur-sm whitespace-nowrap rounded`}>
                                {m.label} {isLocked ? `(ERA ${m.eraRequired})` : (!isCurrentLocation ? '[TRAVEL]' : '')}
                            </div>
                        </Html>
                    </group>
                );
            })}

            {/* Godhood Sparkles */}
            {currentEvo >= 99 && (
                <Sparkles count={2000} scale={earthRadius * 2.5} size={2} speed={0.4} opacity={0.5} color="#FFD700" />
            )}
        </group>
    );
};

export const GlobeScene: React.FC<GlobeSceneProps> = (props) => {
    const { globeState, currentEra, currentEvo = 0, onClose, isOverlay } = props;
    const [viewMode, setViewMode] = useState<'MAP' | 'WORLD'>('MAP');

    return (
        <div className="w-full h-full relative bg-black">
            <div className="absolute inset-0 z-0">
                <Canvas camera={{ position: [0, 0, 12], fov: 45 }}>
                    <color attach="background" args={['#000000']} />
                    <ambientLight intensity={0.2} />
                    <pointLight position={[20, 20, 20]} intensity={1.5} />
                    <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade />

                    {viewMode === 'MAP' ? (
                        <Globe {...props} currentEvo={currentEvo} />
                    ) : (
                        <PlayableGlobe radius={5} />
                    )}

                    <OrbitControls
                        enablePan={false}
                        minDistance={7}
                        maxDistance={20}
                        autoRotate={viewMode === 'MAP'}
                        autoRotateSpeed={0.5}
                    />

                    <Html fullscreen style={{ pointerEvents: 'none' }}>
                        <div className="absolute bottom-4 left-4 font-vt323 text-zinc-500 text-sm">
                            ERA: {currentEra >= 2 ? 'DARK AGES' : 'PRIMITIVE'} // SERVER: GLOBAL_01
                        </div>
                    </Html>
                </Canvas>
            </div>

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

            {/* View Toggle */}
            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-50 pointer-events-auto flex gap-4">
                <button
                    onClick={() => setViewMode('MAP')}
                    className={`px-6 py-2 rounded-full font-bold border-2 transition-all ${viewMode === 'MAP'
                        ? 'bg-cyan-900/80 border-cyan-500 text-cyan-100 shadow-[0_0_15px_rgba(6,182,212,0.5)]'
                        : 'bg-black/50 border-zinc-700 text-zinc-500 hover:bg-zinc-900'
                        }`}
                >
                    MAP VIEW
                </button>
                <button
                    onClick={() => setViewMode('WORLD')}
                    className={`px-6 py-2 rounded-full font-bold border-2 transition-all ${viewMode === 'WORLD'
                        ? 'bg-green-900/80 border-green-500 text-green-100 shadow-[0_0_15px_rgba(34,197,94,0.5)]'
                        : 'bg-black/50 border-zinc-700 text-zinc-500 hover:bg-zinc-900'
                        }`}
                >
                    WORLD VIEW
                </button>
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
        </div>
    );
};
