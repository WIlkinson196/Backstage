# Backstage v0.14.1 — Build Fix

Fixes Vercel TypeScript build failure in:
`app/weddings/[id]/outputs/master-pack/print/page.tsx`

Root cause:
`MasterOperationalPack.checks` was typed without `id`, while the readiness data and render loop correctly use `c.id`.

Fix:
- preserve `id` in the `MasterOperationalPack.checks` type
- bump package version to 0.14.1

No database migration required.
