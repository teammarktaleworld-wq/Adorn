'use client';

import { useEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { SceneEnvironment } from './environment';
import { createDiyaGeometry, createPetalGeometry, DIYA_WICK } from './geometry';
import { createFlameMaterial, createGlowMaterial, createReflectionMaterial, createSkyMaterial } from './shaders';
import { Jewel } from './Jewel';

type Shared = { progress: { current: number }; pointer: { current: { x: number; y: number } } };

const rand = (seed: number) => {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
};

type DiyaPlacement = { x: number; z: number; rot: number; scale: number; phase: number };

function placeDiyas(count: number) {
  const r = rand(11);
  const out: DiyaPlacement[] = [];
  let guard = 0;
  while (out.length < count && guard < 4000) {
    guard += 1;
    const z = -18 + r() * 21.5;
    const spread = 3.5 + Math.abs(z) * 0.85;
    const x = (r() * 2 - 1) * spread;
    if (z > 1.2 && Math.abs(x) < 1.4) continue;
    const near = out.some((d) => Math.hypot(d.x - x, (d.z - z) * 1.3) < 1.15);
    if (near) continue;
    out.push({ x, z, rot: r() * Math.PI * 2, scale: 0.42 + r() * 0.16, phase: r() * Math.PI * 2 });
  }
  return out;
}

function Water() {
  const normal = useMemo(() => {
    const size = 128;
    const data = new Uint8Array(size * size * 4);
    const height = (x: number, y: number) =>
      Math.sin(x * 0.29 + y * 0.11) * 0.6 + Math.sin(x * 0.07 - y * 0.41) * 0.8 + Math.sin((x + y) * 0.53) * 0.3;
    for (let y = 0; y < size; y += 1) {
      for (let x = 0; x < size; x += 1) {
        const dx = height(x + 1, y) - height(x - 1, y);
        const dy = height(x, y + 1) - height(x, y - 1);
        const n = new THREE.Vector3(-dx, -dy, 2).normalize();
        const i = (y * size + x) * 4;
        data[i] = (n.x * 0.5 + 0.5) * 255;
        data[i + 1] = (n.y * 0.5 + 0.5) * 255;
        data[i + 2] = (n.z * 0.5 + 0.5) * 255;
        data[i + 3] = 255;
      }
    }
    const texture = new THREE.DataTexture(data, size, size);
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(18, 18);
    texture.needsUpdate = true;
    return texture;
  }, []);

  useFrame((_, delta) => {
    normal.offset.x += delta * 0.006;
    normal.offset.y += delta * 0.011;
  });

  return (
    <mesh rotation-x={-Math.PI / 2} position-y={-0.02}>
      <planeGeometry args={[120, 120]} />
      <meshStandardMaterial color="#12060a" metalness={0.92} roughness={0.2} normalMap={normal} normalScale={new THREE.Vector2(0.28, 0.28)} envMapIntensity={0.85} />
    </mesh>
  );
}

function Diyas({ count }: { count: number }) {
  const placements = useMemo(() => placeDiyas(count), [count]);
  const body = useMemo(() => createDiyaGeometry(), []);
  const clay = useMemo(() => new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.62, metalness: 0.08, envMapIntensity: 0.6 }), []);
  const quad = useMemo(() => {
    const g = new THREE.PlaneGeometry(0.22, 0.5);
    g.translate(0, 0.25, 0);
    return g;
  }, []);
  const glowQuad = useMemo(() => new THREE.PlaneGeometry(1, 1), []);
  const streak = useMemo(() => new THREE.PlaneGeometry(1, 1, 1, 1), []);
  const flame = useMemo(() => createFlameMaterial(), []);
  const glow = useMemo(() => createGlowMaterial('#ff8a2a', 0.9), []);
  const reflection = useMemo(() => createReflectionMaterial('#ff9a3c'), []);
  const seeds = useMemo(() => {
    const a = new Float32Array(placements.length);
    placements.forEach((p, i) => (a[i] = p.phase));
    return new THREE.InstancedBufferAttribute(a, 1);
  }, [placements]);

  const bodies = useRef<THREE.InstancedMesh>(null);
  const flames = useRef<THREE.InstancedMesh>(null);
  const glows = useRef<THREE.InstancedMesh>(null);
  const reflections = useRef<THREE.InstancedMesh>(null);

  useEffect(() => {
    for (const mesh of [flames.current, glows.current, reflections.current]) mesh?.geometry.setAttribute('aSeed', seeds);
  }, [seeds]);

  const m = useMemo(() => new THREE.Matrix4(), []);
  const q = useMemo(() => new THREE.Quaternion(), []);
  const e = useMemo(() => new THREE.Euler(), []);
  const v = useMemo(() => new THREE.Vector3(), []);
  const s = useMemo(() => new THREE.Vector3(), []);
  const wick = useMemo(() => new THREE.Vector3(), []);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    flame.uniforms.uTime.value = t;
    glow.uniforms.uTime.value = t;
    reflection.uniforms.uTime.value = t;
    placements.forEach((p, i) => {
      const bob = Math.sin(t * 1.1 + p.phase) * 0.025;
      e.set(Math.sin(t * 0.9 + p.phase) * 0.05, p.rot + t * 0.02, Math.cos(t * 0.8 + p.phase) * 0.05);
      q.setFromEuler(e);
      v.set(p.x, bob, p.z);
      s.setScalar(p.scale);
      m.compose(v, q, s);
      bodies.current?.setMatrixAt(i, m);

      wick.copy(DIYA_WICK).applyQuaternion(q).multiplyScalar(p.scale).add(v);
      m.makeScale(p.scale * 0.9, p.scale * 0.9, p.scale * 0.9).setPosition(wick);
      flames.current?.setMatrixAt(i, m);
      m.makeScale(p.scale * 2.2, p.scale * 2.2, p.scale * 2.2).setPosition(wick.x, wick.y + 0.1 * p.scale, wick.z);
      glows.current?.setMatrixAt(i, m);
      m.makeScale(p.scale * 1.3, p.scale * 1.3, p.scale * 1.3).setPosition(wick.x, 0, wick.z);
      reflections.current?.setMatrixAt(i, m);
    });
    for (const mesh of [bodies.current, flames.current, glows.current, reflections.current]) {
      if (mesh) mesh.instanceMatrix.needsUpdate = true;
    }
  });

  const n = placements.length;
  return (
    <group>
      <instancedMesh ref={bodies} args={[body, clay, n]} frustumCulled={false} />
      <instancedMesh ref={reflections} args={[streak, reflection, n]} frustumCulled={false} renderOrder={1} />
      <instancedMesh ref={glows} args={[glowQuad, glow, n]} frustumCulled={false} renderOrder={2} />
      <instancedMesh ref={flames} args={[quad, flame, n]} frustumCulled={false} renderOrder={3} />
    </group>
  );
}

