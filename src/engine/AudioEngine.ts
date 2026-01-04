export interface VisualizerAudioData {
    bass: number;
    mid: number;
    treble: number;
    energy: number;
    isKick: boolean;
    beatCount: number;
    sceneIndex: number;
    time: number;
    frequencyData: Uint8Array;
}

export class AudioEngine {
    private context: AudioContext | null = null;
    private analyser: AnalyserNode | null = null;
    private dataArray: Uint8Array | null = null;
    private isInitialized = false;

    // Smoothed Values
    private smoothed = { bass: 0, mid: 0, treble: 0, energy: 0 };

    // Kick Detection State
    private prevBassEnergy = 0;
    private lastKickTime = 0;
    private fluxHistory: number[] = [];

    public beatCount = 0;
    public sceneIndex = 0;

    constructor() { }

    async init() {
        if (this.isInitialized) return;

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            this.context = new (window.AudioContext || (window as any).webkitAudioContext)();
            const source = this.context.createMediaStreamSource(stream);
            this.analyser = this.context.createAnalyser();

            this.analyser.fftSize = 2048;
            this.analyser.smoothingTimeConstant = 0.0; // Use our own smoothing
            source.connect(this.analyser);

            this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);
            this.isInitialized = true;
        } catch (err) {
            console.error('AudioEngine initialization failed:', err);
        }
    }

    update(): VisualizerAudioData {
        if (!this.isInitialized || !this.analyser || !this.dataArray) {
            return this.getEmptyData();
        }

        if (this.analyser && this.dataArray) {
            //@ts-ignore
            this.analyser.getByteFrequencyData(this.dataArray as unknown as Uint8Array);
        }
        const data = this.dataArray;
        const now = performance.now();

        // 1. Bass Energy Isolation (< 150Hz)
        let bassSum = 0;
        const lowBins = 6;
        for (let i = 0; i <= lowBins; i++) bassSum += data[i];
        const currentBassEnergy = bassSum / (lowBins + 1) / 255;

        // 2. Kick Detection (Spectral Flux)
        const flux = Math.max(0, currentBassEnergy - this.prevBassEnergy);
        this.prevBassEnergy = currentBassEnergy;

        this.fluxHistory.push(flux);
        if (this.fluxHistory.length > 30) this.fluxHistory.shift();
        const avgFlux = this.fluxHistory.reduce((a, b) => a + b, 0) / this.fluxHistory.length;
        const dynamicThreshold = Math.max(0.15, avgFlux * 2.0);

        let isKick = false;
        if (flux > dynamicThreshold && (now - this.lastKickTime > 100)) {
            isKick = true;
            this.lastKickTime = now;
            this.beatCount += 1;
            if (this.beatCount % 16 === 0) {
                this.sceneIndex += 1;
            }
        }

        // 3. Smooth Values (Lerp)
        let midSum = 0;
        for (let i = 8; i <= 100; i++) midSum += data[i];
        const rawMid = midSum / (100 - 8 + 1) / 255;

        let highSum = 0;
        for (let i = 101; i <= 512; i++) highSum += data[i];
        const rawHigh = highSum / (512 - 101 + 1) / 255;

        const rawEnergy = (currentBassEnergy + rawMid + rawHigh) / 3;

        this.smoothed.bass += (currentBassEnergy - this.smoothed.bass) * 0.2;
        this.smoothed.mid += (rawMid - this.smoothed.mid) * 0.1;
        this.smoothed.treble += (rawHigh - this.smoothed.treble) * 0.1;
        this.smoothed.energy += (rawEnergy - this.smoothed.energy) * 0.1;

        return {
            ...this.smoothed,
            isKick,
            beatCount: this.beatCount,
            sceneIndex: this.sceneIndex,
            time: now / 1000,
            frequencyData: data
        };
    }

    private getEmptyData(): VisualizerAudioData {
        return {
            bass: 0, mid: 0, treble: 0, energy: 0,
            isKick: false, beatCount: 0, sceneIndex: 0,
            time: 0,
            frequencyData: new Uint8Array(0)
        };
    }

    get initialized() { return this.isInitialized; }
}
