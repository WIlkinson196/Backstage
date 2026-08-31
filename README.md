# Backstage v0.3 — Premium Foundation + Supabase Reads

## What changed

- Dashboard redesigned much closer to the premium Backstage concept.
- Photography-led hero treatment introduced.
- My Venue hero redesigned.
- Mobile navigation added as the first step toward the mobile product language.
- Fresh Supabase repository added for My Venue reads.
- Safe demo fallback remains if Supabase is not configured.
- No public database writes while there is no login.
- Development-only RLS read migration added.
- Platform architecture document now explicitly covers:
  - Venue Team Web App
  - Customer Portal
  - Staff Mobile App
  - Marketing Website
  - shared AI / automation / Supabase foundation

## Supabase migration order

Run:
1. 001_foundation.sql
2. 002_catalogue.sql
3. 003_enquiries.sql
4. 004_automation.sql
5. 005_my_venue_configuration.sql
6. 006_development_read_access.sql

Then seed:
1. 001_demo_venue.sql
2. 002_my_venue_demo_data.sql

## Vercel environment variables

For fresh Supabase read connection:
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY

Do not add a service-role key to browser code.

## Important
The app intentionally still has no login.
The v0.3 Supabase connection is read-only for the seeded demo venue.
Persistent editing comes after we introduce a secure write mechanism; we will not expose anonymous public writes.

## Next release
Backstage v0.4:
- Enquiries + Sales Intelligence
- enquiry detail workspace
- activity timeline
- pipeline
- AI qualification UI
- follow-up engine
- viewing/proposal workflow
- improved photography and premium states
