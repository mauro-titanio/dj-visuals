import { Canvas } from '@react-three/fiber';
import { Bloom, ChromaticAberration, EffectComposer } from '@react-three/postprocessing';
import { useCallback, useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import './App.css';
import { SceneManager } from './components/SceneManager';
import { useAudioClock } from './hooks/useAudioClock';

function App() {
  const { initAudio, getAudioData, isInitialized } = useAudioClock();
  // const { sceneIndex, beatCount, activeGeometry, materialMode } = useVisualState(); // Obsolete
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
              VISUALS EVOLVE EVERY <span>16 BEATS</span>
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
                intensity={1.0}
                luminanceThreshold={0.4}
                luminanceSmoothing={0.9}
                mipmapBlur
              />
              <ChromaticAberration
                offset={new THREE.Vector2(0.001, 0.001)}
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
