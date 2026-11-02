// Marigold (genda) and mango-leaf symbols, defined once and reused across garlands.
export function GardenSymbols() {
  const ruffle = (r: number, n: number, depth: number) => {
    const pts: string[] = [];
    for (let i = 0; i <= n * 2; i += 1) {
      const a = (i / (n * 2)) * Math.PI * 2;
      const rr = i % 2 ? r - depth : r;
      pts.push(`${(Math.cos(a) * rr).toFixed(2)},${(Math.sin(a) * rr).toFixed(2)}`);
    }
    return `M${pts.join('L')}Z`;
  };
  return (
    <svg width="0" height="0" aria-hidden="true" focusable="false" style={{ position: 'absolute' }}>
      <defs>
        <radialGradient id="genda-orange" cx=".45" cy=".4" r=".7">
          <stop offset="0" stopColor="#ffb02e" />
          <stop offset=".65" stopColor="#f77d0e" />
          <stop offset="1" stopColor="#c74a06" />
        </radialGradient>
        <radialGradient id="genda-yellow" cx=".45" cy=".4" r=".7">
          <stop offset="0" stopColor="#ffe27a" />
          <stop offset=".65" stopColor="#fdb523" />
          <stop offset="1" stopColor="#d98a0a" />
        </radialGradient>
        <linearGradient id="leaf-green" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#3f8f3c" />
          <stop offset="1" stopColor="#0b5d4b" />
        </linearGradient>
        <linearGradient id="brass" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#f6d690" />
          <stop offset=".5" stopColor="#c9952f" />
          <stop offset="1" stopColor="#7e5a16" />
        </linearGradient>
        <symbol id="genda-o" viewBox="-12 -12 24 24" overflow="visible">
          <path d={ruffle(11.5, 14, 1.8)} fill="url(#genda-orange)" />
          <path d={ruffle(8.2, 11, 1.4)} fill="#f8901a" opacity=".9" />
          <path d={ruffle(5, 9, 1.1)} fill="#ffb84a" />
          <circle r="1.6" fill="#a8430a" opacity=".6" />
        </symbol>
        <symbol id="genda-y" viewBox="-12 -12 24 24" overflow="visible">
          <path d={ruffle(11.5, 14, 1.8)} fill="url(#genda-yellow)" />
          <path d={ruffle(8.2, 11, 1.4)} fill="#fdc23c" opacity=".9" />
          <path d={ruffle(5, 9, 1.1)} fill="#ffe27a" />
          <circle r="1.6" fill="#b5760a" opacity=".55" />
        </symbol>
        <symbol id="mango-leaf" viewBox="-6 0 12 34" overflow="visible">
          <path d="M0 0C6 6 7 20 0 34 -7 20 -6 6 0 0Z" fill="url(#leaf-green)" />
          <path d="M0 2V31" stroke="#a7d18a" strokeWidth=".7" opacity=".6" />
        </symbol>
        <symbol id="jasmine" viewBox="-6 -6 12 12" overflow="visible">
          {Array.from({ length: 5 }, (_, i) => (
            <ellipse key={i} cx="0" cy="-3" rx="2" ry="3.2" fill="#fffaf0" transform={`rotate(${i * 72})`} />
          ))}
          <circle r="1.3" fill="#f3e2a8" />
        </symbol>
        <symbol id="bell" viewBox="-10 0 20 26" overflow="visible">
          <path d="M-1 0h2v4h-2Z" fill="url(#brass)" />
          <path d="M0 4C6 4 8 10 8 18H-8C-8 10-6 4 0 4Z" fill="url(#brass)" />
          <path d="M-9 18H9v2H-9Z" fill="#7e5a16" />
          <circle cy="23" r="2.6" fill="url(#brass)" />
        </symbol>
      </defs>
    </svg>
  );
}
