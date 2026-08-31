# Backstage v0.9 — Customer / Couple Portal Foundation

## Added
- separate `/portal` customer experience
- premium wedding hero and countdown
- planning progress
- couple task list
- guest-management handoff
- documents
- payment schedule
- venue/couple messages
- mobile portal navigation
- portal membership schema
- portal permissions foundation
- customer-visible document controls
- portal activity/audit foundation
- migration `012_customer_portal_foundation.sql`

## Important
The portal deliberately shares the same wedding, guest, document and payment data model as the venue workspace.

It is not a second CRM.

## Run after v0.8
`012_customer_portal_foundation.sql`

## Next
v0.10 should begin the wider event engine:
- Functions
- Meetings & Conferences
- Private Events
- shared Event core
- event-specific operational requirements
- reusable Function Sheet / Running Order architecture
