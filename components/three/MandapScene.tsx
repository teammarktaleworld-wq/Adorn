'use client';

import { useEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { SceneEnvironment } from './environment';
import { createPetalGeometry } from './geometry';
import { createFlameMaterial, createGlowMaterial, createSkyMaterial } from './shaders';
import { createRangoliTexture, createShadowTexture, createSilkTexture } from './textures';

type Progress = { current: number };

const PILLAR = 2.6;
const BEAM_Y = 4.05;

const rand = (seed: number) => () => {
  seed = (seed * 16807) % 2147483647;
  return (seed - 1) / 2147483646;
};

const window01 = (p: number, a: number, b: number) => Math.min(1, Math.max(0, (p - a) / (b - a)));

function useMaterials() {
  return useMemo(() => {
    const gold = new THREE.MeshStandardMaterial({ color: '#d9a441', metalness: 1, roughness: 0.27, envMapIntensity: 1.4 });
    const velvet = new THREE.MeshPhysicalMaterial({ color: '#7a1022', roughness: 0.8, sheen: 1, sheenRoughness: 0.45, sheenColor: new THREE.Color('#ff7a8a'), envMapIntensity: 0.6 });
    const silk = new THREE.MeshStandardMaterial({ map: createSilkTexture(), roughness: 0.45, metalness: 0.15 });
    const marble = new THREE.MeshStandardMaterial({ color: '#efe4cf', roughness: 0.18, metalness: 0.05, envMapIntensity: 0.9 });
    const floor = new THREE.MeshStandardMaterial({ color: '#22070f', roughness: 0.22, metalness: 0.55, envMapIntensity: 0.8 });
    const copper = new THREE.MeshStandardMaterial({ color: '#b5643a', metalness: 1, roughness: 0.34 });
    const flower = new THREE.MeshStandardMaterial({ roughness: 0.75, metalness: 0 });
    return { gold, velvet, silk, marble, floor, copper, flower };
  }, []);
}

// Ruffled sphere: reads as a marigold or rose from a short distance.
function createBloomGeometry(radius: number, detail = 3) {
  const g = new THREE.IcosahedronGeometry(radius, detail);
  const p = g.attributes.position;
  const v = new THREE.Vector3();
  for (let i = 0; i < p.count; i += 1) {
    v.fromBufferAttribute(p, i);
    const n = v.clone().normalize();
    const ruffle = 1 + 0.16 * Math.sin(n.x * 18) * Math.sin(n.y * 17) * Math.sin(n.z * 19);
    v.copy(n).multiplyScalar(radius * ruffle);
    p.setXYZ(i, v.x, v.y, v.z);
  }
  g.computeVertexNormals();
  return g;
}

function Pillars({ m }: { m: ReturnType<typeof useMaterials> }) {
  const geometry = useMemo(() => {
    const profile = [
      [0, 0], [0.44, 0], [0.44, 0.12], [0.36, 0.16], [0.36, 0.22], [0.29, 0.27], [0.24, 0.32], [0.24, 0.38], [0.31, 0.44], [0.33, 0.52],
      [0.27, 0.62], [0.21, 0.68], [0.21, 0.74], [0.18, 0.78], [0.18, 3.2], [0.23, 3.25], [0.23, 3.31], [0.18, 3.36], [0.25, 3.5],
      [0.33, 3.62], [0.37, 3.72], [0.3, 3.8], [0.42, 3.86], [0.42, 3.98], [0, 3.98],
    ].map(([x, y]) => new THREE.Vector2(x, y));
    return new THREE.LatheGeometry(profile, 40);
  }, []);
  const wrap = useMemo(() => new THREE.CylinderGeometry(0.205, 0.205, 2.36, 40, 1, true), []);
  const corners = [[-PILLAR, -PILLAR], [PILLAR, -PILLAR], [-PILLAR, PILLAR], [PILLAR, PILLAR]];
  return (
    <group>
      {corners.map(([x, z]) => (
        <group key={`${x}${z}`} position={[x, 0.35, z]}>
          <mesh geometry={geometry} material={m.gold} />
          <mesh geometry={wrap} material={m.silk} position-y={2.0} />
        </group>
      ))}
    </group>
  );
}

function Garlands({ m, lite }: { m: ReturnType<typeof useMaterials>; lite: boolean }) {
  // Marigold spirals up each pillar, and ladis (flower strings) hang from the canopy.
  const bloom = useMemo(() => createBloomGeometry(0.075, lite ? 2 : 3), [lite]);
  const strings = useMemo(() => {
    const out: { x: number; z: number; length: number; phase: number }[] = [];
    const sides = [
      (t: number) => [t, -PILLAR],
      (t: number) => [t, PILLAR],
      (t: number) => [-PILLAR, t],
      (t: number) => [PILLAR, t],
    ];
    sides.forEach((side, s) => {
      for (let i = 0; i < 15; i += 1) {
        const t = -2.3 + (4.6 * i) / 14;
        const [x, z] = side(t);
        if (s === 1 && Math.abs(t) < 1.25) continue;
        const length = 1.1 + 0.75 * Math.pow(Math.abs(t) / 2.3, 1.5);
        out.push({ x, z, length, phase: (s * 15 + i) * 0.7 });
      }
    });
    return out;
  }, []);
  const spirals = useMemo(() => {
    const out: THREE.Vector3[] = [];
    for (const [px, pz] of [[-PILLAR, -PILLAR], [PILLAR, -PILLAR], [-PILLAR, PILLAR], [PILLAR, PILLAR]]) {
      for (let i = 0; i < 46; i += 1) {
        const t = i / 45;
        const a = t * Math.PI * 2 * 5;
        out.push(new THREE.Vector3(px + Math.cos(a) * 0.25, 1.2 + t * 2.3, pz + Math.sin(a) * 0.25));
      }
    }
    return out;
  }, []);
  const STEP = 0.135;
  const flowers = useMemo(() => strings.reduce((sum, s) => sum + Math.floor(s.length / STEP), 0), [strings]);
  const total = flowers + spirals.length;
  const mesh = useRef<THREE.InstancedMesh>(null);
  const palette = useMemo(() => ({ o: new THREE.Color('#f77d0e'), y: new THREE.Color('#fdb523'), w: new THREE.Color('#fff6e4'), r: new THREE.Color('#b3122e') }), []);

  useEffect(() => {
    const target = mesh.current;
    if (!target) return;
    let n = 0;
    strings.forEach((s) => {
      const count = Math.floor(s.length / STEP);
      for (let j = 0; j < count; j += 1) {
        const color = j === count - 1 ? palette.r : j % 5 === 4 ? palette.w : j % 2 ? palette.y : palette.o;
        target.setColorAt(n, color);
        n += 1;
      }
    });
    spirals.forEach((_, i) => {
      target.setColorAt(n + i, i % 3 === 0 ? palette.y : palette.o);
    });
    if (target.instanceColor) target.instanceColor.needsUpdate = true;
  }, [strings, spirals, palette]);

  const m4 = useMemo(() => new THREE.Matrix4(), []);
  useFrame(({ clock }) => {
    const target = mesh.current;
    if (!target) return;
    const t = clock.elapsedTime;
    let n = 0;
    strings.forEach((s) => {
      const count = Math.floor(s.length / STEP);
      for (let j = 0; j < count; j += 1) {
        const depth = j / count;
        const sway = Math.sin(t * 1.1 + s.phase) * 0.05 * depth;
        const scale = j === count - 1 ? 1.35 : 1;
        m4.makeScale(scale, scale, scale).setPosition(s.x + sway, BEAM_Y - 0.2 - j * STEP, s.z + sway * 0.6);
        target.setMatrixAt(n, m4);
        n += 1;
      }
    });
    spirals.forEach((p, i) => {
      m4.makeScale(0.9, 0.9, 0.9).setPosition(p.x, p.y, p.z);
      target.setMatrixAt(n + i, m4);
    });
    target.instanceMatrix.needsUpdate = true;
  });

  return <instancedMesh ref={mesh} args={[bloom, m.flower, total]} frustumCulled={false} />;
}

function Canopy({ m }: { m: ReturnType<typeof useMaterials> }) {
  const dome = useMemo(() => {
    const profile = [[0, 0], [2.05, 0], [2.18, 0.2], [2.12, 0.5], [1.92, 0.9], [1.52, 1.35], [1.02, 1.72], [0.52, 1.98], [0.18, 2.12], [0, 2.22]].map(
      ([x, y]) => new THREE.Vector2(x, y),
    );
    return new THREE.LatheGeometry(profile, 64);
  }, []);
  const ribs = useMemo(() => {
    const parts: THREE.BufferGeometry[] = [];
    for (let i = 0; i < 12; i += 1) {
      const a = (i / 12) * Math.PI * 2;
      const pts = [[2.1, 0.05], [2.16, 0.3], [2.04, 0.65], [1.8, 1.0], [1.4, 1.42], [0.9, 1.78], [0.4, 2.03], [0.05, 2.21]].map(
        ([r, y]) => new THREE.Vector3(Math.cos(a) * r * 1.01, y, Math.sin(a) * r * 1.01),
      );
      parts.push(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 24, 0.025, 6, false));
    }
    return mergeGeometries(parts);
  }, []);
  const kalash = useMemo(() => {
    const profile = [[0, 0], [0.16, 0], [0.2, 0.08], [0.26, 0.2], [0.24, 0.32], [0.12, 0.4], [0.1, 0.46], [0.16, 0.5], [0, 0.5]].map(
      ([x, y]) => new THREE.Vector2(x, y),
    );
    return new THREE.LatheGeometry(profile, 32);
  }, []);
  const beams = [
    { p: [0, BEAM_Y, -PILLAR], r: 0 },
    { p: [0, BEAM_Y, PILLAR], r: 0 },
    { p: [-PILLAR, BEAM_Y, 0], r: Math.PI / 2 },
    { p: [PILLAR, BEAM_Y, 0], r: Math.PI / 2 },
  ] as const;
  const scallops = useMemo(() => {
    const g = new THREE.CircleGeometry(0.2, 18, 0, Math.PI);
    g.rotateZ(Math.PI);
    return g;
  }, []);
  const scallopRef = useRef<THREE.InstancedMesh>(null);
  useEffect(() => {
    const mesh = scallopRef.current;
    if (!mesh) return;
    const m4 = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    let n = 0;
    for (let s = 0; s < 4; s += 1) {
      for (let i = 0; i < 13; i += 1) {
        const t = -2.4 + (4.8 * i) / 12;
        const angle = [0, Math.PI, -Math.PI / 2, Math.PI / 2][s];
        const pos = [new THREE.Vector3(t, BEAM_Y - 0.16, -PILLAR - 0.17), new THREE.Vector3(t, BEAM_Y - 0.16, PILLAR + 0.17), new THREE.Vector3(-PILLAR - 0.17, BEAM_Y - 0.16, t), new THREE.Vector3(PILLAR + 0.17, BEAM_Y - 0.16, t)][s];
        q.setFromAxisAngle(new THREE.Vector3(0, 1, 0), angle);
        m4.compose(pos, q, new THREE.Vector3(1, 1, 1));
        mesh.setMatrixAt(n, m4);
        mesh.setColorAt(n, new THREE.Color(i % 2 ? '#d9a441' : '#9e1530'));
        n += 1;
      }
    }
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  }, []);
  const scallopMaterial = useMemo(() => new THREE.MeshStandardMaterial({ side: THREE.DoubleSide, metalness: 0.6, roughness: 0.35 }), []);

  return (
    <group>
      {beams.map((b, i) => (
        <mesh key={i} position={b.p as unknown as THREE.Vector3Tuple} rotation-y={b.r} material={m.gold}>
          <boxGeometry args={[5.62, 0.3, 0.32]} />
        </mesh>
      ))}
      <mesh position-y={BEAM_Y + 0.15} material={m.velvet}>
        <boxGeometry args={[5.5, 0.06, 5.5]} />
      </mesh>
      <group position-y={BEAM_Y + 0.18}>
        <mesh geometry={dome} material={m.velvet} />
        <mesh geometry={ribs} material={m.gold} />
        <mesh geometry={kalash} material={m.gold} position-y={2.18} />
        <mesh position-y={2.82} material={m.gold}>
          <sphereGeometry args={[0.1, 16, 12]} />
        </mesh>
      </group>
      <instancedMesh ref={scallopRef} args={[scallops, scallopMaterial, 52]} />
    </group>
  );
}

