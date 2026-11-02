import * as THREE from 'three';
import { MARK_SIZE, type Cmd } from '@/components/brand/markData';

const smooth = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

// A clay diya: a turned bowl with a pinched spout for the wick, painted with a red band and a gold rim.
export function createDiyaGeometry() {
  const profile = [
    [0, 0], [0.26, 0], [0.3, 0.03], [0.29, 0.06], [0.38, 0.09], [0.48, 0.16], [0.56, 0.26], [0.6, 0.34],
    [0.6, 0.37], [0.56, 0.38], [0.5, 0.31], [0.4, 0.24], [0.22, 0.2], [0, 0.19],
  ].map(([x, y]) => new THREE.Vector2(x, y));
  const geometry = new THREE.LatheGeometry(profile, 56);
  const position = geometry.attributes.position;
  const colors = new Float32Array(position.count * 3);
  const clay = new THREE.Color('#8f3e1d');
  const band = new THREE.Color('#9e1530');
  const gold = new THREE.Color('#d9a441');
  const inner = new THREE.Color('#4a1a0c');
  const c = new THREE.Color();
  for (let i = 0; i < position.count; i += 1) {
    let x = position.getX(i);
    let y = position.getY(i);
    let z = position.getZ(i);
    const radius = Math.hypot(x, z);
    const angle = Math.atan2(z, x);
    const toward = Math.pow(Math.max(0, Math.cos(angle)), 6);
    const reach = smooth(0.3, 0.6, radius);
    x *= 1 + toward * reach * 0.62;
    z *= 1 - toward * reach * 0.42;
    y += toward * reach * 0.07;
    position.setXYZ(i, x, y, z);

    const outerRim = y > 0.33;
    const isInside = radius < 0.5 && y > 0.18 && i % 14 >= 9;
    if (isInside) c.copy(inner);
    else if (outerRim) c.copy(gold);
    else if (y > 0.2 && y < 0.27) c.copy(band);
    else c.copy(clay);
    colors.set([c.r, c.g, c.b], i * 3);
  }
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  geometry.computeVertexNormals();
  return geometry;
}

// Where the wick sits on the diya above, in its own coordinates.
export const DIYA_WICK = new THREE.Vector3(0.78, 0.42, 0);

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
