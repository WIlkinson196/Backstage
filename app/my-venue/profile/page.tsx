import { getVenueProfile } from "@/features/my-venue/services/repository";
import { Save, Image as ImageIcon } from "lucide-react";

export default async function VenueProfilePage() {
  const venue = await getVenueProfile();

  return (
    <div className="grid gap-6 xl:grid-cols-[1.2fr_.8fr]">
      <section className="backstage-panel rounded-3xl p-6">
        <div className="backstage-kicker">Identity</div>
        <h2 className="backstage-display mt-2 text-3xl">Venue Profile</h2>
        <p className="mt-2 text-sm text-black/45">
          This becomes the source of truth used by proposals, portals, AI and documents.
        </p>

        <form className="mt-7 grid gap-5 md:grid-cols-2">
          {[
            ["Venue name", venue.name],
            ["Trading name", venue.tradingName],
            ["Telephone", venue.phone],
            ["Email", venue.email],
            ["Website", venue.website]
          ].map(([label, value]) => (
            <label key={label} className={label === "Venue name" || label === "Trading name" ? "md:col-span-1" : ""}>
              <span className="mb-2 block text-xs font-semibold text-black/50">{label}</span>
              <input
                defaultValue={value}
                className="w-full rounded-xl border border-backstage-line bg-white px-4 py-3 text-sm outline-none focus:border-backstage-gold"
              />
            </label>
          ))}
          <label className="md:col-span-2">
            <span className="mb-2 block text-xs font-semibold text-black/50">Description</span>
            <textarea
              defaultValue={venue.description}
              rows={5}
              className="w-full resize-none rounded-xl border border-backstage-line bg-white px-4 py-3 text-sm outline-none focus:border-backstage-gold"
            />
          </label>
          <div className="md:col-span-2">
            <button type="button" className="inline-flex items-center gap-2 rounded-xl bg-backstage-ink px-4 py-3 text-sm font-semibold text-white">
              <Save size={16} /> Save profile
            </button>
          </div>
        </form>
      </section>

      <section className="space-y-4">
        <div className="backstage-panel rounded-3xl p-6">
          <div className="flex h-52 items-center justify-center rounded-2xl border border-dashed border-backstage-line bg-white">
            <div className="text-center">
              <ImageIcon className="mx-auto text-backstage-gold" />
              <div className="mt-3 text-sm font-semibold">Venue logo</div>
              <div className="mt-1 text-xs text-black/35">Storage upload comes with Supabase connection.</div>
            </div>
          </div>
        </div>
        <div className="rounded-3xl bg-backstage-ink p-6 text-white">
          <div className="backstage-kicker !text-backstage-gold">AI knowledge</div>
          <div className="mt-3 backstage-display text-2xl">Why this matters</div>
          <p className="mt-3 text-sm leading-6 text-white/60">
            Backstage should never invent venue facts. Its assistant will ground answers,
            proposals and automation in My Venue data.
          </p>
        </div>
      </section>
    </div>
  );
}
