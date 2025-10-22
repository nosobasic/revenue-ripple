# Command Center Environment Setup

## Required Environment Variables

Add these environment variables to your `.env` file or deployment environment:

### Feature Control
```bash
# Enable/disable Command Center feature
REVRIPPLE_COMMAND_CENTER_ENABLED=true

# Enable write mode (staging only - allows database writes)
REVRIPPLE_WRITE_MODE=false
```

### External Integrations (Optional)
```bash
# n8n Integration (for external automation)
N8N_WEBHOOK_SECRET=your_shared_secret_here
N8N_BASE_URL=https://your-n8n-instance.com

# Slack Alerts (for error notifications)
REV_LOG_SLACK_URL=https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK
```

## Deployment Steps

### 1. Database Migration
Run the SQL migration in your Supabase SQL editor:
```sql
-- Copy and paste the contents of db/migrations/20241201_rr_command_center.sql
```

### 2. Environment Variables
Add the environment variables above to your deployment platform:
- **Render**: Add in Environment Variables section
- **Vercel**: Add in Environment Variables section  
- **Local**: Add to `.env` file

### 3. Restart Application
Restart your application to load the new environment variables.

### 4. Test Feature Flag
Visit `/api/command-center/health` to verify the feature is enabled.

## Feature Flag Behavior

### When `REVRIPPLE_COMMAND_CENTER_ENABLED=false` (default)
- Command Center page shows "Feature disabled" message
- API endpoints return 403 Forbidden
- Navigation link still appears but page is disabled

### When `REVRIPPLE_COMMAND_CENTER_ENABLED=true`
- Command Center page loads normally
- API endpoints are active
- Navigation link works

### When `REVRIPPLE_WRITE_MODE=false` (default)
- API endpoints return mock/simulated data
- No database writes occur
- Safe for production testing

### When `REVRIPPLE_WRITE_MODE=true` (staging only)
- API endpoints perform real database operations
- Data is persisted to database
- Use only in staging environment

## Testing Commands

### Check Feature Status
```bash
curl https://your-domain.com/api/command-center/health
```

### Test Agent Catalog
```bash
curl https://your-domain.com/api/agents/catalog
```

### Test Agent List (requires authentication)
```bash
curl -X POST https://your-domain.com/api/agents/list \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{}'
```

## Rollback Instructions

### Disable Feature
```bash
REVRIPPLE_COMMAND_CENTER_ENABLED=false
```

### Remove Database Tables (if needed)
```sql
-- Only run if you need to completely remove Command Center
DROP TABLE IF EXISTS usage_counters;
DROP TABLE IF EXISTS agent_alerts;
DROP TABLE IF EXISTS agent_runs;
DROP TABLE IF EXISTS agent_credentials;
DROP TABLE IF EXISTS agent_instances;
DROP TABLE IF EXISTS agent_catalog;
```

## Security Notes

- All API endpoints require authentication
- Credentials are encrypted before storage
- User data is isolated via RLS policies
- No sensitive data is logged
