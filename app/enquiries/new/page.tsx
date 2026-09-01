import Link from "next/link";
import { ArrowLeft, Sparkles } from "lucide-react";
import { AppShell } from "@/components/navigation/app-shell";
import { EnquiryForm } from "./enquiry-form";

export default function NewEnquiryPage() {
  return (
    <AppShell>
      <div className="mx-auto max-w-5xl space-y-6">
        <Link href="/enquiries" className="inline-flex items-center gap-2 text-xs font-semibold text-black/45 hover:text-black"><ArrowLeft size={14}/> Back to enquiries</Link>
        <section className="backstage-panel rounded-[30px] p-6 sm:p-9">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[.14em] text-backstage-gold"><Sparkles size={14}/> Functional sales workflow</div>
          <h1 className="backstage-display mt-3 text-5xl">New enquiry</h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-black/45">Create the contact and sales opportunity together. Backstage assigns it to your current venue and records the activity automatically.</p>
          <div className="mt-8"><EnquiryForm/></div>
        </section>
      </div>
    </AppShell>
  );
}

