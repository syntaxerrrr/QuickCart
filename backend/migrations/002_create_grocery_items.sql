-- Migration: 002_create_grocery_items
-- Creates the grocery_items table matching the GroceryItem interface in src/types.ts
-- Category matches the Category type: 'Coffee' | 'Milk' | 'Detergent' | 'Soap' | 'Processed Cans' | 'Softdrinks' | 'Others'

DO $$ BEGIN
  CREATE TYPE product_category AS ENUM (
    'Coffee',
    'Milk',
    'Detergent',
    'Soap',
    'Processed Cans',
    'Softdrinks',
    'Others'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS grocery_items (
  id          UUID              PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT              NOT NULL,
  category    product_category  NOT NULL,
  price       NUMERIC(10, 2)    NOT NULL CHECK (price >= 0),
  image       TEXT,
  created_at  TIMESTAMPTZ       NOT NULL DEFAULT NOW()
);
