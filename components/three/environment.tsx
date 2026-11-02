'use client';

import { useEffect } from 'react';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';

type Softbox = { color: string; intensity: number; position: [number, number, number]; size: [number, number] };
export type EnvironmentOptions = { top: string; horizon: string; bottom: string; lights?: Softbox[] };

// A small generated studio: a gradient dome plus a few glowing panels, baked into an
// environment map so gold, brass and glossy balloons have something warm to reflect.
export function createEnvironment(renderer: THREE.WebGLRenderer, options: EnvironmentOptions) {
  const scene = new THREE.Scene();
  const dome = new THREE.SphereGeometry(20, 48, 24);
  const top = new THREE.Color(options.top);
  const horizon = new THREE.Color(options.horizon);
  const bottom = new THREE.Color(options.bottom);
  const color = new THREE.Color();
  const colors: number[] = [];
  const position = dome.attributes.position;
  for (let i = 0; i < position.count; i += 1) {
    const y = position.getY(i) / 20;
    if (y > 0) color.copy(horizon).lerp(top, Math.pow(y, 0.6));
    else color.copy(horizon).lerp(bottom, Math.pow(-y, 0.5));
    colors.push(color.r, color.g, color.b);
  }
  dome.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  scene.add(new THREE.Mesh(dome, new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.BackSide })));

  for (const light of options.lights ?? []) {
    const panel = new THREE.Mesh(
      new THREE.PlaneGeometry(light.size[0], light.size[1]),
      new THREE.MeshBasicMaterial({ color: new THREE.Color(light.color).multiplyScalar(light.intensity), side: THREE.DoubleSide }),
    );
    panel.position.set(...light.position);
    panel.lookAt(0, 0, 0);
    scene.add(panel);
  }

  const pmrem = new THREE.PMREMGenerator(renderer);
  const target = pmrem.fromScene(scene, 0.035);
  pmrem.dispose();
  scene.traverse((object) => {
    const mesh = object as THREE.Mesh;
    if (mesh.isMesh) {
      mesh.geometry.dispose();
      (mesh.material as THREE.Material).dispose();
    }
  });
  return target;
}

export function SceneEnvironment(props: EnvironmentOptions) {
  const gl = useThree((state) => state.gl);
  const scene = useThree((state) => state.scene);
  useEffect(() => {
    const target = createEnvironment(gl, props);
    scene.environment = target.texture;
    return () => {
      scene.environment = null;
      target.dispose();
    };
    // The environment is baked once per scene.
  }, [gl, scene]);
  return null;
}
