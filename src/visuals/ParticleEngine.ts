import * as THREE from 'three';
import type { VisualizerAudioData } from '../engine/AudioEngine';
import { generateShape, type ParticleShape } from './ParticleShapes';

export class ParticleEngine {
    private count = 10000;
    private mesh: THREE.InstancedMesh;
    private shapes: Record<string, Float32Array>;
    private currentPositions: Float32Array;
    private dummy = new THREE.Object3D();

    constructor(scene: THREE.Scene) {
        // 1. Pre-generate all shapes
        this.shapes = {
            sphere: generateShape('sphere', this.count),
            cube: generateShape('cube', this.count),
            tunnel: generateShape('tunnel', this.count),
            dna: generateShape('dna', this.count),
            vortex: generateShape('vortex', this.count),
            grid: generateShape('grid', this.count),
            torus: generateShape('torus', this.count),
            galaxy: generateShape('galaxy', this.count),
            pyramid: generateShape('pyramid', this.count),
            hourglass: generateShape('hourglass', this.count),
            cross: generateShape('cross', this.count),
            knot: generateShape('knot', this.count),
            star: generateShape('star', this.count),
            spiral: generateShape('spiral', this.count),
            wave: generateShape('wave', this.count),
            fountain: generateShape('fountain', this.count),
            cube_hollow: generateShape('cube_hollow', this.count),
            ring: generateShape('ring', this.count),
            monolith: generateShape('monolith', this.count),
            spikes: generateShape('spikes', this.count),
            shards: generateShape('shards', this.count),
            prism: generateShape('prism', this.count),
            structure: generateShape('structure', this.count),
            scatter: generateShape('scatter', this.count),
        };

        this.currentPositions = new Float32Array(this.shapes['scatter']);

        // 2. Setup Mesh (True 3D Spheres - High Fidelity)
        const geometry = new THREE.SphereGeometry(0.08, 16, 12); // Smoother geometry
        const material = new THREE.MeshPhongMaterial({
            color: 0xeeeeee,
            specular: 0x444444,
            shininess: 100,
            emissive: 0x222222
        });

        this.mesh = new THREE.InstancedMesh(geometry, material, this.count);
        this.mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
        scene.add(this.mesh);
    }

    update(delta: number, audio: VisualizerAudioData, targetShape: ParticleShape) {
        const targetBuffer = this.shapes[targetShape] || this.shapes['scatter'];
        const morphSpeed = delta * 1.5;

        for (let i = 0; i < this.count; i++) {
            const i3 = i * 3;

            // 1. Interpolate (Morphing)
            const tx = targetBuffer[i3];
            const ty = targetBuffer[i3 + 1];
            const tz = targetBuffer[i3 + 2];

            let cx = this.currentPositions[i3];
            let cy = this.currentPositions[i3 + 1];
            let cz = this.currentPositions[i3 + 2];

            this.currentPositions[i3] += (tx - cx) * morphSpeed;
            this.currentPositions[i3 + 1] += (ty - cy) * morphSpeed;
            this.currentPositions[i3 + 2] += (tz - cz) * morphSpeed;

            // 2. Industrial Twist & Shear (Driven by Bass)
            const twistAmount = audio.bass * 0.2;
            const angle = cy * twistAmount;
            const s = Math.sin(angle);
            const c = Math.cos(angle);

            const nx = cx * c - cz * s;
            const nz = cx * s + cz * c;
            cx = nx;
            cz = nz;

            // 3. Spectral Vibration (High Frequency Jitter)
            const vibration = (audio.treble * 0.2 + audio.mid * 0.1);
            if (vibration > 0.01) {
                cx += (Math.random() - 0.5) * vibration;
                cy += (Math.random() - 0.5) * vibration;
                cz += (Math.random() - 0.5) * vibration;
            }

            // 4. Industrial Scan Sweep (Procedural Wave)
            const scanPos = (Math.sin(performance.now() * 0.002) * 50);
            const scanDist = Math.abs(cx - scanPos);
            if (scanDist < 5) {
                const scanImpact = (1 - scanDist / 5) * 2;
                cz += scanImpact * audio.energy;
            }

            // 5. Non-Uniform Kick Impact (Industrial Stress)
            if (audio.isKick) {
                cx *= (1 + audio.energy * 0.1);
                cy *= (1 - audio.energy * 0.05);
            }

            // 6. Apply to Instance Matrix
            this.dummy.position.set(cx, cy, cz);

            // Inverse Scale Logic inside instance (Adjusted for 0.1 base radius)
            // energy: 0 -> scale: 2.0 (total radius 0.2)
            // energy: 1 -> scale: 0.5 (total radius 0.05)
            const maxScale = 2.0;
            const minScale = 0.5;
            const baseScale = maxScale - (maxScale - minScale) * audio.energy;
            const kickScale = audio.isKick ? 1.2 : 1.0;
            this.dummy.scale.setScalar(baseScale * kickScale);

            this.dummy.updateMatrix();
            this.mesh.setMatrixAt(i, this.dummy.matrix);
        }

        this.mesh.instanceMatrix.needsUpdate = true;

        // 7. Dynamic Density (Count)
        const minCount = 20;
        const targetCount = Math.floor(minCount + (this.count - minCount) * audio.energy);
        this.mesh.count = targetCount;

        // Rotation
        const rotSpeed = 0.1 + audio.treble * 0.2;
        this.mesh.rotation.y += delta * rotSpeed;
        this.mesh.rotation.z += delta * 0.05;
    }
}
