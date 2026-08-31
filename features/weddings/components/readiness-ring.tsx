export function ReadinessRing({ value, label = "Ready" }: { value: number; label?: string }) {
  return (
    <div className="relative grid h-24 w-24 place-items-center rounded-full" style={{
      background: `conic-gradient(#D5B47A ${value * 3.6}deg, rgba(255,255,255,.12) 0deg)`
    }}>
      <div className="grid h-[78px] w-[78px] place-items-center rounded-full bg-[#101822] text-center">
        <div>
          <div className="backstage-display text-2xl text-white">{value}%</div>
          <div className="text-[9px] uppercase tracking-[.12em] text-white/35">{label}</div>
        </div>
      </div>
    </div>
  );
}
