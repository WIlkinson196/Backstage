import { getVenuePolicies } from "@/features/my-venue/services/repository";
import { Plus } from "lucide-react";

export default async function PoliciesPage() {
  const policies = await getVenuePolicies();

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-5">
        <div>
          <div className="backstage-kicker">Commercial rules</div>
          <h2 className="backstage-display mt-2 text-4xl">Terms & Policies</h2>
          <p className="mt-2 max-w-2xl text-sm text-black/45">
            Backstage can use these rules when answering questions, generating documents and checking bookings.
          </p>
        </div>
        <button className="flex items-center gap-2 rounded-xl bg-backstage-ink px-4 py-3 text-sm font-semibold text-white">
          <Plus size={16} /> Add policy
        </button>
      </div>

      <div className="mt-6 space-y-4">
        {policies.map((policy) => (
          <article key={policy.id} className="backstage-panel rounded-2xl p-5">
            <div className="text-[10px] font-semibold uppercase tracking-[.13em] text-backstage-gold">{policy.policyKey}</div>
            <div className="mt-2 backstage-display text-xl">{policy.title}</div>
            <p className="mt-2 text-sm leading-6 text-black/45">{policy.content}</p>
          </article>
        ))}
      </div>
    </>
  );
}
