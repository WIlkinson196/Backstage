import { AppShell } from "@/components/navigation/app-shell";
import { getCurrentVenueContext } from "@/features/platform/services/context";
import { WeddingsCommandCentre } from "@/features/weddings/components/weddings-command-centre";
import { getWeddings } from "@/features/weddings/services/repository";

export default async function WeddingsPage() {
  const [weddings, context] = await Promise.all([getWeddings(), getCurrentVenueContext()]);
  return <AppShell><WeddingsCommandCentre weddings={weddings} demoMode={!context || context.demoMode}/></AppShell>;
}
