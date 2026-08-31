import type { VenueProduct } from "../types/config";
import { MoreHorizontal } from "lucide-react";

export function ProductCard({ product }: { product: VenueProduct }) {
  const price =
    product.basePrice === null
      ? "Price on request"
      : new Intl.NumberFormat("en-GB", {
          style: "currency",
          currency: "GBP"
        }).format(product.basePrice);

  return (
    <article className="backstage-panel rounded-2xl p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="backstage-display text-xl">{product.name}</div>
          <p className="mt-2 text-sm leading-6 text-black/45">{product.description}</p>
        </div>
        <button className="rounded-lg p-2 text-black/30 hover:bg-black/[0.04] hover:text-black/70">
          <MoreHorizontal size={18} />
        </button>
      </div>
      <div className="mt-5 flex items-end justify-between gap-4">
        <div>
          <div className="text-[10px] uppercase tracking-[.13em] text-black/35">From</div>
          <div className="mt-1 text-lg font-semibold">{price}</div>
        </div>
        <span className="rounded-full bg-backstage-sage px-3 py-1 text-[10px] font-semibold uppercase tracking-[.1em] text-black/60">
          Live
        </span>
      </div>
    </article>
  );
}
