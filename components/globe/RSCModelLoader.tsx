
import React, { useMemo } from 'react';
import { useLoader } from '@react-three/fiber';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader.js';
import { TextureLoader } from 'three';
import * as THREE from 'three';

interface RSCModelLoaderProps {
    modelName: string;
    scale?: number;
    position?: [number, number, number];
    rotation?: [number, number, number];
    onClick?: () => void;
}

export const RSCModelLoader: React.FC<RSCModelLoaderProps> = ({
    modelName,
    scale = 0.05,
    position = [0, 0, 0],
    rotation = [0, 0, 0],
    onClick
}) => {
    const objPath = `/models/rsc/${modelName}.obj`;
    const mtlPath = `/models/rsc/${modelName}.mtl`;

    // Load materials first
    const materials = useLoader(MTLLoader, mtlPath);

    // Configure materials
    useMemo(() => {
        materials.preload();
        // Fix for textures path if needed, but since they are in same dir, it might work.
        // If not, we might need to set resource path.
        // materials.setResourcePath('/models/rsc/'); // This might be needed
    }, [materials]);

    // Load object with materials
    const object = useLoader(OBJLoader, objPath, (loader) => {
        loader.setMaterials(materials as any);
    });

    // Clone the object to allow multiple instances with different transforms
    const clonedObject = useMemo(() => object.clone(), [object]);

    // Fix texture encoding/colors if needed
    useMemo(() => {
        clonedObject.traverse((child) => {
            if ((child as THREE.Mesh).isMesh) {
                const mesh = child as THREE.Mesh;
                // RSC models might need double side rendering
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
    }, [clonedObject]);

    return (
        <primitive
            object={clonedObject}
            scale={[scale, scale, scale]}
            position={position}
            rotation={rotation}
            onClick={onClick}
        />
    );
};
