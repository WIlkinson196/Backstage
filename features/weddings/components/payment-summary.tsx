import type { WeddingPayment, WeddingRecord } from "../types/wedding";
import { CheckCircle2, Clock3 } from "lucide-react";

export function PaymentSummary({ wedding, payments }: { wedding: WeddingRecord; payments: WeddingPayment[] }) {
  const outstanding = Math.max(0, wedding.quotedValue - wedding.paidValue);
  return (
    <div className="grid gap-5 xl:grid-cols-[.7fr_1.3fr]">
      <section className="rounded-3xl bg-backstage-ink p-6 text-white">
        <div className="text-[10px] font-bold uppercase tracking-[.14em] text-backstage-gold">Financial position</div>
        <div className="mt-4 backstage-display text-4xl">£{outstanding.toLocaleString("en-GB")}</div>
        <div className="mt-1 text-xs text-white/40">outstanding</div>
        <div className="mt-6 grid grid-cols-2 gap-3 text-xs">
          <div className="rounded-2xl border border-white/10 bg-white/[.04] p-3"><div className="text-white/35">Quoted</div><div className="mt-1 font-semibold">£{wedding.quotedValue.toLocaleString("en-GB")}</div></div>
          <div className="rounded-2xl border border-white/10 bg-white/[.04] p-3"><div className="text-white/35">Paid</div><div className="mt-1 font-semibold">£{wedding.paidValue.toLocaleString("en-GB")}</div></div>
        </div>
      </section>
      <section className="backstage-panel rounded-3xl p-6">
        <div className="backstage-kicker">Payment schedule</div>
        <div className="mt-4 divide-y divide-backstage-line">
          {payments.map((p) => (
            <div key={p.id} className="grid gap-3 py-4 md:grid-cols-[1fr_120px_120px] md:items-center">
              <div className="flex items-center gap-3">
                {p.status === "paid" ? <CheckCircle2 size={17} className="text-[#5B7A61]"/> : <Clock3 size={17} className="text-backstage-gold"/>}
                <div>
                  <div className="text-sm font-semibold">{p.label}</div>
                  <div className="mt-1 text-xs text-black/35">{p.paidDate ? `Paid ${p.paidDate}` : `Due ${p.dueDate ?? "TBC"}`}</div>
                </div>
              </div>
              <div className="text-sm font-semibold">£{p.amount.toLocaleString("en-GB")}</div>
              <div className="text-xs capitalize text-black/40">{p.status}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
