# Backstage v0.11 — Post-Event + Reviews + Anniversary CRM

## Added
- `app/weddings/[id]/post-event/page.tsx`
- `features/weddings/components/post-event-command-centre.tsx`
- `features/weddings/types/post-event.ts`
- `features/weddings/data/post-event-demo.ts`
- `features/weddings/services/post-event-repository.ts`
- `supabase/migrations/014_wedding_post_event_crm.sql`

## Changed
- `features/weddings/lib/tabs.ts` — adds Post Event workspace
- `package.json` — version 0.11.0

## Product rules
- Post-event activity remains attached to the same wedding account.
- Reviews, testimonial consent and media permission are separate concepts.
- Anniversary retention is scheduled from the original event relationship.
- Marketing content must not be treated as approved until explicit permission is recorded.
