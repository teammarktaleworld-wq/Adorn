import styles from './Toran.module.css';

type Props = { className?: string; swags?: number };

const W = 1600;

// A marigold toran: swags of genda flowers between brass nails, mango leaves, and hanging
// strands that end in small bells. Each strand sways on its own rhythm.
export function Toran({ className, swags = 7 }: Props) {
  const span = W / swags;
  const swagPaths: { d: string; flowers: { x: number; y: number; k: string }[] }[] = [];
  for (let i = 0; i < swags; i += 1) {
    const x0 = i * span;
    const x1 = x0 + span;
    const sag = 70 + (i % 2) * 14;
    const flowers = [];
    for (let j = 1; j < 12; j += 1) {
      const t = j / 12;
      const x = x0 + span * t;
      const y = 14 + Math.sin(Math.PI * t) * sag;
      flowers.push({ x, y, k: j % 2 ? 'genda-o' : 'genda-y' });
    }
    swagPaths.push({ d: `M${x0} 14Q${(x0 + x1) / 2} ${14 + sag * 2} ${x1} 14`, flowers });
  }
  const strands = Array.from({ length: swags + 1 }, (_, i) => i * span);

  return (
    <svg className={className} viewBox={`0 0 ${W} 260`} preserveAspectRatio="xMidYMin slice" aria-hidden="true">
      <path d={`M0 10H${W}`} stroke="url(#brass)" strokeWidth="5" />
      {swagPaths.map((swag, i) => (
        <g key={i}>
          {swag.flowers.map((f, j) =>
            j % 3 === 1 ? (
              <use key={`l${j}`} href="#mango-leaf" x={f.x - 6} y={f.y + 4} width="12" height="34" />
            ) : null,
          )}
          {swag.flowers.map((f, j) => (
            <use key={j} href={`#${f.k}`} x={f.x - 13} y={f.y - 13} width="26" height="26" />
          ))}
        </g>
      ))}
      {strands.map((x, i) => (
        <g key={i} className={styles.strand} style={{ transformOrigin: `${x}px 10px`, animationDelay: `${-i * 0.7}s` }}>
          {Array.from({ length: 6 }, (_, j) => (
            <use key={j} href={j % 2 ? '#genda-y' : '#genda-o'} x={x - 12} y={18 + j * 22} width="24" height="24" />
          ))}
          <use href="#jasmine" x={x - 7} y={152} width="14" height="14" />
          <use href="#bell" x={x - 10} y={166} width="20" height="26" />
          <circle cx={x} cy="10" r="7" fill="url(#brass)" />
        </g>
      ))}
    </svg>
  );
}
