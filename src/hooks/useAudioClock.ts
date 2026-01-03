/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback, useEffect, useRef, useState } from 'react';

export interface AudioClock {
    isInitialized: boolean;
    initAudio: () => void;
    getAudioData: () => AudioData;
}

export interface AudioData {
    bass: number;
    mid: number;
    high: number;
    energy: number;
    isKick: boolean;
    beatCount: number;
    sceneIndex: number;
}

export const useAudioClock = (): AudioClock => {
    const [analyser, setAnalyser] = useState<AnalyserNode | null>(null);
    const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
    const [isInitialized, setIsInitialized] = useState(false);

    // Audio Data Refs
    const dataArrayRef = useRef<Uint8Array | null>(null);
    const smoothedValuesRef = useRef({ bass: 0, mid: 0, high: 0, energy: 0 });

    // Clock/Gate State
    const beatCountRef = useRef(0);
    const sceneIndexRef = useRef(0);

    // Detection Logic State
    const prevBassEnergyRef = useRef(0);
    const lastKickTimeRef = useRef(0);
    const fluxHistoryRef = useRef<number[]>([]);

    const initAudio = useCallback(async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const context = new (window.AudioContext || (window as any).webkitAudioContext)();
            const source = context.createMediaStreamSource(stream);
            const analyserNode = context.createAnalyser();

            analyserNode.fftSize = 2048;
            // Use 0 smoothing on the node to get raw data for our own processing
            analyserNode.smoothingTimeConstant = 0.0;
            source.connect(analyserNode);

            const bufferLength = analyserNode.frequencyBinCount;
            dataArrayRef.current = new Uint8Array(bufferLength);

            setAnalyser(analyserNode);
            setAudioContext(context);
            setIsInitialized(true);
        } catch (err) {
            console.error('Error accessing microphone:', err);
        }
    }, []);

    const getAudioData = useCallback((): AudioData => {
        if (!analyser || !dataArrayRef.current) {
            return {
                bass: 0, mid: 0, high: 0, energy: 0,
                isKick: false, beatCount: 0, sceneIndex: 0
            };
        }

        analyser.getByteFrequencyData(dataArrayRef.current as any);
        const data = dataArrayRef.current;
        const now = performance.now();

        // --- 1. FREQUENCY ISOLATION (< 150Hz) ---
        // Bin width ~ 21.5Hz. Bins 0-6 cover approx 0-150Hz.
        let bassSum = 0;
        const lowBins = 6;
        for (let i = 0; i <= lowBins; i++) bassSum += data[i];
        const currentBassEnergy = bassSum / (lowBins + 1) / 255;

        // --- 2. KICK DETECTION ALGORITHM (Spectral Flux) ---
        // Calculate flux (energy rise)
        const flux = Math.max(0, currentBassEnergy - prevBassEnergyRef.current);
        prevBassEnergyRef.current = currentBassEnergy;

        // Dynamic Threshold (Hysteresis)
        fluxHistoryRef.current.push(flux);
        if (fluxHistoryRef.current.length > 30) fluxHistoryRef.current.shift();
        const avgFlux = fluxHistoryRef.current.reduce((a, b) => a + b, 0) / fluxHistoryRef.current.length;
        const dynamicThreshold = Math.max(0.15, avgFlux * 2.0); // Minimum 0.15 threshold

        // Gate Logic
        let isKick = false;
        // Debounce: 100ms
        if (flux > dynamicThreshold && (now - lastKickTimeRef.current > 100)) {
            isKick = true;
            lastKickTimeRef.current = now;

            // --- 3. CLOCK LOGIC ---
            beatCountRef.current += 1;

            // Scene Trigger: Every 16 beats
            if (beatCountRef.current % 16 === 0) {
                sceneIndexRef.current += 1;
            }
        }

        // --- 4. VISUAL VALUES SMOOTHING ---
        // Extract other ranges for visual mapping
        let midSum = 0;
        for (let i = 8; i <= 100; i++) midSum += data[i];
        const rawMid = midSum / (100 - 8 + 1) / 255;

        let highSum = 0;
        for (let i = 101; i <= 512; i++) highSum += data[i];
        const rawHigh = highSum / (512 - 101 + 1) / 255;

        const rawEnergy = (currentBassEnergy + rawMid + rawHigh) / 3;

        // Apply strict smoothing for smooth visual feedback (Lerp)
        const s = smoothedValuesRef.current;

        // Attack/Decay smoothing
        // Bass snappy, others smooth
        s.bass += (currentBassEnergy - s.bass) * 0.2;
        s.mid += (rawMid - s.mid) * 0.1;
        s.high += (rawHigh - s.high) * 0.1;
        s.energy += (rawEnergy - s.energy) * 0.1;

        return {
            bass: s.bass,
            mid: s.mid,
            high: s.high,
            energy: s.energy,
            isKick,
            beatCount: beatCountRef.current,
            sceneIndex: sceneIndexRef.current,
        };
    }, [analyser]);

    useEffect(() => {
        return () => {
            if (audioContext) audioContext.close();
        };
    }, [audioContext]);

    return { isInitialized, initAudio, getAudioData };
};
