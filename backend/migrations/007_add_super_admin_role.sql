-- Migration: 007_add_super_admin_role
-- Adds the 'super_admin' value to the user_role enum

ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'super_admin';
