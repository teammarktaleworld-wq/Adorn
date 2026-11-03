import * as THREE from 'three';
import { MARK_SIZE, type Cmd } from '@/components/brand/markData';

// A single cupped petal, for marigold and rose showers.
export function createPetalGeometry() {
  const shape = new THREE.Shape();
  shape.moveTo(0, -0.09);
  shape.bezierCurveTo(0.07, -0.07, 0.08, 0.05, 0, 0.1);
  shape.bezierCurveTo(-0.08, 0.05, -0.07, -0.07, 0, -0.09);
  const geometry = new THREE.ShapeGeometry(shape, 8);
  const position = geometry.attributes.position;
  for (let i = 0; i < position.count; i += 1) {
    const x = position.getX(i);
    const y = position.getY(i);
    position.setZ(i, x * x * 3.2 - y * 0.12);
  }
  geometry.computeVertexNormals();
  return geometry;
}

// Builds a THREE.Shape from the shared logo commands, centred and flipped into 3D space.
export function shapeFromCommands(commands: Cmd[], size = 3.2) {
  const k = size / MARK_SIZE.width;
  const ox = MARK_SIZE.width / 2;
  const oy = MARK_SIZE.height / 2;
  const tx = (x: number) => (x - ox) * k;
  const ty = (y: number) => -(y - oy) * k;
  const shape = new THREE.Shape();
  for (const cmd of commands) {
    if (cmd[0] === 'M') shape.moveTo(tx(cmd[1]), ty(cmd[2]));
    else if (cmd[0] === 'L') shape.lineTo(tx(cmd[1]), ty(cmd[2]));
    else if (cmd[0] === 'C') shape.bezierCurveTo(tx(cmd[1]), ty(cmd[2]), tx(cmd[3]), ty(cmd[4]), tx(cmd[5]), ty(cmd[6]));
  }
  return shape;
}

// Paints a vertical-ish gradient across a geometry's vertices, along a chosen direction.
export function paintGradient(geometry: THREE.BufferGeometry, direction: [number, number], stops: [number, string][]) {
  const position = geometry.attributes.position;
  const [dx, dy] = direction;
  let min = Infinity;
  let max = -Infinity;
  for (let i = 0; i < position.count; i += 1) {
    const t = position.getX(i) * dx + position.getY(i) * dy;
    min = Math.min(min, t);
    max = Math.max(max, t);
  }
  const palette = stops.map(([at, hex]) => [at, new THREE.Color(hex)] as const);
  const colors = new Float32Array(position.count * 3);
  const c = new THREE.Color();
  for (let i = 0; i < position.count; i += 1) {
    const t = (position.getX(i) * dx + position.getY(i) * dy - min) / (max - min || 1);
    let k = 0;
    while (k < palette.length - 2 && t > palette[k + 1][0]) k += 1;
    const [a, ca] = palette[k];
    const [b, cb] = palette[k + 1];
    c.copy(ca).lerp(cb, Math.min(1, Math.max(0, (t - a) / (b - a || 1))));
    colors.set([c.r, c.g, c.b], i * 3);
  }
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
}
