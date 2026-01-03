# Active State: Evolution Engine

## Current Status

- The core **Procedural Scene Evolution System** is implemented and build-verified.
- **Organic Fluid System** is live. Driven by "Track Temperature" (energy accumulation).
- **OrganicScene**: Single high-res Icosahedron with custom Perlin Noise 4D vertex shader.
- **CinematicCamera**: Floating orbital movement with temperature-reactive zoom.

## Recent Changes

- Replaced multiple static scenes (`GridScene`, `StarfieldScene`) with a single `GenerativeScene`.
- Integrated `Zustand` for performant global state management.
- Added `maath` for liquid-smooth parametric transitions.
- Implemented **Track Temperature** logic for smooth energy transitions.
- Created **OrganicScene** with custom GLSL shaders.
- Implemented **CinematicCamera** with `maath` damping.

## Priorities

- **Refinement**: Fine-tune the "Kick" detection threshold for different musical genres.
- **Expansion**: Add more geometric primitives (Torus, Knot) to the morphing logic.
- **Aesthetics**: Explore more complex noise-based deformations in the fragment shader.
