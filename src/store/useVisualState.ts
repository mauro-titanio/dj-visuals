import { create } from 'zustand';

interface VisualState {
    // Legacy support for App.tsx to avoid crash until refactor
    // We will keep a simplified store for now, or use it for UI debug
    temperature: number;
}

export const useVisualState = create<VisualState>(() => ({
    temperature: 0,
}));
