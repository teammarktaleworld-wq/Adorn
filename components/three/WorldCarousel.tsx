'use client';

import { useEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame, useThree, type ThreeEvent } from '@react-three/fiber';
import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { markPieces } from '@/components/brand/markData';
import { AdaptiveResolution } from './AdaptiveResolution';
import { SceneEnvironment } from './environment';
import { paintGradient, shapeFromCommands } from './geometry';

type Vec3 = [number, number, number];
type Parts = { matte: THREE.BufferGeometry[]; metal: THREE.BufferGeometry[]; glow: THREE.BufferGeometry[] };
type Ref<T> = { current: T };

export const PLACE_COUNT = 5;
const STEP = (Math.PI * 2) / PLACE_COUNT;
const RADIUS = 4.6;
const GOLD = '#e3b65c';
const MARIGOLD = ['#f7931e', '#fdb523', '#e8590a'];

const newParts = (): Parts => ({ matte: [], metal: [], glow: [] });

function paint(geometry: THREE.BufferGeometry, hex: string) {
  const c = new THREE.Color(hex);
  const colors = new Float32Array(geometry.attributes.position.count * 3);
  for (let i = 0; i < colors.length; i += 3) colors.set([c.r, c.g, c.b], i);
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
}

// Bakes colour and placement into a copy of the geometry, so each island merges into a few draw calls.
function put(list: THREE.BufferGeometry[], source: THREE.BufferGeometry, color: string | null, position: Vec3 = [0, 0, 0], rotation: Vec3 = [0, 0, 0], scale: number | Vec3 = 1) {
  const g = source.index ? source.toNonIndexed() : source.clone();
  g.deleteAttribute('uv');
  if (color) paint(g, color);
  const s = typeof scale === 'number' ? new THREE.Vector3(scale, scale, scale) : new THREE.Vector3(...scale);
  const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(rotation[0], rotation[1], rotation[2], 'YXZ'));
  g.applyMatrix4(new THREE.Matrix4().compose(new THREE.Vector3(...position), q, s));
  list.push(g);
}

// Places a set of pieces built around their own origin, e.g. a leaning card and its trim.
function within(target: Parts, position: Vec3, rotation: Vec3, build: (local: Parts) => void) {
  const local = newParts();
  build(local);
  const matrix = new THREE.Matrix4().compose(new THREE.Vector3(...position), new THREE.Quaternion().setFromEuler(new THREE.Euler(...rotation, 'YXZ')), new THREE.Vector3(1, 1, 1));
  (Object.keys(local) as (keyof Parts)[]).forEach((key) => local[key].forEach((g) => target[key].push(g.applyMatrix4(matrix))));
}

const merge = (list: THREE.BufferGeometry[]) => (list.length ? mergeGeometries(list) : null);
const box = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);
const cyl = (top: number, bottom: number, h: number, seg = 24) => new THREE.CylinderGeometry(top, bottom, h, seg);
const cone = (r: number, h: number, seg = 24) => new THREE.ConeGeometry(r, h, seg);
const ring = (r: number, tube: number, seg = 48) => new THREE.TorusGeometry(r, tube, 6, seg);
const ball = (r: number, detail = 1) => new THREE.IcosahedronGeometry(r, detail);
const lathe = (points: number[][], seg = 32) => new THREE.LatheGeometry(points.map(([x, y]) => new THREE.Vector2(x, y)), seg);

function onion(r: number, h: number, seg = 24) {
  const profile = [[0, 0], [0.82, 0], [0.95, 0.12], [1, 0.3], [0.9, 0.5], [0.62, 0.7], [0.3, 0.86], [0.1, 0.95], [0, 1]];
  return lathe(profile.map(([x, y]) => [x * r, y * h]), seg);
}

// A pointed Mughal arch, flat, standing on y = 0 and facing +z.
function arch(w: number, h: number) {
  const s = new THREE.Shape();
  const spring = h - w * 0.62;
  s.moveTo(-w / 2, 0);
  s.lineTo(w / 2, 0);
  s.lineTo(w / 2, spring);
  s.quadraticCurveTo(w / 2, h - w * 0.12, 0, h);
  s.quadraticCurveTo(-w / 2, h - w * 0.12, -w / 2, spring);
  s.lineTo(-w / 2, 0);
  return new THREE.ShapeGeometry(s, 8);
}

function petal(length: number, width: number, base: string, tip: string) {
  const s = new THREE.Shape();
  s.moveTo(0, 0);
  s.bezierCurveTo(width * 0.9, length * 0.25, width * 0.7, length * 0.78, 0, length);
  s.bezierCurveTo(-width * 0.7, length * 0.78, -width * 0.9, length * 0.25, 0, 0);
  const g = new THREE.ShapeGeometry(s, 8);
  const p = g.attributes.position;
  for (let i = 0; i < p.count; i += 1) {
    const x = p.getX(i) / width;
    const y = p.getY(i) / length;
    p.setZ(i, x * x * width * 0.9 - y * y * length * 0.08);
  }
  g.computeVertexNormals();
  paintGradient(g, [0, 1], [[0, base], [1, tip]]);
  return g;
}

