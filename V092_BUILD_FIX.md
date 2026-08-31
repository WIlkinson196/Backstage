# Backstage v0.9.2 — Build Fix

Fixes the two errors shown in the Vercel build log:

1. Replaced unsupported `ClipboardClock` Lucide icon with `ClipboardList`.
2. Changed the Couple Portal demo type import to `@/features/portal/types/portal`.

This patch is based on the exact `app.zip` supplied after the failed deployment.
