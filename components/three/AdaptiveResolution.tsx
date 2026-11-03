'use client';

import { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';

// Steps the pixel ratio down while frames run slow and back up when there is headroom,
// so weaker phones keep a steady frame rate.
export function AdaptiveResolution({ min = 0.75 }: { min?: number }) {
  const setDpr = useThree((state) => state.setDpr);
  const initial = useThree((state) => state.viewport.initialDpr);
  const stats = useRef({ time: 0, frames: 0, dpr: 0 });
  useFrame((_, delta) => {
    const s = stats.current;
    if (!s.dpr) s.dpr = initial;
    s.time += Math.min(delta, 0.1);
    s.frames += 1;
    if (s.frames < 45) return;
    const average = s.time / s.frames;
    s.time = 0;
    s.frames = 0;
    if (average > 1 / 40 && s.dpr > min) s.dpr = Math.max(min, s.dpr - 0.25);
    else if (average < 1 / 57 && s.dpr < initial) s.dpr = Math.min(initial, s.dpr + 0.25);
    else return;
    setDpr(s.dpr);
  });
  return null;
}
