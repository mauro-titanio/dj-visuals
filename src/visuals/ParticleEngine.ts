import * as THREE from 'three';
import type { VisualizerAudioData } from '../engine/AudioEngine';
import { generateShape, type ParticleShape } from './ParticleShapes';

export class ParticleEngine {
    private count = 10000;
    private mesh: THREE.InstancedMesh;
    private shapes: Record<string, Float32Array>;
    private currentPositions: Float32Array;
    private dummy = new THREE.Object3D();
    private geometries: Record<string, THREE.BufferGeometry>;
    private currentGeomKey: string = 'sphere';
    private isWireframe: boolean = false;
    private explosionFactor: number = 0;

    constructor(scene: THREE.Scene) {
        // 1. Generate Shapes
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

        // 2. Setup Geometries
        this.geometries = {
            sphere: new THREE.SphereGeometry(0.08, 16, 12),
            box: new THREE.BoxGeometry(0.12, 0.12, 0.12),
            octa: new THREE.OctahedronGeometry(0.12)
        };

        const material = new THREE.MeshPhongMaterial({
            color: 0xeeeeee,
            specular: 0x444444,
            shininess: 100,
            emissive: 0x222222
        });

        this.mesh = new THREE.InstancedMesh(this.geometries.sphere, material, this.count);
        this.mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
        scene.add(this.mesh);
    }

    public setMaterialMode(mode: 'solid' | 'net') {
        const mat = this.mesh.material as THREE.MeshPhongMaterial;
        this.isWireframe = mode === 'net';
        mat.wireframe = this.isWireframe;
    }

    update(delta: number, audio: VisualizerAudioData, targetShape: ParticleShape) {
        // 0. Geometry Swapping (Industrial Glitch)
        let nextGeomKey = 'sphere';
        if (audio.isKick && audio.energy > 0.75) {
            nextGeomKey = Math.random() > 0.5 ? 'box' : 'octa';
        }

        if (nextGeomKey !== this.currentGeomKey) {
            this.mesh.geometry = this.geometries[nextGeomKey];
            this.currentGeomKey = nextGeomKey;
        }

        // Explosion Trigger
        const isStrongKick = audio.isKick && audio.energy > 0.8;
        if (isStrongKick && Math.random() > 0.85) {
            this.explosionFactor = 1.0;
        }

        // Explosion Decay
        this.explosionFactor *= 0.9;

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

            // Apply Explosion Displacement
            if (this.explosionFactor > 0.01) {
                // Calculate direction from center
                const dist = Math.sqrt(cx * cx + cy * cy + cz * cz) || 1;
                const dirX = cx / dist;
                const dirY = cy / dist;
                const dirZ = cz / dist;

                // Push outward
                const blast = this.explosionFactor * 20 * (Math.random() * 0.5 + 0.5);
                cx += dirX * blast;
                cy += dirY * blast;
                cz += dirZ * blast;
            }

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

        // 8. Reactive Material Animation
        const mat = this.mesh.material as THREE.MeshPhongMaterial;

        // a. Bass Glow (Emissive)
        const baseEmissiveColor = this.isWireframe ? new THREE.Color(0x004444) : new THREE.Color(0x222222);
        const targetEmissive = new THREE.Color(baseEmissiveColor);

        if (audio.bass > 0.5) {
            const glowFactor = this.isWireframe ? 0x00ffff : 0x442200;
            targetEmissive.add(new THREE.Color(glowFactor).multiplyScalar(audio.bass));
        }
        mat.emissive.lerp(targetEmissive, 0.2);

        // b. Treble Flicker (Shininess)
        mat.shininess = 50 + audio.treble * 150;

        // c. Kick Glitch Color
        const baseColor = this.isWireframe ? new THREE.Color(0x00ffff) : new THREE.Color(0xeeeeee);
        const glitchColor = new THREE.Color(0xff2222); // Aggressive red glitch

        const kickThreshold = this.isWireframe ? 0.6 : 0.8;
        if (audio.isKick && audio.energy > kickThreshold) {
            mat.color.copy(glitchColor);
            mat.emissiveIntensity = this.isWireframe ? 8.0 : 4.0;
        } else {
            mat.color.lerp(baseColor, 0.1);
            const targetIntensity = this.isWireframe ? 2.0 : 1.0;
            mat.emissiveIntensity += (targetIntensity - mat.emissiveIntensity) * 0.1;
        }

        // Rotation
        const rotSpeed = 0.1 + audio.treble * 0.2;
        this.mesh.rotation.y += delta * rotSpeed;
        this.mesh.rotation.z += delta * 0.05;
    }
}
