'use client';

import { useEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame, useThree, type ThreeEvent } from '@react-three/fiber';
import * as THREE from 'three';
import { AdaptiveResolution } from './AdaptiveResolution';
import { SceneEnvironment } from './environment';

type Progress = { current: number };

const rand = (seed: number) => () => {
  seed = (seed * 16807) % 2147483647;
  return (seed - 1) / 2147483646;
};
const window01 = (p: number, a: number, b: number) => Math.min(1, Math.max(0, (p - a) / (b - a)));
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

function createBalloonGeometry() {
  const profile = [
    [0, -1.0], [0.18, -0.97], [0.45, -0.82], [0.72, -0.5], [0.88, -0.12], [0.9, 0.22], [0.8, 0.56], [0.6, 0.82], [0.32, 0.97], [0, 1.0],
  ].map(([x, y]) => new THREE.Vector2(x, y));
  const body = new THREE.LatheGeometry(profile, 48);
  const knot = new THREE.ConeGeometry(0.09, 0.14, 16);
  knot.translate(0, -1.04, 0);
  const merged = new THREE.BufferGeometry();
  const parts = [body.toNonIndexed(), knot.toNonIndexed()];
  const positions = parts.flatMap((g) => Array.from(g.attributes.position.array as Float32Array));
  const normals = parts.flatMap((g) => Array.from(g.attributes.normal.array as Float32Array));
  merged.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  merged.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
  return merged;
}

// The foil "2": a puffy tube traced along the numeral, closed with rounded ends.
function createTwoGeometry() {
  const curve = new THREE.CurvePath<THREE.Vector3>();
  curve.add(
    new THREE.CatmullRomCurve3(
      [
        [-0.95, 0.75], [-0.72, 1.32], [-0.1, 1.62], [0.58, 1.44], [0.95, 0.86], [0.78, 0.18], [0.14, -0.46], [-0.55, -1.02], [-0.98, -1.42],
      ].map(([x, y]) => new THREE.Vector3(x, y, 0)),
    ),
  );
  curve.add(new THREE.LineCurve3(new THREE.Vector3(-0.98, -1.42, 0), new THREE.Vector3(1.05, -1.42, 0)));
  const tube = new THREE.TubeGeometry(curve, 220, 0.4, 28, false);
  return { tube, start: new THREE.Vector3(-0.95, 0.75, 0), end: new THREE.Vector3(1.05, -1.42, 0) };
}

