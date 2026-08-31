import { Building2, Sparkles } from "lucide-react";

export function MyVenueHeader() {
  return (
    <section className="overflow-hidden rounded-3xl bg-backstage-ink text-white">
      <div className="grid min-h-[280px] lg:grid-cols-[1.2fr_.8fr]">
        <div className="p-8 lg:p-10">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[.16em] text-backstage-gold">
            <Building2 size={15} />
            My Venue
          </div>
          <h1 className="backstage-display mt-4 max-w-3xl text-4xl leading-tight md:text-5xl">
            The commercial brain of your venue.
          </h1>
          <p className="mt-5 max-w-2xl text-sm leading-6 text-white/60">
            Configure what you sell, how you price it, what your spaces can do,
            what your policies say and what Backstage is allowed to automate.
          </p>
          <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-backstage-gold/25 bg-white/[0.04] px-4 py-2 text-xs text-white/70">
            <Sparkles size={14} className="text-backstage-gold" />
            Backstage Intelligence reads from this knowledge layer.
          </div>
        </div>
        <div className="relative min-h-64 overflow-hidden bg-[radial-gradient(circle_at_70%_35%,rgba(182,145,93,.42),transparent_24%),radial-gradient(circle_at_35%_70%,rgba(255,255,255,.08),transparent_22%),linear-gradient(145deg,#203143,#101822)]">
          <div className="absolute bottom-8 right-8 rounded-3xl border border-white/10 bg-black/15 p-5 backdrop-blur">
            <div className="text-[10px] uppercase tracking-[.15em] text-white/40">Configuration status</div>
            <div className="mt-2 backstage-display text-3xl">72%</div>
            <div className="mt-1 text-xs text-white/50">8 areas configured</div>
          </div>
        </div>
      </div>
    </section>
  );
}
