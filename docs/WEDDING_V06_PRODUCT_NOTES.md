# Backstage v0.6 — Wedding Planning, Quote & Pricing

## Product rule

The same fact should not be typed into five places.

Backstage should hold one structured wedding record and allow different surfaces to consume it:

My Venue pricing
→ Quote
→ Planning
→ Customer Portal
→ Running Order
→ Function Sheet
→ Kitchen / service documents
→ Live Wedding

## Quote

A quote is versioned and contains snapshot line items.

We retain a link to the source My Venue product where possible, but snapshot the name and price so an old quote does not silently change if the venue later updates its price book.

## Pricing

Pricing is owned by My Venue.

Wedding pricing may later support:
- event-year price books
- date bands
- minimum guest counts
- package inclusions
- upgrades
- per-person pricing
- room pricing
- per-table pricing
- discretionary discounts
- minimum spends

## Planning

Planning is field-based rather than one giant JSON blob.

Each planning field can carry:
- section
- field key
- value
- completion status
- owner: venue/customer/shared
- customer visibility
- source
- change history

This is what will eventually make the customer portal and AI checks reliable.

## AI checks

`wedding_ai_checks` is the persistent place for:
- missing information
- inconsistent guest numbers
- dietary discrepancies
- supplier gaps
- pricing conflicts
- overdue planning
- event-day readiness issues

AI does not become the database. It reads and checks structured data.
