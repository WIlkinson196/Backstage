# Backstage Wedding Workspace — existing CRM migration review

The existing CRM wedding modules were reviewed as the feature source. The implementation itself is not copied.

## Existing depth preserved as product requirements

Original workspace tabs:
- Overview
- Quote
- Pricing
- Planning
- Tasks
- Payments
- Timeline
- Documents
- Running Order
- Seating
- Floor Plan
- Function Sheet
- Live

Guided meeting engine:
- First Meeting
- Halfway Meeting
- Final Meeting
- staged sections rather than asking every planning question at once
- ceremony logic
- reception timings
- suppliers
- décor
- music
- bedrooms
- completion tracking

Existing workflow milestones identified:
- Record quoted price
- Deposit paid
- Book first meeting
- Complete first meeting
- Book halfway meeting
- Complete halfway meeting
- Invite final meeting
- Complete final meeting
- Confirm DJ
- Confirm décor
- Receive ceremony music
- Receive seating plan
- Confirm final guest numbers
- Final balance paid
- Complete function sheet
- Wedding delivered

Operational document concepts retained:
- Customer pack
- Internal documents
- Document history / versions
- Handover / operational document
- Finalisation readiness
- Re-issue if planning changes after issue

Pricing concepts retained:
- year-specific pricing
- packages
- menus
- drinks
- evening food
- extras

## Backstage improvements

- one visually coherent wedding workspace
- AI planning gap detection
- event readiness score
- next milestone surfaced at workspace level
- shared data feeding quote, planning, documents and operations
- no duplicated information between tabs
- dedicated domain tables instead of storing everything in one record
- each module has its own route/folder for easier development and fixes
- final operational pack designed to detect stale/changed planning data
