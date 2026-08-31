import { Plus } from "lucide-react";
import { getVenueProducts } from "../services/repository";
import type { VenueProduct } from "../types/config";
import { ProductCard } from "./product-card";

export async function ProductListPage({
  title,
  kicker,
  description,
  categories
}: {
  title: string;
  kicker: string;
  description: string;
  categories: VenueProduct["category"][];
}) {
  const products = (await getVenueProducts()).filter((item) =>
    categories.includes(item.category)
  );

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-5">
        <div>
          <div className="backstage-kicker">{kicker}</div>
          <h2 className="backstage-display mt-2 text-4xl">{title}</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-black/45">
            {description}
          </p>
        </div>
        <button className="flex items-center gap-2 rounded-xl bg-backstage-ink px-4 py-3 text-sm font-semibold text-white">
          <Plus size={16} /> Add item
        </button>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </>
  );
}
