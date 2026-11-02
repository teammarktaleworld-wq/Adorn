'use client';

import { useMemo, useRef } from 'react';
import { useFrame, type ThreeElements } from '@react-three/fiber';
import * as THREE from 'three';
import { markFolds, markPieces } from '@/components/brand/markData';
import { paintGradient, shapeFromCommands } from './geometry';

type JewelProps = ThreeElements['group'] & {
  size?: number;
  // 0 = assembled; 1 = facets drifted apart
  spread?: { current: number };
  delay?: number;
};

const easeOut = (t: number) => 1 - Math.pow(1 - Math.min(1, Math.max(0, t)), 4);

// The Adorn jewel in 3D: the three folded facets of the logo, extruded and lacquered.
// On first frame the facets fly in from three directions and lock together.
export function Jewel({ size = 3.2, spread, delay = 0.2, ...group }: JewelProps) {
  const parts = useMemo(() => {
    const body = { depth: 0.16, bevelEnabled: true, bevelThickness: 0.035, bevelSize: 0.022, bevelSegments: 4, curveSegments: 32 };
    const fold = { depth: 0.012, bevelEnabled: false, curveSegments: 32 };
    const make = (cmds: Parameters<typeof shapeFromCommands>[0], settings: THREE.ExtrudeGeometryOptions, z: number) => {
      const geometry = new THREE.ExtrudeGeometry(shapeFromCommands(cmds, size), settings);
      geometry.translate(0, 0, z);
      return geometry;
    };
    const top = make(markPieces.top, body, -0.08);
    paintGradient(top, [0, -1], [[0, '#fe4a02'], [0.6, '#fe6a08'], [1, '#fe9313']]);
    const topFold = make(markFolds.top, fold, 0.115);
    paintGradient(topFold, [0, -1], [[0, '#fda52a'], [1, '#ffd24a']]);
    const left = make(markPieces.left, body, -0.08);
    paintGradient(left, [0.72, 0.7], [[0, '#f23a00'], [0.55, '#fe6408'], [1, '#fda020']]);
    const leftFold = make(markFolds.left, fold, 0.115);
    paintGradient(leftFold, [0.72, 0.7], [[0, '#ff9d1c'], [1, '#ffd24a']]);
    const right = make(markPieces.right, body, -0.08);
    paintGradient(right, [-0.62, -0.78], [[0, '#f23a00'], [0.5, '#fd6206'], [1, '#ffd745']]);
    const rightFold = make(markFolds.right, fold, 0.115);
    paintGradient(rightFold, [-0.62, -0.78], [[0, '#fe9e14'], [1, '#ffc23a']]);
    const flap = make(markFolds.flap, fold, 0.115);
    paintGradient(flap, [0, -1], [[0, '#ffb12c'], [1, '#fe8a10']]);
    return {
      top: [top, topFold],
      left: [left, leftFold],
      right: [right, rightFold, flap],
    };
  }, [size]);

  const lacquer = useMemo(
    () => new THREE.MeshPhysicalMaterial({
      vertexColors: true,
      metalness: 0.18,
      roughness: 0.26,
      clearcoat: 1,
      clearcoatRoughness: 0.08,
      emissive: new THREE.Color('#ff4a00'),
      emissiveIntensity: 0.14,
      envMapIntensity: 1.3,
    }),
    [],
  );

  const refs = {
    top: useRef<THREE.Group>(null),
    left: useRef<THREE.Group>(null),
    right: useRef<THREE.Group>(null),
  };
  const clock = useRef(0);
  const from = {
    top: new THREE.Vector3(0, 2.4, -1.2),
    left: new THREE.Vector3(-2.6, -0.8, -1.4),
    right: new THREE.Vector3(2.6, -0.6, -1.6),
  };
  const apart = {
    top: new THREE.Vector3(0, 0.55, 0.25),
    left: new THREE.Vector3(-0.5, -0.3, 0.1),
    right: new THREE.Vector3(0.55, -0.2, 0.2),
  };

  useFrame((_, delta) => {
    clock.current += Math.min(delta, 0.05);
    const t = easeOut((clock.current - delay) / 1.8);
    const s = spread?.current ?? 0;
    (Object.keys(refs) as (keyof typeof refs)[]).forEach((key, i) => {
      const node = refs[key].current;
      if (!node) return;
      const k = 1 - t;
      node.position.set(
        from[key].x * k + apart[key].x * s,
        from[key].y * k + apart[key].y * s,
        from[key].z * k + apart[key].z * s,
      );
      node.rotation.set(k * (i - 1) * 1.6, k * (i % 2 ? -2.2 : 2.2), k * (i - 1) * 0.8);
      node.scale.setScalar(0.35 + 0.65 * t);
    });
  });

  return (
    <group {...group}>
      {(Object.keys(parts) as (keyof typeof parts)[]).map((key) => (
        <group key={key} ref={refs[key]}>
          {parts[key].map((geometry, i) => (
            <mesh key={i} geometry={geometry} material={lacquer} castShadow={false} />
          ))}
        </group>
      ))}
    </group>
  );
}
