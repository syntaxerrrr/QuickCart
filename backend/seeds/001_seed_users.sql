-- Seed: 001_seed_users
-- Static users from src/components/Login.tsx STATIC_USERS array

INSERT INTO users (id, name, role, password) VALUES
  ('00000000-0000-0000-0000-000000000001', 'john dela cruz', 'user',  '123qwe'),
  ('00000000-0000-0000-0000-000000000002', 'joseph santos',  'user',  '123qwe'),
  ('00000000-0000-0000-0000-000000000003', 'joshua garcia',  'user',  '123qwe'),
  ('00000000-0000-0000-0000-000000000004', 'admin',          'admin', '123qwe')
ON CONFLICT (id) DO NOTHING;
