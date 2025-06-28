# DevOps Integration Setup Guide

## 🚀 Overview

This guide provides a complete DevOps integration solution between Revenue Ripple and your DevOpsModule repository. The integration includes:

- **API Key Management**: Secure key generation and management
- **Real-time Data Sync**: Live data flow from Revenue Ripple to DevOps
- **Webhook Integration**: Bi-directional communication
- **Native Dashboard**: Replace iframe with seamless integration

## 🔧 Setup Instructions

### 1. Database Setup

Run the following SQL in your Supabase SQL editor:

```sql
-- Copy contents from create_devops_tables.sql
```

### 2. Environment Variables

Add to your `.env` file:

```bash
# Existing variables...
DEVOPS_MODULE_URL=https://dev-ops-modules-wdonte97.replit.app
DEVOPS_WEBHOOK_SECRET=your-webhook-secret-here
```

### 3. Server Setup

The server now includes these new endpoints:

#### API Key Management
- `POST /api/devops/generate-key` - Generate new API key
- `GET /api/devops/keys` - List user's API keys

#### Data Sync Endpoints
- `GET /api/devops/sync/users` - Sync user metrics
- `GET /api/devops/sync/revenue` - Sync revenue data  
- `GET /api/devops/sync/commissions` - Sync commission data

#### Webhook Integration
- `POST /api/devops/webhook` - Receive DevOps webhooks

## 📊 Admin Panel Integration

The admin panel now includes a native DevOps Integration page at `/admin/embedded-widget` with:

### Features:
1. **Integration Status Dashboard**
   - Connection status
   - Last sync time
   - Real-time metrics

2. **API Key Management**
   - Generate new keys
   - View key usage
   - Revoke keys

3. **DevOps Metrics Display**
   - System uptime
   - Response times
   - Error rates
   - Recent deployments

4. **Real-time Sync**
   - Manual sync triggers
   - Automatic refresh every 30 seconds
   - Status indicators

## 🔐 API Key Usage

### Generate API Key

1. Go to `/admin/embedded-widget`
2. Click "Generate New Key"
3. Enter a descriptive name
4. Copy the generated key (shown only once)

### Use API Key in DevOps Module

```javascript
// Example usage in your DevOps module
const API_KEY = 'rr_your-generated-key-here';
const BASE_URL = 'https://your-revenue-ripple-domain.com';

// Fetch user metrics
const userMetrics = await fetch(`${BASE_URL}/api/devops/sync/users`, {
  headers: {
    'x-api-key': API_KEY
  }
});

// Fetch revenue data
const revenueData = await fetch(`${BASE_URL}/api/devops/sync/revenue`, {
  headers: {
    'x-api-key': API_KEY
  }
});

// Send webhook to Revenue Ripple
await fetch(`${BASE_URL}/api/devops/webhook`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': API_KEY
  },
  body: JSON.stringify({
    event_type: 'deployment',
    status: 'success',
    version: '1.2.3',
    timestamp: new Date().toISOString()
  })
});
```

## 📡 Data Sync Examples

### User Metrics Response
```json
{
  "timestamp": "2024-01-15T10:30:00Z",
  "total_users": 150,
  "users_by_role": {
    "admin": 2,
    "member": 100,
    "reseller": 30,
    "pro_reseller": 18
  },
  "users_by_status": {
    "active": 140,
    "inactive": 10
  },
  "recent_signups": 12,
  "users": [...] // Full user data
}
```

### Revenue Metrics Response
```json
{
  "timestamp": "2024-01-15T10:30:00Z",
  "total_revenue": 15750,
  "subscription_revenue": 14500,
  "tripwire_revenue": 1250,
  "monthly_recurring_revenue": 8500,
  "active_subscriptions": 85,
  "subscription_breakdown": {
    "membership": {"count": 50, "revenue": 3500},
    "reseller": {"count": 25, "revenue": 3500},
    "pro_reseller": {"count": 10, "revenue": 7500}
  },
  "recent_transactions": [...]
}
```

### Commission Metrics Response
```json
{
  "timestamp": "2024-01-15T10:30:00Z",
  "total_commissions": 7875,
  "total_transactions": 156,
  "top_performers": [
    {
      "username": "affiliate1",
      "total_commission": 1250,
      "transaction_count": 15
    }
  ],
  "commission_by_tier": {
    "membership": {"count": 75, "total": 3500},
    "reseller": {"count": 45, "total": 2250},
    "pro_reseller": {"count": 36, "total": 2125}
  },
  "recent_commissions": [...]
}
```

