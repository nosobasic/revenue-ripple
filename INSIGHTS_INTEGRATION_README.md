# Revenue Ripple Insights Integration

This document describes the complete integration of AI-powered insights functionality into the Revenue Ripple application, including daily insights caching, quota enforcement, and tier-based access control.

## Overview

The insights integration provides:
- **Daily Insights**: Cached "Insight of the Day" for each user
- **Quota Enforcement**: Core tier users limited to 10 insights/month, Growth/Partner unlimited
- **Multiple Insight Types**: Prompts, suggestions, competitor analysis, and analytics
- **Environment Toggle**: Feature flag to enable/disable Flask insights backend

## Architecture

### Backend (Flask)
- **Blueprint**: `insights/routes.py` - REST API endpoints
- **Repository**: `insights/repo.py` - Database operations
- **Models**: `insights/models.py` - Pydantic data models
- **Middleware**: `insights/middleware/entitlements.py` - Tier-based access control

### Frontend (React)
- **API Client**: `src/api/insightsClient.js` - Typed API client with Zod validation
- **Components**: 
  - `InsightOfDayCard.jsx` - Daily insight display
  - `InsightsWidget.jsx` - Dashboard widget
  - `Insights.jsx` - Full insights page
- **Environment**: `VITE_USE_FLASK_INSIGHTS=true` toggle

### Database
- **Tables**: 
  - `insights_usage` - Monthly usage tracking
  - `insight_daily_cache` - Daily insights caching
  - `ai_prompts` - User-created prompts

## Setup Instructions

### 1. Environment Configuration

Add to your `.env` file:
```bash
# Enable Flask insights backend
VITE_USE_FLASK_INSIGHTS=true

# Database connection (required for insights)
SUPABASE_DB_URL=postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres
```

### 2. Database Setup

Run the insights tables creation script:
```sql
-- Execute in Supabase SQL editor
\i create_insights_tables.sql
```

This creates:
- `insights_usage` table for quota tracking
- `insight_daily_cache` table for daily insights
- Proper indexes and RLS policies

### 3. Backend Integration

The Flask insights blueprint is automatically registered in `server.py`:
```python
from insights.routes import insights_bp
app.register_blueprint(insights_bp)
```

### 4. Frontend Integration

The insights components are ready to use:
- `InsightsWidget` - Add to dashboard
- `InsightOfDayCard` - Display daily insights
- `Insights` page - Full insights interface

## API Endpoints

### Daily Insights
```
GET /insights/api/daily?business_id=optional
```
- Returns cached daily insight or generates new one
- Enforces quotas for Core tier users
- Supports business-specific insights

### Prompts
```
GET /insights/api/prompts
POST /insights/api/prompts
PUT /insights/api/prompts/{id}
DELETE /insights/api/prompts/{id}
```
- CRUD operations for AI prompts
- Tier-based limits applied

### Suggestions
```
GET /insights/api/suggestions?q=optional&business_id=optional
```
- AI-powered business suggestions
- Quota enforcement for Core tier

### Competitors (Growth/Partner only)
```
GET /insights/api/competitors?industry=optional&limit=50
```
- Competitor analysis data
- Requires Growth or Partner tier

### Analytics (Growth/Partner only)
```
GET /insights/api/analytics?from=YYYY-MM-DD&to=YYYY-MM-DD&group_by=day&metrics=impressions,clicks
```
- Business analytics with time-series data
- Requires Growth or Partner tier

### Health Check
```
GET /insights/api/health
```
- API health status
- Version and tier system info

## Quota System

### Core Tier
- **Limit**: 10 insights per month
- **Endpoints**: Daily insights, prompts, suggestions
- **Behavior**: Returns 403 with `QUOTA_EXCEEDED` code when limit reached

### Growth/Partner Tier
- **Limit**: Unlimited
- **Endpoints**: All insights features
- **Additional**: Competitor analysis, advanced analytics

### Usage Tracking
- Monthly usage stored in `insights_usage` table
- Automatic increment on each request
- Resets monthly on the 1st of each month

## Caching System

### Daily Insights Cache
- **Key**: `(user_id, day, business_id)`
- **Storage**: `insight_daily_cache` table
- **Behavior**: 
  - First request generates and caches insight
  - Subsequent requests return cached version
  - Cache expires daily at midnight

