# Backstage v0.9.1 — Visibility Hotfix

This release exists because a deployed environment was still rendering the old wedding placeholder route.

## What to verify after deployment

1. Open any wedding and click Seating.
2. You should see `Backstage v0.9.1 · Guest & Seating Workspace` above the seating UI.
3. Click Floor Plan.
4. You should see `Backstage v0.9.1 · Floor Plan Workspace`.
5. The wedding hero now contains `Open Couple Portal`.
6. Clicking it opens `/portal`.

If Seating still shows `Dedicated Backstage module boundary created`, the deployed GitHub/Vercel source is not this release.