function garland(list: THREE.BufferGeometry[], from: Vec3, to: Vec3, sag: number, count: number) {
  const bead = ball(0.034, 0);
  for (let i = 0; i <= count; i += 1) {
    const t = i / count;
    const at: Vec3 = [from[0] + (to[0] - from[0]) * t, from[1] + (to[1] - from[1]) * t - Math.sin(Math.PI * t) * sag, from[2] + (to[2] - from[2]) * t];
    put(list, bead, MARIGOLD[i % 2], at);
  }
}

// Every place floats on a marble disc held in a lotus, with a gold drop and a drift of cloud below.
function lotusBase(p: Parts, lite: boolean, ground: string) {
  put(p.matte, cyl(1.3, 1.2, 0.22, 48), '#f7efe2', [0, -0.11, 0]);
  if (ground) put(p.matte, cyl(1.2, 1.2, 0.03, 48), ground, [0, 0.015, 0]);
  const under = lathe([[0, -0.66], [0.42, -0.6], [0.82, -0.44], [1.1, -0.26], [1.22, -0.12]], 40);
  paintGradient(under, [0, 1], [[0, '#e8b4a3'], [1, '#f8e2d6']]);
  put(p.matte, under, null);
  const count = lite ? 10 : 14;
  const outer = petal(0.95, 0.46, '#fdeef1', '#f08aa6');
  const inner = petal(0.72, 0.38, '#fff7f8', '#f5a9bd');
  for (let i = 0; i < count; i += 1) {
    const a = (i / count) * Math.PI * 2;
    const b = ((i + 0.5) / count) * Math.PI * 2;
    put(p.matte, outer, null, [Math.cos(a) * 0.95, -0.12, Math.sin(a) * 0.95], [-(Math.PI / 2 - 0.3), -a - Math.PI / 2, 0]);
    put(p.matte, inner, null, [Math.cos(b) * 0.9, -0.14, Math.sin(b) * 0.9], [-(Math.PI / 2 - 0.55), -b - Math.PI / 2, 0]);
  }
  put(p.metal, ring(1.3, 0.03, 72), GOLD, [0, 0, 0], [Math.PI / 2, 0, 0]);
  put(p.metal, lathe([[0, 0], [0.14, -0.02], [0.18, -0.1], [0.1, -0.22], [0.05, -0.38], [0, -0.48]], 20), GOLD, [0, -0.64, 0]);
  const puff = ball(1, 1);
  for (const [x, y, z, r] of [[0.75, -0.9, 0.35, 0.34], [0.38, -0.98, 0.5, 0.26], [1.05, -0.95, 0.1, 0.24], [-0.8, -0.78, -0.25, 0.28], [-1.05, -0.85, -0.05, 0.2]]) {
    put(p.matte, puff, '#ffffff', [x, y, z], [0, 0, 0], [r * 1.25, r * 0.8, r]);
  }
}

// The royal wedding: a white marble palace with an onion dome, chhatris, minarets and marigold swags.
function palace(p: Parts) {
  const ivory = '#fbf4e6';
  const warm = '#f1dfc0';
  const rose = '#a43c52';
  put(p.matte, box(2.0, 0.16, 1.3), warm, [0, 0.08, 0]);
  put(p.matte, box(0.7, 0.06, 0.24), warm, [0, 0.03, 0.75]);
  put(p.matte, box(1.4, 0.62, 0.84), ivory, [0, 0.47, -0.05]);
  put(p.matte, box(1.52, 0.07, 0.94), warm, [0, 0.815, -0.05]);
  put(p.matte, cyl(0.3, 0.32, 0.16, 32), ivory, [0, 0.93, -0.05]);
  put(p.matte, onion(0.38, 0.72, 32), ivory, [0, 1.0, -0.05]);
  put(p.metal, lathe([[0, 0], [0.04, 0], [0.05, 0.05], [0.02, 0.1], [0.035, 0.14], [0.01, 0.26], [0, 0.3]], 12), GOLD, [0, 1.71, -0.05]);
  put(p.metal, ring(0.31, 0.014), GOLD, [0, 1.0, -0.05], [Math.PI / 2, 0, 0]);
  put(p.metal, box(1.54, 0.016, 0.96), GOLD, [0, 0.855, -0.05]);
  const pillar = cyl(0.012, 0.012, 0.16, 6);
  for (const [x, z] of [[-0.55, 0.22], [0.55, 0.22], [-0.55, -0.32], [0.55, -0.32]]) {
    for (const [dx, dz] of [[-0.07, -0.07], [0.07, -0.07], [-0.07, 0.07], [0.07, 0.07]]) put(p.matte, pillar, ivory, [x + dx, 0.93, z + dz]);
    put(p.matte, cyl(0.12, 0.12, 0.03, 16), warm, [x, 1.025, z]);
    put(p.matte, onion(0.12, 0.2, 16), ivory, [x, 1.04, z]);
    put(p.metal, cone(0.014, 0.08, 6), GOLD, [x, 1.27, z]);
  }
  for (const [x, z] of [[-0.92, 0.55], [0.92, 0.55], [-0.92, -0.55], [0.92, -0.55]]) {
    put(p.matte, cyl(0.06, 0.08, 1.2, 16), ivory, [x, 0.76, z]);
    put(p.matte, cyl(0.11, 0.11, 0.04, 16), warm, [x, 1.05, z]);
    put(p.matte, cyl(0.075, 0.075, 0.14, 16), ivory, [x, 1.43, z]);
    put(p.matte, onion(0.09, 0.16, 16), ivory, [x, 1.5, z]);
    put(p.metal, cone(0.012, 0.08, 6), GOLD, [x, 1.69, z]);
  }
  put(p.matte, arch(0.36, 0.44), rose, [0, 0.18, 0.374]);
  for (const x of [-0.42, 0.42]) {
    put(p.matte, arch(0.22, 0.32), rose, [x, 0.2, 0.374]);
    put(p.matte, arch(0.13, 0.12), rose, [x, 0.6, 0.374]);
  }
  for (const x of [-1.04, 1.04]) put(p.matte, cone(0.11, 0.5, 10), '#4f8a5b', [x, 0.25, 0.66]);
  garland(p.matte, [-0.7, 0.77, 0.38], [0.7, 0.77, 0.38], 0.12, 22);
  garland(p.matte, [-0.92, 1.0, 0.56], [-0.7, 0.77, 0.38], 0.05, 5);
  garland(p.matte, [0.7, 0.77, 0.38], [0.92, 1.0, 0.56], 0.05, 5);
}