function Balloons({ count, progress }: { count: number; progress: Progress }) {
  const geometry = useMemo(() => createBalloonGeometry(), []);
  const glossy = useMemo(
    () => new THREE.MeshPhysicalMaterial({ roughness: 0.2, clearcoat: 1, clearcoatRoughness: 0.12, sheen: 0.5, sheenColor: new THREE.Color('#ffffff'), envMapIntensity: 1.25 }),
    [],
  );
  const mesh = useRef<THREE.InstancedMesh>(null);
  const strings = useRef<THREE.LineSegments>(null);
  const confetti = useRef<THREE.InstancedMesh>(null);
  const pointer = useThree((state) => state.pointer);
  const viewport = useThree((state) => state.viewport);

  const data = useMemo(() => {
    const r = rand(13);
    return Array.from({ length: count }, () => ({
      x: (r() * 2 - 1) * 7,
      y: -6 + r() * 14,
      z: -4 + r() * 5,
      speed: 0.35 + r() * 0.4,
      phase: r() * Math.PI * 2,
      scale: 0.55 + r() * 0.45,
      popped: 0,
      push: new THREE.Vector2(),
    }));
  }, [count]);

  const palette = useMemo(() => ['#f4b6c2', '#e98aa6', '#c7a6e8', '#fff1e6', '#bfd9f2', '#f7c9a5', '#e8c27a'].map((c) => new THREE.Color(c)), []);
  useEffect(() => {
    data.forEach((_, i) => mesh.current?.setColorAt(i, palette[i % palette.length]));
    if (mesh.current?.instanceColor) mesh.current.instanceColor.needsUpdate = true;
  }, [data, palette]);

  const SEG = 10;
  const stringGeometry = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(count * SEG * 2 * 3), 3));
    return g;
  }, [count]);

  // Confetti pool: bursts wherever a balloon is popped.
  const POOL = 260;
  const bits = useMemo(() => Array.from({ length: POOL }, () => ({ alive: 0, p: new THREE.Vector3(), v: new THREE.Vector3(), spin: new THREE.Vector3() })), []);
  const confettiGeometry = useMemo(() => new THREE.PlaneGeometry(0.07, 0.12), []);
  const confettiMaterial = useMemo(() => new THREE.MeshStandardMaterial({ side: THREE.DoubleSide, roughness: 0.4, metalness: 0.3 }), []);
  useEffect(() => {
    const colors = ['#e8c27a', '#f4b6c2', '#c7a6e8', '#bfd9f2', '#ffffff', '#e98aa6'].map((c) => new THREE.Color(c));
    for (let i = 0; i < POOL; i += 1) confetti.current?.setColorAt(i, colors[i % colors.length]);
    if (confetti.current?.instanceColor) confetti.current.instanceColor.needsUpdate = true;
  }, []);
  const cursor = useRef(0);
  const burst = (at: THREE.Vector3) => {
    for (let i = 0; i < 40; i += 1) {
      const bit = bits[cursor.current];
      cursor.current = (cursor.current + 1) % POOL;
      bit.alive = 1;
      bit.p.copy(at);
      bit.v.set((Math.random() - 0.5) * 6, Math.random() * 5 + 1, (Math.random() - 0.5) * 6);
      bit.spin.set(Math.random() * 8, Math.random() * 8, Math.random() * 8);
    }
  };

  const onPop = (event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation();
    const i = event.instanceId;
    if (i === undefined || data[i].popped) return;
    data[i].popped = 0.001;
    burst(event.point.clone());
  };

  const m4 = useMemo(() => new THREE.Matrix4(), []);
  const q = useMemo(() => new THREE.Quaternion(), []);
  const e = useMemo(() => new THREE.Euler(), []);
  const v = useMemo(() => new THREE.Vector3(), []);
  const s = useMemo(() => new THREE.Vector3(), []);

  useFrame(({ clock }, delta) => {
    const t = clock.elapsedTime;
    const dt = Math.min(delta, 0.05);
    const lift = 0.6 + window01(progress.current, 0, 0.3) * 0.8;
    const px = (pointer.x * viewport.width) / 2;
    const py = (pointer.y * viewport.height) / 2;
    const positions = stringGeometry.attributes.position.array as Float32Array;
    data.forEach((b, i) => {
      b.y += b.speed * dt * lift;
      if (b.y > 9) {
        b.y = -7.5;
        b.x = (Math.random() * 2 - 1) * 7;
        b.popped = 0;
      }
      if (b.popped > 0) {
        b.popped += dt;
        if (b.popped > 4) {
          b.popped = 0;
          b.y = -7.5;
        }
      }
      const dx = b.x - px;
      const dy = b.y - py;
      const d2 = dx * dx + dy * dy;
      if (d2 < 4) {
        b.push.x += (dx / (d2 + 0.3)) * dt * 2.2;
        b.push.y += (dy / (d2 + 0.3)) * dt * 2.2;
      }
      b.push.multiplyScalar(0.96);
      const x = b.x + Math.sin(t * 0.6 + b.phase) * 0.35 + b.push.x;
      const y = b.y + b.push.y;
      const shrink = b.popped > 0 ? Math.max(0, 1 - b.popped * 8) : 1;
      e.set(Math.sin(t * 0.8 + b.phase) * 0.12, t * 0.2 + b.phase, Math.sin(t * 0.7 + b.phase) * 0.1);
      q.setFromEuler(e);
      v.set(x, y, b.z);
      s.set(b.scale * shrink, b.scale * 1.08 * shrink, b.scale * shrink);
      m4.compose(v, q, s);
      mesh.current?.setMatrixAt(i, m4);
      // string: hangs from the knot and trails as the balloon rises
      for (let k = 0; k < SEG; k += 1) {
        const a = k / SEG;
        const b2 = (k + 1) / SEG;
        const len = 2.2 * b.scale;
        const sx = (p: number) => x + Math.sin(t * 1.4 + b.phase + p * 3) * 0.18 * p;
        const base = (k * 2 + i * SEG * 2) * 3;
        const top = y - 1.05 * b.scale * 1.08;
        const visible = shrink > 0 ? 1 : 0;
        positions[base] = sx(a);
        positions[base + 1] = visible ? top - a * len : -100;
        positions[base + 2] = b.z;
        positions[base + 3] = sx(b2);
        positions[base + 4] = visible ? top - b2 * len : -100;
        positions[base + 5] = b.z;
      }
    });
    stringGeometry.attributes.position.needsUpdate = true;
    if (mesh.current) mesh.current.instanceMatrix.needsUpdate = true;

    bits.forEach((bit, i) => {
      if (bit.alive <= 0) {
        m4.makeScale(0, 0, 0);
      } else {
        bit.alive -= dt * 0.45;
        bit.v.y -= 6 * dt;
        bit.v.multiplyScalar(0.985);
        bit.p.addScaledVector(bit.v, dt);
        e.set(t * bit.spin.x, t * bit.spin.y, t * bit.spin.z);
        q.setFromEuler(e);
        s.setScalar(Math.min(1, bit.alive * 2));
        m4.compose(bit.p, q, s);
      }
      confetti.current?.setMatrixAt(i, m4);
    });
    if (confetti.current) confetti.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <group>
      <instancedMesh ref={mesh} args={[geometry, glossy, count]} onClick={onPop} frustumCulled={false} />
      <lineSegments ref={strings} geometry={stringGeometry} frustumCulled={false}>
        <lineBasicMaterial color="#c9a7b4" transparent opacity={0.7} />
      </lineSegments>
      <instancedMesh ref={confetti} args={[confettiGeometry, confettiMaterial, POOL]} frustumCulled={false} />
    </group>
  );
}

