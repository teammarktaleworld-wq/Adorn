// The gold double outline drawn over an arch clipped with #clip-arch (same shape, 0–100 units).
const ARCH_100 =
  'M0 100V36C0 30 2 25 6 22 5 18 8 14 12 13 13 9 17 6 22 6 25 3 29 2 33 3 37 0 43-1 50-4 57-1 63 0 67 3 71 2 75 3 78 6 83 6 87 9 88 13 92 14 95 18 94 22 98 25 100 30 100 36V100';

export function ArchFrame({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 -5 100 105" preserveAspectRatio="none" aria-hidden="true">
      <path d={ARCH_100} fill="none" stroke="#d9b26a" strokeWidth="2" vectorEffect="non-scaling-stroke" />
      <path d={ARCH_100} fill="none" stroke="#d9b26a" strokeWidth="0.8" vectorEffect="non-scaling-stroke" transform="translate(3 3) scale(.94 .97)" opacity=".7" />
    </svg>
  );
}
