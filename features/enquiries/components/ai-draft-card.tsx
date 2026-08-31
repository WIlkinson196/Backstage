import { Sparkles, Copy, Send } from "lucide-react";

export function AiDraftCard({ contactName, eventType }: { contactName: string; eventType: string }) {
  return (
    <section className="rounded-[28px] bg-[#EFE6D9] p-6">
      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[.15em] text-[#795E3D]">
        <Sparkles size={15}/> Suggested response
      </div>
      <div className="mt-4 rounded-2xl bg-[#FFFCF8] p-5 text-sm leading-7 text-black/60">
        Hi {contactName.split(" ")[0]},<br/><br/>
        Thank you for getting in touch about your {eventType.toLowerCase()}. We&apos;d love to help you explore the options available and have pulled together the most relevant next steps based on the details you&apos;ve shared.<br/><br/>
        We can also arrange a venue viewing so you can see the space and talk through the day in more detail.
      </div>
      <div className="mt-3 flex gap-2">
        <button className="flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs font-semibold"><Copy size={14}/> Copy</button>
        <button className="flex items-center gap-2 rounded-xl bg-backstage-ink px-4 py-2.5 text-xs font-semibold text-white"><Send size={14}/> Review & send</button>
      </div>
    </section>
  );
}