// Haldi and mehendi: a lawn, a marigold jhoola, a yellow chhatri and an urli of floating flowers.
function garden(p: Parts) {
  const wood = '#c98a3a';
  for (const x of [-0.75, 0.25]) {
    put(p.matte, cyl(0.035, 0.045, 1.15, 10), wood, [x, 0.6, -0.3]);
    garland(p.matte, [x + 0.05, 0.2, -0.26], [x + 0.05, 1.12, -0.26], 0, 10);
  }
  put(p.matte, box(1.16, 0.06, 0.06), wood, [-0.25, 1.18, -0.3]);
  garland(p.matte, [-0.8, 1.22, -0.27], [0.3, 1.22, -0.27], 0.02, 12);
  put(p.metal, cyl(0.016, 0.016, 1.15, 8), GOLD, [0.68, 0.6, 0.38]);
  put(p.matte, new THREE.ConeGeometry(0.55, 0.26, 28, 1, true), '#f6c21c', [0.68, 1.28, 0.38]);
  put(p.metal, ball(0.035, 1), GOLD, [0.68, 1.43, 0.38]);
  for (let i = 0; i < 20; i += 1) {
    const a = (i / 20) * Math.PI * 2;
    put(p.matte, ball(0.03, 0), i % 2 ? '#e8590a' : '#c0213c', [0.68 + Math.cos(a) * 0.55, 1.14, 0.38 + Math.sin(a) * 0.55]);
  }
  put(p.metal, lathe([[0, 0], [0.12, 0], [0.24, 0.05], [0.3, 0.12], [0.28, 0.13]], 24), GOLD, [-0.5, 0.03, 0.55]);
  put(p.matte, cyl(0.25, 0.25, 0.01, 24), '#9fd6df', [-0.5, 0.13, 0.55]);
  for (let i = 0; i < 6; i += 1) {
    const a = (i / 6) * Math.PI * 2;
    put(p.matte, ball(0.045, 0), MARIGOLD[i % 3], [-0.5 + Math.cos(a) * 0.13, 0.145, 0.55 + Math.sin(a) * 0.13], [0, 0, 0], [1, 0.45, 1]);
  }
  for (const [x, z, r] of [[1.0, -0.4, 0.2], [-1.0, 0.15, 0.17], [0.2, 0.78, 0.12], [-0.95, -0.55, 0.13]]) put(p.matte, ball(r, 1), '#5b9a4a', [x, r * 0.9 + 0.03, z]);
}

function swingParts() {
  const p = newParts();
  for (const x of [-0.3, 0.3]) {
    put(p.matte, cyl(0.008, 0.008, 0.78, 5), '#e8c27a', [x, -0.39, 0]);
    garland(p.matte, [x, -0.05, 0.012], [x, -0.72, 0.012], 0, 6);
  }
  put(p.matte, box(0.72, 0.05, 0.3), '#c0213c', [0, -0.8, 0]);
  put(p.matte, box(0.6, 0.06, 0.22), '#f2b705', [0, -0.75, 0]);
  return merge(p.matte);
}

