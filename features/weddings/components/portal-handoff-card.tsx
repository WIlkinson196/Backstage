import { Smartphone, ArrowRight, CheckCircle2 } from "lucide-react";

export function PortalHandoffCard() {
  return (
    <section className="rounded-3xl bg-[#EFE6D9] p-6">
      <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.14em] text-[#795E3D]"><Smartphone size={14}/> Customer Portal handoff</div>
      <h2 className="backstage-display mt-3 text-3xl">Let the couple maintain guest details — without losing control.</h2>
      <p className="mt-3 max-w-3xl text-sm leading-6 text-black/50">
        The portal can later collect names, RSVPs, meal choices and dietary requirements into the same structured guest records used by the venue team.
      </p>
      <div className="mt-5 flex flex-wrap gap-2 text-xs">
        {["Guest names","RSVPs","Menu choices","Dietaries","Accessibility"].map(x => (
          <span key={x} className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-2 font-semibold"><CheckCircle2 size={13} className="text-[#5B7A61]"/>{x}</span>
        ))}
      </div>
      <button className="mt-5 inline-flex items-center gap-2 text-sm font-semibold">Portal architecture prepared <ArrowRight size={15}/></button>
    </section>
  );
}
