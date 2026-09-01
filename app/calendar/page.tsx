import { AppShell } from "@/components/navigation/app-shell";
import { CalendarWorkspace } from "@/features/calendar/components/calendar-workspace";
import { getCalendarWorkspace } from "@/features/calendar/services/repository";

export default async function CalendarPage() {
  const data = await getCalendarWorkspace();
  return <AppShell><CalendarWorkspace data={data}/></AppShell>;
}

