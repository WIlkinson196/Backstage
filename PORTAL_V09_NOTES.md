# Backstage v0.9 — Couple Portal Foundation

The portal is deliberately not "staff CRM lite".

It should feel emotional, calm and premium while reading from the same wedding record used internally.

## Portal surfaces
- wedding home / countdown
- planning progress
- couple tasks
- guest management
- documents
- payments
- messages

## Shared data
The portal must not create separate copies of:
- guest records
- dietaries
- menu choices
- wedding planning fields
- payments
- documents

Customer updates should feed the same structured domain records with source/change history.

## Permissions
Portal membership and permissions are modelled now, but authentication remains intentionally unwired in this development release.

Later RLS should ensure a portal member can only access the wedding(s) explicitly linked to their membership.

## Customer-facing AI
Later Backstage can provide safe customer assistance around:
- what is still outstanding
- explaining venue processes
- helping complete planning questions
- prompting for missing guest information

It must use venue-approved My Venue knowledge and must not invent pricing, policies or availability.
