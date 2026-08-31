import { getRunningOrder } from "@/features/weddings/services/operations-repository";
import { RunningOrderBoard } from "@/features/weddings/components/running-order-board";
import { Sparkles } from "lucide-react";

export default async function RunningOrderPage({ params }: { params: Promise<{ id:string }> }) {
  const { id } = await params;
  const items = await getRunningOrder(id);
  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_350px]">
      <section>
        <div className="backstage-panel rounded-3xl p-7">
          <div className="backstage-kicker">Event day</div>
          <h2 className="backstage-display mt-2 text-4xl">Operational Running Order</h2>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-black/45">
            A staff-facing sequence: what happens, when, where, who owns it and what the team needs to know.
          </p>
        </div>
        <div className="mt-5"><RunningOrderBoard items={items}/></div>
      </section>
      <aside className="rounded-3xl bg-backstage-ink p-6 text-white">
        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.14em] text-backstage-gold"><Sparkles size={14}/> Operations intelligence</div>
        <h3 className="backstage-display mt-3 text-3xl">Three moments need attention.</h3>
        <p className="mt-3 text-sm leading-6 text-white/50">
          Ceremony music, final dietary information and one supplier confirmation remain unresolved and affect the running order.
        </p>
      </aside>
    </div>
  );
}
