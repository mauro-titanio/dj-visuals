import { useFrame } from '@react-three/fiber';
import { easing } from 'maath';
import * as THREE from 'three';

interface CinematicCameraProps {
    temperatureRef: React.MutableRefObject<number>;
}

const SimplexLike = (t: number, seed: number) => {
    return Math.sin(t + seed) * 0.5 + Math.sin(t * 0.3 + seed * 2) * 0.3 + Math.sin(t * 0.1 + seed * 4) * 0.2;
};

export const CinematicCamera = ({ temperatureRef }: CinematicCameraProps) => {
    useFrame((state, delta) => {
        const t = state.clock.getElapsedTime() * 0.2; // Slow time
        const camera = state.camera;
        const temperature = temperatureRef.current;

        // 1. Orbital Sway (Noise-based)
        const xOffset = SimplexLike(t, 0) * 10;
        const yOffset = SimplexLike(t, 100) * 5;
        const zOffset = SimplexLike(t, 200) * 10;

        // 2. Zoom Logic (Reactive)
        // High temp -> Zoom In (Closer). Low temp -> Zoom Out (Farther).
        const targetZoom = THREE.MathUtils.lerp(40, 15, temperature);

        // Current logical target position (Orbit + Zoom base)
        const targetX = xOffset;
        const targetY = yOffset;
        const targetZ = targetZoom + zOffset;

        // Apply Damping to the Camera Position for "Weight"
        easing.damp3(camera.position, [targetX, targetY, targetZ], 2.0, delta);

        camera.lookAt(0, 0, 0);
    });

    return null; // Logic only
};
