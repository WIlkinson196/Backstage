"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getBrowserSupabase } from "@/lib/supabase/browser";
import { ArrowRight, LockKeyhole, Sparkles } from "lucide-react";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function signIn(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const supabase = getBrowserSupabase();
    if (!supabase) {
      setError("Backstage has not been connected to Supabase yet.");
      return;
    }

    setBusy(true);
    const result = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (result.error) {
      setError("The email address or password is incorrect.");
      return;
    }

    router.replace(searchParams.get("next") || "/dashboard");
    router.refresh();
  }

  return (
    <main className="grid min-h-screen bg-backstage-cream lg:grid-cols-[1.05fr_.95fr]">
      <section className="backstage-photo relative hidden overflow-hidden text-white lg:flex lg:flex-col lg:justify-between lg:p-12">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0B121B]/55 via-[#0B121B]/35 to-[#0B121B]/80" />
        <div className="relative">
          <div className="backstage-display text-3xl">Backstage</div>
          <div className="mt-1 text-[10px] font-bold uppercase tracking-[.24em] text-[#E2C69D]">Venue OS</div>
        </div>
        <div className="relative max-w-2xl">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[.18em] text-[#E2C69D]"><Sparkles size={15}/> The AI operating system for venues</div>
          <h1 className="backstage-display mt-5 text-6xl leading-[.98]">Everything behind an unforgettable event.</h1>
          <p className="mt-6 max-w-xl text-sm leading-7 text-white/65">Sales, planning, payments and live operations in one secure workspace.</p>
        </div>
      </section>

      <section className="flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-md">
          <div className="mb-9 lg:hidden">
            <div className="backstage-display text-3xl">Backstage</div>
            <div className="text-[10px] font-bold uppercase tracking-[.22em] text-backstage-gold">Venue OS</div>
          </div>
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-backstage-ink text-backstage-gold"><LockKeyhole size={20}/></div>
          <h2 className="backstage-display mt-6 text-5xl">Welcome back.</h2>
          <p className="mt-3 text-sm leading-6 text-black/45">Sign in to your venue workspace.</p>

          <form onSubmit={signIn} className="mt-8 space-y-5">
            <label className="block text-xs font-semibold text-black/60">
              Email address
              <input type="email" required autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} className="mt-2 w-full rounded-xl border border-backstage-line bg-white px-4 py-3.5 text-sm outline-none transition focus:border-backstage-gold" />
            </label>
            <label className="block text-xs font-semibold text-black/60">
              Password
              <input type="password" required autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} className="mt-2 w-full rounded-xl border border-backstage-line bg-white px-4 py-3.5 text-sm outline-none transition focus:border-backstage-gold" />
            </label>
            {error && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
            <button disabled={busy} className="flex w-full items-center justify-center gap-2 rounded-xl bg-backstage-ink px-4 py-3.5 text-sm font-semibold text-white transition hover:bg-[#1A2735] disabled:opacity-60">
              {busy ? "Signing in…" : "Sign in"}<ArrowRight size={16}/>
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}

export default function LoginPage() {
  return <Suspense fallback={<main className="min-h-screen bg-backstage-cream"/>}><LoginContent/></Suspense>;
}