// Sheer fabric that gathers at a tie-back and moves gently, folded in the vertex shader.
function createDrapeMaterial(color: string, opacity: number) {
  const mat = new THREE.MeshPhysicalMaterial({ color, side: THREE.DoubleSide, roughness: 0.55, sheen: 1, sheenRoughness: 0.35, sheenColor: new THREE.Color('#fff6e6'), transparent: true, opacity });
  mat.onBeforeCompile = (shader) => {
    shader.uniforms.uTime = { value: 0 };
    shader.vertexShader = `uniform float uTime;\n${shader.vertexShader}`.replace(
      '#include <begin_vertex>',
      `#include <begin_vertex>
      float hang = 1.0 - uv.y;
      float gather = mix(1.0, 0.28, smoothstep(0.42, 0.08, uv.y)) * mix(1.0, 0.55, smoothstep(0.82, 1.0, uv.y));
      transformed.x *= gather;
      transformed.z += (sin(position.x * 28.0) * 0.055 + sin(position.x * 11.0 + 1.3) * 0.04) * (0.6 + 0.4 * gather)
        + sin(uTime * 0.9 + position.x * 2.0 + uv.y * 3.0) * 0.07 * hang;`,
    );
    mat.userData.shader = shader;
  };
  return mat;
}

function Drapes({ m }: { m: ReturnType<typeof useMaterials> }) {
  const material = useMemo(() => createDrapeMaterial('#fff1d6', 0.92), []);
  const saffron = useMemo(() => createDrapeMaterial('#f7931e', 0.95), []);
  const geometry = useMemo(() => new THREE.PlaneGeometry(1.15, 3.6, 48, 36), []);
  useFrame(({ clock }) => {
    for (const mat of [material, saffron]) {
      const shader = mat.userData.shader as { uniforms: { uTime: { value: number } } } | undefined;
      if (shader) shader.uniforms.uTime.value = clock.elapsedTime;
    }
  });
  const spots = [
    [-PILLAR - 0.45, -PILLAR, 0.6], [PILLAR + 0.45, -PILLAR, -0.6],
    [-PILLAR - 0.45, PILLAR, -0.6], [PILLAR + 0.45, PILLAR, 0.6],
  ];
  return (
    <group>
      {spots.map(([x, z, r], i) => (
        <group key={i} position={[x, 2.1, z]} rotation-y={r}>
          <mesh geometry={geometry} material={material} />
          <mesh geometry={geometry} material={saffron} position={[0.18, -0.05, 0.08]} scale={[0.7, 1, 1]} />
        </group>
      ))}
      <mesh visible={false} material={m.gold} />
    </group>
  );
}

