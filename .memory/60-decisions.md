# Decision Log: DJ Visuals

## 2026-01-03: Transition to Procedural Evolution

- **Decision**: Move to a single `GenerativeScene` component driven by a `sceneIndex`.

## 2026-01-03: Zustand for State Management

- **Decision**: Implement `useVisualState` store with Zustand for global state.

## 2026-01-03: Refactor to Native Audio Reactivity & Cinematic Camera

- **Decision**: Replace Link Bridge with `useAudioClock` (Native AnalyserNode).

## 2026-01-03: Organic Fluid System ("Track Temperature")

- **Context**: The user requested an "Organic and Fluid" system, abandoning the discrete "Conductor" sequencing.
- **Decision**:
  - **Metric**: Replace Beat Counting with "Track Temperature" (RMS Energy Accumulation).
  - **Visuals**: Use a single high-res Icosahedron with custom Perlin Noise 4D vertex shader for fluid/organic morphing.
  - **Camera**: Implement noise-based continuous orbital movement ("Floating") instead of random jumps.
  - **Performance**: Use React Refs for all high-frequency data passing (Temp/Treble) to avoid React re-renders entirely.
- **Rationale**:
  - Creates a more immersive, hypnotic experience that mirrors the "vibe" of the track rather than just the beat.
  - Removes visual stutter/transitions completely.
