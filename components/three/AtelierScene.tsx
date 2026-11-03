'use client';

import { useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { AdaptiveResolution } from './AdaptiveResolution';
import { SceneEnvironment } from './environment';
import { createPetalGeometry } from './geometry';
import { createFlameMaterial, createGlowMaterial } from './shaders';

export type Spin = { drag: number; velocity: number; dragging: boolean };

const lathe = (points: number[][], segments = 64) => new THREE.LatheGeometry(points.map(([x, y]) => new THREE.Vector2(x, y)), segments);

function useBrass() {
  return useMemo(() => new THREE.MeshStandardMaterial({ color: '#d9a441', metalness: 1, roughness: 0.24, envMapIntensity: 1.5 }), []);
}

const FLAME_SEEDS = [0, 1.3, 2.6, 3.9, 5.2];

function seeded(geometry: THREE.BufferGeometry, seeds: number[]) {
  geometry.setAttribute('aSeed', new THREE.InstancedBufferAttribute(new Float32Array(seeds), 1));
  return geometry;
}

// A brass deepam: a knotted stand and a five-spouted bowl, a flame at every spout.
function Deepam() {
  const brass = useBrass();
  const stand = useMemo(() => lathe([[0, 0], [0.9, 0], [0.92, 0.06], [0.7, 0.14], [0.42, 0.3], [0.2, 0.42], [0.16, 0.5], [0.24, 0.56], [0.14, 0.64], [0.12, 1.3], [0.22, 1.36], [0.12, 1.44], [0.11, 2.0], [0.2, 2.06], [0.12, 2.12], [0, 2.12]]), []);
  const bowl = useMemo(() => {
    const g = lathe([[0, 0], [0.18, 0], [0.5, 0.1], [0.78, 0.26], [0.84, 0.32], [0.76, 0.34], [0.5, 0.2], [0.2, 0.14], [0, 0.14]], 80);
    const p = g.attributes.position;
    for (let i = 0; i < p.count; i += 1) {
      const x = p.getX(i);
      const z = p.getZ(i);
      const r = Math.hypot(x, z);
      const spout = Math.pow(Math.max(0, Math.cos(Math.atan2(z, x) * 5)), 8) * Math.min(1, Math.max(0, (r - 0.5) / 0.3));
      p.setXYZ(i, x * (1 + spout * 0.3), p.getY(i) + spout * 0.06, z * (1 + spout * 0.3));
    }
    g.computeVertexNormals();
    return g;
  }, []);
  const finial = useMemo(() => lathe([[0, 0], [0.12, 0], [0.16, 0.1], [0.08, 0.22], [0.12, 0.3], [0.04, 0.5], [0, 0.56]]), []);
  const flame = useMemo(() => createFlameMaterial(), []);
  const glow = useMemo(() => createGlowMaterial('#ff9a3c', 0.9), []);
  const flameQuad = useMemo(() => seeded(new THREE.PlaneGeometry(0.22, 0.5).translate(0, 0.25, 0), FLAME_SEEDS), []);
  const glowQuad = useMemo(() => seeded(new THREE.PlaneGeometry(1, 1), FLAME_SEEDS), []);
  const place = (mesh: THREE.InstancedMesh | null, y: number, scale: number) => {
    if (!mesh) return;
    const m4 = new THREE.Matrix4();
    for (let i = 0; i < 5; i += 1) {
      const a = (i / 5) * Math.PI * 2;
      mesh.setMatrixAt(i, m4.makeScale(scale, scale, scale).setPosition(Math.cos(a) * 1.08, y, Math.sin(a) * 1.08));
    }
    mesh.instanceMatrix.needsUpdate = true;
  };
  useFrame(({ clock }) => {
    flame.uniforms.uTime.value = clock.elapsedTime;
    glow.uniforms.uTime.value = clock.elapsedTime;
  });
  return (
    <group position-y={-1.4}>
      <mesh geometry={stand} material={brass} />
      <mesh geometry={bowl} material={brass} position-y={2.1} />
      <mesh geometry={finial} material={brass} position-y={2.24} />
      <instancedMesh ref={(m) => place(m, 2.6, 1.4)} args={[glowQuad, glow, 5]} frustumCulled={false} />
      <instancedMesh ref={(m) => place(m, 2.45, 1)} args={[flameQuad, flame, 5]} frustumCulled={false} />
    </group>
  );
}

function createLeafGeometry(length = 1.3, width = 0.34) {
  const shape = new THREE.Shape();
  shape.moveTo(0, 0);
  shape.bezierCurveTo(width, length * 0.3, width * 0.8, length * 0.75, 0, length);
  shape.bezierCurveTo(-width * 0.8, length * 0.75, -width, length * 0.3, 0, 0);
  const g = new THREE.ShapeGeometry(shape, 12);
  const p = g.attributes.position;
  for (let i = 0; i < p.count; i += 1) {
    const y = p.getY(i) / length;
    p.setZ(i, -Math.abs(p.getX(i)) * 0.35 - y * y * 0.45);
  }
  g.computeVertexNormals();
  return g;
}

// The kalash: a brass pot, a ring of mango leaves and a coconut bound with red thread.
function Kalash() {
  const brass = useBrass();
  const pot = useMemo(() => lathe([[0, 0], [0.5, 0], [0.62, 0.08], [0.9, 0.42], [1.0, 0.8], [0.92, 1.18], [0.66, 1.46], [0.4, 1.6], [0.36, 1.72], [0.5, 1.82], [0.54, 1.9], [0.32, 1.9], [0, 1.9]]), []);
  const leaf = useMemo(() => createLeafGeometry(1.45, 0.36), []);
  const leafMaterial = useMemo(() => new THREE.MeshStandardMaterial({ color: '#2f7d3a', roughness: 0.45, side: THREE.DoubleSide, envMapIntensity: 0.8 }), []);
  const coconut = useMemo(() => new THREE.MeshStandardMaterial({ color: '#7a4a24', roughness: 0.92 }), []);
  const thread = useMemo(() => new THREE.MeshStandardMaterial({ color: '#c0213c', roughness: 0.6 }), []);
  return (
    <group position-y={-1.5}>
      <mesh geometry={pot} material={brass} />
      <mesh position-y={0.8} rotation-x={Math.PI / 2} material={thread}>
        <torusGeometry args={[1.0, 0.035, 10, 96]} />
      </mesh>
      <mesh position-y={1.75} rotation-x={Math.PI / 2} material={thread}>
        <torusGeometry args={[0.39, 0.03, 10, 64]} />
      </mesh>
      {Array.from({ length: 8 }, (_, i) => {
        const a = (i / 8) * Math.PI * 2;
        return (
          <group key={i} position={[Math.cos(a) * 0.34, 1.84, Math.sin(a) * 0.34]} rotation-y={-a - Math.PI / 2}>
            <mesh geometry={leaf} material={leafMaterial} rotation-x={-0.78} />
          </group>
        );
      })}
      <mesh position-y={2.32} scale={[0.5, 0.62, 0.5]} material={coconut}>
        <sphereGeometry args={[1, 40, 28]} />
      </mesh>
      <mesh position-y={2.2} rotation-x={Math.PI / 2} material={thread}>
        <torusGeometry args={[0.5, 0.03, 10, 64]} />
      </mesh>
    </group>
  );
}

// A genda: hundreds of cupped petals standing out from a dome, like a real marigold head.
function Marigold() {
  const COUNT = 640;
  const petal = useMemo(() => createPetalGeometry(), []);
  const material = useMemo(() => new THREE.MeshStandardMaterial({ side: THREE.DoubleSide, roughness: 0.6, envMapIntensity: 0.6 }), []);
  const green = useMemo(() => new THREE.MeshStandardMaterial({ color: '#4f8f35', roughness: 0.6 }), []);
  const build = (target: THREE.InstancedMesh | null) => {
    if (!target) return;
    const golden = Math.PI * (3 - Math.sqrt(5));
    const m4 = new THREE.Matrix4();
    const up = new THREE.Vector3(0, 1, 0);
    const normal = new THREE.Vector3();
    const twist = new THREE.Quaternion();
    const q = new THREE.Quaternion();
    const deep = new THREE.Color('#d94a06');
    const bright = new THREE.Color('#ffa21a');
    const c = new THREE.Color();
    let seed = 7;
    const random = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    for (let i = 0; i < COUNT; i += 1) {
      const t = (i + 0.5) / COUNT;
      const a = i * golden;
      const polar = Math.acos(1 - t * 1.34);
      normal.set(Math.sin(polar) * Math.cos(a), Math.cos(polar), Math.sin(polar) * Math.sin(a));
      q.setFromUnitVectors(up, normal);
      twist.setFromAxisAngle(up, random() * Math.PI * 2);
      q.multiply(twist);
      const s = 2.6 + random() * 1.2;
      m4.compose(normal.clone().multiplyScalar(0.78), q, new THREE.Vector3(s, s, s));
      target.setMatrixAt(i, m4);
      c.copy(deep).lerp(bright, 0.35 + random() * 0.65 - t * 0.25);
      target.setColorAt(i, c);
    }
    target.instanceMatrix.needsUpdate = true;
    if (target.instanceColor) target.instanceColor.needsUpdate = true;
  };
  return (
    <group position-y={0.15} rotation-x={0.35}>
      <instancedMesh ref={build} args={[petal, material, COUNT]} />
      <mesh position-y={-0.6} rotation-x={Math.PI} material={green}>
        <coneGeometry args={[0.34, 0.3, 24]} />
      </mesh>
      <mesh position-y={-1.7} material={green}>
        <cylinderGeometry args={[0.05, 0.07, 1.8, 12]} />
      </mesh>
    </group>
  );
}

// An aakash kandil: an eight-pointed paper star lantern, lit from inside, hung with tassels.
function Kandil() {
  const star = useMemo(() => {
    const shape = new THREE.Shape();
    for (let i = 0; i < 16; i += 1) {
      const a = (i / 16) * Math.PI * 2 + Math.PI / 2;
      const r = i % 2 ? 0.62 : 1.25;
      if (i === 0) shape.moveTo(Math.cos(a) * r, Math.sin(a) * r);
      else shape.lineTo(Math.cos(a) * r, Math.sin(a) * r);
    }
    const g = new THREE.ExtrudeGeometry(shape, { depth: 0.55, bevelEnabled: true, bevelThickness: 0.18, bevelSize: 0.12, bevelSegments: 2 });
    g.translate(0, 0, -0.275);
    return g;
  }, []);
  const paper = useMemo(() => new THREE.MeshStandardMaterial({ color: '#ffb347', emissive: new THREE.Color('#ff6a1a'), emissiveIntensity: 0.75, roughness: 0.7 }), []);
  const inner = useMemo(() => new THREE.MeshStandardMaterial({ color: '#e0336f', emissive: new THREE.Color('#c0213c'), emissiveIntensity: 0.6, roughness: 0.6 }), []);
  const trim = useMemo(() => new THREE.MeshStandardMaterial({ color: '#c0213c', roughness: 0.5 }), []);
  const brass = useBrass();
  const tassels: [number, number][] = [[0, -1.25], [-0.884, -0.884], [0.884, -0.884]];
  return (
    <group position-y={0.35}>
      <mesh geometry={star} material={paper} />
      <mesh scale={[1.03, 1.03, 0.3]} geometry={star} material={trim} />
      {[1, -1].map((side) => (
        <group key={side} position-z={side * 0.47} rotation-y={side < 0 ? Math.PI : 0}>
          <mesh scale={[0.5, 0.5, 0.12]} rotation-z={Math.PI / 8} geometry={star} material={inner} />
          <mesh position-z={0.06} material={trim}>
            <torusGeometry args={[0.2, 0.025, 8, 40]} />
          </mesh>
        </group>
      ))}
      <mesh position-y={1.9} material={brass}>
        <cylinderGeometry args={[0.012, 0.012, 1.3, 6]} />
      </mesh>
      {tassels.map(([x, y], i) => (
        <group key={i} position={[x, y, 0]}>
          <mesh position-y={-0.28} material={brass}>
            <cylinderGeometry args={[0.012, 0.012, 0.56, 6]} />
          </mesh>
          <mesh position-y={-0.6} material={brass}>
            <sphereGeometry args={[0.07, 14, 10]} />
          </mesh>
          <mesh position-y={-1.02} material={trim}>
            <cylinderGeometry args={[0.03, 0.1, 0.72, 12]} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

const ARCHES = 9;
const angle = (k: number) => Math.PI * (1.05 + (k / ARCHES) * 0.9);
const height = (k: number) => 0.45 + Math.sin((k / ARCHES) * Math.PI) * 0.75;
const at = (k: number, y: number, r = 1.4) => new THREE.Vector3(Math.cos(angle(k)) * r, y, Math.sin(angle(k)) * r);

// A princess tiara: a gold band of filigree arches set with pearls and a pink centre stone.
function Tiara() {
  const gold = useMemo(() => new THREE.MeshStandardMaterial({ color: '#e8c27a', metalness: 1, roughness: 0.2, envMapIntensity: 1.7 }), []);
  const gem = useMemo(() => new THREE.MeshPhysicalMaterial({ color: '#ff6f9f', roughness: 0.05, clearcoat: 1, envMapIntensity: 2.2 }), []);
  const pearl = useMemo(() => new THREE.MeshPhysicalMaterial({ color: '#fff3ea', roughness: 0.28, clearcoat: 1, iridescence: 0.5 }), []);
  const arches = useMemo(() => Array.from({ length: ARCHES }, (_, i) => {
    const curve = new THREE.CatmullRomCurve3([at(i, 0.06), at(i + 0.18, height(i + 0.5) * 0.7), at(i + 0.5, height(i + 0.5)), at(i + 0.82, height(i + 0.5) * 0.7), at(i + 1, 0.06)]);
    return new THREE.TubeGeometry(curve, 40, 0.028, 8, false);
  }), []);
  return (
    <group position-y={-0.55} rotation-y={Math.PI}>
      <mesh rotation={[-Math.PI / 2, 0, Math.PI * 0.05]} material={gold}>
        <torusGeometry args={[1.4, 0.06, 14, 120, Math.PI * 0.9]} />
      </mesh>
      {arches.map((g, i) => <mesh key={i} geometry={g} material={gold} />)}
      {Array.from({ length: ARCHES }, (_, i) => {
        const centre = i === Math.floor(ARCHES / 2);
        return (
          <group key={i}>
            <mesh position={at(i + 0.5, height(i + 0.5) + (centre ? 0.16 : 0.07))} material={centre ? gem : pearl}>
              <sphereGeometry args={[centre ? 0.17 : 0.075, 24, 18]} />
            </mesh>
            <mesh position={at(i + 0.5, 0.2, 1.42)} material={i % 2 ? gem : pearl}>
              <sphereGeometry args={[0.065, 16, 12]} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}

const OBJECTS = [Deepam, Kalash, Marigold, Kandil, Tiara];
const LAMP_LIGHT = [6, 0, 0, 5, 0];

function Showcase({ index, spin, still }: { index: number; spin: Spin; still: boolean }) {
  const groups = useRef<(THREE.Group | null)[]>([]);
  const light = useRef<THREE.PointLight>(null);
  const shown = useRef<number[]>(OBJECTS.map((_, i) => (i === index ? 1 : 0)));
  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05);
    if (!spin.dragging) spin.velocity *= Math.pow(0.02, dt);
    const turn = (still ? 0 : dt * 0.35) + (spin.dragging ? 0 : spin.velocity * dt) + spin.drag;
    spin.drag = 0;
    let lamp = 0;
    groups.current.forEach((g, i) => {
      if (!g) return;
      const target = i === index ? 1 : 0;
      // Outgoing objects leave quickly so two never crowd the stage.
      const rate = target ? 0.012 : 0.00004;
      shown.current[i] = still ? target : shown.current[i] + (target - shown.current[i]) * (1 - Math.pow(rate, dt));
      const s = shown.current[i];
      lamp += LAMP_LIGHT[i] * s;
      g.visible = s > 0.01;
      g.scale.setScalar(0.4 + 0.6 * s);
      g.rotation.y += turn + (1 - s) * dt * 5;
      g.position.y = (1 - s) * -2.2;
    });
    if (light.current) light.current.intensity = lamp;
  });
  return (
    <group>
      <pointLight ref={light} position={[0, 1.3, 1.2]} distance={7} color="#ff9a3c" />
      {OBJECTS.map((Obj, i) => (
        <group key={i} ref={(g) => { groups.current[i] = g; }}>
          <Obj />
        </group>
      ))}
    </group>
  );
}

export default function AtelierScene({ active, index, spin, wide, still }: { active: boolean; index: number; spin: Spin; wide: boolean; still: boolean }) {
  return (
    <Canvas
      frameloop={active ? 'always' : 'never'}
      dpr={[1, 1.8]}
      camera={{ position: [0, 0.6, 7.2], fov: 38 }}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
    >
      <AdaptiveResolution />
      <SceneEnvironment
        top="#2a1a20"
        horizon="#c9773a"
        bottom="#1a0a10"
        lights={[
          { color: '#fff1d6', intensity: 6, position: [5, 5, 6], size: [4, 4] },
          { color: '#ffb36a', intensity: 3, position: [-6, 2, 3], size: [5, 3] },
          { color: '#ffffff', intensity: 2, position: [0, 8, -4], size: [6, 2] },
        ]}
      />
      <ambientLight intensity={0.5} />
      <directionalLight position={[4, 6, 5]} intensity={1.6} color="#fff2dc" />
      <directionalLight position={[-5, 2, -3]} intensity={0.8} color="#ffb48a" />
      <group position={wide ? [1.75, 0.2, 0] : [0, 0.6, 0]} scale={wide ? 1 : 0.86}>
        <Showcase index={index} spin={spin} still={still} />
      </group>
    </Canvas>
  );
}
