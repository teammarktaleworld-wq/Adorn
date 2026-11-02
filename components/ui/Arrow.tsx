export function Arrow({ className = 'btn-arrow', direction = 'right' }: { className?: string; direction?: 'right' | 'down' | 'left' }) {
  const rotate = direction === 'down' ? 90 : direction === 'left' ? 180 : 0;
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true" style={{ transform: rotate ? `rotate(${rotate}deg)` : undefined }}>
      <path d="M4 12h15M13 6l6 6-6 6" />
    </svg>
  );
}
