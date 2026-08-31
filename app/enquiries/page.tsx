import { AppShell } from "@/components/navigation/app-shell";
import { getEnquiries } from "@/features/enquiries/services/repository";
import { PipelineBoard } from "@/features/enquiries/components/pipeline-board";
import { IntelligencePanel } from "@/features/enquiries/components/intelligence-panel";
import { Plus, Phone, Search, SlidersHorizontal } from "lucide-react";

export default async function EnquiriesPage() {
  const enquiries = await getEnquiries();
  const pipelineValue = enquiries
    .filter((item) => !["lost", "confirmed"].includes(item.stage))
    .reduce((sum, item) => sum + item.estimatedValue, 0);
  const due = enquiries.filter((item) => item.nextActionDate <= "2026-09-01").length;
  const hot = enquiries.filter((item) => item.priority === "hot").length;

  return (
    <AppShell>
      <div className="mx-auto max-w-[1700px] space-y-6">
        <section className="backstage-conference-photo relative min-h-[330px] overflow-hidden rounded-[32px] text-white">
          <div className="absolute inset-0 bg-gradient-to-r from-[#0B141E]/88 via-[#0B141E]/55 to-transparent" />
          <div className="relative flex min-h-[330px] flex-col justify-between p-7 md:p-9">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-[.2em] text-[#E2C69D]">Sales workspace</div>
              <h1 className="backstage-display mt-3 text-5xl md:text-6xl">Enquiries</h1>
              <p className="mt-4 max-w-2xl text-sm leading-6 text-white/65">
                Every lead, next action and buying signal in one working pipeline.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <div className="backstage-glass rounded-2xl px-4 py-3"><div className="text-[10px] uppercase tracking-[.12em] text-white/40">Live pipeline</div><div className="mt-1 text-xl font-semibold">£{pipelineValue.toLocaleString("en-GB")}</div></div>
              <div className="backstage-glass rounded-2xl px-4 py-3"><div className="text-[10px] uppercase tracking-[.12em] text-white/40">Needs action</div><div className="mt-1 text-xl font-semibold">{due}</div></div>
              <div className="backstage-glass rounded-2xl px-4 py-3"><div className="text-[10px] uppercase tracking-[.12em] text-white/40">Hot opportunities</div><div className="mt-1 text-xl font-semibold">{hot}</div></div>
            </div>
          </div>
        </section>

        <div className="grid gap-4 xl:grid-cols-[1fr_360px]">
          <div className="backstage-panel rounded-[28px] p-4">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex min-w-[240px] flex-1 items-center gap-2 rounded-xl border border-backstage-line bg-white px-4 py-3">
                <Search size={15} className="text-black/30"/>
                <input className="w-full bg-transparent text-sm outline-none" placeholder="Search enquiries..." />
              </div>
              <button className="flex items-center gap-2 rounded-xl border border-backstage-line bg-white px-4 py-3 text-xs font-semibold"><SlidersHorizontal size={15}/> Filters</button>
              <button className="flex items-center gap-2 rounded-xl border border-backstage-line bg-white px-4 py-3 text-xs font-semibold"><Phone size={15}/> Start calls</button>
              <button className="flex items-center gap-2 rounded-xl bg-backstage-ink px-4 py-3 text-xs font-semibold text-white"><Plus size={15}/> New enquiry</button>
            </div>
          </div>
          <div className="hidden xl:block" />
        </div>

        <div className="grid gap-6 2xl:grid-cols-[1fr_360px]">
          <div className="min-w-0">
            <PipelineBoard enquiries={enquiries} />
          </div>
          <IntelligencePanel />
        </div>
      </div>
    </AppShell>
  );
}
