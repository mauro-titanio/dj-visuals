import { useCallback, useRef } from 'react';
import * as THREE from 'three';
import type { AudioData } from './useAudioClock';

export interface TrackTemperature {
    temperature: number; // 0.0 to 1.0 (Smoothed)
    updateTemperature: (audioData: AudioData) => number;
}

export const useTrackTemperature = () => {
    const temperatureRef = useRef(0);

    // Config
    const DECAY_RATE = 0.001; // Slow decay (approx 5-10s to drop from 1 to 0)
    const ATTACK_RATE = 0.005; // Fast rise

    // We smooth the RMS input first
    const smoothedEnergyRef = useRef(0);

    const updateTemperature = useCallback((audioData: AudioData) => {
        const { energy, isKick } = audioData;

        // 1. Smooth the raw energy input (RMS-like)
        // Energy is usually 0-1, but often peaks around 0.3-0.5 for normal tracks.
        // We want to detect "intensity".

        smoothedEnergyRef.current += (energy - smoothedEnergyRef.current) * 0.1;
        const vol = smoothedEnergyRef.current;

        // 2. Temperature Logic
        // Ambient/Chill: Low vol (< 0.2)
        // Peak/Chaos: High vol (> 0.5) OR frequent kicks

        let targetChange = 0;

        if (vol > 0.4) {
            // High energy -> Heat up
            targetChange = ATTACK_RATE * (1.0 + (isKick ? 2.0 : 0));
        } else if (vol < 0.2) {
            // Low energy -> Cool down
            targetChange = -DECAY_RATE;
        } else {
            // Mid energy -> Maintain or slight cool
            targetChange = -DECAY_RATE * 0.5;
        }

        // Apply change
        temperatureRef.current = THREE.MathUtils.clamp(
            temperatureRef.current + targetChange,
            0,
            1
        );

        return temperatureRef.current;
    }, []);

    return {
        updateTemperature
        // We don't return the Ref value directly, forcing the consumer to call update() 
        // usually in a useFrame loop, which returns the latest value.
    };
};
