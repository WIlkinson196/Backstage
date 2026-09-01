import { AppShell } from "@/components/navigation/app-shell";
import { FunctionsCommandCentre } from "@/features/events/components/functions-command-centre";
import { getEventsWorkspace } from "@/features/events/services/repository";

export default async function EventsPage() {
  const data = await getEventsWorkspace();
  return <AppShell><FunctionsCommandCentre data={data}/></AppShell>;
}
