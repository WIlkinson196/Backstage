import { Phone, Mail, CalendarPlus, FileText, Clock3, CheckCircle2 } from "lucide-react";

const actions = [
  ["Log call", Phone],
  ["Email sent", Mail],
  ["Book viewing", CalendarPlus],
  ["Proposal sent", FileText],
  ["Follow up later", Clock3],
  ["Confirm booking", CheckCircle2]
] as const;

export function ActionCentre() {
  return (
    <div className="grid grid-cols-2 gap-2">
      {actions.map(([label, Icon]) => (
        <button key={label} className="flex items-center gap-2 rounded-xl border border-backstage-line bg-white px-3 py-3 text-left text-xs font-semibold transition hover:border-backstage-gold/40 hover:bg-[#FBF6EF]">
          <Icon size={15} className="text-backstage-gold" />
          {label}
        </button>
      ))}
    </div>
  );
}