// Sangeet nights: a stage with a DJ booth, speaker stacks, a lighting truss and a glowing floor.
function stage(p: Parts) {
  const silver = '#d4d7de';
  put(p.matte, box(1.9, 0.2, 1.25), '#2a1838', [0, 0.1, 0]);
  put(p.glow, box(1.9, 0.025, 0.012), '#ff3d9a', [0, 0.17, 0.627]);
  put(p.glow, box(1.9, 0.02, 0.012), '#3de0ff', [0, 0.04, 0.627]);
  put(p.matte, box(0.95, 0.4, 0.36), '#1b1026', [0, 0.4, -0.3]);
  put(p.metal, box(0.9, 0.1, 0.012), GOLD, [0, 0.48, -0.116]);
  put(p.glow, box(0.92, 0.014, 0.012), '#b46bff', [0, 0.33, -0.116]);
  for (const x of [-0.24, 0.24]) {
    put(p.matte, cyl(0.12, 0.12, 0.025, 24), '#3a3340', [x, 0.612, -0.3]);
    put(p.glow, ring(0.122, 0.006, 32), '#3de0ff', [x, 0.627, -0.3], [Math.PI / 2, 0, 0]);
  }
  put(p.matte, box(0.16, 0.03, 0.2), '#2c2434', [0, 0.615, -0.3]);
  for (const x of [-0.8, 0.8]) {
    put(p.matte, box(0.32, 0.8, 0.3), '#151019', [x, 0.6, -0.36]);
    for (const [y, r] of [[0.42, 0.1], [0.78, 0.07]]) {
      put(p.matte, cyl(r, r, 0.02, 20), '#2d2733', [x, y, -0.205], [Math.PI / 2, 0, 0]);
      put(p.metal, ring(r, 0.008, 24), GOLD, [x, y, -0.2]);
    }
  }
  for (const x of [-0.95, 0.95]) put(p.metal, cyl(0.025, 0.025, 1.75, 8), silver, [x, 1.075, -0.5]);
  for (const z of [-0.45, -0.58]) put(p.metal, cyl(0.022, 0.022, 1.95, 8), silver, [0, 1.93, z], [0, 0, Math.PI / 2]);
  for (const x of [-0.6, -0.2, 0.2, 0.6]) put(p.matte, box(0.09, 0.09, 0.09), '#1a1a22', [x, 1.86, -0.44]);
}

const BEAMS: { x: number; color: string }[] = [
  { x: -0.6, color: '#ff4fb0' },
  { x: -0.2, color: '#57e3ff' },
  { x: 0.2, color: '#ffd166' },
  { x: 0.6, color: '#b46bff' },
];

function Night({ still }: { still: boolean }) {
  const tiles = useRef<THREE.InstancedMesh>(null);
  const beams = useRef<(THREE.Mesh | null)[]>([]);
  const ballRef = useRef<THREE.Mesh>(null);
  const tile = useMemo(() => box(0.27, 0.02, 0.19), []);
  const tileMaterial = useMemo(() => new THREE.MeshBasicMaterial({ toneMapped: false }), []);
  const beam = useMemo(() => {
    const g = new THREE.ConeGeometry(0.3, 1.5, 20, 1, true).translate(0, -0.75, 0);
    const p = g.attributes.position;
    const colors = new Float32Array(p.count * 4);
    for (let i = 0; i < p.count; i += 1) colors.set([1, 1, 1, 0.5 * Math.max(0, 1 + p.getY(i) / 1.5)], i * 4);
    g.setAttribute('color', new THREE.BufferAttribute(colors, 4));
    return g;
  }, []);
  const beamMaterials = useMemo(
    () => BEAMS.map(({ color }) => new THREE.MeshBasicMaterial({ color, vertexColors: true, transparent: true, depthWrite: false, side: THREE.DoubleSide, toneMapped: false })),
    [],
  );
  const mirror = useMemo(() => new THREE.MeshStandardMaterial({ color: '#eef0f6', metalness: 1, roughness: 0.12, flatShading: true, envMapIntensity: 1.6 }), []);
  const palette = useMemo(() => ['#ff3d9a', '#3de0ff', '#ffd166', '#b46bff', '#ff7a45'].map((c) => new THREE.Color(c)), []);

  useEffect(() => {
    const mesh = tiles.current;
    if (!mesh) return;
    const m = new THREE.Matrix4();
    for (let r = 0; r < 3; r += 1) for (let c = 0; c < 6; c += 1) mesh.setMatrixAt(r * 6 + c, m.makeTranslation(-0.75 + c * 0.3, 0.205, 0.12 + r * 0.21));
    mesh.instanceMatrix.needsUpdate = true;
  }, []);

  useFrame(({ clock }) => {
    const t = still ? 0 : clock.elapsedTime;
    const mesh = tiles.current;
    if (mesh) {
      const c = new THREE.Color();
      for (let i = 0; i < 18; i += 1) {
        const k = Math.floor(t * 2.2 + (i % 6) * 0.7 + Math.floor(i / 6) * 1.3) % palette.length;
        mesh.setColorAt(i, c.copy(palette[(k + i) % palette.length]).multiplyScalar(0.75 + 0.25 * Math.sin(t * 6 + i)));
      }
      if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    }
    beams.current.forEach((b, i) => {
      if (!b) return;
      b.rotation.z = Math.sin(t * 1.3 + i * 1.7) * 0.5;
      b.rotation.x = -0.4 - Math.sin(t * 0.9 + i) * 0.25;
    });
    if (ballRef.current) ballRef.current.rotation.y = t * 0.8;
  });

  return (
    <group>
      <instancedMesh ref={tiles} args={[tile, tileMaterial, 18]} />
      {BEAMS.map(({ x }, i) => (
        <mesh key={x} ref={(m) => { beams.current[i] = m; }} geometry={beam} material={beamMaterials[i]} position={[x, 1.82, -0.44]} />
      ))}
      <mesh ref={ballRef} position={[0, 1.55, -0.1]} material={mirror}>
        <icosahedronGeometry args={[0.15, 1]} />
      </mesh>
      <mesh position={[0, 1.78, -0.1]} material={mirror}>
        <cylinderGeometry args={[0.004, 0.004, 0.3, 4]} />
      </mesh>
    </group>
  );
}

