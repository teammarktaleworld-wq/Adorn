// A pastel fairy-tale castle: towers with conical roofs, gold pennants, arched windows.
type Tower = { x: number; w: number; h: number; roof: number; flag?: boolean };

const towers: Tower[] = [
  { x: 120, w: 70, h: 210, roof: 110, flag: true },
  { x: 300, w: 90, h: 300, roof: 140, flag: true },
  { x: 520, w: 130, h: 380, roof: 190, flag: true },
  { x: 740, w: 90, h: 300, roof: 140, flag: true },
  { x: 920, w: 70, h: 220, roof: 110, flag: true },
];

export function Castle({ className }: { className?: string }) {
  const base = 520;
  return (
    <svg className={className} viewBox="0 0 1040 520" preserveAspectRatio="xMidYMax meet" aria-hidden="true">
      <defs>
        <linearGradient id="castle-wall" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fbe6ee" />
          <stop offset="1" stopColor="#e9c9dc" />
        </linearGradient>
        <linearGradient id="castle-roof" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#d9b8f2" />
          <stop offset="1" stopColor="#a985d6" />
        </linearGradient>
      </defs>
      <rect x="150" y="360" width="740" height="160" fill="url(#castle-wall)" />
      {Array.from({ length: 23 }, (_, i) => (
        <rect key={i} x={150 + i * 32.5} y="344" width="18" height="18" fill="url(#castle-wall)" />
      ))}
      <path d="M470 520v-90a50 50 0 0 1 100 0v90Z" fill="#c79ad8" />
      <path d="M478 520v-88a42 42 0 0 1 84 0v88Z" fill="#fff4dc" opacity=".55" />
      {towers.map((t) => {
        const left = t.x - t.w / 2;
        const top = base - t.h;
        return (
          <g key={t.x}>
            <rect x={left} y={top} width={t.w} height={t.h} fill="url(#castle-wall)" />
            <path d={`M${left - 10} ${top}L${t.x} ${top - t.roof}L${left + t.w + 10} ${top}Z`} fill="url(#castle-roof)" />
            <path d={`M${left - 10} ${top}h${t.w + 20}`} stroke="#e8c27a" strokeWidth="5" />
            {t.flag && (
              <g>
                <path d={`M${t.x} ${top - t.roof}v-46`} stroke="#b8893a" strokeWidth="2.5" />
                <path d={`M${t.x} ${top - t.roof - 46}l34 9-34 9Z`} fill="#e8c27a" className="pennant" />
              </g>
            )}
            {[0.25, 0.5].map((k) => (
              <path key={k} d={`M${t.x - 9} ${top + t.h * k + 30}v-16a9 9 0 0 1 18 0v16Z`} fill="#e8c27a" opacity=".9" />
            ))}
          </g>
        );
      })}
      <g fill="#f6c4d2">
        {Array.from({ length: 18 }, (_, i) => (
          <circle key={i} cx={40 + i * 56} cy={520 - (i % 3) * 8} r={34 + (i % 4) * 8} opacity={0.85} />
        ))}
      </g>
      <g fill="#ffffff" opacity=".9">
        {Array.from({ length: 30 }, (_, i) => (
          <circle key={i} cx={20 + i * 34} cy={500 - ((i * 13) % 30)} r={4} />
        ))}
      </g>
    </svg>
  );
}

export function Cake({ className, lit }: { className?: string; lit: boolean }) {
  return (
    <svg className={className} viewBox="0 0 320 380" role="img" aria-label={lit ? 'A three-tier princess cake with two lit candles' : 'A three-tier princess cake, candles blown out'}>
      <defs>
        <linearGradient id="cake-pink" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#f1a7bb" />
          <stop offset=".5" stopColor="#fbd3de" />
          <stop offset="1" stopColor="#f1a7bb" />
        </linearGradient>
        <linearGradient id="cake-ivory" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#f3e2d2" />
          <stop offset=".5" stopColor="#fff7ee" />
          <stop offset="1" stopColor="#f3e2d2" />
        </linearGradient>
        <radialGradient id="candle-glow">
          <stop offset="0" stopColor="#fff3c4" stopOpacity=".9" />
          <stop offset="1" stopColor="#ffb347" stopOpacity="0" />
        </radialGradient>
      </defs>
      <ellipse cx="160" cy="366" rx="150" ry="12" fill="#e8c27a" />
      <rect x="30" y="270" width="260" height="92" rx="10" fill="url(#cake-pink)" />
      <rect x="62" y="196" width="196" height="78" rx="10" fill="url(#cake-ivory)" />
      <rect x="96" y="134" width="128" height="66" rx="10" fill="url(#cake-pink)" />
      {[[30, 270, 260], [62, 196, 196], [96, 134, 128]].map(([x, y, w]) => (
        <g key={y}>
          <path d={`M${x} ${y + 6}h${w}`} stroke="#e8c27a" strokeWidth="5" />
          {Array.from({ length: Math.floor(w / 18) }, (_, i) => (
            <circle key={i} cx={x + 9 + i * 18} cy={y + 14} r="4" fill="#fffaf0" />
          ))}
        </g>
      ))}
      <path d="M140 134l6-22 14 14 14-14 6 22Z" fill="#e8c27a" />
      <circle cx="160" cy="112" r="5" fill="#ff8fb5" />
      {[128, 192].map((x) => (
        <g key={x}>
          <rect x={x - 5} y="84" width="10" height="50" rx="3" fill="#fff" />
          <path d={`M${x - 5} 96l10-6M${x - 5} 110l10-6M${x - 5} 124l10-6`} stroke="#f1a7bb" strokeWidth="3" />
          <g className="flame" style={{ opacity: lit ? 1 : 0, transformOrigin: `${x}px 84px` }}>
            <circle cx={x} cy="70" r="26" fill="url(#candle-glow)" />
            <path d={`M${x} 52c8 10 10 18 6 26-2 4-4 6-6 6s-4-2-6-6c-4-8-2-16 6-26Z`} fill="#ffb347" />
            <path d={`M${x} 64c4 6 5 10 3 14-1 2-2 3-3 3s-2-1-3-3c-2-4-1-8 3-14Z`} fill="#fff3c4" />
          </g>
          <path className="smoke" d={`M${x} 82c-6-10 6-16 0-26s6-16 0-26`} fill="none" stroke="#bba7b4" strokeWidth="3" strokeLinecap="round" style={{ opacity: lit ? 0 : 0.8 }} />
        </g>
      ))}
    </svg>
  );
}