function FoilTwo({ progress, wide }: { progress: Progress; wide: boolean }) {
  const { tube, start, end } = useMemo(() => createTwoGeometry(), []);
  const foil = useMemo(
    () => new THREE.MeshPhysicalMaterial({ color: '#e9ad93', metalness: 1, roughness: 0.17, clearcoat: 0.6, clearcoatRoughness: 0.1, envMapIntensity: 1.6 }),
    [],
  );
  const gold = useMemo(() => new THREE.MeshStandardMaterial({ color: '#e8c27a', metalness: 1, roughness: 0.22, envMapIntensity: 1.6 }), []);
  const gem = useMemo(() => new THREE.MeshPhysicalMaterial({ color: '#ff8fb5', roughness: 0.05, metalness: 0, clearcoat: 1, envMapIntensity: 2 }), []);
  const group = useRef<THREE.Group>(null);
  const tiara = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    const p = progress.current;
    const t = clock.elapsedTime;
    const rise = easeOut(window01(p, 0.18, 0.5));
    if (group.current) {
      group.current.position.y = -9 + rise * 9 + Math.sin(t * 0.9) * 0.12;
      group.current.rotation.y = (1 - rise) * Math.PI * 1.5 + Math.sin(t * 0.5) * 0.25;
      group.current.position.x = wide ? 2.6 : 0;
      const shrink = 1 - window01(p, 0.92, 1) * 0.3;
      group.current.scale.setScalar((wide ? 1.55 : 1.15) * shrink);
    }
    if (tiara.current) {
      const crown = easeOut(window01(p, 0.42, 0.62));
      tiara.current.position.y = 2.1 + (1 - crown) * 4;
      tiara.current.rotation.y = t * 0.6;
      tiara.current.scale.setScalar(crown);
    }
  });
  const spikes = Array.from({ length: 7 }, (_, i) => {
    const a = (i / 7) * Math.PI - Math.PI;
    return { a, h: i === 3 ? 0.42 : i % 2 ? 0.24 : 0.32 };
  });
  return (
    <group ref={group}>
      <mesh geometry={tube} material={foil} />
      <mesh position={start} material={foil}>
        <sphereGeometry args={[0.4, 28, 20]} />
      </mesh>
      <mesh position={end} material={foil}>
        <sphereGeometry args={[0.4, 28, 20]} />
      </mesh>
      <group ref={tiara} position={[-0.1, 2.1, 0]}>
        <mesh rotation-x={Math.PI / 2} material={gold}>
          <torusGeometry args={[0.55, 0.04, 12, 64]} />
        </mesh>
        {spikes.map(({ a, h }, i) => (
          <group key={i} position={[Math.cos(a) * 0.55, 0, Math.sin(a) * 0.55]}>
            <mesh position-y={h / 2} material={gold}>
              <coneGeometry args={[0.06, h, 12]} />
            </mesh>
            <mesh position-y={h + 0.04} material={i === 3 ? gem : gold}>
              <sphereGeometry args={[i === 3 ? 0.08 : 0.045, 16, 12]} />
            </mesh>
          </group>
        ))}
        <mesh position={[0, 0.16, -0.55]} material={gem}>
          <octahedronGeometry args={[0.1, 0]} />
        </mesh>
      </group>
    </group>
  );
}

export default function BalloonScene({ active, lite, wide, progress }: { active: boolean; lite: boolean; wide: boolean; progress: Progress }) {
  return (
    <Canvas
      frameloop={active ? 'always' : 'never'}
      dpr={[1, lite ? 1.5 : 1.8]}
      camera={{ position: [0, 0, 11], fov: 42 }}
      gl={{ antialias: !lite, alpha: true, powerPreference: 'high-performance' }}
      aria-hidden
    >
      <AdaptiveResolution />
      <SceneEnvironment
        top="#ffffff"
        horizon="#fbe3ea"
        bottom="#e6d8f4"
        lights={[
          { color: '#ffffff', intensity: 4, position: [5, 6, 8], size: [5, 4] },
          { color: '#ffe0ec', intensity: 2.5, position: [-7, 2, 5], size: [5, 5] },
        ]}
      />
      <ambientLight intensity={0.6} color="#ffe6f0" />
      <hemisphereLight args={['#ffffff', '#e8c7d8', 0.8]} />
      <directionalLight position={[4, 6, 6]} intensity={1.6} color="#fff6ee" />
      <Balloons count={lite ? 14 : 26} progress={progress} />
      <FoilTwo progress={progress} wide={wide} />
    </Canvas>
  );
}
