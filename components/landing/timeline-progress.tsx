"use client";

import { useRef } from "react";
import { motion, useScroll, useSpring, useTransform } from "motion/react";

/** Garis emas yang "menggambar" dirinya sepanjang timeline Protocol seiring scroll
 *  (hanya tampil saat 6 kolom sebaris). Progres terikat ke posisi garis di viewport:
 *  mulai terisi saat garis naik ke 90% tinggi layar, penuh saat mencapai 45%.
 *  `reducedMotion="user"` di MotionProvider tidak menyentuh useScroll, jadi dicek manual
 *  lewat CSS (`motion-reduce:hidden`): pengguna reduce-motion tetap melihat garis statis. */
export function TimelineProgress() {
  const ref = useRef<HTMLSpanElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 90%", "start 45%"],
  });
  const smooth = useSpring(scrollYProgress, { stiffness: 120, damping: 24, mass: 0.4 });
  const headLeft = useTransform(smooth, (v) => `${v * 100}%`);

  return (
    <span
      ref={ref}
      aria-hidden
      className="pointer-events-none absolute inset-x-0 top-[21px] hidden h-px min-[1100px]:block motion-reduce:hidden"
    >
      <motion.span
        className="absolute inset-y-0 left-0 h-[2px] w-full origin-left -translate-y-1/2 bg-gold shadow-[0_0_10px_var(--color-gold)]"
        style={{ scaleX: smooth }}
      />
      <motion.span
        className="absolute top-0 size-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gold-2 shadow-[0_0_14px_2px_var(--color-gold)]"
        style={{ left: headLeft }}
      />
    </span>
  );
}
