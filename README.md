# Backstage v0.6 — Wedding Planning + Quote + Pricing

## This release deepens three core wedding modules

### Quote
- versioned quote workspace
- quote lines
- quantity and unit price
- subtotal / discount / total
- preview and issue controls
- quote intelligence panel
- snapshot-ready schema

### Pricing
- wedding catalogue sourced from My Venue
- package, food, entertainment, décor and hire categories
- price types prepared for fixed / per person / per table / per room / from
- avoids hard-coding pricing into the wedding UI

### Planning
- structured planning sections
- individual planning fields
- venue / customer / shared ownership
- customer-visible field flag
- first / halfway / final meeting journey
- planning completeness
- AI gap detection
- planning change-history schema

## New migration

Run after `008_wedding_workspace.sql`:

`009_wedding_quote_pricing_planning.sql`

## Important architecture rule

Pricing comes from My Venue.

When a quote is created, Backstage snapshots the commercial values used at that point in time. Updating a future price in My Venue should not rewrite an already-issued quote.

Planning data is structured once so the same information can later feed:
- Customer Portal
- documents
- running order
- function sheet
- kitchen/service outputs
- live event mode

## Still intentionally demo/read-only

There is still no login and no anonymous write path.

The user interface now models the real workflow, while safe persistence will be connected once the secure write/auth layer is introduced.
