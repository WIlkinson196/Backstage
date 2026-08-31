import { Sparkles } from "lucide-react";

export function AiScore({ score }: { score: number }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-backstage-gold/25 bg-[#F5ECE0] px-3 py-1.5 text-xs font-semibold text-[#765B39]">
      <Sparkles size={13} />
      {score}/100
    </div>
  );
}
