import { notFound } from "next/navigation";
import { AppShell } from "@/components/navigation/app-shell";
import { FunctionWorkspace } from "@/features/events/components/function-workspace";
import { getEventsWorkspace } from "@/features/events/services/repository";

export default async function EventPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await getEventsWorkspace();
  if (!data.events.some((event) => event.id === id)) notFound();
  return <AppShell><FunctionWorkspace data={data} eventId={id}/></AppShell>;
}
