# Project Knowledge: Evolution Engine

## Web Audio Hooks

- **Smoothing**: Don't use `analyserNode.smoothingTimeConstant` alone. A manual lerp with separate factors for Bass, Mids, and Highs provides much better visual results.
- **Beat Detection**: Kicks are most reliable in the sub-140Hz range. Always use a time-based debounce (e.g., 250ms) to prevent double-triggering on single audio spikes.

## R3F Performance

- **InstancedMesh**: Essential for anything over 50 objects. Use a `dummy` object to calculate matrices and `mesh.setMatrixAt` to apply them.
- **`useFrame` Purity**: Never perform state setters (`useState`) or heavy logic inside `useFrame`. Directly mutate refs, uniforms, or use Zustand's selective subscriptions.
- **Shader Uniforms**: Prefer passing high-level parameters (like `u_evolution`) to shaders and letting the GPU handle fine-grained interpolation.

## CSS Strategy

- **Overlay Management**: Use `pointer-events: none` on 2D UI layers over the 3D Canvas to ensure OrbitControls still work.
- **Immersive Modes**: Combining the Fullscreen API with a dynamically toggled `.hide-cursor` class on the body/container is highly effective for visualizers.

## Resource Map

- [Drei Docs](https://github.com/pmndrs/drei): For UI/HTML integration.
- [Maath GitHub](https://github.com/pmndrs/maath): For damping and math helpers.
- [Zustand Docs](https://zustand-demo.pmnd.rs/): For store patterns.
