// The couple as two miniature-style profiles: she faces right, he faces left, so placed side by
// side they look toward each other. Drawn as layered vector shapes.

const pearls = (cx: number, cy: number, r: number, from: number, to: number, count: number, size: number) =>
  Array.from({ length: count }, (_, i) => {
    const a = from + ((to - from) * i) / (count - 1);
    return <circle key={i} cx={cx + Math.cos(a) * r} cy={cy + Math.sin(a) * r} r={size} />;
  });

function Halo({ cx, cy, tone }: { cx: number; cy: number; tone: string }) {
  return (
    <g>
      <circle cx={cx} cy={cy} r="196" fill={tone} opacity=".55" />
      <circle cx={cx} cy={cy} r="196" fill="none" stroke="#d9b26a" strokeWidth="2" />
      <circle cx={cx} cy={cy} r="182" fill="none" stroke="#d9b26a" strokeWidth=".8" strokeDasharray="2 7" />
      {Array.from({ length: 48 }, (_, i) => {
        const a = (i / 48) * Math.PI * 2;
        return <circle key={i} cx={cx + Math.cos(a) * 210} cy={cy + Math.sin(a) * 210} r="2.2" fill="#d9b26a" opacity=".8" />;
      })}
    </g>
  );
}

export function Bride({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 600 800" role="img" aria-label="Illustrated bride in profile, wearing a red dupatta with gold border, nath, maang tikka and jhumkas">
      <defs>
        <radialGradient id="b-bg" cx=".55" cy=".4" r=".8">
          <stop offset="0" stopColor="#8a1a33" />
          <stop offset=".6" stopColor="#5b0f24" />
          <stop offset="1" stopColor="#2a0914" />
        </radialGradient>
        <linearGradient id="b-skin" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#b8734f" />
          <stop offset=".6" stopColor="#d4946a" />
          <stop offset="1" stopColor="#c27f58" />
        </linearGradient>
        <linearGradient id="b-veil" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#c0213c" />
          <stop offset=".55" stopColor="#9e1530" />
          <stop offset="1" stopColor="#6e0f22" />
        </linearGradient>
        <pattern id="b-buti" width="34" height="34" patternUnits="userSpaceOnUse" patternTransform="rotate(18)">
          <circle cx="8" cy="8" r="2.2" fill="#e8c27a" opacity=".85" />
          <path d="M25 22c3-4 7-3 6 1-1 3-4 5-6 4 2-1 2-3 0-5Z" fill="#e8c27a" opacity=".7" />
        </pattern>
        <linearGradient id="b-gold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#f6d690" />
          <stop offset=".5" stopColor="#d9a441" />
          <stop offset="1" stopColor="#9a6c1e" />
        </linearGradient>
      </defs>
      <rect width="600" height="800" fill="url(#b-bg)" />
      <Halo cx={330} cy={330} tone="#7a1430" />

      {/* hair bun at the back, with a gajra of jasmine */}
      <path d="M262 250c-60-10-110 30-112 92-2 58 44 98 104 92Z" fill="#1c0b0b" />
      <g fill="#fffaf0">{pearls(205, 342, 68, Math.PI * 0.45, Math.PI * 1.55, 16, 6)}</g>
      <g fill="#f3e2a8">{pearls(205, 342, 68, Math.PI * 0.45, Math.PI * 1.55, 16, 2)}</g>

      {/* body: shoulders and blouse */}
      <path d="M250 548c-60 20-120 70-140 252h470c-10-140-60-220-150-250-40-14-140-16-180-2Z" fill="#8c1228" />
      <path d="M250 548c40 30 110 34 168 2" fill="none" stroke="url(#b-gold)" strokeWidth="10" />
      <g fill="none" stroke="#e0b664" strokeWidth="1.6" opacity=".8">
        <path d="M190 640c40 20 90 26 150 18M170 700c60 26 140 30 240 14M160 760c70 26 170 30 300 10" />
      </g>

      {/* face and neck */}
      <path
        d="M322 236C340 250 350 275 348 296C348 302 345 308 344 312C352 330 372 344 376 356C378 364 370 368 362 366C360 372 363 376 365 381C366 385 362 387 357 388C361 390 364 393 362 396C360 401 356 402 354 404C356 410 362 418 358 424C352 434 340 438 330 440C326 470 330 520 344 562L250 566C256 520 258 470 256 440C262 418 266 398 268 380L268 300C272 262 292 240 322 236Z"
        fill="url(#b-skin)"
      />
      <path d="M330 440c-14 4-40 4-62-6" fill="none" stroke="#9a5a3a" strokeWidth="2" opacity=".5" />
      {/* ear */}
      <path d="M276 352c-12 2-14 30-2 40 8 6 14-2 12-12" fill="#c08058" stroke="#9a5a3a" strokeWidth="1.5" />
      {/* brow, eye and kohl */}
      <path d="M318 302c10-6 22-8 33-4" fill="none" stroke="#2a1410" strokeWidth="3.4" strokeLinecap="round" />
      <path d="M324 318c8-8 20-8 28-1-8 5-18 7-28 1Z" fill="#fbf2e6" />
      <path d="M340 314a5 5 0 1 0 6 6" fill="#1a0a08" />
      <path d="M316 315c8 6 20 7 36 2M318 314c6-6 18-8 34 2" fill="none" stroke="#1a0a08" strokeWidth="2.2" strokeLinecap="round" />
      <path d="M316 315l-10-5" stroke="#1a0a08" strokeWidth="2" strokeLinecap="round" />
      <path d="M326 309c8-4 16-4 24 0" fill="none" stroke="#8a4a32" strokeWidth="1.2" opacity=".7" />
      {/* lips and bindi */}
      <path d="M365 381c-2 4-5 6-8 7 3 2 5 4 5 8-4 2-8 1-11-2l-2-6c4-4 10-7 16-7Z" fill="#9c1028" />
      <circle cx="344" cy="286" r="3.4" fill="#c0213c" />
      <circle cx="344" cy="286" r="1.2" fill="#f6d690" />

      {/* veil: falls over the head and down the back */}
      <path d="M340 228C300 214 250 230 232 282C222 320 232 368 246 410C262 460 268 500 292 548C318 600 352 690 372 800H40C60 640 80 520 110 400C126 330 140 260 180 214C222 168 300 168 340 228Z" fill="url(#b-veil)" />
      <path d="M340 228C300 214 250 230 232 282C222 320 232 368 246 410C262 460 268 500 292 548C318 600 352 690 372 800H40C60 640 80 520 110 400C126 330 140 260 180 214C222 168 300 168 340 228Z" fill="url(#b-buti)" />
      {/* the veil's gold zari border along its front edge */}
      <path d="M340 228C300 214 250 230 232 282C222 320 232 368 246 410C262 460 268 500 292 548C318 600 352 690 372 800" fill="none" stroke="url(#b-gold)" strokeWidth="18" />
      <path d="M340 228C300 214 250 230 232 282C222 320 232 368 246 410C262 460 268 500 292 548C318 600 352 690 372 800" fill="none" stroke="#7a1430" strokeWidth="4" strokeDasharray="6 8" />

      {/* maang tikka */}
      <path d="M300 222c10 6 20 14 28 26" fill="none" stroke="url(#b-gold)" strokeWidth="2" />
      <circle cx="330" cy="252" r="8" fill="url(#b-gold)" />
      <circle cx="330" cy="252" r="3.4" fill="#c0213c" />
      <circle cx="330" cy="264" r="3" fill="#fffaf0" />

      {/* jhumka */}
      <circle cx="279" cy="396" r="6" fill="url(#b-gold)" />
      <path d="M266 404c0-8 26-8 26 0l6 24h-38Z" fill="url(#b-gold)" />
      <g fill="#fffaf0">{[262, 270, 279, 288, 296].map((x) => <circle key={x} cx={x} cy={433} r={3} />)}</g>
      <circle cx="279" cy="414" r="3" fill="#0b5d4b" />

      {/* nath: the bridal nose ring, chained back to the hair */}
      <circle cx="354" cy="388" r="28" fill="none" stroke="url(#b-gold)" strokeWidth="2.6" />
      <g fill="#fffaf0">{pearls(354, 388, 28, Math.PI * 0.15, Math.PI * 0.95, 8, 2.6)}</g>
      <circle cx="350" cy="416" r="4" fill="#c0213c" />
      <path d="M330 372C312 360 296 330 284 304" fill="none" stroke="url(#b-gold)" strokeWidth="1.6" />
      <g fill="#fffaf0">{[[322, 364], [312, 352], [302, 338], [294, 324]].map(([x, y]) => <circle key={x} cx={x} cy={y} r={2} />)}</g>

      {/* necklaces: a choker and a long rani haar */}
      <path d="M262 470c22 14 52 16 74 4" fill="none" stroke="url(#b-gold)" strokeWidth="10" />
      <g fill="#c0213c">{[270, 286, 302, 318].map((x, i) => <circle key={x} cx={x} cy={474 + (i === 1 || i === 2 ? 3 : 0)} r={3.6} />)}</g>
      <path d="M258 560c26 70 76 110 140 110" fill="none" stroke="url(#b-gold)" strokeWidth="3" />
      <g fill="#fffaf0">
        {Array.from({ length: 12 }, (_, i) => {
          const t = i / 11;
          const x = 258 + 140 * t;
          const y = 560 + 110 * (1 - (1 - t) * (1 - t)) - 10 * Math.sin(Math.PI * t);
          return <circle key={i} cx={x} cy={y} r={3} />;
        })}
      </g>
      <path d="M392 662l14 22-14 22-14-22Z" fill="#0b5d4b" stroke="url(#b-gold)" strokeWidth="3" />
    </svg>
  );
}

