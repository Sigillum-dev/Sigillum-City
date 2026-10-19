"use client";

import { useEffect, useRef } from "react";
import { animate, useInView, useReducedMotion } from "motion/react";

/** Angka yang menghitung naik saat pertama masuk layar, lalu bergulir mulus ke nilai baru
 *  tiap data berubah (ganti window 24H/7D/ALL, refresh realtime). Nilai akhir sudah ada
 *  di HTML hasil SSR; animasi hanya menulis `textContent`, jadi tanpa JS / reduced-motion
 *  angkanya tetap benar dan tidak ada hydration mismatch. */
export function AnimatedNumber({
  value,
  format,
  duration = 1.2,
}: {
  value: number;
  format: (n: number) => string;
  duration?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const shown = useRef<number | null>(null); // null = belum pernah beranimasi
  const inView = useInView(ref, { once: true, margin: "0px 0px -10% 0px" });
  const reduced = useReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el || !inView || !Number.isFinite(value)) return;
    if (reduced) {
      el.textContent = format(value);
      shown.current = value;
      return;
    }
    const controls = animate(shown.current ?? 0, value, {
      duration,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => {
        shown.current = v;
        el.textContent = format(v);
      },
      onComplete: () => {
        shown.current = value;
        el.textContent = format(value);
      },
    });
    return () => controls.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- `format` biasanya fungsi inline baru tiap render
  }, [value, inView, reduced, duration]);

  return <span ref={ref}>{format(value)}</span>;
}
