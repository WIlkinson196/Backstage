# Backstage v0.18 — Changed Files

## Added

- `021_functions_weddings_command_centre.sql`
- `docs/V018_FUNCTIONS_WEDDINGS_COMMAND_CENTRE.md`
- `features/events/components/function-workspace.tsx`
- `features/events/components/functions-command-centre.tsx`
- `features/events/data/demo.ts`
- `features/weddings/components/weddings-command-centre.tsx`
- `supabase/migrations/021_functions_weddings_command_centre.sql`

## Updated

- `README.md`
- `app/events/[id]/page.tsx`
- `app/events/page.tsx`
- `app/weddings/page.tsx`
- `components/navigation/mobile-nav.tsx`
- `components/navigation/sidebar.tsx`
- `features/calendar/components/calendar-workspace.tsx`
- `features/events/actions.ts`
- `features/events/services/repository.ts`
- `features/events/types/event.ts`
- `package.json`
- `package-lock.json`

## Release behavior

Authentication and external integrations remain off in build mode. Functions, Wedding navigation and calendar handover work with browser-persistent demonstration data until production setup is deliberately enabled.