function Fire({ progress }: { progress: Progress }) {
  const flame = useMemo(() => createFlameMaterial(), []);
  const glow = useMemo(() => createGlowMaterial('#ff7a1a', 1.1), []);
  const quad = useMemo(() => {
    const g = new THREE.PlaneGeometry(0.22, 0.5);
    g.translate(0, 0.25, 0);
    return g;
  }, []);
  const glowQuad = useMemo(() => new THREE.PlaneGeometry(1, 1), []);
  const flames = useRef<THREE.InstancedMesh>(null);
  const halo = useRef<THREE.InstancedMesh>(null);
  const light = useRef<THREE.PointLight>(null);
  const COUNT = 9;
  useEffect(() => {
    const seeds = new THREE.InstancedBufferAttribute(new Float32Array(COUNT).map((_, i) => i * 1.7), 1);
    flames.current?.geometry.setAttribute('aSeed', seeds);
    halo.current?.geometry.setAttribute('aSeed', new THREE.InstancedBufferAttribute(new Float32Array([0.5]), 1));
    const m4 = new THREE.Matrix4();
    for (let i = 0; i < COUNT; i += 1) {
      const a = (i / COUNT) * Math.PI * 2;
      const r = i === 0 ? 0 : 0.12 + (i % 3) * 0.04;
      const s = i === 0 ? 2.2 : 1.2 + (i % 4) * 0.25;
      m4.makeScale(s, s, s).setPosition(Math.cos(a) * r, 0.56, Math.sin(a) * r);
      flames.current?.setMatrixAt(i, m4);
    }
    m4.makeScale(2.6, 2.6, 2.6).setPosition(0, 0.95, 0);
    halo.current?.setMatrixAt(0, m4);
  }, []);
  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    flame.uniforms.uTime.value = t;
    glow.uniforms.uTime.value = t;
    const boost = 1 + window01(progress.current, 0.55, 0.75) * 0.6;
    if (light.current) light.current.intensity = (18 + Math.sin(t * 13) * 2.5 + Math.sin(t * 7.3) * 2) * boost;
  });
  return (
    <group>
      <mesh rotation-y={Math.PI / 4} position-y={0.48}>
        <cylinderGeometry args={[0.52, 0.34, 0.26, 4, 1]} />
        <meshStandardMaterial color="#b5643a" metalness={1} roughness={0.32} />
      </mesh>
      <instancedMesh ref={flames} args={[quad, flame, COUNT]} frustumCulled={false} renderOrder={3} />
      <instancedMesh ref={halo} args={[glowQuad, glow, 1]} frustumCulled={false} renderOrder={2} />
      <pointLight ref={light} position={[0, 1.2, 0]} color="#ff7a24" distance={11} decay={1.6} />
    </group>
  );
}

