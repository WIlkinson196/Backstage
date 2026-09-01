# Backstage Venue OS v0.17

Backstage is the AI operating system for venues: one platform for enquiries, bookings, planning, payments, customer collaboration and live event operations.

## Current release

v0.17 adds the first operational venue diary while keeping the product easy to build and review before authentication is switched on.

- month, week and list calendar views
- confirmed bookings, provisional holds and enquiry demand on one diary
- booking creation with space, capacity, setup and clear-down validation
- conflict prevention for overlapping bookings and venue blackout periods
- confirm or release provisional bookings
- hold-expiry visibility and diary-value summaries
- browser-persistent build data with a one-click reset
- production-ready Supabase schema, RPCs, tenancy and concurrency protection
- v0.16's enquiry, event, membership and audit foundations remain included

## Build mode — no authentication required

Build mode is on by default. You can use and test Backstage without configuring authentication, Supabase or Stripe. Calendar changes persist in the current browser so the workflow is usable while the rest of the product is built.

Keep this setting during product development:

```env
NEXT_PUBLIC_BACKSTAGE_BUILD_MODE=true
```

Authentication is only activated later by explicitly setting it to `false` and completing the production setup. Supabase keys alone will not unexpectedly turn login on.

## Local setup

1. Run `npm install`.
2. Run `npm run dev`.
3. Open `http://localhost:3000/calendar`.

No authentication or database setup is needed for this stage.

## Later production activation

When the product is ready for real users:

1. Add the Supabase environment values.
2. Apply migrations `001` through `020` in order.
3. Create the first organisation, venue and staff membership.
4. Set `NEXT_PUBLIC_BACKSTAGE_BUILD_MODE=false`.
5. Restart the app and test each role before launch.

## Production principles

- A user can only access venues granted through membership.
- Cross-venue access is explicit, never inferred.
- Venue IDs are resolved from the authenticated server context rather than trusted from browser forms.
- Customer-facing automation can require approval.
- Weddings, meetings, conferences, private events and Christmas events will share the same event core.

See `docs/V017_CALENDAR_AVAILABILITY.md` for the complete v0.17 behavior, build-mode guidance and later production checklist.
