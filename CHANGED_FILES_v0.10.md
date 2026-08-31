# Backstage v0.10 — Wedding Live Mode

## Added
- `features/weddings/types/live.ts`
- `features/weddings/data/live-demo.ts`
- `features/weddings/services/live-repository.ts`
- `features/weddings/components/live-command-centre.tsx`
- `supabase/migrations/013_wedding_live_mode.sql`

## Replaced
- `app/weddings/[id]/live/page.tsx`

## Updated
- `package.json` → `0.10.0`

## Product behaviour
Live Mode is an event-day command centre over the same wedding record. It does not create a second wedding database. It surfaces current/next running-order items, operational checks, contacts, dietaries, balances, documents and a live event log in one place.
