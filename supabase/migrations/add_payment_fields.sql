-- Add payment verification fields to users table
-- Run this in your Supabase SQL editor

-- Add the new payment fields to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS has_paid BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS payment_status VARCHAR(20) DEFAULT 'pending';

-- Update existing users who have completed payments
-- Check subscriptions table for users who have active subscriptions
UPDATE users 
SET has_paid = TRUE, payment_status = 'completed'
WHERE role IN ('member', 'reseller', 'pro_reseller') 
AND email IN (
  SELECT DISTINCT email 
  FROM subscriptions 
  WHERE status = 'active' OR status = 'completed'
);

-- Also check tripwire_purchases for users who bought the book
UPDATE users 
SET has_paid = TRUE, payment_status = 'completed'
WHERE email IN (
  SELECT DISTINCT email 
  FROM tripwire_purchases
);

-- Check founders_annual_members for users who have founders access
UPDATE users 
SET has_paid = TRUE, payment_status = 'completed'
WHERE email IN (
  SELECT DISTINCT email 
  FROM founders_annual_members
  WHERE is_active = true
);

-- Create indexes for faster payment status queries
CREATE INDEX IF NOT EXISTS idx_users_payment_status ON users(payment_status);
CREATE INDEX IF NOT EXISTS idx_users_has_paid ON users(has_paid);

-- Ensure admin users always have access (bypass payment requirement)
UPDATE users 
SET has_paid = TRUE, payment_status = 'admin_access'
WHERE role = 'admin';

-- Specifically ensure donte97@gmail.com has admin access
UPDATE users 
SET has_paid = TRUE, payment_status = 'admin_access', role = 'admin'
WHERE email = 'donte97@gmail.com';

-- Show the results
SELECT 
  email, 
  role, 
  has_paid, 
  payment_status,
  created_at
FROM users 
WHERE has_paid = TRUE
ORDER BY created_at DESC
LIMIT 10;