function Petals({ count }: { count: number }) {
  const geometry = useMemo(() => createPetalGeometry(), []);
  const material = useMemo(() => new THREE.MeshStandardMaterial({ side: THREE.DoubleSide, roughness: 0.55, metalness: 0, envMapIntensity: 0.8 }), []);
  const mesh = useRef<THREE.InstancedMesh>(null);
  const data = useMemo(() => {
    const r = rand(29);
    return Array.from({ length: count }, () => ({
      x: (r() * 2 - 1) * 12,
      y: r() * 7,
      z: -12 + r() * 14,
      speed: 0.18 + r() * 0.25,
      spin: (r() - 0.5) * 2,
      phase: r() * Math.PI * 2,
      floating: r() < 0.35,
      scale: 0.9 + r() * 0.7,
    }));
  }, [count]);
  const palette = useMemo(() => ['#fe7a0b', '#fdb523', '#fe5a08', '#c0213c', '#ffd24a', '#f7931e'].map((c) => new THREE.Color(c)), []);

  useEffect(() => {
    data.forEach((_, i) => mesh.current?.setColorAt(i, palette[i % palette.length]));
    if (mesh.current?.instanceColor) mesh.current.instanceColor.needsUpdate = true;
  }, [data, palette]);

  const m = useMemo(() => new THREE.Matrix4(), []);
  const q = useMemo(() => new THREE.Quaternion(), []);
  const e = useMemo(() => new THREE.Euler(), []);
  const v = useMemo(() => new THREE.Vector3(), []);
  const s = useMemo(() => new THREE.Vector3(), []);

  useFrame(({ clock }, delta) => {
    const t = clock.elapsedTime;
    const step = Math.min(delta, 0.05);
    data.forEach((p, i) => {
      if (p.floating) {
        v.set(p.x + Math.sin(t * 0.2 + p.phase) * 0.3, 0.012 + Math.sin(t + p.phase) * 0.01, p.z);
        e.set(-Math.PI / 2 + Math.sin(t + p.phase) * 0.08, p.phase, 0);
      } else {
        p.y -= p.speed * step;
        if (p.y < 0) p.y = 6.5 + Math.random() * 2;
        v.set(p.x + Math.sin(t * 0.6 + p.phase) * 0.6, p.y, p.z + Math.cos(t * 0.4 + p.phase) * 0.4);
        e.set(t * p.spin + p.phase, t * 0.7 * p.spin, Math.sin(t + p.phase));
      }
      q.setFromEuler(e);
      s.setScalar(p.scale);
      m.compose(v, q, s);
      mesh.current?.setMatrixAt(i, m);
    });
    if (mesh.current) mesh.current.instanceMatrix.needsUpdate = true;
  });

  return <instancedMesh ref={mesh} args={[geometry, material, count]} frustumCulled={false} />;
}

