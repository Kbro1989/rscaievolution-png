import { useState, useEffect, useCallback } from 'react';

interface GridPosition {
    x: number;
    z: number;
}

interface UseGridMovementProps {
    currentPosition: GridPosition;
    onMove: (position: GridPosition) => void;
    speed?: number; // tiles per second
}

export function useGridMovement({ currentPosition, onMove, speed = 4 }: UseGridMovementProps) {
    const [walkPath, setWalkPath] = useState<GridPosition[]>([]);
    const [isWalking, setIsWalking] = useState(false);
    const [smoothPosition, setSmoothPosition] = useState(currentPosition);

    // Calculate simple path (no obstacles for now)
    const calculatePath = useCallback((from: GridPosition, to: GridPosition): GridPosition[] => {
        const path: GridPosition[] = [];
        let current = { ...from };

        // Move tile-by-tile (no diagonals)
        while (current.x !== to.x || current.z !== to.z) {
            if (current.x !== to.x) {
                current.x += current.x < to.x ? 1 : -1;
                path.push({ ...current });
            } else if (current.z !== to.z) {
                current.z += current.z < to.z ? 1 : -1;
                path.push({ ...current });
            }
        }

        return path;
    }, []);

    // Set destination and calculate path
    const walkTo = useCallback((destination: GridPosition) => {
        const snapped = {
            x: Math.round(destination.x),
            z: Math.round(destination.z)
        };

        const path = calculatePath(currentPosition, snapped);
        if (path.length > 0) {
            setWalkPath(path);
            setIsWalking(true);
        }
    }, [currentPosition, calculatePath]);

    // Update smooth position (called every frame)
    const updateSmoothPosition = useCallback((deltaTime: number) => {
        if (walkPath.length === 0) {
            setIsWalking(false);
            return;
        }

        const target = walkPath[0];
        const dx = target.x - smoothPosition.x;
        const dz = target.z - smoothPosition.z;
        const distance = Math.sqrt(dx * dx + dz * dz);

        if (distance < 0.05) {
            // Reached waypoint
            setSmoothPosition(target);
            onMove(target);
            
            const newPath = walkPath.slice(1);
            setWalkPath(newPath);
            
            if (newPath.length === 0) {
                setIsWalking(false);
            }
        } else {
            // Move towards waypoint
            const moveDistance = speed * deltaTime;
            const ratio = Math.min(moveDistance / distance, 1);
            
            setSmoothPosition({
                x: smoothPosition.x + dx * ratio,
                z: smoothPosition.z + dz * ratio
            });
        }
    }, [walkPath, smoothPosition, speed, onMove]);

    // Clear path
    const stopWalking = useCallback(() => {
        setWalkPath([]);
        setIsWalking(false);
    }, []);

    return {
        walkTo,
        stopWalking,
        isWalking,
        smoothPosition,
        walkPath,
        updateSmoothPosition
    };
}
