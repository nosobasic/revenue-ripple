-- Migration: Add missing payment columns to users table
-- Run this in your Supabase SQL editor if you get 500 errors

-- Add has_paid column
ALTER TABLE users ADD COLUMN IF NOT EXISTS has_paid BOOLEAN DEFAULT FALSE;

-- Add payment_status column  
ALTER TABLE users ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'pending';

-- Optional: Add check constraint for payment_status
-- ALTER TABLE users ADD CONSTRAINT payment_status_check 
--   CHECK (payment_status IN ('pending', 'completed', 'failed', 'refunded'));

-- To grant yourself admin access, run:
-- UPDATE users SET role = 'admin' WHERE email = 'your-email@example.com';
