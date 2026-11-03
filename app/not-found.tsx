import Link from 'next/link';
import { AdornMark } from '@/components/brand/Logo';

export const metadata = { title: 'Page not found' };

export default function NotFound() {
  return (
    <main
      id="main"
      style={{
        minHeight: '100svh',
        display: 'grid',
        placeItems: 'center',
        padding: 'var(--gutter)',
        textAlign: 'center',
        background: 'radial-gradient(60% 60% at 50% 40%, #fffaf3, #f6e2d4)',
        color: 'var(--maroon-900)',
      }}
    >
      <div style={{ display: 'grid', justifyItems: 'center', gap: '1.4rem', maxWidth: '34rem' }}>
        <div style={{ width: '5.5rem' }}>
          <AdornMark />
        </div>
        <p className="eyebrow" style={{ color: 'var(--gold-text)' }}>
          Page not found
        </p>
        <h1 className="display" style={{ fontSize: 'var(--fs-xl)', fontWeight: 300, lineHeight: 0.95 }}>
          This path leads <em style={{ color: 'var(--red)' }}>nowhere.</em>
        </h1>
        <p className="lede" style={{ color: 'var(--ink-soft)' }}>
          The celebration is just around the corner.
        </p>
        <Link href="/" className="btn btn-saffron">
          <span>Back to the beginning</span>
        </Link>
      </div>
    </main>
  );
}
