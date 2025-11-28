import * as THREE from 'three';

export const degToRad = (deg: number) => (deg * Math.PI) / 180;

/**
 * Converts Latitude and Longitude to 3D Cartesian coordinates on a sphere.
 * @param lat Latitude in degrees (-90 to 90)
 * @param lon Longitude in degrees (-180 to 180)
 * @param radius Radius of the sphere
 * @returns THREE.Vector3
 */
export const latLonToCartesian = (lat: number, lon: number, radius: number): THREE.Vector3 => {
    const phi = degToRad(90 - lat); // polar angle (0 at North Pole, 180 at South Pole)
    const theta = degToRad(lon + 180); // azimuthal angle (0 to 360)

    const x = -(radius * Math.sin(phi) * Math.cos(theta));
    const z = (radius * Math.sin(phi) * Math.sin(theta));
    const y = (radius * Math.cos(phi));

    return new THREE.Vector3(x, y, z);
};

/**
 * Calculates the rotation quaternion to orient an object on the sphere surface
 * so that its "up" vector points away from the center of the sphere.
 * @param position The position vector of the object on the sphere
 * @returns THREE.Quaternion
 */
export const getSphericalRotation = (position: THREE.Vector3): THREE.Quaternion => {
    const up = position.clone().normalize();
    const target = new THREE.Object3D();
    target.position.copy(position);
    target.lookAt(0, 0, 0); // Look at center
    target.rotateX(Math.PI / 2); // Adjust so "up" is normal to surface
    return target.quaternion;
};

export const cartesianToLatLon = (point: THREE.Vector3, radius: number): { lat: number, lon: number } => {
    const phi = Math.acos(point.y / radius); // polar angle
    const theta = Math.atan2(point.z, -point.x); // azimuthal angle

    const lat = 90 - (phi * 180 / Math.PI);
    let lon = (theta * 180 / Math.PI) - 180;

    // Normalize lon to -180..180
    if (lon < -180) lon += 360;
    if (lon > 180) lon -= 360;

    return { lat, lon };
};
