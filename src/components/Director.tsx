import { useEffect, useRef } from 'react';
import { useShallow } from 'zustand/react/shallow';
import type { GeometryId } from '../store/useVJStore';
import { useVJStore } from '../store/useVJStore';

const GEOMETRIES: GeometryId[] = ['sphere', 'void', 'grid', 'hyperplane', 'torusChaos'];

export const Director = () => {
    const {
        audioData,
        beatCount,
        setGeometry,
        setMaterial,
        toggleEffect,
        setCameraMode
    } = useVJStore(useShallow((state) => ({
        audioData: state.audioData,
        beatCount: state.beatCount,
        setGeometry: state.setGeometry,
        setMaterial: state.setMaterial,
        toggleEffect: state.toggleEffect,
        setCameraMode: state.setCameraMode
    })));

    const prevBarRef = useRef(0);
    const prevPhraseRef = useRef(0);

    // 1. Macro Orchestration (Phrasing)
    useEffect(() => {
        const currentBar = Math.floor(beatCount / 4);
        const currentPhrase = Math.floor(beatCount / 64); // 16 bars

        // Every 8 Bars: Material / Camera Mode Mixup
        if (currentBar !== prevBarRef.current && currentBar % 8 === 0) {
            const temp = audioData.temperature;

            // Probabilistic Material Selection
            if (temp < 0.4) {
                setCameraMode('steady');
                setMaterial(Math.random() > 0.5 ? 'liquid' : 'hologram');
            } else if (temp < 0.8) {
                setCameraMode('kinetic');
                setMaterial(Math.random() > 0.5 ? 'reactive' : 'cyberGrid');
            }
            prevBarRef.current = currentBar;
        }

        // Every 16 Bars: Major Transition (The Reset/Evolution)
        if (currentPhrase !== prevPhraseRef.current) {
            const currentGeo = useVJStore.getState().currentGeometry;
            let nextGeo = currentGeo;
            while (nextGeo === currentGeo) {
                nextGeo = GEOMETRIES[Math.floor(Math.random() * GEOMETRIES.length)];
            }
            setGeometry(nextGeo);

            // Reset camera to kinetic for general flow
            setCameraMode('kinetic');
            prevPhraseRef.current = currentPhrase;
        }
    }, [beatCount, audioData.temperature, setGeometry, setMaterial, setCameraMode]);

    // 2. Micro Orchestration (Energy Tiers)
    useEffect(() => {
        const temp = audioData.temperature;

        // Tier 4: PEAK / THE DROP (> 0.9)
        if (temp > 0.9) {
            setMaterial('glitch');
            setCameraMode('glitchy');
            toggleEffect('bloom', true);
            toggleEffect('afterimage', true);
            toggleEffect('chromatic', true);
        }
        // Tier 3: HIGH ENERGY (0.7 - 0.9)
        else if (temp > 0.7) {
            toggleEffect('chromatic', true);
            toggleEffect('afterimage', false);
            if (useVJStore.getState().cameraMode === 'steady') setCameraMode('kinetic');
        }
        // Tier 2: MID (0.3 - 0.7)
        else if (temp > 0.3) {
            toggleEffect('bloom', true);
            toggleEffect('chromatic', false);
            toggleEffect('afterimage', false);
        }
        // Tier 1: AMBIENT / CHILL (< 0.3)
        else {
            setCameraMode('steady');
            toggleEffect('bloom', false);
            toggleEffect('chromatic', false);
            toggleEffect('afterimage', false);
        }
    }, [audioData.temperature, setMaterial, toggleEffect, setCameraMode]);

    return null;
};
