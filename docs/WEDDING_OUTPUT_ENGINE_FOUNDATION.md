# Wedding Output Engine Foundation

## Old CRM logic deliberately retained
The old Windmill Farm CRM was reviewed before this foundation was designed.

Useful patterns found:
- Wedding planning is the source for customer and operational documents.
- Finalisation fingerprints planning, guests, seating and running order, then flags issued sheets after changes.
- Kitchen imports live Weddings/Functions instead of re-keying events.
- Wedding-to-Kitchen transforms structured meal/evening services and guest dietary information.
- Kitchen calculations use actual covers and menu allocation rules.
- Drinks calculations derive bottle/glassware/prep quantities from allocations and package rules.
- Supplier/DJ handovers expose only relevant timings and planning information.
- Customer documents filter operational-only values and distinguish indicative/TBC information.

## Backstage improvement
Backstage formalises those ideas as one Wedding Operational Model with normalised facts, confidence state, audience visibility, readiness gates, food-service contracts, domain fingerprints and versioned output snapshots.

PDF templates must consume this model rather than calculate wedding truth independently.
