import { getPortalTasks, getPortalWedding } from "@/features/portal/services/repository";
import { PortalHero } from "@/features/portal/components/portal-hero";
import { PortalTasks } from "@/features/portal/components/portal-tasks";
import { PortalQuickCards } from "@/features/portal/components/portal-quick-cards";

export default async function PortalHome() {
  const [wedding,tasks]=await Promise.all([getPortalWedding(),getPortalTasks()]);
  return <div className="mx-auto max-w-[1280px] space-y-6 px-5 py-6 pb-24"><PortalHero wedding={wedding}/><div className="grid gap-6 xl:grid-cols-[1fr_.9fr]"><PortalTasks tasks={tasks}/><PortalQuickCards balance={wedding.outstandingBalance}/></div></div>
}
