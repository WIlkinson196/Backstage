# Backstage Venue OS v0.18

Backstage is the AI operating system for venues: one platform for enquiries, bookings, planning, payments, customer collaboration and live event operations.

## Current release

v0.18 turns calendar bookings into proper operational Functions and connects them to the specialist Wedding workspace.

- Functions & Weddings command centre with booked value, outstanding balances, readiness and priority actions
- a detailed Function workspace for meetings, conferences, parties, wakes, Christmas events and other bookings
- conditional room, catering, dietary, AV, entertainment and accommodation planning
- editable planning checklists and minute-by-minute running orders
- payment schedules and balance tracking
- printable operational function-sheet preview
- a richer Wedding command centre linked to the existing guided meetings, seating, guests, outputs and live-day modules
- calendar-to-function handover in build mode
- production Supabase operations, tasks, running-order and payment-schedule foundation
- staged Stripe, email, OpenAI, document and customer-portal integration status without activating them
- v0.17's availability and provisional-booking engine remains included

## Build mode — no authentication required

Build mode is on by default. You can use and test Backstage without configuring authentication, Supabase or Stripe. Calendar, Function planning, checklist, running-order and payment-position changes persist in the current browser.

Keep this setting during product development:

```env
NEXT_PUBLIC_BACKSTAGE_BUILD_MODE=true
```

Authentication is only activated later by explicitly setting it to `false` and completing the production setup. Supabase keys alone will not unexpectedly turn login on.

## Local setup

1. Run `npm install`.
2. Run `npm run dev`.
3. Open `http://localhost:3000/events` for the Functions command centre, `http://localhost:3000/weddings` for Weddings, or `http://localhost:3000/calendar` for the diary.

No authentication or database setup is needed for this stage.

## Later production activation

When the product is ready for real users:

1. Add the Supabase environment values.
2. Apply migrations `001` through `021` in order.
3. Create the first organisation, venue and staff membership.
4. Set `NEXT_PUBLIC_BACKSTAGE_BUILD_MODE=false`.
5. Restart the app and test each role before launch.

## Production principles

- A user can only access venues granted through membership.
- Cross-venue access is explicit, never inferred.
- Venue IDs are resolved from the authenticated server context rather than trusted from browser forms.
- Customer-facing automation can require approval.
- Weddings, meetings, conferences, private events and Christmas events will share the same event core.

See `docs/V018_FUNCTIONS_WEDDINGS_COMMAND_CENTRE.md` for the complete v0.18 behavior and integration staging plan.
