// A Rajput palace drawn from simple rules: onion domes, chhatris, jharokha windows and an arcaded
// plinth on the water. Lit windows are grouped (data-lit) so a scroll scene can light them floor
// by floor; data-lights marks the fairy-light outlines traced over the roofline.

const onion = (cx: number, base: number, w: number, h: number) =>
  `M${cx - w / 2} ${base}C${cx - w * 0.68} ${base - h * 0.42} ${cx - w * 0.2} ${base - h * 0.72} ${cx} ${base - h}C${cx + w * 0.2} ${base - h * 0.72} ${cx + w * 0.68} ${base - h * 0.42} ${cx + w / 2} ${base}Z`;

const arch = (x: number, y: number, w: number, h: number) =>
  `M${x} ${y + h}V${y + w * 0.62}Q${x} ${y + w * 0.08} ${x + w / 2} ${y}Q${x + w} ${y + w * 0.08} ${x + w} ${y + w * 0.62}V${y + h}Z`;

const merlons = (x0: number, x1: number, y: number, size = 10) => {
  let d = '';
  for (let x = x0; x < x1 - size * 0.5; x += size * 1.6) d += `M${x} ${y}v${-size * 0.7}l${size / 2} ${-size * 0.5}l${size / 2} ${size * 0.5}v${size * 0.7}Z`;
  return d;
};

function Chhatri({ cx, base, w, lit = 4 }: { cx: number; base: number; w: number; lit?: number }) {
  const pillarH = w * 0.72;
  const top = base - 6 - pillarH;
  return (
    <g>
      <rect x={cx - w * 0.62} y={base - 6} width={w * 1.24} height={6} />
      <rect x={cx - w * 0.44} y={top} width={w * 0.88} height={pillarH} className="palace-window" />
      <rect data-lit={lit} className="palace-lit" x={cx - w * 0.4} y={top + 3} width={w * 0.8} height={pillarH - 3} rx={2} />
      {[-0.42, -0.14, 0.14, 0.42].map((k) => (
        <rect key={k} x={cx + k * w - 2} y={top} width={4} height={pillarH} />
      ))}
      <rect x={cx - w * 0.72} y={top - 5} width={w * 1.44} height={5} />
      <path d={onion(cx, top - 5, w * 0.92, w * 0.82)} />
      <rect x={cx - 1} y={top - 5 - w * 0.82 - 12} width={2} height={12} />
    </g>
  );
}

function windowsRow(x0: number, x1: number, y: number, w: number, h: number, count: number, group: number, keyPrefix: string) {
  const gap = count > 1 ? (x1 - x0 - count * w) / (count - 1) : 0;
  const start = count > 1 ? x0 : (x0 + x1 - w) / 2;
  return Array.from({ length: count }, (_, i) => {
    const x = start + i * (w + gap);
    return (
      <g key={`${keyPrefix}${i}`}>
        <path d={arch(x, y, w, h)} className="palace-window" />
        <path d={arch(x + 3, y + 3, w - 6, h - 4)} data-lit={group} className="palace-lit" />
        <rect x={x - 5} y={y - 6} width={w + 10} height={4} className="palace-ledge" />
      </g>
    );
  });
}

