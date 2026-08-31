# Backstage v0.7 — Documents + Function Sheet + Running Order

## Added

- Wedding Document Centre
- document version/status treatment
- stale-document architecture
- Operational Running Order
- owners, locations and operational notes
- Function Sheet preview
- Finalisation / readiness gate
- blocking vs warning checks
- source-version tracking
- migration `010_wedding_documents_operations.sql`

## Product rule

The function sheet is not a separate set of manually maintained data.

Backstage generates it from the structured wedding record. If the wedding plan changes after issue, Backstage can detect that the document is stale and requires re-issue.

## Run after v0.6

`010_wedding_documents_operations.sql`

## Next

v0.8 should deepen:
- Seating & Guest Management
- dietary matrix
- menu choices
- table allocation
- floor-plan data model
- customer portal guest-information handoff

That gives the Function Sheet and Kitchen outputs much stronger operational data.
