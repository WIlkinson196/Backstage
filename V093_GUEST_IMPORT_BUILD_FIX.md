# Backstage v0.9.3 — Guest Import Build Fix

This patch is based on the exact `app.zip` supplied by the user.

Fixes:
- replaces unsupported `ClipboardClock` with `ClipboardList`
- changes all guest/seating type imports to the absolute alias:
  `@/features/weddings/types/guests`
- retains the portal type import fix:
  `@/features/portal/types/portal`

Files covered:
- Dietary Matrix
- Floor Plan Canvas
- Guest Readiness Cards
- Guest Table
- Seating Board
- Guest demo data
- Guest repository
- Portal demo data
