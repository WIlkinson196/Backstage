export default function Page() {
  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
      <section className="backstage-panel rounded-3xl p-7">
        <div className="backstage-kicker">Event day</div>
        <h2 className="backstage-display mt-2 text-4xl">Running Order</h2>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-black/45">Turn the recorded plan into a timed, operational sequence for the venue team.</p>
        <div className="mt-7 rounded-3xl border border-dashed border-backstage-line bg-backstage-cream p-8">
          <div className="text-sm font-semibold">Dedicated Backstage module boundary created.</div>
          <p className="mt-2 text-sm leading-6 text-black/40">
            This area is intentionally isolated so we can now build the full workflow without affecting the rest of the wedding workspace.
          </p>
        </div>
      </section>
      <aside className="rounded-3xl bg-backstage-ink p-6 text-white">
        <div className="text-[10px] font-bold uppercase tracking-[.14em] text-backstage-gold">Backstage Intelligence</div>
        <div className="mt-3 backstage-display text-3xl">AI will read the same wedding record.</div>
        <p className="mt-3 text-sm leading-6 text-white/50">
          No duplicate data entry: this module will consume the shared planning, pricing, guest and operational data.
        </p>
      </aside>
    </div>
  );
}
