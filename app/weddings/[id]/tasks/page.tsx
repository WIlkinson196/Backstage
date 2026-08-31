import { getWeddingTasks } from "@/features/weddings/services/repository";
import { WeddingTaskList } from "@/features/weddings/components/task-list";

export default async function TasksPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const tasks = await getWeddingTasks(id);
  return (
    <section className="backstage-panel rounded-3xl p-6">
      <div className="backstage-kicker">Wedding workflow</div>
      <h2 className="backstage-display mt-2 text-4xl">Tasks & milestones</h2>
      <p className="mt-2 max-w-2xl text-sm text-black/45">Milestones are generated around the booking and wedding dates rather than relying on memory.</p>
      <div className="mt-6"><WeddingTaskList tasks={tasks}/></div>
    </section>
  );
}
