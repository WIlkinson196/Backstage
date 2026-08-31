import { ProductListPage } from "@/features/my-venue/components/product-list-page";

export default function Page() {
  return (
    <ProductListPage
      kicker="Upsells"
      title="Décor & Extras"
      description="Décor, entertainment and optional extras that can be added to bookings."
      categories={["extra"]}
    />
  );
}
