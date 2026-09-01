# Backstage v0.16 — Functional Core / Golden Path

## Why this release exists

Earlier releases established the product shape and detailed wedding workspaces, but most pages still read demonstration data. v0.16 creates the first production-shaped workflow:

`Sign in → create enquiry → progress enquiry → confirm booking → manage event`

## Database changes

Migration `019_functional_core.sql` adds:

- user profiles
- organisation memberships
- venue memberships and roles
- enquiry activity history
- canonical events
- event activity history
- tenant audit log
- atomic contact + enquiry creation
- strict RLS access helpers and policies

The migration removes the temporary anonymous demonstration policies. Earlier feature tables that are not yet connected to authenticated repositories are placed behind RLS with no public access. They can be opened deliberately as each vertical slice is wired.

## Staff roles

- `owner`
- `admin`
- `manager`
- `sales`
- `operations`
- `finance`
- `staff`
- `viewer`

Organisation owners/admins may access venues in their organisation. Other users require an active venue membership.

## First-tenant bootstrap

After creating the first Auth user, create the organisation, venue and membership in the Supabase SQL editor. Replace the example values before running:

```sql
insert into public.organisations (name)
values ('Example Venue Group')
returning id;

insert into public.venues (organisation_id, name, trading_name)
values ('ORGANISATION_ID', 'Example Venue', 'Example Venue')
returning id;

insert into public.organisation_memberships (organisation_id, user_id, role)
values ('ORGANISATION_ID', 'AUTH_USER_ID', 'owner');

insert into public.venue_memberships (venue_id, user_id, role, is_default)
values ('VENUE_ID', 'AUTH_USER_ID', 'owner', true);
```

## Verification

1. An unauthenticated request redirects to `/login` when Supabase is configured.
2. A signed-in user without a venue membership receives no venue context.
3. Venue A staff cannot select or mutate Venue B contacts, enquiries or events.
4. Creating an enquiry creates its contact atomically.
5. Progressing an enquiry records an activity entry.
6. Confirming an enquiry creates one canonical event and links the source enquiry.
7. Repeating conversion is rejected by the unique source-enquiry constraint.
8. Event status changes create event activity and audit entries.

## Intentionally not included yet

- self-service organisation onboarding
- invitation emails and membership administration UI
- real OpenAI qualification/drafting
- Stripe Connect account onboarding and payment collection
- authenticated customer portal access
- wedding tables converted from demo repositories
- shared calendar conflict engine

Those now build on the v0.16 tenancy and event core rather than adding more disconnected demo screens.

