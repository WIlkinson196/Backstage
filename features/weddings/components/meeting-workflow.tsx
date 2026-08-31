<<<<<<< HEAD
import type { PlanningSection } from "@/features/weddings/types/commercial";
=======
import type { PlanningSection } from "../types/commercial";
>>>>>>> cacf636fd431a81300b8c8cf578905e909769d03
import { CheckCircle2, Circle, LockKeyhole } from "lucide-react";

const steps = [
  {name:"First Meeting", detail:"Shape the day", complete:true},
  {name:"Halfway Meeting", detail:"Turn ideas into selections", complete:true},
  {name:"Final Meeting", detail:"Lock the operation", complete:false}
];

export function MeetingWorkflow({ sections }: { sections: PlanningSection[] }) {
  const completeFields = sections.flatMap(s=>s.fields).filter(f=>f.status==="complete").length;
  const totalFields = sections.flatMap(s=>s.fields).length;

  return (
    <section className="backstage-panel rounded-3xl p-6">
      <div className="backstage-kicker">Guided journey</div>
      <h2 className="backstage-display mt-2 text-3xl">Meeting workflow</h2>
      <div className="mt-6 grid gap-3 md:grid-cols-3">
        {steps.map((step,index)=>(
          <div key={step.name} className={`rounded-2xl border p-4 ${index===2 ? "border-backstage-gold bg-[#FBF4EA]" : "border-backstage-line bg-[#FFFCF8]"}`}>
            <div className="flex items-center justify-between">
              {step.complete ? <CheckCircle2 size={18} className="text-[#5B7A61]"/> : <Circle size={18} className="text-backstage-gold"/>}
              {index===2 && <LockKeyhole size={15} className="text-backstage-gold"/>}
            </div>
            <div className="mt-4 font-semibold">{step.name}</div>
            <div className="mt-1 text-xs text-black/40">{step.detail}</div>
          </div>
        ))}
      </div>
      <div className="mt-5 rounded-2xl bg-backstage-cream p-4 text-sm">
        <span className="font-semibold">{completeFields}/{totalFields}</span>
        <span className="ml-2 text-black/40">tracked planning fields currently complete.</span>
      </div>
    </section>
  );
}
