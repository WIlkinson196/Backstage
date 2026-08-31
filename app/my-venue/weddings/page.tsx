import { ProductListPage } from "@/features/my-venue/components/product-list-page";

export default function Page() {
  return (
    <ProductListPage
      kicker="Wedding packages"
      title="Weddings"
      description="Build the packages, inclusions and prices that Backstage can quote and recommend."
      categories={["wedding"]}
    />
  );
}
