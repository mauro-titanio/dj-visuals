import { Canvas } from '@react-three/fiber';
import { Bloom, ChromaticAberration, EffectComposer } from '@react-three/postprocessing';
import { useCallback, useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import './App.css';
import { SceneManager } from './components/SceneManager';
import { useAudioClock } from './hooks/useAudioClock';
import { useVJStore } from './store/useVJStore';

function App() {
  const { initAudio, getAudioData, isInitialized } = useAudioClock();
  const { activeEffects } = useVJStore();
  const [showCursor, setShowCursor] = useState(true);
  const cursorTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = useCallback(() => {
    setShowCursor(true);
    if (cursorTimeoutRef.current) clearTimeout(cursorTimeoutRef.current);
    cursorTimeoutRef.current = setTimeout(() => {
      setShowCursor(false);
    }, 3000);
  }, []);

  useEffect(() => {
    if (isInitialized) {
      window.addEventListener('mousemove', handleMouseMove);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (cursorTimeoutRef.current) clearTimeout(cursorTimeoutRef.current);
    };
  }, [isInitialized, handleMouseMove]);

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen().catch((err) => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  }, []);

  const showBloom = activeEffects.includes('bloom');
  const showChromatic = activeEffects.includes('chromatic');

  return (
    <div
      ref={containerRef}
      className={`app-container ${!showCursor ? 'hide-cursor' : ''}`}
      onDoubleClick={isInitialized ? toggleFullscreen : undefined}
    >
      {!isInitialized ? (
        <div className="overlay">
          <div className="welcome-card">
            <h1>EVOLUTION ENGINE</h1>
            <p>Beat-driven procedural generative visualizer.</p>
            <div className="controls-hint">
              VISUALS EVOLVE EVERY <span>16 BARS</span>
              <br />
              <span>DOUBLE CLICK</span> FOR FULLSCREEN
            </div>
            <button className="start-button" onClick={initAudio}>
              START EVOLUTION
            </button>
          </div>
        </div>
      ) : (
        <div className="visualizer-container">
          <Canvas dpr={[1, 2]}>
            <color attach="background" args={['#050505']} />
            <SceneManager getAudioData={getAudioData} />

            <EffectComposer>
              <Bloom
                intensity={showBloom ? 1.5 : 0}
                luminanceThreshold={0.2}
                luminanceSmoothing={0.9}
                mipmapBlur
              />
              <ChromaticAberration
                offset={showChromatic ? new THREE.Vector2(0.005, 0.005) : new THREE.Vector2(0, 0)}
              />
            </EffectComposer>
          </Canvas>

          <div className="vj-ui">
            {/* UI Removed for Cinematic Experience */}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