export function Groom({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 600 800" role="img" aria-label="Illustrated groom in profile, wearing a saffron safa with kalgi, a pearl sehra, an ivory sherwani and a varmala">
      <defs>
        <radialGradient id="g-bg" cx=".45" cy=".4" r=".8">
          <stop offset="0" stopColor="#14705a" />
          <stop offset=".6" stopColor="#0b5d4b" />
          <stop offset="1" stopColor="#052a22" />
        </radialGradient>
        <linearGradient id="g-skin" x1="1" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#a8664a" />
          <stop offset=".6" stopColor="#c4855f" />
          <stop offset="1" stopColor="#b17150" />
        </linearGradient>
        <linearGradient id="g-safa" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ffb347" />
          <stop offset=".5" stopColor="#f7931e" />
          <stop offset="1" stopColor="#d4620f" />
        </linearGradient>
        <linearGradient id="g-gold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#f6d690" />
          <stop offset=".5" stopColor="#d9a441" />
          <stop offset="1" stopColor="#9a6c1e" />
        </linearGradient>
        <linearGradient id="g-ivory" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fbf2dd" />
          <stop offset="1" stopColor="#e7d3a8" />
        </linearGradient>
      </defs>
      <rect width="600" height="800" fill="url(#g-bg)" />
      <Halo cx={270} cy={320} tone="#0e6b55" />

      {/* sherwani: shoulders and bandhgala collar */}
      <path d="M200 560c-90 30-130 110-140 240h480c-10-120-40-210-150-246-40-12-150-10-190 6Z" fill="url(#g-ivory)" />
      <g fill="none" stroke="#c9952f" strokeWidth="1.6" opacity=".9">
        <path d="M150 650c60 24 150 30 290 8M120 720c90 30 220 34 380 6M100 790h420" />
        <path d="M262 566v234" strokeWidth="2" />
      </g>
      <g fill="url(#g-gold)">{[600, 640, 680, 720, 760].map((y) => <circle key={y} cx={262} cy={y} r={5} />)}</g>
      <path d="M318 552c-20 10-70 12-100 2l4 30c30 10 70 8 96-2Z" fill="url(#g-ivory)" stroke="#c9952f" strokeWidth="2" />
      {/* a maroon dupatta across the shoulder */}
      <path d="M330 560c40 10 90 40 120 90 30 50 40 100 46 150h-60c-6-60-24-120-60-160-20-24-40-40-60-50Z" fill="#7a1430" />
      <path d="M330 560c40 10 90 40 120 90 30 50 40 100 46 150" fill="none" stroke="url(#g-gold)" strokeWidth="8" />

      {/* face and neck, facing left */}
      <path
        d="M276 262C258 276 250 290 252 300C252 306 255 310 256 314C246 334 226 348 222 360C220 368 230 372 238 370C240 376 236 380 234 384C232 388 236 392 240 394C236 398 236 402 240 406C238 414 232 422 236 432C242 444 256 448 270 450C274 480 272 520 262 566L348 566C344 520 342 478 344 446C340 420 336 398 334 380L332 300C328 282 304 262 276 262Z"
        fill="url(#g-skin)"
      />
      <path d="M270 450c14 4 40 4 62-8" fill="none" stroke="#8a4a32" strokeWidth="2" opacity=".5" />
      {/* ear */}
      <path d="M326 352c12 2 14 30 2 40-8 6-14-2-12-12" fill="#b9775a" stroke="#8a4a32" strokeWidth="1.5" />
      {/* brow, eye */}
      <path d="M282 304c-10-6-22-8-33-4" fill="none" stroke="#1d0f0c" strokeWidth="3.8" strokeLinecap="round" />
      <path d="M276 320c-8-8-20-8-28-1 8 5 18 7 28 1Z" fill="#f6ecdc" />
      <path d="M260 316a5 5 0 1 1-6 6" fill="#1a0a08" />
      <path d="M284 317c-8 6-20 7-36 2M282 316c-6-6-18-8-34 2" fill="none" stroke="#1a0a08" strokeWidth="2" strokeLinecap="round" />
      {/* moustache */}
      <path d="M238 374c8-2 18 0 26 4 6 4 14 4 18 0-2 8-14 12-24 8-6-2-12-6-20-12Z" fill="#1d0f0c" />
      <path d="M240 394c4-2 8-2 12 0" fill="none" stroke="#7a3a2a" strokeWidth="2" strokeLinecap="round" />

      {/* safa: the wedding turban, wound in saffron folds */}
      <path d="M256 296C240 250 252 196 300 170C350 144 420 160 438 214C450 254 432 292 400 310C370 326 330 320 300 306C286 300 270 300 256 296Z" fill="url(#g-safa)" />
      <g fill="none" stroke="#c9520c" strokeWidth="3" opacity=".75">
        <path d="M262 280C290 240 360 214 432 230" />
        <path d="M272 250C300 214 360 192 424 198" />
        <path d="M290 214C320 186 370 172 410 178" />
      </g>
      <g fill="none" stroke="#f6d690" strokeWidth="1.6" opacity=".9">
        <path d="M264 290C292 252 362 226 434 242" />
        <path d="M276 262C304 226 364 204 428 210" />
      </g>
      {/* the turban's tail falling down the back */}
      <path d="M404 300C430 360 436 460 424 600l40 4c10-150 0-250-30-320Z" fill="url(#g-safa)" />
      <path d="M424 600l40 4" stroke="url(#g-gold)" strokeWidth="6" />
      {/* kalgi: a jewelled brooch with a plume */}
      <path d="M300 214C296 170 310 130 340 104c-8 30-12 64-10 104Z" fill="#fbf2dd" />
      <path d="M302 210c2-36 14-70 34-96" fill="none" stroke="#e7d3a8" strokeWidth="1.2" />
      <circle cx="304" cy="222" r="14" fill="url(#g-gold)" />
      <circle cx="304" cy="222" r="7" fill="#c0213c" />
      <g fill="#fffaf0">{pearls(304, 222, 18, 0, Math.PI * 2, 12, 2.4).slice(0, 11)}</g>
      <circle cx="304" cy="246" r="5" fill="#0b5d4b" stroke="url(#g-gold)" strokeWidth="2" />

      {/* sehra: strands of pearls and jasmine hanging from the turban across the face */}
      <g>
        {Array.from({ length: 9 }, (_, i) => {
          const x = 232 + i * 9.5;
          const top = 286 - Math.max(0, i - 3) * 3;
          const length = 150 - Math.abs(i - 3) * 6;
          return (
            <g key={i}>
              <path d={`M${x} ${top}V${top + length}`} stroke="#f6d690" strokeWidth=".8" opacity=".8" />
              {Array.from({ length: Math.floor(length / 13) }, (_, j) => (
                <circle key={j} cx={x} cy={top + 8 + j * 13} r={j % 4 === 3 ? 3.4 : 2.4} fill={j % 4 === 3 ? '#fffaf0' : '#f3e6c4'} />
              ))}
            </g>
          );
        })}
      </g>
      <path d="M226 288C250 280 290 278 316 292" fill="none" stroke="url(#g-gold)" strokeWidth="5" />

      {/* varmala: a garland of roses and marigold */}
      <path d="M250 560c-10 60 20 130 70 160 40 24 90 20 120-8" fill="none" stroke="#0b5d4b" strokeWidth="4" />
      {Array.from({ length: 16 }, (_, i) => {
        const t = i / 15;
        const x = 250 + 190 * t - 20 * Math.sin(Math.PI * t);
        const y = 560 + 160 * Math.sin(Math.PI * t * 0.95);
        return <use key={i} href={i % 3 === 1 ? '#genda-y' : '#genda-o'} x={x - 13} y={y - 13} width="26" height="26" />;
      })}
      {Array.from({ length: 7 }, (_, i) => {
        const t = (i + 0.5) / 7;
        const x = 250 + 190 * t - 20 * Math.sin(Math.PI * t);
        const y = 560 + 160 * Math.sin(Math.PI * t * 0.95);
        return <circle key={i} cx={x} cy={y + 2} r={8} fill="#b3122e" stroke="#7a0a1c" strokeWidth="2" />;
      })}
    </svg>
  );
}