// A princess birthday: a pastel castle, gold-banded towers and a bunch of balloons.
function castle(p: Parts) {
  const wall = '#fbe4ec';
  put(p.matte, box(1.3, 0.5, 0.2), wall, [0, 0.28, 0.12]);
  for (let i = 0; i < 7; i += 1) put(p.matte, box(0.12, 0.1, 0.2), wall, [-0.6 + i * 0.2, 0.58, 0.12]);
  put(p.matte, arch(0.3, 0.36), '#e3a093', [0, 0.03, 0.222]);
  put(p.matte, cyl(0.27, 0.29, 1.25, 28), '#fdeef3', [0, 0.655, -0.3]);
  put(p.matte, cone(0.36, 0.62, 28), '#c9a7f0', [0, 1.59, -0.3]);
  put(p.metal, ring(0.28, 0.016), GOLD, [0, 1.27, -0.3], [Math.PI / 2, 0, 0]);
  put(p.matte, arch(0.1, 0.17), '#9c7ac9', [0, 0.92, -0.025]);
  const flag = new THREE.Shape();
  flag.moveTo(0, 0);
  flag.lineTo(0.2, -0.05);
  flag.lineTo(0, -0.11);
  const flagGeometry = new THREE.ShapeGeometry(flag);
  put(p.metal, cyl(0.008, 0.008, 0.32, 6), GOLD, [0, 2.06, -0.3]);
  put(p.matte, flagGeometry, '#ff7aa8', [0, 2.2, -0.3]);
  for (const [x, roof] of [[-0.7, '#f5a3c0'], [0.7, '#9fd3f2']] as const) {
    put(p.matte, cyl(0.18, 0.19, 0.85, 24), '#fff1e6', [x, 0.455, 0.15]);
    put(p.matte, cone(0.24, 0.46, 24), roof, [x, 1.11, 0.15]);
    put(p.metal, ring(0.185, 0.012, 32), GOLD, [x, 0.87, 0.15], [Math.PI / 2, 0, 0]);
    put(p.matte, arch(0.08, 0.14), '#9c7ac9', [x, 0.55, 0.335]);
    put(p.metal, cyl(0.006, 0.006, 0.2, 6), GOLD, [x, 1.42, 0.15]);
    put(p.matte, flagGeometry, roof === '#f5a3c0' ? '#c9a7f0' : '#ff7aa8', [x, 1.5, 0.15], [0, 0, 0], 0.7);
  }
}

const BALLOONS: { at: Vec3; color: string }[] = [
  { at: [0.75, 1.75, 0.45], color: '#ffb3c7' },
  { at: [1.05, 1.95, 0.25], color: '#c9a7f0' },
  { at: [0.95, 1.55, 0.7], color: '#9fd3f2' },
  { at: [1.25, 1.65, 0.55], color: '#fff1a8' },
  { at: [0.6, 2.05, 0.2], color: '#ffd6a5' },
  { at: [1.2, 2.2, 0.0], color: '#f7c8e0' },
  { at: [0.85, 2.3, 0.4], color: '#b8f0d8' },
];
const BALLOON_ANCHOR: Vec3 = [0.9, 0.06, 0.62];

