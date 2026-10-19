'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { SiteMark } from '@/components/site-logo';

const SPARKS = Array.from({ length: 14 }, (_, i) => {
  const angle = (i / 14) * Math.PI * 2 + (i % 2) * 0.2;
  const dist = 130 + (i % 3) * 38;
  return { x: Math.cos(angle) * dist, y: Math.sin(angle) * dist, d: (i % 4) * 0.02 };
});

const SHOW_MS = 1700;

/** Efek "press the Sigil": cap emas menghantam layar, cincin kejut mengembang, percikan
 *  menyebar, lalu menghilang sendiri. Dipicu dengan menaikkan `trigger` (mis. counter yang
 *  di-increment setelah seal berhasil); nilai awal 0 tidak memicu apa-apa. Tidak memblokir
 *  klik (pointer-events-none) dan hanya fade sederhana bila pengguna memilih reduce-motion. */
export function SigilStamp({ trigger }: { trigger: number }) {
  const [shown, setShown] = useState(false);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (trigger <= 0) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setShown(true);
    const t = window.setTimeout(() => setShown(false), SHOW_MS);
    return () => window.clearTimeout(t);
  }, [trigger]);

  return (
    <AnimatePresence>
      {shown && (
        <motion.div
          key={trigger}
          aria-hidden
          className="pointer-events-none fixed inset-0 z-[100] grid place-items-center"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.35 } }}
        >
          {/* kilatan emas saat cap mendarat */}
          {!reduced && (
            <motion.div
              className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(214,182,118,0.35),transparent_55%)]"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 1, 0] }}
              transition={{ duration: 0.8, times: [0, 0.25, 1], delay: 0.18 }}
            />
          )}

          {/* cincin kejut */}
          {!reduced &&
            [0, 0.12].map((delay) => (
              <motion.div
                key={delay}
                className="absolute size-44 rounded-full border-2 border-gold"
                initial={{ scale: 0.4, opacity: 0 }}
                animate={{ scale: 3.2, opacity: [0, 0.9, 0] }}
                transition={{ duration: 1.1, delay: 0.2 + delay, ease: 'easeOut' }}
              />
            ))}

          {/* percikan */}
          {!reduced &&
            SPARKS.map((s, i) => (
              <motion.span
                key={i}
                className="absolute size-1.5 rounded-full bg-gold-2 shadow-[0_0_10px_2px_var(--color-gold)]"
                initial={{ x: 0, y: 0, opacity: 0, scale: 1 }}
                animate={{ x: s.x, y: s.y, opacity: [0, 1, 0], scale: [1, 1.2, 0.2] }}
                transition={{ duration: 0.9, delay: 0.22 + s.d, ease: 'easeOut' }}
              />
            ))}

          {/* cap */}
          <motion.div
            className="relative grid size-44 place-items-center rounded-full border-2 border-gold bg-bg/85 shadow-[0_0_60px_-6px_var(--color-gold)] backdrop-blur-sm"
            initial={reduced ? { opacity: 0 } : { scale: 2.4, rotate: -14, opacity: 0 }}
            animate={reduced ? { opacity: 1 } : { scale: 1, rotate: 0, opacity: 1 }}
            transition={
              reduced
                ? { duration: 0.2 }
                : { type: 'spring', stiffness: 420, damping: 22, mass: 0.9 }
            }
          >
            <span className="absolute inset-2 rounded-full border border-gold/40" />
            <SiteMark className="h-24 w-auto" />
            <span className="absolute -bottom-9 font-mono text-[11px] uppercase tracking-[0.3em] text-gold-2">
              Sigil pressed
            </span>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
