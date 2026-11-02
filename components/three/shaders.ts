import * as THREE from 'three';

// Shared camera-facing quad: instances are drawn as sprites that always face the viewer.
const billboardVertex = /* glsl */ `
  attribute float aSeed;
  uniform float uTime;
  uniform float uStretch;
  varying vec2 vUv;
  varying float vSeed;
  void main() {
    vUv = uv;
    vSeed = aSeed;
    vec4 center = modelViewMatrix * instanceMatrix * vec4(0.0, 0.0, 0.0, 1.0);
    float scale = length(instanceMatrix[0].xyz);
    float flicker = 1.0 + 0.09 * sin(uTime * 13.0 + aSeed * 40.0) + 0.05 * sin(uTime * 23.0 + aSeed * 11.0);
    vec3 offset = vec3(position.x * scale, position.y * scale * mix(1.0, flicker, uStretch), 0.0);
    offset.x += sin(uTime * 5.0 + aSeed * 20.0) * 0.05 * scale * uv.y * uStretch;
    center.xyz += offset;
    gl_Position = projectionMatrix * center;
  }
`;

// A teardrop flame: white-gold core, saffron body, a hint of blue at the base.
export function createFlameMaterial() {
  return new THREE.ShaderMaterial({
    uniforms: { uTime: { value: 0 }, uStretch: { value: 1 } },
    vertexShader: billboardVertex,
    fragmentShader: /* glsl */ `
      varying vec2 vUv;
      varying float vSeed;
      void main() {
        float y = vUv.y;
        float x = (vUv.x - 0.5) * 2.0;
        float width = mix(0.62, 0.0, pow(y, 1.25)) * smoothstep(0.0, 0.16, y + 0.02);
        float d = abs(x) / max(width, 0.001);
        float body = smoothstep(1.0, 0.25, d) * smoothstep(1.0, 0.72, y);
        float core = smoothstep(0.65, 0.0, d) * smoothstep(0.02, 0.22, y) * smoothstep(0.68, 0.28, y);
        vec3 color = mix(vec3(1.0, 0.28, 0.03), vec3(1.0, 0.72, 0.22), body);
        color = mix(color, vec3(1.0, 0.97, 0.86), core);
        color = mix(color, vec3(0.35, 0.45, 1.0), smoothstep(0.16, 0.0, y) * 0.5);
        gl_FragColor = vec4(color * body * 1.7, body);
      }
    `,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
}

// Soft round light, for halos around flames and floating gold dust.
export function createGlowMaterial(color: string, strength = 1) {
  return new THREE.ShaderMaterial({
    uniforms: { uTime: { value: 0 }, uStretch: { value: 0 }, uColor: { value: new THREE.Color(color) }, uStrength: { value: strength } },
    vertexShader: billboardVertex,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor;
      uniform float uStrength;
      uniform float uTime;
      varying vec2 vUv;
      varying float vSeed;
      void main() {
        float d = length(vUv - 0.5) * 2.0;
        float a = pow(max(0.0, 1.0 - d), 2.4);
        float pulse = 0.85 + 0.15 * sin(uTime * 9.0 + vSeed * 30.0);
        gl_FragColor = vec4(uColor * a * uStrength * pulse, a);
      }
    `,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
}

// Light reflected on water: a column that breaks into ripples as it runs down toward the viewer.
export function createReflectionMaterial(color: string) {
  return new THREE.ShaderMaterial({
    uniforms: { uTime: { value: 0 }, uColor: { value: new THREE.Color(color) } },
    vertexShader: /* glsl */ `
      attribute float aSeed;
      varying vec2 vUv;
      varying float vSeed;
      void main() {
        vUv = uv;
        vSeed = aSeed;
        vec4 center = modelViewMatrix * instanceMatrix * vec4(0.0, 0.0, 0.0, 1.0);
        float scale = length(instanceMatrix[0].xyz);
        center.xy += vec2(position.x * scale * 0.35, (position.y - 0.5) * scale * 2.4);
        gl_Position = projectionMatrix * center;
      }
    `,
    fragmentShader: /* glsl */ `
      uniform float uTime;
      uniform vec3 uColor;
      varying vec2 vUv;
      varying float vSeed;
      void main() {
        float fromTop = 1.0 - vUv.y;
        float x = abs(vUv.x - 0.5) * 2.0;
        float ripple = 0.5 + 0.5 * sin(fromTop * 46.0 - uTime * 3.0 + vSeed * 17.0);
        float wobble = sin(fromTop * 13.0 + uTime * 2.0 + vSeed * 7.0) * 0.18 * fromTop;
        float column = smoothstep(1.0, 0.0, abs(x + wobble) * (1.0 + fromTop * 1.5));
        float fade = smoothstep(0.0, 0.08, vUv.y) * pow(vUv.y, 0.6);
        float a = column * fade * mix(0.35, 1.0, ripple) * 0.9;
        gl_FragColor = vec4(uColor * a, a);
      }
    `,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
}

// A gradient dome for skies: deep top, glowing horizon.
export function createSkyMaterial(top: string, horizon: string, glow: string) {
  return new THREE.ShaderMaterial({
    uniforms: { uTop: { value: new THREE.Color(top) }, uHorizon: { value: new THREE.Color(horizon) }, uGlow: { value: new THREE.Color(glow) } },
    vertexShader: /* glsl */ `
      varying vec3 vWorld;
      void main() {
        vWorld = normalize(position);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: /* glsl */ `
      uniform vec3 uTop;
      uniform vec3 uHorizon;
      uniform vec3 uGlow;
      varying vec3 vWorld;
      void main() {
        float h = clamp(vWorld.y, -0.2, 1.0);
        vec3 color = mix(uHorizon, uTop, smoothstep(0.0, 0.55, h));
        color += uGlow * exp(-abs(h - 0.02) * 18.0) * 0.9;
        gl_FragColor = vec4(color, 1.0);
      }
    `,
    side: THREE.BackSide,
    depthWrite: false,
  });
}
