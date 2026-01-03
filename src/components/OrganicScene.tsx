import { useFrame } from '@react-three/fiber';
import { easing } from 'maath';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';

interface OrganicSceneProps {
  temperatureRef: React.MutableRefObject<number>;
  trebleRef: React.MutableRefObject<number>;
}

// --- SHADERS ---
const vertexShader = `
  varying vec2 vUv;
  varying float vDisplacement;
  varying vec3 vNormal;
  
  uniform float u_time;
  uniform float u_temperature;

  // Simplex 4D Noise by Ashima Arts
  vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  float mod289(float x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
  float permute(float x) { return mod289(((x*34.0)+1.0)*x); }
  vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
  float taylorInvSqrt(float r) { return 1.79284291400159 - 0.85373472095314 * r; }

  vec4 grad4(float j, vec4 ip) {
    const vec4 ones = vec4(1.0, 1.0, 1.0, -1.0);
    vec4 p,s;
    p.xyz = floor( fract (vec3(j) * ip.xyz) * 7.0) * ip.z - 1.0;
    p.w = 1.5 - dot(abs(p.xyz), ones.xyz);
    s = vec4(lessThan(p, vec4(0.0)));
    p.xyz = p.xyz + (s.xyz*2.0 - 1.0) * s.www; 
    return p;
  }

  float snoise(vec4 v) {
    const vec4  C = vec4( 0.138196601125011,  // (5 - sqrt(5))/20  G4
                          0.276393202250021,  // 2 * G4
                          0.414589803375032,  // 3 * G4
                         -0.447213595499958); // -1 + 4 * G4

    vec4 i  = floor(v + dot(v, vec4(C.y)) );
    vec4 x0 = v -   i + dot(i, vec4(C.x)) ;

    vec4 i0;
    vec3 isX = step( x0.yzw, x0.xyz );
    vec3 isYZ = step( x0.zww, x0.wwz );
    i0.x = isX.x + isX.y + isX.z;
    i0.yzw = 1.0 - isX;
    i0.y += isYZ.x + isYZ.y;
    i0.zw += 1.0 - isYZ.xy;
    i0.z += isYZ.z;
    i0.w += 1.0 - isYZ.z;

    vec4 i3 = clamp( i0, 0.0, 1.0 );
    vec4 i2 = clamp( i0-1.0, 0.0, 1.0 );
    vec4 i1 = clamp( i0-2.0, 0.0, 1.0 );

    vec4 x1 = x0 - i1 + C.xxxx;
    vec4 x2 = x0 - i2 + C.yyyy;
    vec4 x3 = x0 - i3 + C.zzzz;
    vec4 x4 = x0 + C.wwww;

    i = mod289(i); 
    float j0 = permute( permute( permute( permute(i.w) + i.z) + i.y) + i.x);
    float j1 = permute( permute( permute( permute(i.w + i1.w) + i.z + i1.z) + i.y + i1.y) + i.x + i1.x);
    float j2 = permute( permute( permute( permute(i.w + i2.w) + i.z + i2.z) + i.y + i2.y) + i.x + i2.x);
    float j3 = permute( permute( permute( permute(i.w + i3.w) + i.z + i3.z) + i.y + i3.y) + i.x + i3.x);
    float j4 = permute( permute( permute( permute(i.w + 1.0) + i.z + 1.0) + i.y + 1.0) + i.x + 1.0);

    vec4 ip = vec4(1.0/294.0, 1.0/49.0, 1.0/7.0, 0.0) ;

    vec4 p0 = grad4(j0,   ip);
    vec4 p1 = grad4(j1,   ip);
    vec4 p2 = grad4(j2,   ip);
    vec4 p3 = grad4(j3,   ip);
    vec4 p4 = grad4(j4,   ip);

    vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
    p0 *= norm.x;
    p1 *= norm.y;
    p2 *= norm.z;
    p3 *= norm.w;
    p4 *= taylorInvSqrt(dot(p4,p4));

    vec3 m0 = max(0.6 - vec3(dot(x0,x0), dot(x1,x1), dot(x2,x2)), 0.0);
    vec2 m1 = max(0.6 - vec2(dot(x3,x3), dot(x4,x4)            ), 0.0);
    m0 = m0 * m0;
    m1 = m1 * m1;
    return 49.0 * ( dot(m0*m0, vec3( dot(p0,x0), dot(p1,x1), dot(p2,x2)))
                   + dot(m1*m1, vec2( dot(p3,x3), dot(p4,x4))) );
  }

  void main() {
    vUv = uv;
    vNormal = normal;
    
    // Scale parameters by temperature
    float noiseFreq = 0.5 + u_temperature * 1.5; 
    float noiseAmp = 0.5 + u_temperature * 1.5;  
    float speed = u_time * (0.2 + u_temperature * 1.0);
    
    float noise = snoise(vec4(position * noiseFreq, speed));
    vDisplacement = noise;
    
    vec3 newPosition = position + normal * (noise * noiseAmp);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
  }
`;

const fragmentShader = `
  varying vec2 vUv;
  varying float vDisplacement;
  varying vec3 vNormal;
  
  uniform float u_temperature;
  uniform float u_time;
  
  void main() {
    vec3 coolColor = vec3(0.0, 0.05, 0.2);
    vec3 warmColor = vec3(0.7, 0.1, 0.0);
    vec3 hotColor = vec3(1.0, 0.7, 0.2);
    
    vec3 baseColor = mix(coolColor, warmColor, u_temperature);
    float glow = smoothstep(-0.8, 1.0, vDisplacement);
    vec3 finalColor = mix(baseColor, hotColor, glow * u_temperature);
    
    float fresnel = pow(1.0 - max(0.0, dot(vNormal, vec3(0.0, 0.0, 1.0))), 2.0);
    finalColor += fresnel * (0.2 + u_temperature * 0.3);

    gl_FragColor = vec4(finalColor, 1.0);
  }
`;

export const OrganicScene = ({ temperatureRef }: OrganicSceneProps) => {
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const meshRef = useRef<THREE.Mesh>(null);

  const uniforms = useMemo(() => ({
    u_time: { value: 0 },
    u_temperature: { value: 0 }
  }), []);

  useFrame((state, delta) => {
    const time = state.clock.getElapsedTime();
    const temperature = temperatureRef.current;

    if (materialRef.current) {
      materialRef.current.uniforms.u_time.value = time;
      easing.damp(materialRef.current.uniforms.u_temperature, 'value', temperature, 0.5, delta);
    }

    if (meshRef.current) {
      meshRef.current.rotation.y = time * 0.05;
      meshRef.current.rotation.x = time * 0.02;
    }
  });

  return (
    <mesh ref={meshRef}>
      <icosahedronGeometry args={[5, 40]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
};
