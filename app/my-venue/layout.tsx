import { AppShell } from "@/components/navigation/app-shell";
import { MyVenueHeader } from "@/features/my-venue/components/my-venue-header";
import { MyVenueSectionNav } from "@/features/my-venue/components/section-nav";

export default function MyVenueLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <AppShell>
      <div className="mx-auto max-w-[1500px]">
        <MyVenueHeader />
        <div className="mt-6">
          <MyVenueSectionNav />
        </div>
        <div className="mt-7">{children}</div>
      </div>
    </AppShell>
  );
}
