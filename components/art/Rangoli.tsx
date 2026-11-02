type Props = { className?: string; palette?: string[] };

const petal = (r1: number, r2: number, w: number) =>
  `M0 ${-r1}C${w} ${-(r1 + r2) / 2} ${w * 0.6} ${-r2} 0 ${-r2 - w * 0.4}C${-w * 0.6} ${-r2} ${-w} ${-(r1 + r2) / 2} 0 ${-r1}Z`;

// A radially symmetric rangoli: rings of petals, dots and a lotus heart.
export function Rangoli({ className, palette = ['#c0213c', '#fe7a0b', '#fdb523', '#0b5d4b', '#fbf6ea', '#5b0f24'] }: Props) {
  const [red, saffron, yellow, green, white, maroon] = palette;
  const ring = (count: number, r1: number, r2: number, w: number, fill: string, offset = 0) =>
    Array.from({ length: count }, (_, i) => (
      <path key={i} d={petal(r1, r2, w)} fill={fill} transform={`rotate(${(360 / count) * i + offset})`} />
    ));
  const dots = (count: number, r: number, size: number, fill: string) =>
    Array.from({ length: count }, (_, i) => {
      const a = (i / count) * Math.PI * 2;
      return <circle key={i} cx={Math.cos(a) * r} cy={Math.sin(a) * r} r={size} fill={fill} />;
    });
  return (
    <svg className={className} viewBox="-400 -400 800 800" aria-hidden="true">
      <circle r="392" fill="none" stroke={maroon} strokeWidth="3" strokeDasharray="2 10" />
      {dots(72, 378, 5, yellow)}
      {ring(36, 300, 362, 26, red)}
      {ring(36, 312, 352, 14, saffron)}
      {dots(36, 290, 6, white)}
      <circle r="282" fill="none" stroke={green} strokeWidth="10" />
      {ring(24, 200, 274, 40, green, 7.5)}
      {ring(24, 210, 262, 22, yellow, 7.5)}
      {ring(24, 196, 268, 34, saffron)}
      {ring(24, 206, 256, 18, white)}
      <circle r="188" fill={maroon} />
      {ring(16, 110, 186, 44, red)}
      {ring(16, 120, 176, 24, saffron)}
      {dots(16, 160, 6, yellow)}
      {ring(8, 40, 112, 46, yellow, 22.5)}
      {ring(8, 44, 104, 30, saffron)}
      <circle r="44" fill={white} />
      {ring(12, 8, 40, 12, red)}
      <circle r="10" fill={yellow} />
    </svg>
  );
}
