import { useFrame } from '@react-three/fiber';
import { easing } from 'maath';
import { useRef } from 'react';
import * as THREE from 'three';
import { useVJStore } from '../store/useVJStore';

export const LightingStrobe = () => {
    const lightRef = useRef<THREE.PointLight>(null);
    const audioData = useVJStore((state) => state.audioData);
    const lastKickRef = useRef(false);

    useFrame((state, delta) => {
        if (!lightRef.current) return;

        const isKick = audioData.isKick;

        // On Kick Trigger: Instant spike
        if (isKick && !lastKickRef.current) {
            lightRef.current.intensity = 20; // Flash intensity
        }

        // Natural decay
        easing.damp(lightRef.current, 'intensity', 0, 0.2, delta);

        lastKickRef.current = isKick;

        // Slight movement to the strobe
        const time = state.clock.getElapsedTime();
        lightRef.current.position.set(
            Math.sin(time) * 10,
            15,
            Math.cos(time) * 10
        );
    });

    return (
        <pointLight
            ref={lightRef}
            color="#ffffff"
            distance={50}
            decay={2}
        />
    );
};
