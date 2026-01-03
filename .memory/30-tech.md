# Technology Landscape

## Primary Stack

- **React 18**: UI component architecture.
- **React Three Fiber (R3F)**: Declarative Three.js integration.
- **Three.js**: WebGL rendering engine.
- **Zustand**: Lightweight state management for the performance loop.
- **Maath**: Mathematical utilities for easing and interpolation.

## Core Dependencies

- **`@react-three/drei`**: Useful helpers (Html, OrbitControls, PerspectiveCamera).
- **`@react-three/postprocessing`**: Cinematic effects (Bloom, ChromaticAberration).
- **`postprocessing`**: The underlying effect composer.

## Development Environment

- **Build Tool**: Vite (Fast HMR, optimized production builds).
- **Language**: TypeScript (Strict mode enabled).
- **Audio API**: Web Audio API (`AnalyserNode`, `MediaStreamAudioSourceNode`).

## Performance Targets

- **Resolution**: High DPI support (`dpr={[1, 2]}`).
- **Framerate**: Target 60 FPS consistently.
- **Optimization Strategy**: Use `InstancedMesh` for object repetition and `useFrame` for frame-aware updates.
