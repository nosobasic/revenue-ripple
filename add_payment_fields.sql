-- Add payment verification fields to users table
-- Run this in your Supabase SQL editor

ALTER TABLE users 
ADD COLUMN IF NOT EXISTS has_paid BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS payment_status VARCHAR(20) DEFAULT 'pending';

-- Update existing users who have completed payments
-- This should be run after the webhook has processed existing payments
UPDATE users 
SET has_paid = TRUE, payment_status = 'completed'
WHERE role IN ('member', 'reseller', 'pro_reseller') 
AND email IN (
  SELECT DISTINCT customer_email 
  FROM subscriptions 
  WHERE status = 'active'
);

-- Create index for faster payment status queries
CREATE INDEX IF NOT EXISTS idx_users_payment_status ON users(payment_status);
CREATE INDEX IF NOT EXISTS idx_users_has_paid ON users(has_paid);