function GoldDust({ count }: { count: number }) {
  const material = useMemo(() => createGlowMaterial('#ffcf7a', 0.55), []);
  const quad = useMemo(() => new THREE.PlaneGeometry(1, 1), []);
  const mesh = useRef<THREE.InstancedMesh>(null);
  const data = useMemo(() => {
    const r = rand(5);
    return Array.from({ length: count }, () => ({ x: (r() * 2 - 1) * 10, y: 0.6 + r() * 5, z: -10 + r() * 12, s: 0.05 + r() * 0.12, phase: r() * 6.28 }));
  }, [count]);
  useEffect(() => {
    const a = new Float32Array(count).map((_, i) => data[i].phase);
    mesh.current?.geometry.setAttribute('aSeed', new THREE.InstancedBufferAttribute(a, 1));
  }, [count, data]);
  const m = useMemo(() => new THREE.Matrix4(), []);
  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    material.uniforms.uTime.value = t;
    data.forEach((p, i) => {
      m.makeScale(p.s, p.s, p.s).setPosition(p.x + Math.sin(t * 0.15 + p.phase) * 0.8, p.y + Math.sin(t * 0.3 + p.phase) * 0.4, p.z);
      mesh.current?.setMatrixAt(i, m);
    });
    if (mesh.current) mesh.current.instanceMatrix.needsUpdate = true;
  });
  return <instancedMesh ref={mesh} args={[quad, material, count]} frustumCulled={false} />;
}

function Stars({ count }: { count: number }) {
  const geometry = useMemo(() => {
    const r = rand(77);
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i += 1) {
      const theta = r() * Math.PI * 2;
      const phi = 0.12 + r() * 1.1;
      positions.set([Math.cos(theta) * Math.cos(phi) * 50, Math.sin(phi) * 50, Math.sin(theta) * Math.cos(phi) * 50 - 10], i * 3);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    return g;
  }, [count]);
  return (
    <points geometry={geometry}>
      <pointsMaterial color="#f6e2b8" size={0.09} sizeAttenuation transparent opacity={0.7} depthWrite={false} />
    </points>
  );
}

