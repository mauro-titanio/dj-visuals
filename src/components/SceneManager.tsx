import { PerspectiveCamera } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { easing } from 'maath';
import { useRef } from 'react';
import * as THREE from 'three';
import type { AudioData } from '../hooks/useAudioClock';
import { useTrackTemperature } from '../hooks/useTrackTemperature';
import { CinematicCamera } from './CinematicCamera';
import { OrganicScene } from './OrganicScene';

interface SceneManagerProps {
    getAudioData: () => AudioData;
}

export const SceneManager = ({ getAudioData }: SceneManagerProps) => {
    // Hooks & Refs
    const { updateTemperature } = useTrackTemperature();

    // Shared Data Refs (Zero-React-Render updates)
    const temperatureRef = useRef(0);
    const trebleRef = useRef(0);

    // Light Refs
    const ambientRef = useRef<THREE.AmbientLight>(null);
    const pointRef1 = useRef<THREE.PointLight>(null);
    const pointRef2 = useRef<THREE.PointLight>(null);

    useFrame((state, delta) => {
        const audio = getAudioData();

        // 1. Update Temperature logic
        const temp = updateTemperature(audio);
        temperatureRef.current = temp;

        // 2. Update Treble
        const treble = audio.high;
        trebleRef.current = treble;

        // 3. Lighting Logic (Reactive)
        // Ambient: Blue -> Red based on Temp
        if (ambientRef.current) {
            const cool = new THREE.Color('#001133'); // Deep Blue
            const hot = new THREE.Color('#330500');  // Dark Red

            // Interpolate color based on temp
            const targetColor = cool.clone().lerp(hot, temp);

            easing.dampC(ambientRef.current.color, targetColor, 0.5, delta);
            ambientRef.current.intensity = 0.5 + temp * 0.5;
        }

        // Point Lights: Treble reaction (Hi-hat flashes)
        // Orbit them too?
        const time = state.clock.getElapsedTime();

        const updatePointLight = (ref: React.MutableRefObject<THREE.PointLight | null>, offset: number) => {
            if (ref.current) {
                // Orbit
                ref.current.position.set(
                    Math.sin(time * 0.5 + offset) * 20,
                    Math.sin(time * 0.3 + offset) * 10,
                    Math.cos(time * 0.5 + offset) * 20
                );

                // Intensity = Base + Treble impulse
                // Boost treble significantly
                const targetIntensity = 2.0 + (treble * 10.0);
                easing.damp(ref.current, 'intensity', targetIntensity, 0.1, delta);

                // Color could also flare up? White?
            }
        };

        updatePointLight(pointRef1, 0);
        updatePointLight(pointRef2, Math.PI);
    });

    return (
        <>
            <PerspectiveCamera makeDefault position={[0, 0, 40]} />

            {/* Autonomous Camera */}
            <CinematicCamera temperatureRef={temperatureRef} />

            {/* Visuals */}
            <OrganicScene temperatureRef={temperatureRef} trebleRef={trebleRef} />

            {/* Reactive Lighting */}
            <ambientLight ref={ambientRef} />
            <pointLight ref={pointRef1} distance={50} decay={2} color="#ffaaee" />
            <pointLight ref={pointRef2} distance={50} decay={2} color="#ccff00" />

            <fog attach="fog" args={['#000000', 30, 80]} />
        </>
    );
};
