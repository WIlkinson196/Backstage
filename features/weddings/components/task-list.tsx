<<<<<<< HEAD
import type { WeddingTask } from "@/features/weddings/types/wedding";
=======
import type { WeddingTask } from "../types/wedding";
>>>>>>> cacf636fd431a81300b8c8cf578905e909769d03
import { CheckCircle2, Circle } from "lucide-react";

export function WeddingTaskList({ tasks }: { tasks: WeddingTask[] }) {
  return (
    <div className="divide-y divide-backstage-line">
      {tasks.map((task) => (
        <div key={task.id} className="grid gap-3 py-4 md:grid-cols-[32px_1fr_130px_100px] md:items-center">
          <div>{task.completed ? <CheckCircle2 size={18} className="text-[#5B7A61]"/> : <Circle size={18} className="text-black/20"/>}</div>
          <div>
            <div className={`text-sm font-semibold ${task.completed ? "text-black/35 line-through" : ""}`}>{task.title}</div>
            <div className="mt-1 text-[10px] uppercase tracking-[.1em] text-backstage-gold">{task.category}</div>
          </div>
          <div className="text-xs text-black/40">{task.dueDate}</div>
          <div className={`w-fit rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[.08em] ${task.priority === "High" ? "bg-backstage-blush text-[#7B5053]" : "bg-backstage-blue text-[#40516A]"}`}>{task.priority}</div>
        </div>
      ))}
    </div>
  );
}