// The saat phere: seven rings round the fire that light one by one.
function Vows({ progress }: { progress: Progress }) {
  const rings = useMemo(
    () => Array.from({ length: 7 }, (_, i) => ({ radius: 0.95 + i * 0.2, material: new THREE.MeshBasicMaterial({ color: '#ffcf6a', transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false }) })),
    [],
  );
  useFrame(() => {
    const p = progress.current;
    rings.forEach((ring, i) => {
      const on = window01(p, 0.56 + i * 0.03, 0.6 + i * 0.03);
      const off = 1 - window01(p, 0.9, 1);
      ring.material.opacity = on * off * 0.85;
    });
  });
  return (
    <group position-y={0.37} rotation-x={-Math.PI / 2}>
      {rings.map((ring, i) => (
        <mesh key={i} material={ring.material}>
          <ringGeometry args={[ring.radius, ring.radius + 0.025, 96]} />
        </mesh>
      ))}
    </group>
  );
}

function PetalShower({ progress, count }: { progress: Progress; count: number }) {
  const geometry = useMemo(() => createPetalGeometry(), []);
  const material = useMemo(() => new THREE.MeshStandardMaterial({ side: THREE.DoubleSide, roughness: 0.6 }), []);
  const mesh = useRef<THREE.InstancedMesh>(null);
  const data = useMemo(() => {
    const r = rand(41);
    return Array.from({ length: count }, () => ({ x: (r() - 0.5) * 7, z: (r() - 0.5) * 7, y: r() * 7, speed: 0.5 + r() * 0.6, spin: r() * 4, phase: r() * 6 }));
  }, [count]);
  useEffect(() => {
    const colors = ['#c0213c', '#e2405a', '#fe7a0b', '#fdb523', '#fff1d6'].map((c) => new THREE.Color(c));
    data.forEach((_, i) => mesh.current?.setColorAt(i, colors[i % colors.length]));
    if (mesh.current?.instanceColor) mesh.current.instanceColor.needsUpdate = true;
  }, [data]);
  const m4 = useMemo(() => new THREE.Matrix4(), []);
  const q = useMemo(() => new THREE.Quaternion(), []);
  const e = useMemo(() => new THREE.Euler(), []);
  const v = useMemo(() => new THREE.Vector3(), []);
  const s = useMemo(() => new THREE.Vector3(), []);
  useFrame(({ clock }, delta) => {
    if (!mesh.current) return;
    const amount = window01(progress.current, 0.82, 0.95);
    mesh.current.visible = amount > 0;
    if (!amount) return;
    const t = clock.elapsedTime;
    data.forEach((p, i) => {
      p.y -= p.speed * Math.min(delta, 0.05);
      if (p.y < 0.4) p.y = 7.5;
      v.set(p.x + Math.sin(t + p.phase) * 0.4, p.y, p.z + Math.cos(t * 0.8 + p.phase) * 0.4);
      e.set(t * p.spin, t * 0.6, p.phase);
      q.setFromEuler(e);
      s.setScalar(1.6 * amount);
      m4.compose(v, q, s);
      mesh.current?.setMatrixAt(i, m4);
    });
    mesh.current.instanceMatrix.needsUpdate = true;
  });
  return <instancedMesh ref={mesh} args={[geometry, material, count]} frustumCulled={false} />;
}

