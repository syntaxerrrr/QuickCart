-- Migration: 005_add_cancelled_status
-- Adds 'Cancelled' to the order_status enum to support order cancellation

ALTER TYPE order_status ADD VALUE IF NOT EXISTS 'Cancelled';
