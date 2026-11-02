import * as THREE from 'three';

// A rangoli painted onto a canvas, for the mandap floor.
export function createRangoliTexture(size = 1024) {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.Texture();
  const c = size / 2;
  ctx.translate(c, c);
  ctx.fillStyle = '#f3e7cf';
  ctx.fillRect(-c, -c, size, size);
  const k = size / 800;

  const petalRing = (count: number, r1: number, r2: number, w: number, color: string, offset = 0) => {
    ctx.fillStyle = color;
    for (let i = 0; i < count; i += 1) {
      ctx.save();
      ctx.rotate(((Math.PI * 2) / count) * i + offset);
      ctx.beginPath();
      ctx.moveTo(0, -r1 * k);
      ctx.bezierCurveTo(w * k, -((r1 + r2) / 2) * k, w * 0.6 * k, -r2 * k, 0, -(r2 + w * 0.4) * k);
      ctx.bezierCurveTo(-w * 0.6 * k, -r2 * k, -w * k, -((r1 + r2) / 2) * k, 0, -r1 * k);
      ctx.fill();
      ctx.restore();
    }
  };
  const dotRing = (count: number, r: number, size2: number, color: string) => {
    ctx.fillStyle = color;
    for (let i = 0; i < count; i += 1) {
      const a = (i / count) * Math.PI * 2;
      ctx.beginPath();
      ctx.arc(Math.cos(a) * r * k, Math.sin(a) * r * k, size2 * k, 0, Math.PI * 2);
      ctx.fill();
    }
  };
  const disc = (r: number, color: string) => {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(0, 0, r * k, 0, Math.PI * 2);
    ctx.fill();
  };

  disc(398, '#5b0f24');
  dotRing(80, 386, 5, '#fdb523');
  petalRing(40, 300, 370, 26, '#c0213c');
  petalRing(40, 312, 360, 14, '#fe7a0b');
  dotRing(40, 292, 6, '#fbf6ea');
  disc(284, '#0b5d4b');
  petalRing(24, 200, 276, 40, '#fdb523', Math.PI / 24);
  petalRing(24, 196, 268, 34, '#fe7a0b');
  petalRing(24, 206, 256, 18, '#fbf6ea');
  disc(188, '#7a1430');
  petalRing(16, 110, 186, 44, '#c0213c');
  petalRing(16, 120, 176, 24, '#fe9313');
  dotRing(16, 160, 6, '#ffd24a');
  petalRing(8, 40, 112, 46, '#ffd24a', Math.PI / 8);
  petalRing(8, 44, 104, 30, '#fe7a0b');
  disc(44, '#fbf6ea');
  petalRing(12, 8, 40, 12, '#c0213c');
  disc(10, '#fdb523');

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  return texture;
}

// Red silk with fine gold stripes, wrapped round the mandap pillars.
export function createSilkTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.Texture();
  const g = ctx.createLinearGradient(0, 0, 256, 0);
  g.addColorStop(0, '#7a0f22');
  g.addColorStop(0.5, '#b3122e');
  g.addColorStop(1, '#7a0f22');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 256, 256);
  ctx.strokeStyle = '#e2b55c';
  ctx.lineWidth = 6;
  for (let i = -256; i < 512; i += 48) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i + 256, 256);
    ctx.stroke();
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(2, 6);
  return texture;
}

// A soft dark pool used as a cheap contact shadow under objects.
export function createShadowTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 128;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.Texture();
  const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
  g.addColorStop(0, 'rgba(0,0,0,0.75)');
  g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 128, 128);
  return new THREE.CanvasTexture(canvas);
}
