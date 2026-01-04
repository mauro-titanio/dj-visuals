import { easing } from 'maath';
import * as THREE from 'three';
import { type VisualizerAudioData } from '../engine/AudioEngine';

const DriftNoise = (t: number, seed: number) => {
    return Math.sin(t * 0.2 + seed) * 0.6 + Math.sin(t * 0.05 + seed * 2) * 0.4;
};

export class CameraEngine {
    private targetLook = new THREE.Vector3(0, 0, 0);
    private shakeOffset = new THREE.Vector3(0, 0, 0);
    private fovState = { current: 45 };
    private zRotState = { current: 0 };

    constructor() { }

    update(delta: number, audio: VisualizerAudioData, camera: THREE.PerspectiveCamera, time: number) {
        // 1. Mode Calculation
        let mode = 'steady';
        if (audio.energy > 0.8) mode = 'glitchy';
        else if (audio.energy > 0.4) mode = 'kinetic';

        const targetPos = new THREE.Vector3();
        let lerpSpeed = 0.5;

        // 2. Base Movement
        if (mode === 'steady') {
            targetPos.set(
                DriftNoise(time * 0.5, 0) * 15,
                DriftNoise(time * 0.5, 10) * 8,
                45 + DriftNoise(time * 0.3, 20) * 10
            );
            lerpSpeed = 0.8;
        } else if (mode === 'kinetic') {
            const rad = 30 + Math.sin(time * 0.1) * 10;
            const orbit = time * 0.2;
            targetPos.set(
                Math.sin(orbit) * rad,
                10 + DriftNoise(time, 5) * 10,
                Math.cos(orbit) * rad
            );
            lerpSpeed = 1.2;
        } else {
            const rad = 25;
            const fastOrbit = time * 0.5;
            targetPos.set(
                Math.sin(fastOrbit) * rad,
                20 + Math.sin(time * 2) * 10,
                Math.cos(fastOrbit) * rad
            );
            lerpSpeed = 3.0;
        }

        // 3. Kick Shake
        if (audio.isKick) {
            const shake = 2.0 * audio.energy;
            this.shakeOffset.set(
                (Math.random() - 0.5) * shake,
                (Math.random() - 0.5) * shake,
                (Math.random() - 0.5) * shake
            );
        }
        easing.damp3(this.shakeOffset, [0, 0, 0], 0.1, delta);

        // 4. Apply
        const finalTarget = targetPos.add(this.shakeOffset);
        easing.damp3(camera.position, finalTarget, lerpSpeed, delta);

        // 5. Look At
        const lookTarget = new THREE.Vector3(
            DriftNoise(time * 0.2, 100) * 5,
            DriftNoise(time * 0.2, 200) * 5,
            0
        );
        easing.damp3(this.targetLook, lookTarget, 1.0, delta);
        camera.lookAt(this.targetLook);

        // 6. Rotation & FOV
        const baseTilt = Math.sin(time * 0.2) * 0.1;
        const kickTilt = audio.isKick ? (Math.random() - 0.5) * 0.2 : 0;
        const targetZ = baseTilt + kickTilt;

        easing.damp(this.zRotState, 'current', targetZ, 0.5, delta);
        camera.rotation.z = this.zRotState.current;

        const targetFov = 45 + audio.energy * 20;
        easing.damp(this.fovState, 'current', targetFov, 0.2, delta);
        camera.fov = this.fovState.current;
        camera.updateProjectionMatrix();
    }
}
