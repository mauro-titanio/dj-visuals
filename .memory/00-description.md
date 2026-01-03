# DJ Visuals: Evolution Engine

A production-ready, beat-driven VJ performance system built with React and WebGL.

## Overview

This project transforms simple audio-reactive objects into a **Procedural Scene Evolution System**. It listens to live audio input, detects rhythmic patterns (kicks), and progressively evolves a "Super-Scene" through 200 distinct procedural states.

## Core Features

- **Beat Detection Engine**: Real-time kick detection in the 20Hz-140Hz range with dynamic thresholding and phrase quantization (16-beat bars).
- **Procedural Evolution**: A parametric generative system that morphs geometry (Sphere → Matrix → Cloud) and color palettes progressively over 200 states.
- **High-Performance Instancing**: GPU-accelerated rendering of thousands of reactive objects via `THREE.InstancedMesh`.
- **Advanced Post-Processing**: Cinematic stack including Bloom, Chromatic Aberration, and reactive lighting.
- **Smooth Interpolation**: Parametric transitions using `maath/easing` for liquid-smooth state changes.
- **VJ Controls**: Integrated UI for tracking generation progress, beat counts, and palette states, plus fullscreen and auto-hide cursor features.

## Tech Stack

- **Framework**: React / Vite
- **3D Engine**: React Three Fiber (R3F), Drei, Three.js
- **State Management**: Zustand
- **Math & Easing**: Maath
- **Post-Processing**: `@react-three/postprocessing`
- **Language**: TypeScript
- **Styling**: Vanilla CSS
