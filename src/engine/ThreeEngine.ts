import {
    BlendFunction,
    ChromaticAberrationEffect,
    EffectComposer,
    EffectPass,
    GlitchEffect,
    NoiseEffect,
    PixelationEffect,
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
    public chromaticAberrationEffect: ChromaticAberrationEffect;
    public pixelationEffect: PixelationEffect;

    // Lights
    private ambientLight: THREE.AmbientLight;
    public strobeLight: THREE.PointLight;
    private directionalLight: THREE.DirectionalLight;

    constructor(canvas: HTMLCanvasElement) {
        // 1. Core
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.z = 50;

        // Lights Setup
        this.ambientLight = new THREE.AmbientLight(0xffffff, 0.2); // Base ambient
        this.scene.add(this.ambientLight);

        this.directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        this.directionalLight.position.set(5, 10, 7);
        this.scene.add(this.directionalLight);

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
            blendFunction: BlendFunction.SCREEN,
            premultiply: true
        });
        this.noiseEffect.blendMode.opacity.value = 0.1;

        this.vignetteEffect = new VignetteEffect({
            offset: 0.1,
            darkness: 0.6
        });

        this.glitchEffect = new GlitchEffect({
            delay: new THREE.Vector2(0.5, 1.0),
            duration: new THREE.Vector2(0.1, 0.3),
            strength: new THREE.Vector2(0.3, 0.6)
        });

        this.chromaticAberrationEffect = new ChromaticAberrationEffect({
            offset: new THREE.Vector2(0.001, 0.001),
            radialModulation: false,
            modulationOffset: 0.1
        });

        this.pixelationEffect = new PixelationEffect(0);

        // Pass 1: UV Transformations (Digital Distortion)
        // These transform texture coordinates and cannot mix with convolution
        const distortionPass = new EffectPass(
            this.camera,
            this.glitchEffect,
            this.pixelationEffect
        );

        // Pass 2: Overlays & Convolution (Analog Effects)
        // Chromatic Aberration behaves like convolution (blur) in some contexts
        const overlayPass = new EffectPass(
            this.camera,
            this.chromaticAberrationEffect,
            this.scanlineEffect,
            this.noiseEffect,
            this.vignetteEffect
        );

        this.composer.addPass(distortionPass);
        this.composer.addPass(overlayPass);

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

    updateEngine(delta: number, audio: any) {
        // 1. Lights
        this.ambientLight.intensity = 0.4 + audio.energy * 0.2;
        this.strobeLight.intensity = audio.energy > 0.8 ? audio.energy * 150 : audio.energy * 10;
        this.strobeLight.position.x = Math.sin(performance.now() * 0.001) * 20;

        // Subtle light movement using delta
        this.directionalLight.position.x += Math.sin(delta * 2) * 5;
        this.directionalLight.position.z += Math.cos(delta * 2) * 5;

        // 2. Effects
        // Chromatic Aberration follows treble and transients
        const chromOffset = audio.treble * 0.01;
        this.chromaticAberrationEffect.offset.set(chromOffset, chromOffset);

        // Pixelation Glitch on strong kicks
        if (audio.isKick && audio.energy > 0.85) {
            this.pixelationEffect.granularity = 10;
        } else {
            this.pixelationEffect.granularity = 0;
        }

        // Noise follows overall tension
        this.noiseEffect.blendMode.opacity.value = 0.05 + audio.energy * 0.15;
    }

    render(delta: number) {
        this.composer.render(delta);
    }
}
