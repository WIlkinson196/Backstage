import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";
import { MobileNav } from "./mobile-nav";
import { getCurrentVenueContext } from "@/features/platform/services/context";

export async function AppShell({ children }: { children: React.ReactNode }) {
  const context = await getCurrentVenueContext();
  return (
    <div className="min-h-screen bg-backstage-cream">
      <Sidebar context={context} />
      <div className="lg:pl-64">
        <Topbar context={context} />
        <main className="p-4 pb-24 sm:p-6 sm:pb-24 lg:p-8 lg:pb-8">{children}</main>
      </div>
      <MobileNav />
    </div>
  );
}
