insert into venue_spaces (
  id, venue_id, name, description, capacity_seated, capacity_standing, is_active
)
values
(
  '33333333-3333-3333-3333-333333333331',
  '22222222-2222-2222-2222-222222222222',
  'The Granary',
  'Main event space for weddings, conferences and private functions.',
  160, 200, true
),
(
  '33333333-3333-3333-3333-333333333332',
  '22222222-2222-2222-2222-222222222222',
  'Event Garden',
  'Outdoor event space and wedding photo area.',
  80, 120, true
)
on conflict do nothing;

insert into venue_products (venue_id, category, name, description, base_price, price_type)
values
('22222222-2222-2222-2222-222222222222', 'wedding', 'Evergreen', 'Entry all-day wedding package.', 1995, 'fixed'),
('22222222-2222-2222-2222-222222222222', 'wedding', 'Blossom', 'Enhanced wedding package.', 3999, 'fixed'),
('22222222-2222-2222-2222-222222222222', 'wedding', 'Willow', 'Premium wedding package.', 4495.95, 'fixed'),
('22222222-2222-2222-2222-222222222222', 'meeting', 'Delegate Day Package', 'Meeting room, refreshments and catering.', 25, 'per_person'),
('22222222-2222-2222-2222-222222222222', 'private_event', 'Private Event Room Hire', 'Evening private event hire.', 300, 'fixed'),
('22222222-2222-2222-2222-222222222222', 'food', 'Finger Buffet', 'Cold finger buffet.', 14, 'per_person'),
('22222222-2222-2222-2222-222222222222', 'food', 'Hog Roast', 'Evening hog roast.', 16, 'per_person'),
('22222222-2222-2222-2222-222222222222', 'extra', 'DJ', 'Resident entertainment package.', 400, 'fixed'),
('22222222-2222-2222-2222-222222222222', 'extra', 'LOVE Letters', 'Illuminated LOVE letters.', 180, 'fixed');
