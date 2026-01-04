import * as THREE from 'three';
import type { VisualizerAudioData } from '../engine/AudioEngine';
import { generateShape, type ParticleShape } from './ParticleShapes';

export class ParticleEngine {
    private count = 10000;
    private points: THREE.Points;
    private shapes: Record<string, Float32Array>;
    private startPositions: Float32Array;

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

        this.startPositions = new Float32Array(this.shapes['scatter']);

        // 2. Setup Mesh
        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.BufferAttribute(this.startPositions, 3));

        const material = new THREE.PointsMaterial({
            color: 0xaaaaaa,
            size: 0.03,
            sizeAttenuation: true,
            transparent: true,
            opacity: 0.8,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });

        this.points = new THREE.Points(geometry, material);
        scene.add(this.points);
    }

    update(delta: number, audio: VisualizerAudioData, targetShape: ParticleShape) {
        const positions = this.points.geometry.attributes.position.array as Float32Array;
        const targetBuffer = this.shapes[targetShape] || this.shapes['scatter'];

        const morphSpeed = delta * 1.5;
        const instability = audio.bass * 0.5;

        for (let i = 0; i < this.count; i++) {
            const i3 = i * 3;

            // 1. Interpolate
            const tx = targetBuffer[i3];
            const ty = targetBuffer[i3 + 1];
            const tz = targetBuffer[i3 + 2];

            const cx = positions[i3];
            const cy = positions[i3 + 1];
            const cz = positions[i3 + 2];

            positions[i3] += (tx - cx) * morphSpeed;
            positions[i3 + 1] += (ty - cy) * morphSpeed;
            positions[i3 + 2] += (tz - cz) * morphSpeed;

            // 2. Audio Noise
            if (audio.energy > 0.1) {
                positions[i3] += (Math.random() - 0.5) * instability;
                positions[i3 + 1] += (Math.random() - 0.5) * instability;
                positions[i3 + 2] += (Math.random() - 0.5) * instability;
            }

            // 3. Kick Expansion
            if (audio.isKick) {
                const dist = Math.sqrt(cx * cx + cy * cy + cz * cz);
                if (dist > 0.1) {
                    const push = 0.5 / dist;
                    positions[i3] += cx * push;
                    positions[i3 + 1] += cy * push;
                    positions[i3 + 2] += cz * push;
                }
            }
        }

        this.points.geometry.attributes.position.needsUpdate = true;

        // 1. Inverse Density-Size Logic
        // energy: 0 -> count: 20, size: 0.5
        // energy: 1 -> count: 10000, size: 0.03

        // a. Dynamic Count (Draw Range)
        const minCount = 20;
        const maxCount = this.count; // 10000
        const targetCount = Math.floor(minCount + (maxCount - minCount) * audio.energy);
        this.points.geometry.setDrawRange(0, targetCount);

        // b. Dynamic Size (Inverse proportional)
        const maxSize = 0.5;
        const minSize = 0.03;
        // Inverse linear mapping: size decreases as energy/count increases
        const targetSize = maxSize - (maxSize - minSize) * audio.energy;
        const mat = this.points.material as THREE.PointsMaterial;
        mat.size += (targetSize - mat.size) * 0.1;

        // 2. High Energy Pulsing (Extra kick for techno impact)
        if (audio.isKick) {
            mat.size *= 1.2;
        }

        // Rotation
        const rotSpeed = 0.1 + audio.treble * 0.2;
        this.points.rotation.y += delta * rotSpeed;
        this.points.rotation.z += delta * 0.05;
    }
}
