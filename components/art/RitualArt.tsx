// Five ritual vignettes. Paths marked data-draw are traced in by the Rituals scene.

const ring = (n: number, r: number, cx = 200, cy = 200) => Array.from({ length: n }, (_, i) => {
  const a = (i / n) * Math.PI * 2 - Math.PI / 2;
  return { x: cx + Math.cos(a) * r, y: cy + Math.sin(a) * r, a };
});

export function HaldiThali({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 400 400" aria-hidden="true">
      <defs>
        <radialGradient id="thali" cx=".42" cy=".38" r=".7">
          <stop offset="0" stopColor="#fbe3a2" />
          <stop offset=".55" stopColor="#d9a441" />
          <stop offset="1" stopColor="#8a6018" />
        </radialGradient>
        <radialGradient id="haldi-paste" cx=".4" cy=".35" r=".7">
          <stop offset="0" stopColor="#ffe066" />
          <stop offset=".7" stopColor="#f2b705" />
          <stop offset="1" stopColor="#c98a00" />
        </radialGradient>
      </defs>
      <circle cx="200" cy="208" r="186" fill="#7a5a10" opacity=".25" />
      <circle cx="200" cy="200" r="184" fill="url(#thali)" />
      <circle cx="200" cy="200" r="164" fill="none" stroke="#9a6c1e" strokeWidth="2" />
      {ring(64, 174).map((p, i) => <circle key={i} cx={p.x} cy={p.y} r="2.4" fill="#fbe3a2" />)}
      {ring(12, 118).map((p, i) => (
        <use key={i} href={i % 2 ? '#genda-y' : '#genda-o'} x={p.x - 22} y={p.y - 22} width="44" height="44" />
      ))}
      {ring(24, 146).map((p, i) => (
        <ellipse key={i} cx={p.x} cy={p.y} rx="7" ry="4" fill={i % 3 ? '#c0213c' : '#e2405a'} transform={`rotate(${(p.a * 180) / Math.PI + 30} ${p.x} ${p.y})`} />
      ))}
      <circle cx="200" cy="200" r="64" fill="#b8893a" />
      <circle cx="200" cy="200" r="56" fill="url(#haldi-paste)" />
      <path d="M170 196c10-8 30-10 52-2M176 214c14 6 30 6 44-2" stroke="#ffe999" strokeWidth="4" fill="none" strokeLinecap="round" opacity=".7" />
      {ring(10, 84).map((p, i) => <ellipse key={i} cx={p.x} cy={p.y} rx="3" ry="1.6" fill="#fffaf0" transform={`rotate(${i * 37} ${p.x} ${p.y})`} />)}
    </svg>
  );
}

export function MehendiMandala({ className }: { className?: string }) {
  const petals = ring(16, 0);
  return (
    <svg className={className} viewBox="0 0 400 400" aria-hidden="true">
      <g fill="none" stroke="#f3e2c0" strokeLinecap="round" strokeLinejoin="round">
        <circle data-draw cx="200" cy="200" r="22" strokeWidth="2.4" />
        <circle data-draw cx="200" cy="200" r="10" strokeWidth="2" />
        {petals.map((_, i) => (
          <path key={`p${i}`} data-draw d="M200 178C190 160 192 140 200 126 208 140 210 160 200 178Z" strokeWidth="2" transform={`rotate(${i * 22.5} 200 200)`} />
        ))}
        <circle data-draw cx="200" cy="200" r="80" strokeWidth="2" />
        <circle data-draw cx="200" cy="200" r="88" strokeWidth="1.2" strokeDasharray="1 7" />
        {ring(12, 0).map((_, i) => (
          <path key={`l${i}`} data-draw d="M200 112c-14-10-20-30-10-46 4 10 12 14 20 14 2 12-2 24-10 32Z" strokeWidth="2" transform={`rotate(${i * 30} 200 200)`} />
        ))}
        <circle data-draw cx="200" cy="200" r="138" strokeWidth="2.2" />
        {ring(24, 0).map((_, i) => (
          <path key={`s${i}`} data-draw d="M200 62a12 12 0 0 1 12 12" strokeWidth="2" transform={`rotate(${i * 15} 200 200)`} />
        ))}
        {ring(8, 0).map((_, i) => (
          <path key={`k${i}`} data-draw d="M200 46c16 0 26 12 22 26-3 10-14 14-22 8 8-2 12-8 8-14-4-6-14-6-18 2" strokeWidth="2.2" transform={`rotate(${i * 45 + 22.5} 200 200)`} />
        ))}
        <circle data-draw cx="200" cy="200" r="176" strokeWidth="1.6" strokeDasharray="2 8" />
      </g>
      <g fill="#f3e2c0">
        {ring(24, 150).map((p, i) => <circle key={i} cx={p.x} cy={p.y} r="2.6" />)}
        {ring(16, 50).map((p, i) => <circle key={`d${i}`} cx={p.x} cy={p.y} r="2" />)}
      </g>
    </svg>
  );
}

