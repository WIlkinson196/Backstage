# Backstage v0.8 — Guest Management + Seating + Floor Plan

## Added

- guest management data model
- guest list UI
- RSVP status
- day/evening/both attendance
- adult/child/baby grouping
- menu choices
- dietary requirements
- dietary severity
- accessibility field
- guest data source tracking
- Dietary Matrix
- guest readiness metrics
- table entities
- seating workspace
- unassigned guest list
- floor-plan data model
- floor-plan canvas foundation
- operational zones
- customer portal guest-management settings
- guest change log
- migration `011_wedding_guests_seating_floorplan.sql`

## Product rule

A guest is entered once.

The same guest record will eventually feed:
- couple portal
- seating
- dietary matrix
- kitchen sheet
- function sheet
- running order
- live wedding mode

## Run after v0.7

`011_wedding_guests_seating_floorplan.sql`

## Next

v0.9 should build:
- Customer / Couple Portal foundation
- branded wedding homepage
- planning progress
- tasks for the couple
- guest management handoff
- document access
- payment visibility
- message / question area
- portal-specific permissions

This is where Backstage begins to show the customer-facing side of the platform.
