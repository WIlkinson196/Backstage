import { ProductListPage } from "@/features/my-venue/components/product-list-page";

export default function Page() {
  return (
    <ProductListPage
      kicker="Menus"
      title="Food & Drink"
      description="Food, drinks, evening catering and menu items used across events."
      categories={["food", "drink"]}
    />
  );
}
