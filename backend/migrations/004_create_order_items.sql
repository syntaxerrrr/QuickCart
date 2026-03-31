-- Migration: 004_create_order_items
-- Creates order_items table to normalize CartItem[] stored inside Order.items
-- Snapshots item name/category/price at time of order so history is preserved
-- even if the grocery_item is later edited or deleted.

CREATE TABLE IF NOT EXISTS order_items (
  id               UUID           PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id         UUID           NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  grocery_item_id  UUID           REFERENCES grocery_items(id) ON DELETE SET NULL,
  item_name        TEXT           NOT NULL,
  item_category    TEXT           NOT NULL,
  item_price       NUMERIC(10,2)  NOT NULL,
  quantity         INTEGER        NOT NULL CHECK (quantity > 0),
  created_at       TIMESTAMPTZ    NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS order_items_order_id_idx ON order_items(order_id);
