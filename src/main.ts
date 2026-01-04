import { AudioEngine, type VisualizerAudioData } from './engine/AudioEngine';
import { ThreeEngine } from './engine/ThreeEngine';
import './index.css';
import { CameraEngine } from './visuals/CameraEngine';
import { ParticleEngine } from './visuals/ParticleEngine';
import type { ParticleShape } from './visuals/ParticleShapes';

class App {
    private audioEngine: AudioEngine;
    private threeEngine: ThreeEngine;
    private particleEngine: ParticleEngine;
    private cameraEngine: CameraEngine;

    private overlay: HTMLElement;
    private startButton: HTMLButtonElement;

    private lastTime = 0;
    private activeShape: ParticleShape = 'sphere';

    constructor() {
        this.overlay = document.getElementById('overlay')!;
        this.startButton = document.getElementById('start-button') as HTMLButtonElement;

        const canvas = document.getElementById('visualizer') as HTMLCanvasElement;

        // Initialize Engines
        this.audioEngine = new AudioEngine();
        this.threeEngine = new ThreeEngine(canvas);
        this.particleEngine = new ParticleEngine(this.threeEngine.scene);
        this.cameraEngine = new CameraEngine();

        this.startButton.addEventListener('click', () => this.start());

        // Fullscreen
        window.addEventListener('dblclick', () => {
            if (!document.fullscreenElement) {
                document.documentElement.requestFullscreen();
            } else {
                document.exitFullscreen();
            }
        });
    }

    async start() {
        await this.audioEngine.init();
        this.overlay.classList.add('hidden');

        requestAnimationFrame((t) => this.loop(t));
    }

    private loop(time: number) {
        const delta = Math.min((time - this.lastTime) / 1000, 0.1);
        this.lastTime = time;

        const audio = this.audioEngine.update();
        const elapsedTime = time / 1000;

        // 1. Narrative Logic (Chapter Cycle)
        this.updateNarrative(elapsedTime, audio);

        // 2. Update Visuals
        this.particleEngine.update(delta, audio, this.activeShape);
        this.cameraEngine.update(delta, audio, this.threeEngine.camera, elapsedTime);

        // 3. Render and Lights
        this.threeEngine.updateLights(audio.energy);
        this.threeEngine.render(delta);

        requestAnimationFrame((t) => this.loop(t));
    }

    private updateNarrative(time: number, audio: VisualizerAudioData) {
        // 1. Glitch Morphing (Unexpected shape flickering on kicks)
        if (audio.energy > 0.8 && audio.isKick && Math.random() > 0.7) {
            const glitchShapes: ParticleShape[] = ['scatter', 'vortex', 'spikes', 'shards'];
            this.activeShape = glitchShapes[Math.floor(Math.random() * glitchShapes.length)];
            return;
        }

        // 2. Shape Chapter Cycle
        const shapeCycleLength = 12;
        const shapes: ParticleShape[] = [
            'monolith', 'spikes', 'shards', 'prism', 'structure',
            'knot', 'cross', 'grid', 'pyramid', 'cube_hollow',
            'star', 'spiral', 'wave', 'fountain', 'ring'
        ];
        const shapeChapter = Math.floor(time / shapeCycleLength) % shapes.length;
        this.activeShape = shapes[shapeChapter];

        // 3. Camera Mode Cycle
        const camCycleLength = 8;
        const camModes = ['steady', 'kinetic', 'dolly_zoom', 'orbital_chaos', 'macro'];
        const camChapter = Math.floor(time / camCycleLength) % camModes.length;
        this.cameraEngine.setMode(camModes[camChapter]);
    }
}

// Bootstrap
new App();
