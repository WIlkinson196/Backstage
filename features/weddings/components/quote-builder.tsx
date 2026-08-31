<<<<<<< HEAD
import type { WeddingQuote } from "@/features/weddings/types/commercial";
=======
import type { WeddingQuote } from "../types/commercial";
>>>>>>> cacf636fd431a81300b8c8cf578905e909769d03
import { Plus, Sparkles, FileText, Send, MoreHorizontal } from "lucide-react";

function money(n: number) {
  return new Intl.NumberFormat("en-GB", { style:"currency", currency:"GBP" }).format(n);
}

export function QuoteBuilder({ quote }: { quote: WeddingQuote }) {
  const subtotal = quote.lines.reduce((sum, x) => sum + x.quantity * x.unitPrice, 0);
  const total = Math.max(0, subtotal - quote.discount);

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_350px]">
      <section className="backstage-panel rounded-3xl p-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="backstage-kicker">Commercial builder</div>
            <h2 className="backstage-display mt-2 text-4xl">Wedding quote</h2>
            <div className="mt-2 text-sm text-black/40">Version {quote.version} · {quote.status}</div>
          </div>
          <div className="flex gap-2">
            <button className="inline-flex items-center gap-2 rounded-xl border border-backstage-line bg-white px-4 py-3 text-xs font-semibold"><FileText size={15}/> Preview</button>
            <button className="inline-flex items-center gap-2 rounded-xl bg-backstage-ink px-4 py-3 text-xs font-semibold text-white"><Send size={15}/> Issue quote</button>
          </div>
        </div>

        <div className="mt-7 overflow-hidden rounded-2xl border border-backstage-line">
          <div className="grid grid-cols-[1fr_70px_110px_110px_40px] gap-3 bg-backstage-cream px-4 py-3 text-[10px] font-bold uppercase tracking-[.1em] text-black/35">
            <div>Item</div><div>Qty</div><div>Unit</div><div>Total</div><div></div>
          </div>
          {quote.lines.map((line) => (
            <div key={line.id} className="grid grid-cols-[1fr_70px_110px_110px_40px] gap-3 border-t border-backstage-line px-4 py-4 text-sm">
              <div>
                <div className="font-semibold">{line.name}</div>
                <div className="mt-1 text-xs text-black/35">{line.category}{line.description ? ` · ${line.description}` : ""}</div>
              </div>
              <div>{line.quantity}</div>
              <div>{money(line.unitPrice)}</div>
              <div className="font-semibold">{money(line.quantity * line.unitPrice)}</div>
              <button className="text-black/25"><MoreHorizontal size={17}/></button>
            </div>
          ))}
          <button className="flex w-full items-center gap-2 border-t border-backstage-line px-4 py-4 text-xs font-semibold text-backstage-gold">
            <Plus size={15}/> Add item
          </button>
        </div>

        <div className="mt-6 ml-auto max-w-sm space-y-3 text-sm">
          <div className="flex justify-between text-black/45"><span>Subtotal</span><span>{money(subtotal)}</span></div>
          <div className="flex justify-between text-black/45"><span>Discount</span><span>-{money(quote.discount)}</span></div>
          <div className="flex justify-between border-t border-backstage-line pt-3 text-lg font-semibold"><span>Total</span><span>{money(total)}</span></div>
        </div>
      </section>

      <aside className="space-y-5">
        <section className="rounded-3xl bg-backstage-ink p-6 text-white">
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.14em] text-backstage-gold"><Sparkles size={14}/> Quote intelligence</div>
          <h3 className="backstage-display mt-3 text-3xl">Commercially clean.</h3>
          <div className="mt-5 space-y-3 text-sm leading-6 text-white/55">
            <p>Package and agreed extras are represented in the quote.</p>
            <p>Final guest-dependent catering can be recalculated later without rebuilding the quote.</p>
            <p>No discount is currently applied.</p>
          </div>
        </section>

        <section className="backstage-panel rounded-3xl p-5">
          <div className="backstage-kicker">Customer issue</div>
          <div className="mt-3 grid gap-3 text-sm">
            <div className="rounded-2xl bg-backstage-cream p-4"><div className="text-[10px] uppercase tracking-[.1em] text-black/30">Expires</div><div className="mt-1 font-semibold">{quote.expiresAt ?? "No expiry set"}</div></div>
            <div className="rounded-2xl bg-backstage-cream p-4"><div className="text-[10px] uppercase tracking-[.1em] text-black/30">Notes</div><div className="mt-1 text-black/55">{quote.notes ?? "No customer note."}</div></div>
          </div>
        </section>
      </aside>
    </div>
  );
}