function Platform({ m }: { m: ReturnType<typeof useMaterials> }) {
  const rangoli = useMemo(() => createRangoliTexture(1024), []);
  const shadow = useMemo(() => createShadowTexture(), []);
  const lotas = [[-1.8, -1.8], [1.8, -1.8], [-1.8, 1.8], [1.8, 1.8]];
  const lota = useMemo(() => {
    const profile = [[0, 0], [0.12, 0], [0.18, 0.06], [0.22, 0.16], [0.2, 0.26], [0.1, 0.32], [0.09, 0.38], [0.14, 0.42], [0, 0.42]].map(([x, y]) => new THREE.Vector2(x, y));
    return new THREE.LatheGeometry(profile, 32);
  }, []);
  return (
    <group>
      <mesh rotation-x={-Math.PI / 2} position-y={0} material={m.floor}>
        <circleGeometry args={[40, 64]} />
      </mesh>
      <mesh rotation-x={-Math.PI / 2} position-y={0.01}>
        <circleGeometry args={[7, 48]} />
        <meshBasicMaterial map={shadow} transparent depthWrite={false} />
      </mesh>
      <mesh position-y={0.09} material={m.marble}>
        <cylinderGeometry args={[4.8, 4.9, 0.18, 96]} />
      </mesh>
      <mesh position-y={0.27} material={m.marble}>
        <cylinderGeometry args={[4.25, 4.3, 0.2, 96]} />
      </mesh>
      <mesh position-y={0.37} rotation-x={-Math.PI / 2}>
        <circleGeometry args={[3.65, 96]} />
        <meshStandardMaterial map={rangoli} roughness={0.85} />
      </mesh>
      <mesh position-y={0.37} rotation-x={Math.PI / 2} material={m.gold}>
        <torusGeometry args={[4.25, 0.035, 8, 128]} />
      </mesh>
      {lotas.map(([x, z]) => (
        <group key={`${x}${z}`} position={[x, 0.37, z]}>
          <mesh geometry={lota} material={m.copper} />
          <mesh position-y={0.5} material={m.flower}>
            <sphereGeometry args={[0.1, 16, 12]} />
          </mesh>
        </group>
      ))}
      {[-1.05, 1.05].map((x) => (
        <mesh key={x} position={[x, 0.47, 1.3]} scale={[1, 0.38, 1]} material={m.velvet}>
          <sphereGeometry args={[0.45, 32, 16]} />
        </mesh>
      ))}
    </group>
  );
}

