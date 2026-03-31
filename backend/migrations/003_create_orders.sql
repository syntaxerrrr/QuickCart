-- Migration: 003_create_orders
-- Creates the orders table matching the Order interface in src/types.ts
-- Status matches OrderStatus: 'Pending' | 'On Process' | 'Ready to Pick Up' | 'Completed'

DO $$ BEGIN
  CREATE TYPE order_status AS ENUM (
    'Pending',
    'On Process',
    'Ready to Pick Up',
    'Completed'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS orders (
  id             UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID          NOT NULL REFERENCES users(id),
  customer_name  TEXT          NOT NULL,
  total_price    NUMERIC(10,2) NOT NULL CHECK (total_price >= 0),
  status         order_status  NOT NULL DEFAULT 'Pending',
  created_at     TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS orders_user_id_idx ON orders(user_id);
CREATE INDEX IF NOT EXISTS orders_status_idx  ON orders(status);
