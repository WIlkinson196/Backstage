# Backstage v0.17 — Calendar, Availability & Provisional Bookings

## What this release changes

v0.17 replaces the calendar placeholder with an operational venue diary. It is intentionally usable before authentication is configured: build mode keeps all calendar interactions in the browser while the production Supabase design sits ready behind it.

## Working now in build mode

- month, week and chronological list views
- confirmed, provisional, enquiry-demand and unavailable indicators
- search and status filters
- selected-day booking view
- new booking and provisional-hold creation
- venue-space selection and capacity validation
- setup and clear-down buffers in clash detection
- confirm and release controls for provisional holds
- hold-expiry warnings
- confirmed, provisional, diary-value and space summaries
- browser persistence through local storage
- reset back to the supplied demonstration diary

Enquiry demand is advisory and does not block a date. Confirmed bookings, active provisional holds and explicit availability blocks do block the selected space. Expired or released holds no longer block it.

## No authentication setup is required yet

Keep the following value in `.env.local`, or simply leave it unset because build mode defaults to on:

```env
NEXT_PUBLIC_BACKSTAGE_BUILD_MODE=true
```

In build mode:

- middleware does not redirect to login;
- the venue context uses the demonstration venue;
- calendar writes stay in the browser;
- production RPCs are not called;
- Supabase keys do not activate authentication by themselves.

This means the remaining product can be built and tested before onboarding, user roles and real data are introduced.

## Production foundation included

Migration `020_calendar_availability_engine.sql` adds:

- venue booking rules;
- event-to-space allocations;
- venue-wide or space-specific availability blocks;
- tenant-aware Row Level Security policies;
- buffer-aware conflict lookup;
- atomic booking creation;
- provisional confirmation and release operations;
- per-space transaction locks to reduce double-booking races.

The live repository combines canonical events, allocations, venue spaces, booking rules, availability blocks and dated enquiries. Server actions resolve the signed-in venue context rather than accepting tenant identity from the browser.

## Later, when authentication is wanted

Do not do this during the current build stage. At launch preparation:

1. create or select the production Supabase project;
2. configure the Supabase URL and keys;
3. apply migrations `001` through `020` in order;
4. create the first organisation, venue, user profile and venue membership;
5. set `NEXT_PUBLIC_BACKSTAGE_BUILD_MODE=false`;
6. restart the app;
7. verify owner, manager, sales, operations, finance and viewer permissions;
8. test simultaneous booking attempts before taking live reservations.

## Known scope boundary

v0.17 focuses on the diary and availability engine. Recurring blocks, drag-and-drop rescheduling, automated hold-expiry jobs, external calendar feeds and customer self-service booking are later releases. The schema is designed so those features can be added without replacing this calendar core.
