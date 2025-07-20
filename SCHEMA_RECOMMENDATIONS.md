# 🗄️ Database Schema Analysis & Recommendations

## ✅ **Current Schema Analysis**

Based on your actual Supabase tables, here's what you have and my recommendations:

---

## 📊 **REDUNDANT TABLES - Recommend Consolidation**

### **Payment Tracking Overlap:**
You have **3 tables** doing similar things:

1. **`subscriptions`** - Basic subscription tracking
2. **`payment_subscriptions`** - More detailed payment tracking with Stripe IDs  
3. **`transactions`** - Very basic transaction log

**💡 RECOMMENDATION:** 
- **Keep:** `payment_subscriptions` (most complete)
- **Migrate data from:** `subscriptions` → `payment_subscriptions`
- **Drop:** `transactions` (too basic) and `subscriptions` (redundant)

---

## 🎯 **TABLES TO KEEP AS-IS**

✅ **`users`** - Perfect structure
✅ **`user_progress`** - Good for overall course progress
✅ **`user_module_completion`** - Good for granular module tracking
✅ **`tripwire_purchases`** - Clean tripwire tracking
✅ **`commissions`** - Complete commission tracking
✅ **`referral_clicks`** - Basic referral tracking
✅ **`referral_signups`** - Good for signup attribution

---

## 🔧 **TABLES THAT NEED ADDITIONS**

### **`referral_clicks` - Missing Fields**
Add these columns for better tracking:
```sql
ALTER TABLE referral_clicks ADD COLUMN landing_page TEXT;
ALTER TABLE referral_clicks ADD COLUMN utm_source TEXT;
ALTER TABLE referral_clicks ADD COLUMN utm_medium TEXT;
ALTER TABLE referral_clicks ADD COLUMN utm_campaign TEXT;
ALTER TABLE referral_clicks ADD COLUMN converted BOOLEAN DEFAULT FALSE;
```

### **`commissions` - Missing Status Tracking**
Add these for payment management:
```sql
ALTER TABLE commissions ADD COLUMN timestamp TIMESTAMPTZ DEFAULT NOW();
-- Note: You already have created_at, so timestamp might be redundant
```

---

## 🆕 **MISSING TABLES - Add These**

### **`webhook_logs`** - For debugging webhooks
```sql
CREATE TABLE webhook_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source TEXT NOT NULL, -- 'stripe', 'other'
    event_type TEXT NOT NULL,
    event_data JSONB NOT NULL,
    processed BOOLEAN DEFAULT FALSE,
    processed_at TIMESTAMPTZ,
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 📋 **SCHEMA OPTIMIZATION PLAN**

### **Phase 1: Immediate Fixes**
1. ✅ Fix commission_rate format (0.5 instead of 50) - **DONE IN CODE**
2. Add missing columns to `referral_clicks`
3. Create `webhook_logs` table

### **Phase 2: Consolidation (Optional)**
1. Migrate `subscriptions` data to `payment_subscriptions`
2. Drop redundant tables
3. Add foreign key constraints

### **Phase 3: Enhancements**
1. Add indexes for performance
2. Set up proper RLS policies
3. Add data validation triggers

---

## 🚀 **IMMEDIATE SQL TO RUN**

```sql
-- Add missing webhook logs table
CREATE TABLE IF NOT EXISTS webhook_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source TEXT NOT NULL,
    event_type TEXT NOT NULL,
    event_data JSONB NOT NULL,
    processed BOOLEAN DEFAULT FALSE,
    processed_at TIMESTAMPTZ,
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enhance referral_clicks tracking
ALTER TABLE referral_clicks ADD COLUMN IF NOT EXISTS landing_page TEXT;
ALTER TABLE referral_clicks ADD COLUMN IF NOT EXISTS utm_source TEXT;
ALTER TABLE referral_clicks ADD COLUMN IF NOT EXISTS utm_medium TEXT;
ALTER TABLE referral_clicks ADD COLUMN IF NOT EXISTS utm_campaign TEXT;
ALTER TABLE referral_clicks ADD COLUMN IF NOT EXISTS converted BOOLEAN DEFAULT FALSE;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_progress_user_id ON user_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_module_completion_user_course ON user_module_completion(user_id, course_id);
CREATE INDEX IF NOT EXISTS idx_commissions_referrer ON commissions(referrer_username);
CREATE INDEX IF NOT EXISTS idx_referral_clicks_referrer ON referral_clicks(referrer_username);
CREATE INDEX IF NOT EXISTS idx_webhook_logs_event_type ON webhook_logs(event_type);

-- Enable RLS on new table
ALTER TABLE webhook_logs ENABLE ROW LEVEL SECURITY;

-- Add webhook logs policy
CREATE POLICY "Admins can view webhook logs" ON webhook_logs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role = 'admin'
        )
    );

CREATE POLICY "Service role can insert webhook logs" ON webhook_logs
    FOR INSERT WITH CHECK (true);
```

---

## 🎯 **KEY OBSERVATIONS**

### **✅ GOOD DECISIONS:**
- Separate `user_progress` and `user_module_completion` tables
- Commission rate as numeric (decimal) format
- Comprehensive funnel system with `funnels` and `funnel_steps`
- Separate referral tracking tables

### **⚠️ POTENTIAL ISSUES:**
- Multiple payment tables creating data inconsistency
- Missing webhook logging for debugging
- Limited referral click tracking data

### **🚀 CODE CHANGES MADE:**
- ✅ Updated all commission_rate handling to use decimals (0.5 = 50%)
- ✅ Updated CourseService to use `user_progress` and `user_module_completion`
- ✅ Fixed all table references to match your actual schema
- ✅ Added new methods for module completion tracking

---

## 🔄 **MIGRATION STRATEGY (If you want to consolidate)**

```sql
-- Optional: Migrate subscriptions to payment_subscriptions
INSERT INTO payment_subscriptions (user_id, amount, plan_type, status, paid_at, stripe_id)
SELECT 
    (SELECT id FROM users WHERE email = s.email) as user_id,
    s.amount,
    s.tier,
    s.status,
    s.subscribed_at,
    NULL as stripe_id
FROM subscriptions s
WHERE NOT EXISTS (
    SELECT 1 FROM payment_subscriptions ps 
    WHERE ps.user_id = (SELECT id FROM users WHERE email = s.email)
    AND ps.plan_type = s.tier
);

-- After migration, you could drop subscriptions table
-- DROP TABLE subscriptions;
```

Your current schema is actually quite well thought out! The main improvements are just adding missing columns and consolidating redundant payment tables.