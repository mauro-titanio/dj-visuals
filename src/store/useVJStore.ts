import { create } from 'zustand';

export type GeometryId = 'sphere' | 'void' | 'grid' | 'hyperplane' | 'torusChaos';
export type MaterialId = 'reactive' | 'points' | 'liquid' | 'glitch' | 'cyberGrid' | 'hologram';
export type EffectId = 'bloom' | 'glitch' | 'afterimage' | 'chromatic';
export type CameraMode = 'steady' | 'kinetic' | 'glitchy';

interface AudioData {
    low: number;
    mid: number;
    high: number;
    temperature: number;
    isKick: boolean;
}

interface VJState {
    // Audio Data
    audioData: AudioData;
    beatCount: number;

    // Visual Selection
    currentGeometry: GeometryId;
    currentMaterial: MaterialId;
    activeEffects: EffectId[];
    cameraMode: CameraMode;

    // Actions
    syncAudio: (data: AudioData, beatCount: number) => void;
    setGeometry: (id: GeometryId) => void;
    setMaterial: (id: MaterialId) => void;
    toggleEffect: (id: EffectId, active: boolean) => void;
    setCameraMode: (mode: CameraMode) => void;
}

export const useVJStore = create<VJState>((set) => ({
    audioData: { low: 0, mid: 0, high: 0, temperature: 0, isKick: false },
    beatCount: 0,

    currentGeometry: 'sphere',
    currentMaterial: 'reactive',
    activeEffects: ['bloom'],
    cameraMode: 'steady',

    syncAudio: (audioData, beatCount) => set({ audioData, beatCount }),
    setGeometry: (currentGeometry) => set({ currentGeometry }),
    setMaterial: (currentMaterial) => set({ currentMaterial }),
    setCameraMode: (cameraMode) => set({ cameraMode }),
    toggleEffect: (id, active) => set((state) => ({
        activeEffects: active
            ? [...new Set([...state.activeEffects, id])]
            : state.activeEffects.filter(e => e !== id)
    })),
}));
