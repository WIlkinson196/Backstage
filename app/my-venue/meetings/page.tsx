import { ProductListPage } from "@/features/my-venue/components/product-list-page";

export default function Page() {
  return (
    <ProductListPage
      kicker="Corporate products"
      title="Meetings & Conferences"
      description="Delegate packages, room hire, equipment and conference products."
      categories={["meeting"]}
    />
  );
}
