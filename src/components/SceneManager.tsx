import { useFrame } from '@react-three/fiber';
import type { AudioData as OriginalAudioData } from '../hooks/useAudioClock';
import { useTrackTemperature } from '../hooks/useTrackTemperature';
import { useVJStore } from '../store/useVJStore';
import { CinematicCamera } from './CinematicCamera';
import { Director } from './Director';
import { LightingStrobe } from './LightingStrobe';
import { VisualizerScene } from './VisualizerScene';

interface SceneManagerProps {
    getAudioData: () => OriginalAudioData;
}

export const SceneManager = ({ getAudioData }: SceneManagerProps) => {
    const { updateTemperature } = useTrackTemperature();
    const syncAudio = useVJStore((state) => state.syncAudio);

    useFrame(() => {
        const audio = getAudioData();
        const temp = updateTemperature(audio);

        // Sync to Store
        syncAudio({
            low: audio.bass,
            mid: audio.mid,
            high: audio.high,
            temperature: temp,
            isKick: audio.isKick
        }, audio.beatCount);
    });

    return (
        <>
            <Director />
            <CinematicCamera />
            <VisualizerScene />
            <LightingStrobe />

            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} intensity={2} />
            <fog attach="fog" args={['#000000', 30, 100]} />
        </>
    );
};
