import { getGuestReadiness, getWeddingDietarySummary, getWeddingGuests } from "@/features/weddings/services/guest-repository";
import { GuestReadinessCards } from "@/features/weddings/components/guest-readiness-cards";
import { GuestTable } from "@/features/weddings/components/guest-table";
import { DietaryMatrix } from "@/features/weddings/components/dietary-matrix";

export default async function Page(){
  const [guests,readiness,summary]=await Promise.all([getWeddingGuests("wed-002"),getGuestReadiness("wed-002"),getWeddingDietarySummary("wed-002")]);
  return <div className="mx-auto max-w-[1280px] space-y-6 px-5 py-10 pb-24"><div><div className="text-[10px] font-bold uppercase tracking-[.14em] text-[#A37E4B]">Your wedding</div><h1 className="mt-2 font-serif text-4xl">Guests</h1><p className="mt-2 text-sm text-black/45">Keep names, attendance, meal choices and dietary information up to date.</p></div><GuestReadinessCards readiness={readiness}/><GuestTable guests={guests}/><DietaryMatrix guests={guests} summary={summary}/></div>
}
