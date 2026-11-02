import { useId } from 'react';
import { markFolds, markPieces, toPath } from './markData';

type MarkProps = { className?: string; title?: string };

// The jewel on its own: the folded saffron diamond.
export function AdornMark({ className, title }: MarkProps) {
  const id = useId().replace(/:/g, '');
  return (
    <svg className={className} viewBox="0 0 740 552" role={title ? 'img' : undefined} aria-hidden={title ? undefined : true} aria-label={title}>
      <defs>
        <linearGradient id={`${id}t`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FE4A02" />
          <stop offset=".6" stopColor="#FE6A08" />
          <stop offset="1" stopColor="#FE9313" />
        </linearGradient>
        <linearGradient id={`${id}tf`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FDA52A" />
          <stop offset="1" stopColor="#FFD24A" />
        </linearGradient>
        <linearGradient id={`${id}l`} x1="0" y1=".85" x2=".9" y2=".15">
          <stop offset="0" stopColor="#F23A00" />
          <stop offset=".55" stopColor="#FE6408" />
          <stop offset="1" stopColor="#FDA020" />
        </linearGradient>
        <linearGradient id={`${id}lf`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#FF9D1C" />
          <stop offset="1" stopColor="#FFD24A" />
        </linearGradient>
        <linearGradient id={`${id}r`} x1="1" y1=".3" x2=".05" y2="1">
          <stop offset="0" stopColor="#F23A00" />
          <stop offset=".5" stopColor="#FD6206" />
          <stop offset="1" stopColor="#FFD745" />
        </linearGradient>
        <linearGradient id={`${id}rf`} x1="1" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FE9E14" />
          <stop offset="1" stopColor="#FFC23A" />
        </linearGradient>
      </defs>
      <path d={toPath(markPieces.top)} fill={`url(#${id}t)`} />
      <path d={toPath(markFolds.top)} fill={`url(#${id}tf)`} />
      <path d={toPath(markPieces.left)} fill={`url(#${id}l)`} />
      <path d={toPath(markFolds.left)} fill={`url(#${id}lf)`} opacity=".85" />
      <path d={toPath(markPieces.right)} fill={`url(#${id}r)`} />
      <path d={toPath(markFolds.right)} fill={`url(#${id}rf)`} opacity=".85" />
      <path d={toPath(markFolds.flap)} fill="#FFB12C" />
    </svg>
  );
}

// The lotus that sits between the divider lines under the wordmark.
export function LotusMotif({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 64 48" aria-hidden="true">
      <g fill="currentColor">
        <path d="M32 2c5 8 7 15 7 22 0 8-3 14-7 18-4-4-7-10-7-18 0-7 2-14 7-22Z" />
        <path d="M30 44c-9-1-17-7-20-17 6-1 12 1 16 5 2 3 4 7 4 12Z" opacity=".9" />
        <path d="M34 44c9-1 17-7 20-17-6-1-12 1-16 5-2 3-4 7-4 12Z" opacity=".9" />
        <path d="M27 46c-7 1-15-1-21-6 4-3 10-3 14-1 3 2 5 4 7 7Z" opacity=".75" />
        <path d="M37 46c7 1 15-1 21-6-4-3-10-3-14-1-3 2-5 4-7 7Z" opacity=".75" />
      </g>
    </svg>
  );
}

type LockupProps = { className?: string; tone?: 'ink' | 'ivory' };

// Full lockup: jewel, ADORN with its gold swash, and the tagline between lotus rules.
export function AdornLockup({ className, tone = 'ink' }: LockupProps) {
  const ink = tone === 'ink' ? '#120B0D' : '#FBF6EA';
  return (
    <svg className={className} viewBox="0 0 1000 980" role="img" aria-label="Adorn — The Event Company">
      <svg x="250" y="30" width="500" height="373" viewBox="0 0 740 552">
        <MarkShapes />
      </svg>
      <text x="500" y="640" textAnchor="middle" fill={ink} style={{ font: '500 232px var(--font-display), Georgia, serif', letterSpacing: '0.01em' }}>
        ADORN
      </text>
      <path d="M86 600c130-78 250-66 356-12 96 50 204 74 356 16-130 78-258 58-364 4-106-52-214-64-348-8Z" fill="#D9A441" />
      <text x="500" y="760" textAnchor="middle" fill={ink} style={{ font: '400 48px var(--font-sans), Arial, sans-serif', letterSpacing: '0.42em' }}>
        THE EVENT COMPANY
      </text>
      <path d="M210 850H442M558 850H790" fill="none" stroke="#D68A1C" strokeWidth="3" />
      <svg x="466" y="824" width="68" height="51" viewBox="0 0 64 48" color="#CA8A28">
        <LotusShapes />
      </svg>
    </svg>
  );
}

function MarkShapes() {
  return <AdornMark />;
}

function LotusShapes() {
  return <LotusMotif />;
}
