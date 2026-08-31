import type { PricingCatalogueItem } from "@/features/weddings/types/commercial";
import { Search, Plus, Building2 } from "lucide-react";

function priceLabel(item: PricingCatalogueItem) {
  const price = new Intl.NumberFormat("en-GB", { style:"currency", currency:"GBP" }).format(item.price);
  if (item.priceType === "per_person") return `${price} pp`;
  if (item.priceType === "per_table") return `${price} / table`;
  if (item.priceType === "per_room") return `${price} / room`;
  if (item.priceType === "from") return `From ${price}`;
  return price;
}

export function PricingCatalogue({ items }: { items: PricingCatalogueItem[] }) {
  const categories = Array.from(new Set(items.map(x => x.category)));

  return (
    <div className="space-y-6">
      <section className="backstage-panel rounded-3xl p-5">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex min-w-[240px] flex-1 items-center gap-2 rounded-xl border border-backstage-line bg-white px-4 py-3">
            <Search size={15} className="text-black/30"/>
            <input className="w-full bg-transparent text-sm outline-none" placeholder="Search venue pricing..." />
          </div>
          <div className="inline-flex items-center gap-2 rounded-xl bg-[#F2E9DC] px-4 py-3 text-xs font-semibold text-[#745A39]"><Building2 size={15}/> Sourced from My Venue</div>
        </div>
      </section>

      {categories.map(category => (
        <section key={category} className="backstage-panel rounded-3xl p-6">
          <div className="backstage-kicker">{category}</div>
          <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {items.filter(x => x.category === category).map(item => (
              <article key={item.id} className="rounded-2xl border border-backstage-line bg-[#FFFCF8] p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="backstage-display text-xl">{item.name}</div>
                    <p className="mt-2 text-xs leading-5 text-black/40">{item.description}</p>
                  </div>
                  <button className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-backstage-ink text-white"><Plus size={15}/></button>
                </div>
                <div className="mt-5 text-sm font-semibold">{priceLabel(item)}</div>
              </article>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