### Cache Structure
```sql
CREATE TABLE insight_daily_cache (
    id uuid PRIMARY KEY,
    user_id uuid NOT NULL,
    business_id uuid NULL,
    day date NOT NULL,
    title text NULL,
    suggestion text NOT NULL,
    source text NOT NULL,
    created_at timestamptz DEFAULT now(),
    UNIQUE(user_id, day, business_id)
);
```

## Testing

### Automated Tests
Run the comprehensive test suite:
```bash
python test_insights_integration.py
```

Tests include:
- ✅ Health check endpoint
- ✅ Environment toggle verification
- ✅ API endpoints functionality
- ✅ Daily insight caching
- ✅ Quota enforcement for Core tier
- ✅ Unlimited access for Growth tier

### Manual Testing

1. **Enable Flask Insights**:
   ```bash
   export VITE_USE_FLASK_INSIGHTS=true
   ```

2. **Start the Flask server**:
   ```bash
   python server.py
   ```

3. **Test daily insights**:
   ```bash
   curl -H "Authorization: Bearer test-token" \
        "http://localhost:5000/insights/api/daily"
   ```

4. **Test quota enforcement**:
   ```bash
   # Make 11 requests to test Core tier limit
   for i in {1..11}; do
     curl -H "Authorization: Bearer test-token-core-user" \
          "http://localhost:5000/insights/api/daily"
   done
   ```

## Frontend Usage

### Adding Insights Widget to Dashboard
```jsx
import InsightsWidget from '../components/InsightsWidget';

// In your dashboard component
<InsightsWidget />
```

### Using the API Client
```javascript
import { fetchDailyInsight, fetchSuggestions } from '../api/insightsClient';

// Get daily insight
const insight = await fetchDailyInsight(token, { business_id: 'optional' });

// Get suggestions
const suggestions = await fetchSuggestions(token, { q: 'marketing' });
```

### Environment Toggle
The frontend respects the `VITE_USE_FLASK_INSIGHTS` environment variable:
- `true`: Use Flask insights backend
- `false`: Use legacy endpoints (if available)

## Error Handling

### Common Error Codes
- `401`: Authentication required
- `403`: Insufficient tier or quota exceeded
- `404`: Resource not found
- `500`: Server error

### Error Response Format
```json
{
  "error": "Monthly insights quota exceeded",
  "code": "QUOTA_EXCEEDED",
  "details": {
    "current_usage": 10,
    "limit": 10
  }
}
```

## Security

### Row Level Security (RLS)
- Users can only access their own data
- Automatic filtering by `auth.uid()`
- Secure by default

### Tier Enforcement
- Middleware validates user tier on each request
- Automatic quota checking for Core tier
- Graceful degradation for insufficient permissions

### Input Validation
- Pydantic models validate all inputs
- SQL injection protection via parameterized queries
- XSS protection via proper escaping

## Performance

### Caching Strategy
- Daily insights cached to reduce AI API calls
- Database indexes on frequently queried columns
- Connection pooling for database operations

### Optimization Tips
- Use business_id parameter for business-specific insights
- Implement client-side caching for static data
- Monitor usage patterns to optimize quota limits

## Monitoring

### Key Metrics
- Daily insight generation rate
- Quota usage by tier
- API response times
- Error rates by endpoint

### Logging
- All API requests logged with user context
- Error details captured for debugging
- Performance metrics tracked

## Troubleshooting

### Common Issues

1. **"Legacy endpoint not implemented"**
   - Set `VITE_USE_FLASK_INSIGHTS=true`
   - Ensure Flask server is running

2. **"Authentication required"**
   - Check JWT token is valid
   - Verify user is logged in

3. **"Quota exceeded"**
   - Upgrade to Growth/Partner tier
   - Wait for monthly reset

4. **"Database connection error"**
   - Check `SUPABASE_DB_URL` environment variable
   - Verify database is accessible

### Debug Mode
Enable debug logging:
```python
import logging
logging.getLogger('insights').setLevel(logging.DEBUG)
```

## Future Enhancements

### Planned Features
- Real-time insights via WebSocket
- Advanced AI model integration
- Custom insight templates
- Bulk operations for enterprise users

### Scalability Improvements
- Redis caching for high-traffic scenarios
- Async insight generation
- Horizontal scaling support

## Support

For issues or questions:
1. Check the troubleshooting section
2. Run the test suite to verify functionality
3. Review logs for error details
4. Contact the development team

---

**Version**: 1.0.0  
**Last Updated**: January 2024  
**Compatibility**: Revenue Ripple v2.0+