export function SangeetLights({ className }: { className?: string }) {
  const bulbs = (x0: number, x1: number, y: number, sag: number, n: number) =>
    Array.from({ length: n }, (_, i) => {
      const t = i / (n - 1);
      return { x: x0 + (x1 - x0) * t, y: y + Math.sin(Math.PI * t) * sag };
    });
  const strings = [bulbs(-10, 410, 40, 70, 14), bulbs(-10, 410, 90, 60, 13), bulbs(30, 370, 20, 110, 12)];
  return (
    <svg className={className} viewBox="0 0 400 400" aria-hidden="true">
      <defs>
        <radialGradient id="bulb">
          <stop offset="0" stopColor="#fff6d6" />
          <stop offset=".35" stopColor="#ffd27a" />
          <stop offset="1" stopColor="#ff9a3c" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="dholak" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#c0213c" />
          <stop offset=".5" stopColor="#7a1430" />
          <stop offset="1" stopColor="#3d0c1c" />
        </linearGradient>
      </defs>
      {strings.map((s, k) => (
        <g key={k}>
          <path d={`M${s[0].x} ${s[0].y}Q200 ${s[0].y + (k === 2 ? 220 : k ? 120 : 140)} ${s[s.length - 1].x} ${s[s.length - 1].y}`} stroke="#5a4a6a" strokeWidth="1.5" fill="none" />
          {s.map((b, i) => (
            <g key={i} className="bulb" style={{ animationDelay: `${(i * 0.37 + k) % 2.4}s` }}>
              <circle cx={b.x} cy={b.y + 6} r="16" fill="url(#bulb)" />
              <circle cx={b.x} cy={b.y + 6} r="4" fill="#fff3c4" />
            </g>
          ))}
        </g>
      ))}
      <g transform="translate(200 280) rotate(-8)">
        <rect x="-110" y="-46" width="220" height="92" rx="44" fill="url(#dholak)" />
        <g stroke="#e2b55c" strokeWidth="2" fill="none">
          {Array.from({ length: 9 }, (_, i) => (
            <path key={i} d={`M${-86 + i * 21} -40L${-76 + i * 21} 40`} />
          ))}
          {Array.from({ length: 9 }, (_, i) => (
            <path key={`b${i}`} d={`M${-76 + i * 21} -40L${-86 + i * 21} 40`} />
          ))}
        </g>
        <ellipse cx="-110" cy="0" rx="14" ry="46" fill="#f3e2c0" stroke="#b8893a" strokeWidth="3" />
        <ellipse cx="110" cy="0" rx="14" ry="46" fill="#f3e2c0" stroke="#b8893a" strokeWidth="3" />
        <ellipse cx="-110" cy="0" rx="6" ry="20" fill="#3d2a1a" opacity=".55" />
      </g>
      <g fill="#ffd27a" className="notes">
        <path d="M70 200v-50l40-10v46a10 10 0 1 1-6-9v-26l-28 7v40a10 10 0 1 1-6-9Z" />
        <path d="M320 170v-40a9 9 0 1 1-6-8v-14l24-6v10l-18 4Z" opacity=".85" />
      </g>
    </svg>
  );
}

