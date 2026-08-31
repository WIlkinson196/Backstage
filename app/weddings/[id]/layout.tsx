import { notFound } from "next/navigation";
import { AppShell } from "@/components/navigation/app-shell";
import { getWedding } from "@/features/weddings/services/repository";
import { WeddingHero } from "@/features/weddings/components/wedding-hero";
import { WeddingWorkspaceNav } from "@/features/weddings/components/workspace-nav";

export default async function WeddingLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const wedding = await getWedding(id);
  if (!wedding) notFound();

  return (
    <AppShell>
      <div className="mx-auto max-w-[1500px] space-y-5">
        <WeddingHero wedding={wedding}/>
        <WeddingWorkspaceNav weddingId={id}/>
        {children}
      </div>
    </AppShell>
  );
}
