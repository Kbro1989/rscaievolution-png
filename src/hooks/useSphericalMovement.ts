import { useState, useCallback } from 'react';
import { latLonToCartesian, degToRad } from '../utils/sphericalMath';

export interface SphericalPosition {
    lat: number; // -90 .. 90 (degrees)
    lon: number; // -180 .. 180 (degrees)
}

/**
 * Simple spherical movement hook.
 * Stores latitude and longitude in degrees and provides helpers to move/rotate.
 * The globe radius is supplied by the caller (default 100).
 */
export function useSphericalMovement(initialRadius: number = 100) {
    const [position, setPosition] = useState<SphericalPosition>({ lat: 0, lon: 0 });
    const [heading, setHeading] = useState<number>(0); // degrees, 0 = north

    const getCartesian = useCallback(
        (lat: number, lon: number) => latLonToCartesian(lat, lon, initialRadius),
        [initialRadius]
    );

    const moveForward = useCallback(
        (distance: number) => {
            // Move along heading direction on the sphere surface.
            // Approximate by adjusting lat/lon based on heading.
            const headingRad = degToRad(heading);
            const deltaLat = distance * Math.cos(headingRad) / initialRadius * (180 / Math.PI);

            // Avoid division by zero at poles
            const cosLat = Math.cos(degToRad(position.lat));
            const safeCosLat = Math.abs(cosLat) < 0.0001 ? 0.0001 : cosLat;

            const deltaLon = distance * Math.sin(headingRad) / (initialRadius * safeCosLat) * (180 / Math.PI);

            setPosition(prev => ({
                lat: Math.max(-90, Math.min(90, prev.lat + deltaLat)),
                lon: ((prev.lon + deltaLon + 180) % 360) - 180,
            }));
        },
        [heading, initialRadius, position.lat]
    );

    const turnLeft = useCallback((angle: number) => {
        setHeading(prev => (prev - angle + 360) % 360);
    }, []);

    const turnRight = useCallback((angle: number) => {
        setHeading(prev => (prev + angle) % 360);
    }, []);

    return {
        position,
        setPosition,
        heading,
        setHeading,
        latLonToCartesian: getCartesian,
        moveForward,
        turnLeft,
        turnRight,
    };
}
