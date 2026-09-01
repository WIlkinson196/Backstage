# Backstage Venue OS v0.16

Backstage is the AI operating system for venues: one platform for enquiries, bookings, planning, payments, customer collaboration and live event operations.

## Current release

v0.16 begins the move from a visual prototype to a functional B2B product.

- Supabase staff authentication and session middleware
- organisations, venues and explicit venue memberships
- strict tenant-aware Row Level Security helpers
- production lockdown for earlier unwired feature tables
- shared canonical `events` table for every event type
- real enquiry/contact creation
- real enquiry pipeline progression and activity history
- enquiry-to-confirmed-event conversion
- event list, event workspace and status updates
- venue-aware navigation and server-side repositories
- audit history for enquiries and events

When Supabase environment variables are absent, the interface continues to use demonstration data for design review. Live writes are never silently stored in demo mode.

## Local setup

1. Copy `.env.example` to `.env.local` and add the Supabase project values.
2. Apply migrations `001` through `019` in order.
3. Create the first organisation, venue and membership using the Supabase service role or SQL editor.
4. Run `npm install`.
5. Run `npm run dev`.

## Production principles

- A user can only access venues granted through membership.
- Cross-venue access is explicit, never inferred.
- Venue IDs are resolved from the authenticated server context rather than trusted from browser forms.
- Customer-facing automation can require approval.
- Weddings, meetings, conferences, private events and Christmas events will share the same event core.

See `docs/V016_FUNCTIONAL_CORE.md` for deployment and verification notes.