const CAMERA_PATH = new THREE.CatmullRomCurve3([
  new THREE.Vector3(0, 3.1, 13.5),
  new THREE.Vector3(8.8, 3.8, 8.2),
  new THREE.Vector3(3.3, 1.9, 5.4),
  new THREE.Vector3(-2.8, 1.25, 2.8),
  new THREE.Vector3(0, 8.5, 12.5),
]);
const LOOK_PATH = new THREE.CatmullRomCurve3([
  new THREE.Vector3(0, 2.5, 0),
  new THREE.Vector3(0, 2.4, 0),
  new THREE.Vector3(0, 3.9, 0),
  new THREE.Vector3(0, 0.8, 0),
  new THREE.Vector3(0, 1.2, 0),
]);

function Rig({ progress }: { progress: Progress }) {
  const camera = useThree((state) => state.camera);
  const pos = useMemo(() => new THREE.Vector3(), []);
  const look = useMemo(() => new THREE.Vector3(), []);
  const smooth = useRef(0);
  useFrame((_, delta) => {
    smooth.current += (progress.current - smooth.current) * (1 - Math.pow(0.0005, Math.min(delta, 0.05)));
    const p = Math.min(0.999, Math.max(0, smooth.current));
    CAMERA_PATH.getPointAt(p, pos);
    LOOK_PATH.getPointAt(p, look);
    camera.position.copy(pos);
    camera.lookAt(look);
  });
  return null;
}

