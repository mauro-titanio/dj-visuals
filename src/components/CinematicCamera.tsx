import { useFrame } from '@react-three/fiber';
import { easing } from 'maath';
import { useRef } from 'react';
import * as THREE from 'three';
import { useShallow } from 'zustand/react/shallow';
import { useVJStore } from '../store/useVJStore';

const SimplexLikeValue = (t: number, seed: number) => {
    return Math.sin(t + seed) * 0.5 + Math.sin(t * 0.3 + seed * 2) * 0.3 + Math.sin(t * 0.1 + seed * 4) * 0.2;
};

export const CinematicCamera = () => {
    const { audioData, cameraMode } = useVJStore(useShallow((state) => ({
        audioData: state.audioData,
        cameraMode: state.cameraMode
    })));
    const lastKickRef = useRef(false);
    const fovRef = useRef(45);

    useFrame((state, delta) => {
        const time = state.clock.getElapsedTime();
        const camera = state.camera as THREE.PerspectiveCamera;
        const temperature = audioData.temperature;
        const isKick = audioData.isKick;

        // 1. Position & Motion Logic based on Mode
        let xOffset = 0;
        let yOffset = 0;
        let zOffset = 0;
        const lookAtTarget = new THREE.Vector3(0, 0, 0);
        let lerpSpeed = 2.0;

        switch (cameraMode) {
            case 'steady':
                xOffset = SimplexLikeValue(time * 0.1, 0) * 10;
                yOffset = SimplexLikeValue(time * 0.1, 10) * 5;
                zOffset = 40 + SimplexLikeValue(time * 0.1, 20) * 10;
                lerpSpeed = 1.0;
                break;
            case 'kinetic': {
                const rad = 30 + Math.sin(time * 0.2) * 10;
                xOffset = Math.sin(time * 0.5) * rad;
                zOffset = Math.cos(time * 0.5) * rad;
                yOffset = Math.sin(time * 0.3) * 15;
                lerpSpeed = 3.0;
                break;
            }
            case 'glitchy':
                if (isKick && !lastKickRef.current) {
                    // Sudden jump on kick
                    camera.position.x += (Math.random() - 0.5) * 5;
                    camera.position.y += (Math.random() - 0.5) * 5;
                }
                xOffset = Math.sin(time * 2.0) * 20;
                zOffset = Math.cos(time * 2.0) * 20;
                yOffset = 10;
                lerpSpeed = 5.0;
                break;
        }

        // 2. Reactive Zoom (Base distance)
        const baseDistance = THREE.MathUtils.lerp(45, 15, temperature);
        if (cameraMode !== 'glitchy') {
            easing.damp3(camera.position, [xOffset, yOffset, baseDistance], lerpSpeed, delta);
        } else {
            easing.damp3(camera.position, [xOffset, yOffset, zOffset], lerpSpeed, delta);
        }

        // 3. FOV Pulses on Kick
        if (isKick && !lastKickRef.current) {
            fovRef.current = 60 + audioData.high * 40; // Zoom out effect
        }
        easing.damp(fovRef, 'current', 45, 0.2, delta);
        camera.fov = fovRef.current;
        camera.updateProjectionMatrix();

        camera.lookAt(lookAtTarget);
        lastKickRef.current = isKick;
    });

    return null;
};
