import { useFrame } from '@react-three/fiber';
import { useControls } from 'leva';
import { easing } from 'maath';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useShallow } from 'zustand/react/shallow';
import type { GeometryId, MaterialId } from '../store/useVJStore';
import { useVJStore } from '../store/useVJStore';

// --- SHARED MODIFIER (3D Simplex Noise) ---
export const NOISE_GLSL = `
  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
  vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

  float snoise(vec3 v) {
    const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;
    const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);
    vec3 i  = floor(v + dot(v, C.yyy) );
    vec3 x0 = v - i + dot(i, C.xxx) ;
    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min( g.xyz, l.zxy );
    vec3 i2 = max( g.xyz, l.zxy );
    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + C.yyy;
    vec3 x3 = x0 - D.yyy;
    i = mod289(i);
    vec4 p = permute( permute( permute(
              i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
            + i.y + vec4(0.0, i1.y, i2.y, 1.0 ))
            + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));
    float n_ = 0.142857142857;
    vec3 ns = n_ * D.wyz - D.xzx;
    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_ );
    vec4 x = x_ *ns.x + ns.yyyy;
    vec4 y = y_ *ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);
    vec4 b0 = vec4( x.xy, y.xy );
    vec4 b1 = vec4( x.zw, y.zw );
    vec4 s0 = floor(b0)*2.0 + 1.0;
    vec4 s1 = floor(b1)*2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));
    vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
    vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;
    vec3 p0 = vec3(a0.xy,h.x);
    vec3 p1 = vec3(a0.zw,h.y);
    vec3 p2 = vec3(a1.xy,h.z);
    vec3 p3 = vec3(a1.zw,h.w);
    vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
    p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
    vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
    m = m * m;
    return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3) ) );
  }
`;

// --- ASSETS ---
export const OrganicSphere = () => <icosahedronGeometry args={[4, 50]} />;
export const Hyperplane = () => <planeGeometry args={[100, 100, 128, 128]} />;
export const AbstractGrid = () => <planeGeometry args={[100, 100, 60, 60]} />;

export const TheVoid = () => {
    const meshRef = useRef<THREE.InstancedMesh>(null);
    const count = 500;
    const dummy = useMemo(() => new THREE.Object3D(), []);

    useFrame((state) => {
        if (!meshRef.current) return;
        const time = state.clock.getElapsedTime();
        for (let i = 0; i < count; i++) {
            const z = ((i / count) * 100 - time * 20) % 100;
            const x = Math.sin(i * 0.2 + time * 0.5) * 10;
            const y = Math.cos(i * 0.2 + time * 0.5) * 10;
            dummy.position.set(x, y, -z);
            dummy.rotation.set(time * 0.5 + i, time * 0.2 + i, 0);
            dummy.scale.setScalar(0.3 + Math.sin(time + i) * 0.2);
            dummy.updateMatrix();
            meshRef.current.setMatrixAt(i, dummy.matrix);
        }
        meshRef.current.instanceMatrix.needsUpdate = true;
    });

    return (
        <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
            <coneGeometry args={[0.5, 1, 3]} />
            <meshNormalMaterial />
        </instancedMesh>
    );
};

export const TorusChaos = () => {
    const groupRef = useRef<THREE.Group>(null);
    const count = 5;

    useFrame((state) => {
        if (!groupRef.current) return;
        const time = state.clock.getElapsedTime();
        groupRef.current.children.forEach((child, i) => {
            child.rotation.x = time * (0.2 + i * 0.1);
            child.rotation.y = time * 0.3;
        });
    });

    return (
        <group ref={groupRef}>
            {Array.from({ length: count }).map((_, i) => (
                <mesh key={i}>
                    <torusKnotGeometry args={[3 + i * 1.5, 0.2, 128, 32]} />
                    <meshNormalMaterial />
                </mesh>
            ))}
        </group>
    );
};

