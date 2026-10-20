"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Panel } from "@/components/ui/panel";
import { buttonClasses } from "@/components/ui/button-styles";
import { ButtonArrow } from "@/components/ui/button";
import { H2, Lede, Section } from "@/components/landing/section";
import { LEDGER } from "@/components/landing/copy";
import {
  describeEvent,
  formatClockUTC,
  type LandingEvent,
} from "@/components/landing/ledger-events";
import { createClient } from "@/lib/supabase/client";
import { useRealtimeChanges } from "@/lib/supabase/realtime";

const MAX_ROWS = 6;
const byNewest = (a: LandingEvent, b: LandingEvent) => (a.at < b.at ? 1 : a.at > b.at ? -1 : 0);
const visible = (e: LandingEvent) => describeEvent(e) !== null;

/** Feed Ledger di landing: event nyata dari server (listRecentEvents) + Supabase Realtime
 *  (hook `useRealtimeChanges` yang sudah ada). Kosong -> keadaan kosong (tanpa data contoh). */
export function LedgerPreview({ initialEvents }: { initialEvents: LandingEvent[] }) {
  const [events, setEvents] = useState(() =>
    initialEvents.filter(visible).sort(byNewest).slice(0, MAX_ROWS)
  );
  const supabase = useMemo(() => createClient(), []);
  const titles = useRef(new Map(initialEvents.map((e) => [e.jobId, e.title])));
  const alive = useRef(true);
  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
    };
  }, []);

  useRealtimeChanges("job_events", (payload) => {
    if (payload.eventType !== "INSERT") return; // event tidak pernah di-update/dihapus
    const row = payload.new;
    const known = titles.current.get(row.job_id);
    const next: LandingEvent = {
      id: row.id,
      jobId: row.job_id,
      at: row.at,
      type: row.type,
      note: row.note,
      title: known ?? "a job",
    };
    if (!visible(next)) return;
    setEvents((prev) =>
      prev.some((e) => e.id === next.id) ? prev : [next, ...prev].sort(byNewest).slice(0, MAX_ROWS)
    );
    if (known) return;
    // Payload Realtime hanya membawa job_id: ambil judulnya sekali, lalu perbarui baris itu.
    void supabase
      .from("jobs")
      .select("title")
      .eq("id", row.job_id)
      .maybeSingle()
      .then(({ data }) => {
        if (!data?.title || !alive.current) return;
        titles.current.set(row.job_id, data.title);
        setEvents((prev) =>
          prev.map((e) => (e.jobId === row.job_id && e.title === "a job" ? { ...e, title: data.title } : e))
        );
      });
  });

  const live = events.length > 0;
  const rows = live
    ? events.map((e) => {
        const line = describeEvent(e)!;
        return { key: e.id, time: formatClockUTC(e.at), ...line };
      })
    : [];

  return (
    <Section id="ledger">
      <div className="grid grid-cols-1 items-center gap-[clamp(30px,5vw,80px)] min-[1100px]:grid-cols-[0.9fr_1.1fr]">
        <div>
          <Eyebrow className="rv">{LEDGER.eyebrow}</Eyebrow>
          <H2 parts={LEDGER.title} />
          <Lede parts={LEDGER.lede} />
          <div className="rv d2 mt-[30px] flex flex-wrap gap-3">
            <Link href="/jobs" className={buttonClasses({ variant: "ghost", size: "large" })}>
              {LEDGER.cta} <ButtonArrow />
            </Link>
          </div>
        </div>

        <Panel ticks className="rv d1 min-h-[440px]">
          <div className="py-2">
            <div className="flex items-center justify-between border-b border-line-2 px-6 py-4">
              <span className="font-mono text-[10.5px] uppercase tracking-[0.24em] text-ink-3">
                Ledger · live feed · UTC
              </span>
              <span className="inline-flex items-center gap-[7px] font-mono text-[10px] uppercase tracking-[0.2em] text-ice">
                <i aria-hidden className="size-1.5 animate-beacon rounded-full bg-ice shadow-[0_0_10px_var(--color-ice)]" />
                {live ? "Streaming" : "Waiting"}
              </span>
            </div>
            {!live && (
              <p className="px-6 py-10 text-center text-[13.5px] text-ink-3">
                {LEDGER.empty}
              </p>
            )}
            <ol className="list-none">
              {rows.map((e) => (
                <li
                  key={e.key}
                  style={{ "--c": e.color } as CSSProperties}
                  className="grid grid-cols-1 gap-1.5 border-b border-line-2 px-6 py-[15px] text-[13.5px] text-ink-2 min-[560px]:grid-cols-[62px_82px_1fr] min-[560px]:gap-3.5"
                >
                  <time className="pt-0.5 font-mono text-[11px] text-ink-3">{e.time}</time>
                  <span className="self-start justify-self-start rounded-full border border-[color-mix(in_srgb,var(--c)_40%,transparent)] px-2.5 py-[3px] text-center font-mono text-[9.5px] uppercase tracking-[0.16em] text-[var(--c)] min-[560px]:w-full min-[560px]:justify-self-auto min-[560px]:px-0">
                    {e.label}
                  </span>
                  <span>{e.text}</span>
                </li>
              ))}
            </ol>
          </div>
        </Panel>
      </div>
    </Section>
  );
}