function Scene({ progress, lite }: { progress: Progress; lite: boolean }) {
  const m = useMaterials();
  const sky = useMemo(() => createSkyMaterial('#12050a', '#3d0c1c', '#8a2a14'), []);
  return (
    <>
      <color attach="background" args={['#12050a']} />
      <fog attach="fog" args={['#1d0710', 14, 40]} />
      <SceneEnvironment
        top="#2a0a14"
        horizon="#8a3a18"
        bottom="#12050a"
        lights={[
          { color: '#ffd59a', intensity: 7, position: [6, 6, 8], size: [5, 4] },
          { color: '#ff6a3a', intensity: 3, position: [-8, 3, -6], size: [6, 3] },
        ]}
      />
      <mesh material={sky}>
        <sphereGeometry args={[60, 32, 16]} />
      </mesh>
      <ambientLight intensity={0.35} color="#ffb48a" />
      <hemisphereLight args={['#ffcf9a', '#1d0710', 0.5]} />
      <directionalLight position={[6, 9, 8]} intensity={1.4} color="#ffe2b8" />
      <directionalLight position={[-6, 4, -8]} intensity={0.9} color="#ff5a7a" />
      <Platform m={m} />
      <Pillars m={m} />
      <Canopy m={m} />
      <Drapes m={m} />
      <Garlands m={m} lite={lite} />
      <Fire progress={progress} />
      <Vows progress={progress} />
      <PetalShower progress={progress} count={lite ? 70 : 150} />
      <Rig progress={progress} />
    </>
  );
}

export default function MandapScene({ active, lite, progress }: { active: boolean; lite: boolean; progress: Progress }) {
  return (
    <Canvas
      frameloop={active ? 'always' : 'never'}
      dpr={[1, lite ? 1.5 : 1.8]}
      camera={{ position: [0, 3.1, 13.5], fov: 40, near: 0.1, far: 120 }}
      gl={{ antialias: !lite, powerPreference: 'high-performance' }}
      aria-hidden
    >
      <Scene progress={progress} lite={lite} />
    </Canvas>
  );
}
