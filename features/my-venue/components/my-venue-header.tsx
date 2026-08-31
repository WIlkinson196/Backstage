import { Building2, Sparkles } from "lucide-react";

export function MyVenueHeader() {
  return (
    <section className="backstage-photo relative min-h-[340px] overflow-hidden rounded-[32px] text-white shadow-soft">
      <div className="absolute inset-0 bg-gradient-to-r from-[#0C151F]/85 via-[#0C151F]/50 to-transparent" />
      <div className="relative grid min-h-[340px] lg:grid-cols-[1.25fr_.75fr]">
        <div className="flex flex-col justify-center p-8 lg:p-10">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[.17em] text-[#E2C69D]">
            <Building2 size={15}/> My Venue
          </div>
          <h1 className="backstage-display mt-4 max-w-3xl text-4xl leading-[1.04] md:text-5xl">
            Everything Backstage needs to understand your venue.
          </h1>
          <p className="mt-5 max-w-2xl text-sm leading-6 text-white/65">
            Your spaces, packages, menus, prices, policies and commercial rules become a single knowledge layer used throughout sales, planning, operations and AI.
          </p>
        </div>
        <div className="flex items-end justify-end p-7 lg:p-10">
          <div className="backstage-glass w-full max-w-xs rounded-2xl p-5">
            <div className="flex items-center gap-2 text-xs text-[#E2C69D]"><Sparkles size={14}/> Venue knowledge</div>
            <div className="mt-3 flex items-end justify-between">
              <div>
                <div className="backstage-display text-4xl">72%</div>
                <div className="mt-1 text-xs text-white/45">configuration complete</div>
              </div>
              <div className="h-12 w-12 rounded-full border-[3px] border-[#D7B985] border-r-white/15"/>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