function Balloons({ still }: { still: boolean }) {
  const mesh = useRef<THREE.InstancedMesh>(null);
  const lines = useRef<THREE.LineSegments>(null);
  const geometry = useMemo(() => new THREE.SphereGeometry(0.17, 20, 16), []);
  const material = useMemo(() => new THREE.MeshStandardMaterial({ roughness: 0.22, metalness: 0, envMapIntensity: 1.1 }), []);
  const strings = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(BALLOONS.length * 6), 3));
    return g;
  }, []);
  useEffect(() => {
    BALLOONS.forEach(({ color }, i) => mesh.current?.setColorAt(i, new THREE.Color(color)));
    if (mesh.current?.instanceColor) mesh.current.instanceColor.needsUpdate = true;
  }, []);
  useFrame(({ clock }) => {
    const t = still ? 0 : clock.elapsedTime;
    const m = new THREE.Matrix4();
    const positions = strings.attributes.position as THREE.BufferAttribute;
    BALLOONS.forEach(({ at }, i) => {
      const x = at[0] + Math.sin(t * 0.9 + i * 1.9) * 0.05;
      const y = at[1] + Math.sin(t * 1.3 + i * 2.3) * 0.06;
      const z = at[2] + Math.cos(t * 0.8 + i) * 0.04;
      mesh.current?.setMatrixAt(i, m.compose(new THREE.Vector3(x, y, z), new THREE.Quaternion(), new THREE.Vector3(1, 1.18, 1)));
      positions.setXYZ(i * 2, x, y - 0.2, z);
      positions.setXYZ(i * 2 + 1, ...BALLOON_ANCHOR);
    });
    if (mesh.current) mesh.current.instanceMatrix.needsUpdate = true;
    positions.needsUpdate = true;
  });
  return (
    <group>
      <instancedMesh ref={mesh} args={[geometry, material, BALLOONS.length]} frustumCulled={false} />
      <lineSegments ref={lines} geometry={strings} frustumCulled={false}>
        <lineBasicMaterial color="#b98a9a" transparent opacity={0.7} />
      </lineSegments>
    </group>
  );
}

// Your celebration: an invitation card rising from its envelope, sealed, with gifts beside it.
function invitation(p: Parts) {
  within(p, [0, 1.02, -0.22], [-0.16, 0, 0], (card) => {
    put(card.matte, box(1.05, 1.45, 0.04), '#5b0f24');
    for (const inset of [0, 0.06]) {
      const w = 0.95 - inset * 2;
      const h = 1.35 - inset * 2;
      const t = inset ? 0.008 : 0.018;
      put(card.metal, box(w, t, 0.01), GOLD, [0, h / 2, 0.024]);
      put(card.metal, box(w, t, 0.01), GOLD, [0, -h / 2, 0.024]);
      put(card.metal, box(t, h, 0.01), GOLD, [w / 2, 0, 0.024]);
      put(card.metal, box(t, h, 0.01), GOLD, [-w / 2, 0, 0.024]);
    }
    const stops: Record<keyof typeof markPieces, [number, string][]> = {
      top: [[0, '#fe4a02'], [1, '#fe9313']],
      left: [[0, '#f23a00'], [1, '#fda020']],
      right: [[0, '#f23a00'], [1, '#ffd745']],
    };
    (Object.keys(markPieces) as (keyof typeof markPieces)[]).forEach((key) => {
      const g = new THREE.ExtrudeGeometry(shapeFromCommands(markPieces[key], 0.42), { depth: 0.025, bevelEnabled: false, curveSegments: 6 });
      paintGradient(g, [0.4, 1], stops[key]);
      put(card.matte, g, null, [0, 0.36, 0.022]);
    });
    for (const [y, w] of [[0.02, 0.56], [-0.08, 0.4], [-0.18, 0.5], [-0.28, 0.32]]) put(card.metal, box(w, 0.016, 0.006), GOLD, [0, y, 0.023]);
  });
  within(p, [0, 0.42, 0.14], [-0.1, 0, 0], (envelope) => {
    put(envelope.matte, box(1.25, 0.78, 0.05), '#f6ead5');
    for (const side of [-1, 1]) put(envelope.metal, box(0.72, 0.012, 0.006), GOLD, [side * 0.31, 0.2, 0.027], [0, 0, side * -0.56]);
    put(envelope.matte, cyl(0.11, 0.115, 0.03, 24), '#b3122e', [0, 0.02, 0.04], [Math.PI / 2, 0, 0]);
    put(envelope.metal, ring(0.07, 0.007, 24), GOLD, [0, 0.02, 0.057]);
  });
  for (const [x, z, s, color, turn] of [[0.86, 0.48, 0.32, '#f4b6c2', 0.4], [-0.88, 0.42, 0.25, '#9fd3f2', -0.3]] as const) {
    put(p.matte, box(s, s * 0.88, s), color, [x, s * 0.44 + 0.03, z], [0, turn, 0]);
    put(p.metal, box(s + 0.01, s * 0.88 + 0.01, 0.04), GOLD, [x, s * 0.44 + 0.03, z], [0, turn, 0]);
    put(p.metal, box(0.04, s * 0.88 + 0.01, s + 0.01), GOLD, [x, s * 0.44 + 0.03, z], [0, turn, 0]);
    put(p.metal, ring(0.05, 0.012, 16), GOLD, [x - 0.04, s * 0.88 + 0.08, z], [0, turn, 0.5]);
    put(p.metal, ring(0.05, 0.012, 16), GOLD, [x + 0.04, s * 0.88 + 0.08, z], [0, turn, -0.5]);
  }
  for (let i = 0; i < 9; i += 1) {
    const a = i * 2.4;
    put(p.matte, ball(0.04, 0), MARIGOLD[i % 3], [Math.cos(a) * (0.5 + (i % 3) * 0.2), 0.035, 0.55 + Math.sin(a) * 0.25], [0, a, 0], [1, 0.35, 1]);
  }
}

