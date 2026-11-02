// Small emblem drawings for the services index.
type Props = { className?: string };

export function MotifMandap({ className }: Props) {
  return (
    <svg className={className} viewBox="0 0 120 120" aria-hidden="true">
      <g fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
        <path d="M20 100V46M100 100V46M14 46h92" />
        <path d="M24 46c0-20 16-34 36-34s36 14 36 34" />
        <path d="M60 12V4" />
        <circle cx="60" cy="4" r="2.4" />
        <path d="M30 46v20M40 46v14M50 46v24M60 46v14M70 46v24M80 46v14M90 46v20" strokeDasharray="1 5" />
        <path d="M10 106h100" />
        <path d="M52 100c2-10 6-14 8-20 2 6 6 10 8 20Z" />
      </g>
    </svg>
  );
}

export function MotifHenna({ className }: Props) {
  return (
    <svg className={className} viewBox="0 0 120 120" aria-hidden="true">
      <g fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
        <circle cx="60" cy="60" r="14" />
        <circle cx="60" cy="60" r="5" />
        {Array.from({ length: 8 }, (_, i) => (
          <path key={i} d="M60 46c-6-8-6-18 0-26 6 8 6 18 0 26Z" transform={`rotate(${i * 45} 60 60)`} />
        ))}
        <circle cx="60" cy="60" r="42" strokeDasharray="2 6" />
      </g>
    </svg>
  );
}

export function MotifRings({ className }: Props) {
  return (
    <svg className={className} viewBox="0 0 120 120" aria-hidden="true">
      <g fill="none" stroke="currentColor" strokeWidth="2.6">
        <circle cx="46" cy="68" r="26" />
        <circle cx="74" cy="68" r="26" />
        <path d="M40 42l6-12 6 12" strokeLinejoin="round" />
      </g>
    </svg>
  );
}

export function MotifBalloons({ className }: Props) {
  return (
    <svg className={className} viewBox="0 0 120 120" aria-hidden="true">
      <g fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
        <ellipse cx="44" cy="40" rx="18" ry="22" />
        <ellipse cx="78" cy="46" rx="16" ry="20" />
        <path d="M44 62c-4 14 6 24 14 46M78 66c2 14-8 26-20 42" />
        <path d="M40 62h8M74 66h8" />
      </g>
    </svg>
  );
}

export function MotifDiya({ className }: Props) {
  return (
    <svg className={className} viewBox="0 0 120 120" aria-hidden="true">
      <g fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
        <path d="M60 18c10 14 12 24 6 34-3 4-9 4-12 0-6-10-4-20 6-34Z" />
        <path d="M18 70c10 22 74 22 84 0" />
        <path d="M18 70h84" />
        <path d="M40 92l-4 12h48l-4-12" />
      </g>
    </svg>
  );
}

export function MotifLantern({ className }: Props) {
  return (
    <svg className={className} viewBox="0 0 120 120" aria-hidden="true">
      <g fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinejoin="round">
        <path d="M60 6v14" />
        <path d="M60 20l26 20-10 40H44L34 40Z" />
        <path d="M34 40h52M44 80l16-60 16 60" />
        <path d="M52 80v22M60 80v28M68 80v22" strokeLinecap="round" />
      </g>
    </svg>
  );
}
