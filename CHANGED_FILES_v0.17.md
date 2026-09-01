# Backstage v0.17 — Changed Files

## Added

- `020_calendar_availability_engine.sql`
- `docs/V017_CALENDAR_AVAILABILITY.md`
- `features/calendar/actions.ts`
- `features/calendar/components/calendar-workspace.tsx`
- `features/calendar/data/demo.ts`
- `features/calendar/lib/conflicts.ts`
- `features/calendar/services/repository.ts`
- `features/calendar/types/calendar.ts`
- `supabase/migrations/020_calendar_availability_engine.sql`

## Updated

- `.env.example`
- `README.md`
- `app/calendar/page.tsx`
- `features/platform/services/context.ts`
- `lib/supabase/middleware.ts`
- `lib/supabase/server.ts`
- `package.json`
- `package-lock.json`

## Release behavior

Build mode is enabled by default, so v0.17 can be reviewed and used without authentication. Set `NEXT_PUBLIC_BACKSTAGE_BUILD_MODE=false` only when the production authentication and database setup is ready.
