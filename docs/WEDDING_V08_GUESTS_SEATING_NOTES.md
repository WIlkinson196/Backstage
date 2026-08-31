# Backstage v0.8 — Guests, Seating, Dietaries & Floor Plan

## One guest record

Backstage should not maintain separate guest lists for:
- seating
- kitchen
- dietary requirements
- menu choices
- customer portal
- function sheet

Each guest exists once and can carry:
- attendance scope
- RSVP status
- age group
- table
- seat
- menu choice
- dietary requirement
- severity
- accessibility requirement
- notes
- source

## Dietary safety

Dietary requirements are structured enough to support operational checks.

A future AI/rules layer can compare:
- dietary requirement
- menu choice
- table allocation
- kitchen output
- final guest numbers

Critical requirements can be flagged more prominently than preferences.

## Seating

Tables are separate entities.

Guest allocation references a table ID rather than just a typed table name.

This allows:
- table capacity checks
- unassigned guest checks
- seating-plan generation
- floor-plan linkage
- table-specific kitchen/service sheets

## Floor Plan

Floor plan objects are data rather than a static image.

Tables and operational zones can carry x/y/width/height/rotation.

Future interaction can add:
- drag/drop
- snap-to-grid
- room templates
- capacity rules
- service-route warnings
- clash detection

## Customer Portal

The portal guest-management foundation is prepared.

A venue can later choose whether a couple may maintain:
- guest names
- RSVP
- menu choices
- dietaries
- accessibility requirements

Portal updates should write into the same wedding guest records, with change logging.