## 🔄 Webhook Integration

### Send Webhooks from DevOps to Revenue Ripple

```javascript
// Deployment notification
await fetch('/api/devops/webhook', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': 'your-api-key'
  },
  body: JSON.stringify({
    event_type: 'deployment',
    environment: 'production',
    version: '1.2.3',
    status: 'success',
    deployTime: 45,
    timestamp: new Date().toISOString()
  })
});

// System alert
await fetch('/api/devops/webhook', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': 'your-api-key'
  },
  body: JSON.stringify({
    event_type: 'alert',
    severity: 'warning',
    message: 'High CPU usage detected',
    details: {
      cpu_usage: '92%',
      threshold: '85%',
      duration: '5 minutes'
    },
    timestamp: new Date().toISOString()
  })
});
```

## 🚦 Testing the Integration

### 1. Server Test
```bash
# Activate virtual environment
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start server
python3 server.py
```

### 2. API Key Test
```bash
# Test API key generation (replace with actual admin user ID)
curl -X POST http://localhost:5000/api/devops/generate-key \
  -H "Content-Type: application/json" \
  -d '{"user_id": "admin-user-id", "name": "Test Key"}'

# Test data sync (replace with generated API key)
curl -H "x-api-key: rr_your-generated-key" \
  http://localhost:5000/api/devops/sync/users
```

### 3. Frontend Test
1. Visit `/admin/embedded-widget`
2. Generate an API key
3. Test sync functionality
4. Verify real-time updates

## 🔒 Security Features

### API Key Security
- Keys are hashed in database using SHA-256
- Keys have expiration dates (default: 1 year)
- Permission-based access control
- Usage tracking and logging

### Authentication
- Admin-only access to API key management
- Row-level security on database tables
- Secure webhook signature validation

### Rate Limiting (Recommended)
Add rate limiting to protect your endpoints:

```python
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address

limiter = Limiter(
    app,
    key_func=get_remote_address,
    default_limits=["1000 per hour"]
)

@app.route('/api/devops/sync/users')
@limiter.limit("100 per hour")
def sync_users_to_devops():
    # ... existing code
```

## 🚀 Going Live

### Pre-Production Checklist
- [ ] Database tables created
- [ ] Environment variables set
- [ ] API keys generated and tested
- [ ] Webhook endpoints tested
- [ ] Admin panel integration verified
- [ ] DevOps module updated to use new API

### Production Deployment
1. Deploy server with new endpoints
2. Update DevOps module with API key
3. Configure webhooks in DevOps module
4. Test full integration flow
5. Monitor API key usage and logs

## 🛠️ Troubleshooting

### Common Issues

**API Key Not Working**
- Check key format (should start with `rr_`)
- Verify key hasn't expired
- Check user has admin role
- Ensure key has correct permissions

**Data Sync Failing**
- Verify database connections
- Check Supabase permissions
- Validate API key authentication
- Review server logs for errors

**Admin Panel Not Loading**
- Check user authentication
- Verify admin role in database
- Clear browser cache
- Check browser console for errors

### Debug Endpoints

Add these for debugging (remove in production):

```python
@app.route('/api/debug/api-keys', methods=['GET'])
def debug_api_keys():
    # Debug endpoint to check API key status
    # Remove in production
    pass
```

## 📈 Benefits of This Integration

### Instead of Iframe:
❌ **Old Approach**: Basic iframe embedding
- Limited interaction
- No data sharing
- Security restrictions
- Poor user experience

✅ **New Approach**: Native API integration
- Real-time data flow
- Secure authentication
- Seamless user experience
- Full control over presentation

### Data Flow Benefits:
- **Real-time sync**: Live data updates every 30 seconds
- **Historical data**: Access to complete transaction history
- **Metrics aggregation**: Pre-calculated KPIs and analytics
- **Webhook notifications**: Instant alerts and updates

---

**🎉 Result**: You now have a production-ready DevOps integration that provides seamless data flow between Revenue Ripple and your DevOps module, with secure API key management and real-time monitoring capabilities.