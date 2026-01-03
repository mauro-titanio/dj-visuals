# Project Charter: DJ Visuals / Evolution Engine

## High-Level Vision

Create an autonomous VJ performance system that "performs" alongside a DJ by analyzing musical structures (beats, phrases) and evolving visual complexity progressively.

## Core Requirements

- **Audio Autonomy**: Hand-free operation during a set; visuals must react and evolve based solely on audio input.
- **Visual Fluidity**: No hard cuts; every state transition must be smoothed via mathematical interpolation.
- **Scalability**: Support rendering of large-scale instanced geometries (1000+ objects) while maintaining 60 FPS.
- **Production UX**: Dark-mode primary interface, fullscreen support, and auto-hiding distractions (cursor).

## Success Criteria

- Sustained 60 FPS performance on mid-range hardware.
- Robust beat detection that correctly identifies 4/4 kicks across different intensities.
- Visually distinct "evolution" feeling from start (Generation 0) to climax (Generation 200).
- Successful build and deployment via Vite.
