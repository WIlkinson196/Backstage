import { ProductListPage } from "@/features/my-venue/components/product-list-page";

export default function Page() {
  return (
    <ProductListPage
      kicker="Private events"
      title="Private Events"
      description="Birthdays, wakes, anniversaries and celebration products."
      categories={["private_event"]}
    />
  );
}
