import {
    BlendFunction,
    EffectComposer,
    EffectPass,
    GlitchEffect,
    NoiseEffect,
    RenderPass,
    ScanlineEffect,
    VignetteEffect
} from 'postprocessing';
import * as THREE from 'three';

export class ThreeEngine {
    public scene: THREE.Scene;
    public camera: THREE.PerspectiveCamera;
    public renderer: THREE.WebGLRenderer;
    public composer: EffectComposer;

    // Effects
    public glitchEffect: GlitchEffect;
    public noiseEffect: NoiseEffect;
    public scanlineEffect: ScanlineEffect;
    public vignetteEffect: VignetteEffect;

    // Lights
    private ambientLight: THREE.AmbientLight;
    public strobeLight: THREE.PointLight;

    constructor(canvas: HTMLCanvasElement) {
        // 1. Core
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.z = 50;

        // Lights Setup
        this.ambientLight = new THREE.AmbientLight(0xffffff, 0.1);
        this.scene.add(this.ambientLight);

        this.strobeLight = new THREE.PointLight(0xffffff, 0, 100);
        this.strobeLight.position.set(0, 10, 20);
        this.scene.add(this.strobeLight);

        this.renderer = new THREE.WebGLRenderer({
            canvas,
            powerPreference: 'high-performance',
            antialias: false,
            stencil: false,
            depth: true
        });
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setClearColor(0x000000);

        // 2. Post-processing
        this.composer = new EffectComposer(this.renderer);
        this.composer.addPass(new RenderPass(this.scene, this.camera));

        // Create Effects
        this.scanlineEffect = new ScanlineEffect({
            density: 1.5
        });
        this.scanlineEffect.blendMode.opacity.value = 0.15;

        this.noiseEffect = new NoiseEffect({
            blendFunction: BlendFunction.SCREEN, // Use SCREEN or similar
            premultiply: true
        });
        this.noiseEffect.blendMode.opacity.value = 0.1;

        this.vignetteEffect = new VignetteEffect({
            eskil: false,
            offset: 0.1,
            darkness: 0.6
        });

        this.glitchEffect = new GlitchEffect({
            delay: new THREE.Vector2(0.5, 1.0),
            duration: new THREE.Vector2(0.1, 0.3),
            strength: new THREE.Vector2(0.3, 0.6)
        });

        // Effect Pass
        const effectPass = new EffectPass(
            this.camera,
            this.scanlineEffect,
            this.noiseEffect,
            this.vignetteEffect,
            this.glitchEffect
        );
        this.composer.addPass(effectPass);

        // Events
        window.addEventListener('resize', this.onResize.bind(this));
    }

    private onResize() {
        const width = window.innerWidth;
        const height = window.innerHeight;

        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();

        this.renderer.setSize(width, height);
        this.composer.setSize(width, height);
    }

    updateLights(energy: number) {
        // Ambient flicker
        this.ambientLight.intensity = 0.1 + energy * 0.1;

        // Strobe effect on high energy
        this.strobeLight.intensity = energy > 0.8 ? energy * 50 : energy * 5;
        this.strobeLight.position.x = Math.sin(performance.now() * 0.001) * 20;
    }

    render(delta: number) {
        this.composer.render(delta);
    }
}
