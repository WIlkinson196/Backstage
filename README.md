# Backstage v0.2 — My Venue

Backstage is being rebuilt as a fresh, modular venue operating system.

## v0.2 adds

- Premium `My Venue` workspace
- Venue Profile
- Spaces
- Wedding packages
- Meeting packages
- Private Events
- Food & Drink
- Accommodation
- Décor & Extras
- Terms & Policies
- Automation Rules
- Dedicated My Venue data/types/service folders
- New Supabase migration `005_my_venue_configuration.sql`
- New demo seed `002_my_venue_demo_data.sql`

## Important

There is still **no login**.

The v0.2 UI currently reads from the repository abstraction in:

`features/my-venue/services/repository.ts`

That currently returns safe demo data. The next connection step swaps that repository to the fresh Supabase project without rewriting the pages.

This is intentional: UI, domain logic and database access stay separate.

## Fresh Supabase setup order

Run:

1. `001_foundation.sql`
2. `002_catalogue.sql`
3. `003_enquiries.sql`
4. `004_automation.sql`
5. `005_my_venue_configuration.sql`

Then optional demo data:

1. `001_demo_venue.sql`
2. `002_my_venue_demo_data.sql`

## Vercel

The app can deploy without Supabase credentials at this stage because My Venue uses the demo repository.

This lets us perfect the application first without exposing public unauthenticated database writes.

## Next build

v0.3 should connect the repository to the fresh Supabase project and make My Venue editing persistent, followed by the full Enquiries/Sales workflow.