export function Palace({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 1600 600" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
      <defs>
        <linearGradient id="palace-stone" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#6a2433" />
          <stop offset=".55" stopColor="#3c0f1c" />
          <stop offset="1" stopColor="#24060f" />
        </linearGradient>
        <radialGradient id="window-glow">
          <stop offset="0" stopColor="#ffcf7a" stopOpacity=".55" />
          <stop offset="1" stopColor="#ff8a2a" stopOpacity="0" />
        </radialGradient>
      </defs>
      <g fill="url(#palace-stone)">
        {/* plinth and arcade on the water */}
        <rect x="60" y="500" width="1480" height="100" />
        {/* wings */}
        <rect x="140" y="392" width="1320" height="112" />
        <path d={merlons(140, 1460, 392, 11)} />
        {/* main block */}
        <rect x="460" y="262" width="680" height="240" />
        <path d={merlons(460, 1140, 262, 12)} />
        {/* bastion towers */}
        <rect x="410" y="196" width="70" height="306" rx="6" />
        <rect x="1120" y="196" width="70" height="306" rx="6" />
        <path d={merlons(410, 480, 196, 9)} />
        <path d={merlons(1120, 1190, 196, 9)} />
        {/* central dome on its drum */}
        <rect x="690" y="226" width="220" height="38" />
        <path d={onion(800, 228, 214, 172)} />
        <rect x="798" y="30" width="4" height="30" />
        <circle cx="800" cy="54" r="7" />
        <circle cx="800" cy="38" r="4" />
        {/* side domes */}
        <rect x="548" y="236" width="84" height="28" />
        <path d={onion(590, 238, 104, 92)} />
        <rect x="968" y="236" width="84" height="28" />
        <path d={onion(1010, 238, 104, 92)} />
        <rect x="589" y="128" width="2" height="20" />
        <rect x="1009" y="128" width="2" height="20" />
        <Chhatri cx={445} base={196} w={58} lit={6} />
        <Chhatri cx={1155} base={196} w={58} lit={6} />
        <Chhatri cx={190} base={392} w={44} lit={2} />
        <Chhatri cx={330} base={392} w={40} lit={2} />
        <Chhatri cx={1270} base={392} w={40} lit={2} />
        <Chhatri cx={1410} base={392} w={44} lit={2} />
      </g>

      {/* windows: unlit openings, with lit panes on top for the scene to fade in */}
      <g fill="#1a050b">
        {Array.from({ length: 26 }, (_, i) => (
          <path key={`p${i}`} d={arch(88 + i * 55.5, 516, 30, 52)} />
        ))}
      </g>
      <g fill="#ffcf7a">
        {Array.from({ length: 26 }, (_, i) => (
          <path key={`pl${i}`} d={arch(91 + i * 55.5, 519, 24, 49)} data-lit={1} className="palace-lit" />
        ))}
      </g>
      <g className="palace-rows">
        {windowsRow(170, 400, 420, 28, 46, 6, 2, 'wl')}
        {windowsRow(1200, 1430, 420, 28, 46, 6, 2, 'wr')}
        {windowsRow(500, 1100, 440, 38, 52, 9, 3, 'g')}
        {windowsRow(496, 1104, 362, 30, 46, 11, 4, 'b')}
        {windowsRow(520, 1080, 290, 34, 44, 9, 5, 'a')}
        {windowsRow(428, 462, 240, 34, 36, 1, 6, 'tl')}
        {windowsRow(1138, 1172, 240, 34, 36, 1, 6, 'tr')}
        {windowsRow(428, 462, 320, 34, 36, 1, 6, 'tl2')}
        {windowsRow(1138, 1172, 320, 34, 36, 1, 6, 'tr2')}
      </g>
      {/* central gate */}
      <path d={arch(752, 400, 96, 102)} fill="#1a050b" />
      <path d={arch(758, 406, 84, 96)} fill="#ffcf7a" data-lit={3} className="palace-lit" />

      {/* fairy lights along domes and rooflines */}
      <g data-lights className="palace-lights" fill="none" stroke="#ffe3a0" strokeWidth="3.2" strokeLinecap="round" strokeDasharray="0 11">
        <path d={onion(800, 228, 214, 172).replace('Z', '')} />
        <path d={onion(590, 238, 104, 92).replace('Z', '')} />
        <path d={onion(1010, 238, 104, 92).replace('Z', '')} />
        <path d="M460 262H1140M140 392H460M1140 392H1460M60 500H1540M410 196H480M1120 196H1190" />
        <path d="M410 196V500M480 196V262M1120 262V196M1190 196V500" />
      </g>
    </svg>
  );
}
