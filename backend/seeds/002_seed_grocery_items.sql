-- Seed: 002_seed_grocery_items
-- Initial grocery items from src/constants.ts GROCERY_ITEMS array

INSERT INTO grocery_items (id, name, category, price) VALUES
  ('00000000-0000-0000-0001-000000000001', 'Instant Coffee (200g)',    'Coffee',         180.00),
  ('00000000-0000-0000-0001-000000000002', 'Fresh Milk (1L)',           'Milk',            95.00),
  ('00000000-0000-0000-0001-000000000003', 'Laundry Detergent (1kg)',  'Detergent',      150.00),
  ('00000000-0000-0000-0001-000000000004', 'Bath Soap (3-pack)',        'Soap',            85.00),
  ('00000000-0000-0000-0001-000000000005', 'Canned Corned Beef',        'Processed Cans',  65.00),
  ('00000000-0000-0000-0001-000000000006', 'Cola (1.5L)',               'Softdrinks',      55.00),
  ('00000000-0000-0000-0001-000000000007', 'Ground Coffee (500g)',      'Coffee',         350.00),
  ('00000000-0000-0000-0001-000000000008', 'Evaporated Milk (370ml)',   'Milk',            45.00),
  ('00000000-0000-0000-0001-000000000009', 'Dishwashing Liquid',        'Detergent',       75.00),
  ('00000000-0000-0000-0001-000000000010', 'Canned Sardines',           'Processed Cans',  25.00),
  ('00000000-0000-0000-0001-000000000011', 'Orange Soda (1.5L)',        'Softdrinks',      50.00),
  ('00000000-0000-0000-0001-000000000012', 'Kitchen Towels',            'Others',          40.00)
ON CONFLICT (id) DO NOTHING;
