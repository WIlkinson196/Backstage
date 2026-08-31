import { getVenueSpaces } from "@/features/my-venue/services/repository";
import { Plus, Users, Armchair } from "lucide-react";

export default async function SpacesPage() {
  const spaces = await getVenueSpaces();

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-5">
        <div>
          <div className="backstage-kicker">Physical inventory</div>
          <h2 className="backstage-display mt-2 text-4xl">Spaces</h2>
          <p className="mt-2 max-w-2xl text-sm text-black/45">
            Capacities, layouts, facilities and restrictions will feed availability, quoting and AI recommendations.
          </p>
        </div>
        <button className="flex items-center gap-2 rounded-xl bg-backstage-ink px-4 py-3 text-sm font-semibold text-white">
          <Plus size={16} /> Add space
        </button>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        {spaces.map((space) => (
          <article key={space.id} className="backstage-panel overflow-hidden rounded-3xl">
            <div className="h-36 bg-[radial-gradient(circle_at_80%_20%,rgba(182,145,93,.28),transparent_24%),linear-gradient(145deg,#243545,#172431)]" />
            <div className="p-6">
              <div className="backstage-display text-2xl">{space.name}</div>
              <p className="mt-2 text-sm leading-6 text-black/45">{space.description}</p>
              <div className="mt-5 flex gap-3">
                <div className="flex items-center gap-2 rounded-full bg-backstage-cream px-3 py-2 text-xs">
                  <Armchair size={14} /> {space.capacitySeated ?? "—"} seated
                </div>
                <div className="flex items-center gap-2 rounded-full bg-backstage-cream px-3 py-2 text-xs">
                  <Users size={14} /> {space.capacityStanding ?? "—"} standing
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>
    </>
  );
}
