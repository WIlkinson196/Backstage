"use client";

import { useActionState } from "react";
import { createEnquiryAction } from "@/features/enquiries/actions";
import { ArrowRight } from "lucide-react";

const inputClass = "mt-2 w-full rounded-xl border border-backstage-line bg-white px-4 py-3 text-sm outline-none transition focus:border-backstage-gold";

export function EnquiryForm() {
  const [state, action, pending] = useActionState(createEnquiryAction, {});
  return (
    <form action={action} className="space-y-6">
      <div className="grid gap-5 md:grid-cols-2">
        <label className="text-xs font-semibold text-black/55">Contact name<input required name="contactName" className={inputClass} placeholder="e.g. Louise Cutler"/></label>
        <label className="text-xs font-semibold text-black/55">Email address<input required type="email" name="email" className={inputClass} placeholder="customer@example.com"/></label>
        <label className="text-xs font-semibold text-black/55">Telephone<input name="phone" className={inputClass} placeholder="Optional"/></label>
        <label className="text-xs font-semibold text-black/55">Event type
          <select required name="eventType" className={inputClass} defaultValue="Wedding"><option>Wedding</option><option>Meeting</option><option>Conference</option><option>Private Event</option><option>Christmas Party</option><option>Celebration</option></select>
        </label>
        <label className="text-xs font-semibold text-black/55">Preferred date<input type="date" name="eventDate" className={inputClass}/></label>
        <label className="text-xs font-semibold text-black/55">Estimated guests<input type="number" min="0" name="guestCount" className={inputClass}/></label>
        <label className="text-xs font-semibold text-black/55">Estimated value (£)<input type="number" min="0" step="0.01" name="estimatedValue" className={inputClass}/></label>
        <label className="text-xs font-semibold text-black/55">Source<input name="source" className={inputClass} placeholder="Website, Bridebook, phone…"/></label>
        <label className="text-xs font-semibold text-black/55">Priority
          <select name="priority" className={inputClass} defaultValue="normal"><option value="hot">Hot</option><option value="warm">Warm</option><option value="normal">Normal</option></select>
        </label>
      </div>
      <label className="block text-xs font-semibold text-black/55">Original enquiry or notes<textarea name="message" rows={6} className={inputClass} placeholder="Paste the customer enquiry here…"/></label>
      {state.error && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{state.error}</div>}
      <button disabled={pending} className="flex items-center gap-2 rounded-xl bg-backstage-ink px-5 py-3 text-sm font-semibold text-white disabled:opacity-60">{pending ? "Creating…" : "Create enquiry"}<ArrowRight size={16}/></button>
    </form>
  );
}