function Rig({ shared, wide }: { shared: Shared; wide: boolean }) {
  const camera = useThree((state) => state.camera);
  const look = useMemo(() => new THREE.Vector3(), []);
  useFrame((_, delta) => {
    const p = shared.progress.current;
    const { x, y } = shared.pointer.current;
    const k = 1 - Math.pow(0.001, Math.min(delta, 0.05));
    const tx = x * 0.45;
    const ty = 1.25 + y * 0.18 + p * 2.4;
    const tz = 8.6 - p * 2.2;
    camera.position.x += (tx - camera.position.x) * k;
    camera.position.y += (ty - camera.position.y) * k;
    camera.position.z += (tz - camera.position.z) * k;
    look.set(wide ? 0.4 : 0, 0.9 - p * 0.6, -2);
    camera.lookAt(look);
  });
  return null;
}

function Scene({ shared, lite, wide }: { shared: Shared; lite: boolean; wide: boolean }) {
  const sky = useMemo(() => createSkyMaterial('#0b0407', '#3a0c18', '#7a2a10'), []);
  const spread = useMemo(() => ({ current: 0 }), []);
  useFrame(() => {
    spread.current = Math.min(1, shared.progress.current * 1.4);
  });
  return (
    <>
      <color attach="background" args={['#0b0407']} />
      <fog attach="fog" args={['#26080f', 10, 34]} />
      <SceneEnvironment
        top="#1a0a12"
        horizon="#6a2410"
        bottom="#0a0306"
        lights={[
          { color: '#ffb35c', intensity: 6, position: [6, 4, 6], size: [6, 3] },
          { color: '#ff6a1a', intensity: 3, position: [-8, 2, -4], size: [8, 2] },
        ]}
      />
      <mesh material={sky}>
        <sphereGeometry args={[60, 32, 16]} />
      </mesh>
      <Stars count={lite ? 160 : 320} />
      <ambientLight intensity={0.25} color="#ff9a6a" />
      <hemisphereLight args={['#ff9a4a', '#12060b', 0.45]} />
      <pointLight position={wide ? [3.7, 3.4, 0.2] : [0, 3.6, 0]} intensity={14} distance={9} color="#ff7a1a" />
      <pointLight position={[-2, 1.2, 3]} intensity={5} distance={7} color="#ff9a3c" />
      <Water />
      <Diyas count={lite ? 16 : 30} />
      <Petals count={lite ? 60 : 140} />
      <GoldDust count={lite ? 24 : 50} />
      <group position={wide ? [3.7, 2.95, -1.6] : [0, 3.05, -2.2]} rotation={[0.06, -0.38, 0]}>
        <Floating>
          <Jewel size={wide ? 2.7 : 2.5} spread={spread} delay={0.4} />
        </Floating>
      </group>
      <Rig shared={shared} wide={wide} />
    </>
  );
}

function Floating({ children }: { children: React.ReactNode }) {
  const ref = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.elapsedTime;
    ref.current.position.y = Math.sin(t * 0.8) * 0.12;
    ref.current.rotation.y = Math.sin(t * 0.35) * 0.32;
    ref.current.rotation.x = Math.sin(t * 0.5) * 0.04;
  });
  return <group ref={ref}>{children}</group>;
}

export default function DiyaNight({ active, lite, wide, shared }: { active: boolean; lite: boolean; wide: boolean; shared: Shared }) {
  return (
    <Canvas
      frameloop={active ? 'always' : 'never'}
      dpr={[1, lite ? 1.5 : 1.8]}
      camera={{ position: [0, 1.25, 8.6], fov: wide ? 38 : 52, near: 0.1, far: 120 }}
      gl={{ antialias: !lite, powerPreference: 'high-performance', alpha: false }}
      aria-hidden
    >
      <Scene shared={shared} lite={lite} wide={wide} />
    </Canvas>
  );
}
