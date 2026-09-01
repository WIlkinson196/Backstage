# v0.15 - Wedding Prep & Equipment Engine

This release rebuilds the old CRM Wedding Prep List logic on the Backstage Operational Model.

Retained from the old CRM:
- day-guest meal-service calculations for cutlery/crockery
- higher of day/evening guests for room chairs
- table-count-driven table numbers and centrepieces
- package/booked decor principle
- separate welcome and toast flute-service counts
- evening-food cover driven service equipment
- printable department checklist and sign-off

Expanded in Backstage:
- General operational-document checks
- Kitchen dietary/accessibility controls
- Housekeeping presentation checks
- Reception/supplier arrival handover
- source shown against every calculated line
- priority and calculation metadata
- venue-configurable prep-rule database foundation
- versioned prep snapshots for future stale/reissue detection

Important:
The current demo wedding has structured prep inputs in `features/weddings/data/prep-demo.ts`.
The migration creates the venue-level rule foundation so these calculations can later be configured in My Venue rather than hardcoded per venue.
