import { notFound } from "next/navigation";
import { getWedding } from "@/features/weddings/services/repository";
import { getPostEventRecord, getPostEventTasks, getPostEventTouchpoints } from "@/features/weddings/services/post-event-repository";
import { PostEventCommandCentre } from "@/features/weddings/components/post-event-command-centre";

export default async function PostEventPage({ params }: { params: Promise<{ id:string }> }) {
  const { id } = await params;
  const [wedding, record, tasks, touchpoints] = await Promise.all([
    getWedding(id),
    getPostEventRecord(id),
    getPostEventTasks(id),
    getPostEventTouchpoints(id)
  ]);

  if (!wedding) notFound();

  return <PostEventCommandCentre wedding={wedding} initialRecord={record} initialTasks={tasks} touchpoints={touchpoints}/>;
}
