import { ProductListPage } from "@/features/my-venue/components/product-list-page";

export default function Page() {
  return (
    <ProductListPage
      kicker="Hotel products"
      title="Accommodation"
      description="Bedroom rates, room blocks and accommodation-related products."
      categories={["accommodation"]}
    />
  );
}