const PLACES: { ground: string; build: (p: Parts) => void }[] = [
  { ground: '', build: palace },
  { ground: '#a6d27a', build: garden },
  { ground: '', build: stage },
  { ground: '#f9dfe8', build: castle },
  { ground: '', build: invitation },
];

function Swing({ still, material }: { still: boolean; material: THREE.Material }) {
  const ref = useRef<THREE.Mesh>(null);
  const geometry = useMemo(() => swingParts(), []);
  useFrame(({ clock }) => {
    if (ref.current) ref.current.rotation.x = still ? 0 : Math.sin(clock.elapsedTime * 1.4) * 0.28;
  });
  return geometry ? <mesh ref={ref} geometry={geometry} material={material} position={[-0.25, 1.15, -0.3]} /> : null;
}

function Dust({ count, still }: { count: number; still: boolean }) {
  const points = useRef<THREE.Points>(null);
  const { geometry, material } = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i += 1) {
      const a = Math.random() * Math.PI * 2;
      const r = 2 + Math.random() * 7;
      positions.set([Math.cos(a) * r, -1.5 + Math.random() * 6, Math.sin(a) * r], i * 3);
    }
    g.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 64;
    const ctx = canvas.getContext('2d')!;
    const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    grad.addColorStop(0, 'rgba(255,236,190,1)');
    grad.addColorStop(0.4, 'rgba(240,190,100,0.55)');
    grad.addColorStop(1, 'rgba(240,190,100,0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 64, 64);
    const m = new THREE.PointsMaterial({ size: 0.12, map: new THREE.CanvasTexture(canvas), transparent: true, depthWrite: false, opacity: 0.85 });
    return { geometry: g, material: m };
  }, [count]);
  useFrame((_, delta) => {
    if (still || !points.current) return;
    points.current.rotation.y += delta * 0.03;
    points.current.position.y = Math.sin(performance.now() / 4000) * 0.2;
  });
  return <points ref={points} geometry={geometry} material={material} />;
}

const damp = (current: number, target: number, rate: number, dt: number) => current + (target - current) * (1 - Math.exp(-rate * dt));
const easeOut = (t: number) => 1 - Math.pow(1 - Math.min(1, Math.max(0, t)), 3);

// The carousel dwells on each place, then glides to the next as the page scrolls.
function detent(raw: number) {
  const k = Math.floor(raw);
  const f = raw - k;
  const t = Math.min(1, Math.max(0, (f - 0.18) / 0.64));
  return Math.min(PLACE_COUNT - 1, k + t * t * (3 - 2 * t));
}

type SceneProps = {
  progress: Ref<number>;
  started: Ref<boolean>;
  pointer: Ref<{ x: number; y: number }>;
  still: boolean;
  lite: boolean;
  onActive: (index: number) => void;
  onPick: (index: number) => void;
};

