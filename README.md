# Backstage v0.5 — Wedding Workspace Foundation

## Added

- Premium Weddings landing page
- Individual wedding workspace
- Full existing-CRM tab architecture:
  - Overview
  - Quote
  - Pricing
  - Planning
  - Tasks
  - Payments
  - Timeline
  - Documents
  - Running Order
  - Seating
  - Floor Plan
  - Function Sheet
  - Live
- First / Halfway / Final guided meeting cards
- Wedding readiness score
- Planning score
- AI planning checks
- Task/milestone engine UI
- Payment position and payment schedule
- Event timeline
- Shared planning snapshot
- Dedicated module folders/routes
- Migration `008_wedding_workspace.sql`
- Wedding migration notes documenting old CRM functionality retained

## Important

This is the foundation release for Weddings, not the completed wedding module.

The key change is architectural: every wedding function now has its own route and database boundary, but they share the same wedding record and planning model.

The next wedding releases can therefore deepen Quote, Pricing, Planning, Documents, Seating, Function Sheet and Live independently without creating another giant wedding JS file.

## Database migration order

Run after the existing migrations:
`008_wedding_workspace.sql`

## Still intentionally absent

- login
- anonymous writes
- customer portal access
- Stripe live payments
- OpenAI live calls

Those integrations remain architecturally prepared but are not being exposed before the core product is stable.
