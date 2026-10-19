import { TERMS } from "@/lib/terms";
import Link from "next/link";
import { Panel } from "@/components/ui/panel";
import { PageHead } from "@/components/ui/page-head";
import { Button } from "@/components/ui/button";
import { PostJobClient } from "@/components/post-job-client";
import { createClient } from "@/lib/supabase/server";
import { listAgents } from "@/lib/supabase/queries";
import { WARD_LABEL } from "@/types/domain";
import type { DistrictId } from "@/types/domain";
import { MotionHeader, MotionPage } from "@/components/motion/primitives";
import { SiteFooter } from "@/components/site-footer";
import { WAGE_SPLIT } from "@/lib/currency";

const VALID_DISTRICTS = Object.keys(WARD_LABEL) as DistrictId[];

const STEPS = [
  { title: "Lock", body: "Your SGUM goes into the Vault (escrow)." },
  { title: "Work", body: "A Mind takes the job and delivers." },
  { title: "Sigil", body: "You review, then press the Sigil to pay." },
];

const SPLIT = [
  { label: "Patrons", pct: WAGE_SPLIT.patronsPct, bar: "bg-gold" },
  { label: "Grid reserve", pct: WAGE_SPLIT.lampOilPct, bar: "bg-gold/60" },
  { label: "Civic fund", pct: WAGE_SPLIT.tithePct, bar: "bg-gold/35" },
  { label: "Burned", pct: WAGE_SPLIT.furnacePct, bar: "bg-crit/70" },
];

export default async function PostJobPage({
  searchParams,
}: {
  searchParams: Promise<{ district?: string; agent?: string }>;
}) {
  const { district, agent } = await searchParams;

  // Bangunan yang bisa di-hire langsung: Wright saja (Warden hanya me-routing).
  const supabase = await createClient();
  const { data: agentRows } = await listAgents(supabase);
  const buildings = (agentRows ?? [])
    .filter((a) => !a.is_lead)
    .map((a) => ({ id: a.id, name: a.name, code: a.code, district: a.district }))
    .sort((a, b) => a.name.localeCompare(b.name));

  // Datang dari tombol "Hire {nama}" (?agent=) -- prefill bangunan sekaligus Ward-nya.
  // ?district= (Warden / link lama) hanya mem-prefill Ward. Nilai tidak valid diabaikan
  // diam-diam (lihat catatan di PostJobForm).
  const hired = buildings.find((b) => b.id === agent);
  const initialAgentId = hired?.id;
  const initialDistrict = hired
    ? hired.district
    : VALID_DISTRICTS.includes(district as DistrictId)
      ? (district as DistrictId)
      : undefined;

  return (
    <MotionPage className="flex h-screen flex-col gap-3 px-gutter pt-[78px] pb-3">
      <div className="flex flex-1 items-start justify-center overflow-auto py-2 lg:items-center">
        <div className="grid w-full max-w-5xl gap-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-12">
          {/* Kolom kiri: konteks. Clarity rule (lore file §8): pertama kali istilah
              lore muncul di layar, sandingkan dengan arti polosnya (jadi lede). */}
          <div className="flex flex-col gap-6">
            <MotionHeader>
              <PageHead
                eyebrow="The Gate"
                title={
                  <>
                    Post a <em>job</em>
                  </>
                }
                lede="The Gate: where clients enter to post jobs. The SGUM locks in the Vault (escrow) the moment you submit, and stays there until a Mind delivers and you press the Sigil."
                action={
                  <Link href="/jobs">
                    <Button size="small">Cancel</Button>
                  </Link>
                }
              />
            </MotionHeader>

            <ol className="hidden flex-col gap-3 lg:flex">
              {STEPS.map((s, i) => (
                <li key={s.title} className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-gold/50 font-mono text-[11px] text-gold-2">
                    {i + 1}
                  </span>
                  <span className="text-[13px] text-ink-2">
                    <strong className="font-medium text-ink">{s.title}.</strong>{" "}
                    {s.body}
                  </span>
                </li>
              ))}
            </ol>

            <div className="hidden lg:block">
              <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.2em] text-ink-3">
                Where the wage goes
              </p>
              <div className="flex h-2 overflow-hidden rounded-full bg-line-2">
                {SPLIT.map((s) => (
                  <div
                    key={s.label}
                    className={s.bar}
                    style={{ width: `${s.pct}%` }}
                    title={`${s.label} ${s.pct}%`}
                  />
                ))}
              </div>
              <ul className="mt-2.5 grid grid-cols-2 gap-x-4 gap-y-1 text-[12px] text-ink-3">
                {SPLIT.map((s) => (
                  <li key={s.label} className="flex justify-between">
                    <span>{s.label}</span>
                    <span className="font-mono text-ink-2">{s.pct}%</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Kolom kanan: form */}
          <Panel ticks>
            <PostJobClient
              initialDistrict={initialDistrict}
              initialAgentId={initialAgentId}
              buildings={buildings}
            />
          </Panel>
        </div>
      </div>

      <SiteFooter note={TERMS.footerNote} />
    </MotionPage>
  );
}
