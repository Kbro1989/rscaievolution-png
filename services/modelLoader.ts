import * as THREE from 'three';

interface RSModelData {
    vertexCount: number;
    positionBuffer: string;
    normalBuffer: string;
    tagentBuffer: string; // Note: Typo in source data 'tagent' -> tangent
    faceCount: number;
    // ... other fields
}

export const parseRSModel = (data: RSModelData): THREE.BufferGeometry => {
    const geometry = new THREE.BufferGeometry();

    // Helper to parse "buffer type[n][]{values...}"
    const parseBuffer = (bufferStr: string, type: 'short' | 'byte', stride: number): number[] => {
        if (!bufferStr) return [];
        const content = bufferStr.substring(bufferStr.indexOf('{') + 1, bufferStr.lastIndexOf('}'));
        return content.split(',').map(Number);
    };

    const positions = parseBuffer(data.positionBuffer, 'short', 3);
    const normals = parseBuffer(data.normalBuffer, 'byte', 3);
    // const tangents = parseBuffer(data.tagentBuffer, 'short', 2); // UVs?

    // Convert to Float32Arrays
    const posArray = new Float32Array(positions.length);
    const normArray = new Float32Array(normals.length);

    // Scaling factor (RS units to World units)
    // RS coords are often large integers. We need to scale them down.
    // Assuming standard tile is 1x1 or 2x2 in Three.js, and RS tile is 128 or 512.
    // Let's try / 128.0 first.
    const SCALE = 1 / 128.0;

    for (let i = 0; i < positions.length; i++) {
        posArray[i] = positions[i] * SCALE;
    }

    for (let i = 0; i < normals.length; i++) {
        // Normals in RS might be 0-255 or -128 to 127. 
        // If byte, likely -128 to 127. Normalize to -1.0 to 1.0.
        // But usually they are direction vectors scaled.
        // Let's assume they are just raw values that need normalizing.
        normArray[i] = normals[i] / 127.0;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    geometry.setAttribute('normal', new THREE.BufferAttribute(normArray, 3));

    // Topology
    // If faceCount is 0, it might be a point cloud or unindexed triangles.
    // Given vertexCount 4601, it's not divisible by 3 (4601 / 3 = 1533.66).
    // This suggests it might be indexed but the indices are missing from the snippet, 
    // OR it's a triangle strip, OR it's just vertices and we need to infer faces (unlikely).
    // OR, the "meshes" field (null in snippet) usually contains the index buffer.

    // Fallback: Render as Points if no faces, or try to render as triangles if divisible.
    // Since it's not divisible, we'll default to Points for safety unless we find indices.

    // Center the geometry
    geometry.center();
    geometry.computeBoundingSphere();

    return geometry;
};
