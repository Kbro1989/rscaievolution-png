import { useEffect, useRef } from 'react';
import createGlobe from 'cobe';

interface EarthTextureProps {
    onTextureReady: (canvas: HTMLCanvasElement) => void;
}

export const EarthTexture: React.FC<EarthTextureProps> = ({ onTextureReady }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const globeRef = useRef<any>(null);

    useEffect(() => {
        if (!canvasRef.current) return;

        let phi = 0;

        // Create the cobe globe with proper continent rendering settings
        globeRef.current = createGlobe(canvasRef.current, {
            devicePixelRatio: 2,
            width: 2048,
            height: 2048,
            phi: 0,
            theta: 0,
            dark: 1, // Dark mode to show continents
            diffuse: 1.2,
            mapSamples: 16000,
            mapBrightness: 6,
            baseColor: [0.1, 0.1, 0.1], // Darker ocean
            markerColor: [1, 1, 1], // White markers (won't show our markers, just cobe's)
            glowColor: [0.05, 0.05, 0.1],
            markers: [],
            onRender: (state) => {
                // Slowly rotate to ensure texture updates
                state.phi = phi;
                phi += 0.005;

                // Trigger texture update on first few renders
                if (state.phi < 2 && canvasRef.current) {
                    onTextureReady(canvasRef.current);
                }
            }
        });

        // Initial texture ready callback
        setTimeout(() => {
            if (canvasRef.current) {
                onTextureReady(canvasRef.current);
            }
        }, 500); // Longer delay to ensure first render

        return () => {
            if (globeRef.current) {
                globeRef.current.destroy();
            }
        };
    }, [onTextureReady]);

    return (
        <canvas
            ref={canvasRef}
            style={{
                width: 2048,
                height: 2048,
                position: 'absolute',
                top: -10000,
                left: -10000,
                pointerEvents: 'none'
            }}
        />
    );
};