// --- RENDER MATERIAL HELPER ---
const RenderMaterial = ({ id, materialRef, uniforms }: { id: string, materialRef: React.RefObject<THREE.ShaderMaterial | null>, uniforms: { [key: string]: THREE.IUniform } }) => {
    switch (id) {
        case 'liquid':
            return <meshStandardMaterial metalness={1} roughness={0.1} color="#111" />;
        case 'reactive':
            return (
                <shaderMaterial
                    ref={materialRef}
                    uniforms={uniforms}
                    vertexShader={`
                        ${NOISE_GLSL}
                        varying vec3 vNormal;
                        varying float vDisp;
                        uniform float u_time;
                        uniform float u_temperature;
                        uniform float u_low;
                        void main() {
                            vNormal = normal;
                            float d = snoise(position * 0.3 + u_time * 0.1) * (0.5 + u_temperature + u_low * 2.0);
                            vDisp = d;
                            vec3 pos = position + normal * d;
                            gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
                        }
                    `}
                    fragmentShader={`
                        varying vec3 vNormal;
                        varying float vDisp;
                        uniform float u_high;
                        uniform float u_temperature;
                        void main() {
                            vec3 colorA = mix(vec3(0.0, 0.05, 0.4), vec3(0.4, 0.0, 0.4), u_temperature);
                            vec3 colorB = mix(vec3(1.0, 0.4, 0.0), vec3(1.0, 0.9, 0.4), u_high);
                            vec3 color = mix(colorA, colorB, vDisp * 0.3 + 0.7);
                            gl_FragColor = vec4(color, 1.0);
                        }
                    `}
                />
            );
        case 'glitch':
            return (
                <shaderMaterial
                    ref={materialRef}
                    uniforms={uniforms}
                    vertexShader={`
                        varying vec3 vNormal;
                        uniform float u_time;
                        uniform float u_high;
                        void main() {
                            vNormal = normal;
                            vec3 pos = position;
                            if (fract(u_time * 8.0) > 0.8) {
                                pos += normal * sin(pos.y * 20.0) * u_high * 5.0;
                            }
                            gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
                        }
                    `}
                    fragmentShader={`
                        varying vec3 vNormal;
                        uniform float u_time;
                        void main() {
                            float g = step(0.95, fract(sin(u_time * 50.0 + vNormal.x * 20.0)));
                            vec3 color = mix(vec3(0.0), vec3(1.0, 0.2, 0.8), g);
                            gl_FragColor = vec4(color, 1.0);
                        }
                    `}
                />
            );
        case 'cyberGrid':
            return (
                <shaderMaterial
                    ref={materialRef}
                    uniforms={uniforms}
                    vertexShader={`
                        varying vec2 vUv;
                        void main() {
                            vUv = uv;
                            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                        }
                    `}
                    fragmentShader={`
                        varying vec2 vUv;
                        uniform float u_time;
                        uniform float u_low;
                        void main() {
                            float grid = step(0.98, fract(vUv.x * 20.0)) + step(0.98, fract(vUv.y * 20.0));
                            float scan = step(0.9, fract(vUv.y * 5.0 - u_time * 2.0));
                            vec3 color = mix(vec3(0.0), vec3(0.0, 1.0, 0.8), grid + scan * u_low);
                            gl_FragColor = vec4(color, 1.0);
                        }
                    `}
                />
            );
        case 'hologram':
            return (
                <shaderMaterial
                    ref={materialRef}
                    uniforms={uniforms}
                    transparent
                    side={THREE.DoubleSide}
                    vertexShader={`
                        varying vec3 vPosition;
                        void main() {
                            vPosition = position;
                            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                        }
                    `}
                    fragmentShader={`
                        varying vec3 vPosition;
                        uniform float u_time;
                        uniform float u_temperature;
                        void main() {
                            float strip = sin(vPosition.y * 10.0 + u_time * 5.0);
                            float alpha = mix(0.1, 0.4, strip) * (0.5 + u_temperature);
                            gl_FragColor = vec4(0.0, 0.8, 1.0, alpha);
                        }
                    `}
                />
            );
        case 'points':
            return <meshBasicMaterial transparent opacity={0} />;
        default:
            return <meshNormalMaterial />;
    }
};



// --- MAIN MIXER ---
export const VisualizerScene = () => {
    const { currentGeometry, currentMaterial, audioData, setGeometry, setMaterial } = useVJStore(useShallow((state) => ({
        currentGeometry: state.currentGeometry,
        currentMaterial: state.currentMaterial,
        audioData: state.audioData,
        setGeometry: state.setGeometry,
        setMaterial: state.setMaterial
    })));
    const materialRef = useRef<THREE.ShaderMaterial>(null);

    useControls('Visualizer', {
        geometry: {
            value: currentGeometry,
            options: ['sphere', 'void', 'grid', 'hyperplane', 'torusChaos'],
            onChange: (v: string) => setGeometry(v as GeometryId)
        },
        material: {
            value: currentMaterial,
            options: ['reactive', 'points', 'liquid', 'glitch', 'cyberGrid', 'hologram'],
            onChange: (v: string) => setMaterial(v as MaterialId)
        }
    });

    const uniforms = useMemo(() => ({
        u_time: { value: 0 },
        u_temperature: { value: 0 },
        u_low: { value: 0 },
        u_high: { value: 0 }
    }), []);

    useFrame((state, delta) => {
        if (materialRef.current) {
            materialRef.current.uniforms.u_time.value = state.clock.getElapsedTime();
            easing.damp(materialRef.current.uniforms.u_temperature, 'value', audioData.temperature, 0.5, delta);
            easing.damp(materialRef.current.uniforms.u_low, 'value', audioData.low, 0.1, delta);
            easing.damp(materialRef.current.uniforms.u_high, 'value', audioData.high, 0.1, delta);
        }
    });

    return (
        <group rotation={[Math.PI / 2, 0, 0]}>
            {currentGeometry === 'sphere' && (
                <mesh>
                    <OrganicSphere />
                    <RenderMaterial id={currentMaterial} materialRef={materialRef} uniforms={uniforms} />
                </mesh>
            )}

            {currentGeometry === 'void' && <TheVoid />}

            {currentGeometry === 'grid' && (
                <mesh position={[0, 0, -5]}>
                    <AbstractGrid />
                    <RenderMaterial id={currentMaterial} materialRef={materialRef} uniforms={uniforms} />
                </mesh>
            )}

            {currentGeometry === 'hyperplane' && (
                <mesh position={[0, 0, -10]}>
                    <Hyperplane />
                    <RenderMaterial id={currentMaterial} materialRef={materialRef} uniforms={uniforms} />
                </mesh>
            )}

            {currentGeometry === 'torusChaos' && <TorusChaos />}

            {currentMaterial === 'points' && currentGeometry !== 'void' && currentGeometry !== 'torusChaos' && (
                <points>
                    {currentGeometry === 'sphere' && <OrganicSphere />}
                    {currentGeometry === 'grid' && <AbstractGrid />}
                    {currentGeometry === 'hyperplane' && <Hyperplane />}
                    <pointsMaterial size={0.05} color="#00ffff" transparent opacity={0.6} />
                </points>
            )}
        </group>
    );
};