function World({ progress, started, pointer, still, lite, onActive, onPick }: SceneProps) {
  const orbit = useRef<THREE.Group>(null);
  const islands = useRef<(THREE.Group | null)[]>([]);
  const turn = useRef(0);
  const introStart = useRef(-1);
  const hovered = useRef(-1);
  const lifts = useRef(Array.from({ length: PLACE_COUNT }, () => 0));
  const reported = useRef(-1);
  const { camera, size } = useThree();

  const materials = useMemo(
    () => ({
      matte: new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.62, metalness: 0, side: THREE.DoubleSide, envMapIntensity: 0.55 }),
      metal: new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.26, metalness: 1, envMapIntensity: 1.4 }),
      glow: new THREE.MeshBasicMaterial({ vertexColors: true, toneMapped: false }),
      hit: new THREE.MeshBasicMaterial({ visible: false }),
    }),
    [],
  );
  const geometries = useMemo(
    () =>
      PLACES.map(({ ground, build }) => {
        const p = newParts();
        lotusBase(p, lite, ground);
        build(p);
        return { matte: merge(p.matte), metal: merge(p.metal), glow: merge(p.glow) };
      }),
    [lite],
  );
  const orbitGeometry = useMemo(() => {
    const g = new THREE.TorusGeometry(RADIUS, 0.009, 6, 220);
    paint(g, GOLD);
    return g;
  }, []);

  useEffect(() => () => {
    document.body.style.cursor = '';
  }, []);

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05);
    const t = still ? 0 : state.clock.elapsedTime;
    if (started.current && introStart.current < 0) introStart.current = state.clock.elapsedTime;
    const k = still ? 1 : introStart.current < 0 ? 0 : Math.min(1, (state.clock.elapsedTime - introStart.current) / 2.4);
    const target = detent(progress.current * (PLACE_COUNT - 1));
    turn.current = still ? target : damp(turn.current, target, 5.5, dt);

    const aspect = size.width / size.height;
    const fit = 0.9 * Math.min(1, Math.max(0.66, aspect / 1.3));
    const world = orbit.current;
    if (world) {
      world.rotation.y = -turn.current * STEP - (1 - easeOut(k)) * 1.6;
      world.scale.setScalar(fit * (0.82 + 0.18 * easeOut(k)));
      world.position.y = aspect < 0.8 ? 0.5 : 0.25;
    }
    islands.current.forEach((g, i) => {
      if (!g) return;
      let diff = (i - turn.current) * STEP;
      diff = Math.atan2(Math.sin(diff), Math.cos(diff));
      const facing = (Math.cos(diff) + 1) / 2;
      const rise = easeOut(k * 1.5 - i * 0.12);
      lifts.current[i] = damp(lifts.current[i], hovered.current === i ? 0.2 : 0, 8, dt);
      g.scale.setScalar((0.6 + 0.4 * Math.pow(facing, 1.6)) * (0.001 + 0.999 * rise));
      g.position.y = Math.sin(t * 0.8 + i * 1.7) * 0.08 + lifts.current[i] - (1 - rise) * 2.5;
      g.rotation.y = i * STEP + pointer.current.x * 0.35 * Math.pow(facing, 4);
    });
    const nearest = ((Math.round(turn.current) % PLACE_COUNT) + PLACE_COUNT) % PLACE_COUNT;
    if (nearest !== reported.current) {
      reported.current = nearest;
      onActive(nearest);
    }
    camera.position.x = damp(camera.position.x, pointer.current.x * 0.7, 2.5, dt);
    camera.position.y = damp(camera.position.y, 3.1 + pointer.current.y * 0.35, 2.5, dt);
    camera.lookAt(0, 0.45, 1.5);
  });

  const hover = (i: number) => (event: ThreeEvent<PointerEvent>) => {
    event.stopPropagation();
    hovered.current = i;
    document.body.style.cursor = 'pointer';
  };
  const leave = (i: number) => () => {
    if (hovered.current === i) hovered.current = -1;
    document.body.style.cursor = '';
  };
  const click = (i: number) => (event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation();
    onPick(i);
  };

  return (
    <group ref={orbit}>
      <mesh geometry={orbitGeometry} material={materials.metal} rotation-x={Math.PI / 2} position-y={-0.95} />
      {geometries.map((g, i) => (
        <group key={i} position={[Math.sin(i * STEP) * RADIUS, 0, Math.cos(i * STEP) * RADIUS]}>
          <group ref={(node) => { islands.current[i] = node; }}>
            {g.matte && <mesh geometry={g.matte} material={materials.matte} />}
            {g.metal && <mesh geometry={g.metal} material={materials.metal} />}
            {g.glow && <mesh geometry={g.glow} material={materials.glow} />}
            {i === 1 && <Swing still={still} material={materials.matte} />}
            {i === 2 && <Night still={still} />}
            {i === 3 && <Balloons still={still} />}
            <mesh position-y={0.55} material={materials.hit} onPointerOver={hover(i)} onPointerOut={leave(i)} onClick={click(i)}>
              <cylinderGeometry args={[1.6, 1.3, 3, 12]} />
            </mesh>
          </group>
        </group>
      ))}
      <Dust count={lite ? 60 : 140} still={still} />
    </group>
  );
}

export default function WorldCarousel({ active, ...props }: SceneProps & { active: boolean }) {
  return (
    <Canvas
      frameloop={active ? 'always' : 'never'}
      dpr={props.lite ? [1, 1.3] : [1, 1.75]}
      camera={{ position: [0, 3.1, 13.6], fov: 34, near: 0.5, far: 60 }}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      onCreated={({ scene }) => {
        scene.fog = new THREE.Fog('#f8ebe2', 13, 30);
      }}
    >
      <AdaptiveResolution />
      <SceneEnvironment
        top="#fffaf3"
        horizon="#f7dccb"
        bottom="#e8c0ad"
        lights={[
          { color: '#fff4e2', intensity: 5, position: [6, 7, 6], size: [5, 4] },
          { color: '#ffd9c2', intensity: 2.5, position: [-7, 3, 2], size: [5, 3] },
          { color: '#ffffff', intensity: 2, position: [0, 9, -5], size: [7, 2] },
        ]}
      />
      <hemisphereLight args={['#fff6ec', '#f0c4b4', 1.5]} />
      <directionalLight position={[5, 8, 6]} intensity={2.1} color="#fff0dc" />
      <directionalLight position={[-6, 3, -4]} intensity={0.7} color="#ffd6e4" />
      <World {...props} />
    </Canvas>
  );
}
