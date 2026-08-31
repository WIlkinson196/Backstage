# Backstage v0.7 — Documents & Operations

## Core principle

A function sheet should not become a second database.

The live wedding record remains the source of truth. Operational documents are generated views/snapshots of that record.

## Document lifecycle

1. Planning data changes.
2. Backstage recalculates readiness.
3. User generates a document.
4. Backstage stores a source snapshot/hash and version.
5. Document is issued.
6. If source planning changes later, Backstage marks the issued document as stale / re-issue required.

## Running Order

The running order is operational rather than customer-facing.

Each line can carry:
- time
- action
- owner
- location
- operational notes
- status
- source planning field

## Function Sheet

The function sheet is assembled from structured sections such as:
- event
- numbers
- ceremony
- food & drink
- suppliers
- accommodation
- room layout
- operations
- payments / commercial notes where appropriate

## Finalisation Gate

Checks can be:
- pass
- warning
- block

Blocking checks should stop a document being treated as final.

Examples:
- missing seating plan
- unresolved dietary information
- missing supplier confirmation
- incomplete final meeting
- unpaid final balance
- impossible guest-number mismatch
