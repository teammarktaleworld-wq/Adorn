// Silhouettes of a dancing crowd: turbans, dupattas and raised hands.
type Person = { x: number; h: number; hands: 0 | 1 | 2; turban?: boolean; bun?: boolean; group: number };

const people: Person[] = [
  { x: 40, h: 150, hands: 1, group: 0 }, { x: 110, h: 170, hands: 2, turban: true, group: 1 }, { x: 185, h: 140, hands: 0, bun: true, group: 2 },
  { x: 250, h: 175, hands: 2, group: 0 }, { x: 330, h: 155, hands: 1, bun: true, group: 1 }, { x: 400, h: 180, hands: 2, turban: true, group: 2 },
  { x: 470, h: 145, hands: 0, group: 0 }, { x: 545, h: 168, hands: 2, bun: true, group: 1 }, { x: 620, h: 176, hands: 1, turban: true, group: 2 },
  { x: 700, h: 150, hands: 2, group: 0 }, { x: 775, h: 165, hands: 0, bun: true, group: 1 }, { x: 850, h: 182, hands: 2, turban: true, group: 2 },
  { x: 925, h: 148, hands: 1, group: 0 }, { x: 1000, h: 172, hands: 2, bun: true, group: 1 }, { x: 1075, h: 160, hands: 2, group: 2 },
  { x: 1150, h: 178, hands: 1, turban: true, group: 0 }, { x: 1225, h: 150, hands: 2, bun: true, group: 1 }, { x: 1300, h: 170, hands: 0, group: 2 },
  { x: 1375, h: 158, hands: 2, turban: true, group: 0 }, { x: 1450, h: 176, hands: 1, bun: true, group: 1 }, { x: 1530, h: 165, hands: 2, group: 2 },
];

function Figure({ p }: { p: Person }) {
  const top = 260 - p.h;
  const head = top + 18;
  return (
    <g className={`dancer dancer-${p.group}`}>
      <path d={`M${p.x - 36} 260C${p.x - 34} ${top + 70} ${p.x - 22} ${top + 44} ${p.x} ${top + 44}S${p.x + 34} ${top + 70} ${p.x + 36} 260Z`} />
      <circle cx={p.x} cy={head} r="17" />
      {p.turban && <path d={`M${p.x - 19} ${head - 2}C${p.x - 20} ${head - 26} ${p.x + 20} ${head - 30} ${p.x + 20} ${head - 4}Z`} />}
      {p.turban && <path d={`M${p.x + 6} ${head - 22}c4-12 10-18 18-20-4 8-6 14-6 22Z`} />}
      {p.bun && <circle cx={p.x - 14} cy={head - 8} r="9" />}
      {p.hands >= 1 && <path d={`M${p.x + 22} ${top + 56}L${p.x + 44} ${top - 6}l8 3-16 64Z`} />}
      {p.hands === 2 && <path d={`M${p.x - 22} ${top + 56}L${p.x - 44} ${top - 6}l-8 3 16 64Z`} />}
    </g>
  );
}

export function Crowd({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 1600 260" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
      <g fill="#070205">
        {people.map((p) => <Figure key={p.x} p={p} />)}
        <rect x="0" y="240" width="1600" height="20" />
      </g>
    </svg>
  );
}