export function PherasFire({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 400 400" aria-hidden="true">
      <defs>
        <radialGradient id="agni-glow">
          <stop offset="0" stopColor="#ffd27a" stopOpacity=".9" />
          <stop offset="1" stopColor="#ff4a00" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="200" cy="230" r="170" fill="url(#agni-glow)" opacity=".5" />
      <g fill="none" stroke="#ffd27a" strokeLinecap="round">
        {Array.from({ length: 7 }, (_, i) => (
          <ellipse key={i} data-draw cx="200" cy="300" rx={70 + i * 18} ry={22 + i * 6} strokeWidth={1.6} opacity={0.9 - i * 0.08} />
        ))}
      </g>
      <path d="M140 300l12 40h96l12-40Z" fill="#b5643a" />
      <path d="M140 300h120" stroke="#f6d690" strokeWidth="4" />
      <g className="agni">
        <path d="M200 120c40 50 64 90 48 140-8 28-28 42-48 42s-42-14-48-42c-12-46 14-90 48-140Z" fill="#fe4a02" />
        <path d="M200 170c26 34 40 62 30 96-6 20-18 30-30 30s-26-10-30-30c-8-32 6-60 30-96Z" fill="#fe9313" />
        <path d="M200 220c14 20 20 36 14 56-4 10-8 16-14 16s-12-6-14-16c-4-20 2-36 14-56Z" fill="#ffe08a" />
      </g>
      <path d="M90 360c40-18 70-18 110 0s70 18 110 0" fill="none" stroke="#f6d690" strokeWidth="3" />
      <path d="M200 360c-8 10-8 20 0 28 8-8 8-18 0-28Z" fill="#f6d690" />
    </svg>
  );
}

export function VidaaiDoli({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 400 400" aria-hidden="true">
      <defs>
        <linearGradient id="doli-wood" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#9e1530" />
          <stop offset="1" stopColor="#5b0f24" />
        </linearGradient>
      </defs>
      <path d="M20 250H380" stroke="#8a6018" strokeWidth="10" strokeLinecap="round" />
      <path d="M120 140c0-40 36-70 80-70s80 30 80 70Z" fill="url(#doli-wood)" />
      <path d="M190 70h20l-10-24Z" fill="#d9a441" />
      <circle cx="200" cy="44" r="6" fill="#d9a441" />
      <rect x="112" y="140" width="176" height="14" fill="#d9a441" />
      <rect x="120" y="154" width="160" height="120" fill="url(#doli-wood)" />
      <path d="M134 160h132v104H134Z" fill="#f3e2c0" />
      <path d="M134 160c30 40 30 70 0 104M266 160c-30 40-30 70 0 104" fill="#c0213c" />
      <path d="M134 160c30 40 30 70 0 104M266 160c-30 40-30 70 0 104" fill="none" stroke="#d9a441" strokeWidth="3" />
      <rect x="112" y="274" width="176" height="12" fill="#d9a441" />
      {[140, 170, 200, 230, 260].map((x, i) => (
        <g key={x}>
          <path d={`M${x} 154v${18 + (i % 2) * 10}`} stroke="#fff6e4" strokeWidth="1.2" />
          <use href={i % 2 ? '#genda-y' : '#genda-o'} x={x - 8} y={168 + (i % 2) * 10} width="16" height="16" />
        </g>
      ))}
      <g className="petals">
        {Array.from({ length: 14 }, (_, i) => (
          <ellipse key={i} cx={40 + ((i * 53) % 330)} cy={40 + ((i * 97) % 160)} rx="6" ry="3.4" fill={i % 3 ? '#c0213c' : '#fe7a0b'} transform={`rotate(${i * 41} ${40 + ((i * 53) % 330)} ${40 + ((i * 97) % 160)})`} />
        ))}
      </g>
    </svg>
  );
}
