-- DEVELOPMENT-ONLY access model while Backstage intentionally has no login.
-- Public/anon may READ the seeded demo venue configuration.
-- There are NO anon insert/update/delete policies.
-- Replace this migration's access model when authentication and memberships arrive.

alter table organisations enable row level security;
alter table venues enable row level security;
alter table venue_spaces enable row level security;
alter table venue_products enable row level security;
alter table venue_policies enable row level security;
alter table venue_branding enable row level security;
alter table venue_space_features enable row level security;
alter table venue_product_inclusions enable row level security;
alter table venue_knowledge_entries enable row level security;

create policy "dev read demo organisation"
on organisations for select to anon
using (id = '11111111-1111-1111-1111-111111111111');

create policy "dev read demo venue"
on venues for select to anon
using (id = '22222222-2222-2222-2222-222222222222');

create policy "dev read demo venue spaces"
on venue_spaces for select to anon
using (venue_id = '22222222-2222-2222-2222-222222222222');

create policy "dev read demo venue products"
on venue_products for select to anon
using (venue_id = '22222222-2222-2222-2222-222222222222');

create policy "dev read demo venue policies"
on venue_policies for select to anon
using (venue_id = '22222222-2222-2222-2222-222222222222');

create policy "dev read demo venue branding"
on venue_branding for select to anon
using (venue_id = '22222222-2222-2222-2222-222222222222');

create policy "dev read demo knowledge"
on venue_knowledge_entries for select to anon
using (venue_id = '22222222-2222-2222-2222-222222222222');

create policy "dev read demo space features"
on venue_space_features for select to anon
using (
  exists (
    select 1 from venue_spaces s
    where s.id = venue_space_features.space_id
      and s.venue_id = '22222222-2222-2222-2222-222222222222'
  )
);

create policy "dev read demo product inclusions"
on venue_product_inclusions for select to anon
using (
  exists (
    select 1 from venue_products p
    where p.id = venue_product_inclusions.product_id
      and p.venue_id = '22222222-2222-2222-2222-222222222222'
  )
);
