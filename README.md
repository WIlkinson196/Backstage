# Backstage v0.4 — Enquiries + Sales Intelligence

## Added

- Premium enquiry sales workspace
- Kanban-style sales pipeline
- Live pipeline value
- Needs-action and hot-opportunity metrics
- AI lead score
- AI qualification summary
- AI suggested response
- Next-best-action card
- Customer/contact panel
- Sales activity action centre
- Activity timeline
- Viewing/proposal/provisional states
- Pipeline health treatment
- Buying-signal / revenue-risk intelligence panel
- Dedicated enquiry detail route
- Migration `007_sales_intelligence.sql`
- Migration notes documenting useful workflows retained from the existing CRM

## Existing CRM reference

The previous CRM was reviewed specifically for:
- enquiry activity outcomes
- follow-up logic
- viewing workflow
- quote/proposal workflow
- provisional booking workflow
- lost enquiries
- pipeline health
- Sales OS qualification
- revenue at risk
- sales sequences

The old implementation was not copied.

## Important

There is still no login.

The v0.4 UI currently uses demo enquiry data because we are not enabling anonymous public writes.

The next technical step for real interactive saves is a secure development write gateway or the auth/membership layer when we are ready for it.

## Next release recommendation

v0.5 — Wedding Workspace Foundation:
- wedding overview
- quote / pricing
- planning
- meeting milestones
- tasks
- payments
- timeline
- documents
- running order
- seating
- function sheet
- live event view
- AI planning checks

This should use the existing CRM wedding module as a detailed feature checklist, but rebuild the experience completely in Backstage.
