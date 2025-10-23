# Command Center Rollout Plan

## Overview
This document outlines the complete rollout plan for the Revenue Ripple Command Center feature, including schema changes, API routes, UI components, and deployment steps.

## 1. Schema Plan

### New Tables (Non-Destructive)
All new tables use `CREATE TABLE IF NOT EXISTS` to avoid conflicts:

```sql
-- Core Agent Tables
agent_catalog          - Available agent types
agent_instances        - User-configured agents
agent_credentials      - Encrypted credentials
agent_runs            - Execution history
agent_alerts          - Notifications
usage_counters        - Rate limiting
```

### Migration File
- **Location**: `db/migrations/20241201_rr_command_center.sql`
- **Safe Operations**: All operations use `IF NOT EXISTS` or `IF NOT EXISTS` patterns
- **RLS Policies**: Enabled on all new tables with user-based access control
- **Indexes**: Performance indexes on foreign keys and frequently queried columns

## 2. New API Routes

### Agent Management
```
GET  /api/agents/catalog          - List available agents
GET  /api/agents/catalog/:id      - Get agent details
POST /api/agents/list             - List user instances
POST /api/agents/create           - Create agent instance
POST /api/agents/update           - Update agent instance
POST /api/agents/delete           - Delete agent instance
```

### Agent Execution
```
POST /api/agents/run              - Execute agent
GET  /api/agents/runs/:id         - Get run status
POST /api/agents/runs/list        - List user runs
```

### Credentials Management
```
POST /api/credentials/upsert      - Save credentials
POST /api/credentials/list        - List credentials
POST /api/credentials/delete      - Delete credentials
```

### Webhooks
```
POST /api/webhooks/n8n/run-callback - n8n execution callback
```

### Health Check
```
GET  /api/command-center/health    - Feature status check
```

## 3. Feature Flag Implementation

### Environment Variables
```bash
# Feature Control
REVRIPPLE_COMMAND_CENTER_ENABLED=true

# Write Mode (Staging Only)
REVRIPPLE_WRITE_MODE=false

# n8n Integration
N8N_WEBHOOK_SECRET=your_shared_secret
N8N_BASE_URL=https://your-n8n-instance.com
```

### Feature Flag Functions
```python
def is_feature_enabled():
    return os.getenv('REVRIPPLE_COMMAND_CENTER_ENABLED', 'false').lower() == 'true'

def is_write_mode_enabled():
    return os.getenv('REVRIPPLE_WRITE_MODE', 'false').lower() == 'true'
```

## 4. UI Implementation

### Command Center Page
- **File**: `src/pages/CommandCenter.jsx`
- **Route**: `/command-center` (add to App.jsx)
- **Features**:
  - Agent catalog display
  - Instance management
  - Run execution
  - Credentials modal
  - Recent runs history

### Integration Steps
1. Add route to `src/App.jsx`:
```jsx
<Route path="/command-center" element={<ProtectedRoute><CommandCenter /></ProtectedRoute>} />
```

2. Add navigation link to Navbar component
3. Implement feature flag check in frontend

## 5. Deployment Checklist

### Phase 1: Schema Deployment
- [ ] Run migration: `db/migrations/20241201_rr_command_center.sql`
- [ ] Verify tables created successfully
- [ ] Check RLS policies are active
- [ ] Test with sample data

### Phase 2: Backend Integration
- [ ] Add `command_center_routes.py` to Flask app
- [ ] Register blueprint in `server.py`
- [ ] Set environment variables
- [ ] Test API endpoints (read-only mode)

### Phase 3: Frontend Integration
- [ ] Add CommandCenter component to pages
- [ ] Add route to App.jsx
- [ ] Add navigation link
- [ ] Test UI functionality

### Phase 4: Feature Flag Testing
- [ ] Test with `REVRIPPLE_COMMAND_CENTER_ENABLED=false`
- [ ] Test with `REVRIPPLE_COMMAND_CENTER_ENABLED=true`
- [ ] Verify graceful degradation

### Phase 5: Write Mode Testing (Staging Only)
- [ ] Set `REVRIPPLE_WRITE_MODE=true` in staging
- [ ] Test database writes
- [ ] Verify data persistence
- [ ] Test error handling

## 6. Security Considerations

### Authentication
- All routes require authentication via `@require_auth` decorator
- User context extracted from JWT tokens
- User isolation enforced via RLS policies

### Credentials Security
- Credentials encrypted before storage
- No plaintext credential transmission
- User-scoped access only

### Rate Limiting
- Implement rate limiting on execution endpoints
- Usage counters for quota management
- Per-user limits enforced

## 7. Testing Strategy

### Unit Tests
- [ ] Feature flag functions
- [ ] Authentication middleware
- [ ] Error handling
- [ ] Input validation

### Integration Tests
- [ ] API endpoint responses
- [ ] Database operations
- [ ] Webhook callbacks
- [ ] Frontend-backend communication

### End-to-End Tests
- [ ] Complete user workflow
- [ ] Agent creation and execution
- [ ] Credentials management
- [ ] Error scenarios

## 8. Monitoring and Observability

### Logging
- All API calls logged with user context
- Error logging with stack traces
- Performance metrics collection

### Alerts
- Failed agent executions
- High error rates
- Unusual usage patterns
- Security violations

### Metrics
- Agent execution success rate
- Average execution time
- User adoption metrics
- Feature usage analytics

## 9. Rollback Plan

### Immediate Rollback
1. Set `REVRIPPLE_COMMAND_CENTER_ENABLED=false`
2. Remove frontend route
3. Disable API endpoints

### Data Rollback
- Tables can be dropped if needed (with user approval)
- No existing data affected
- Migration is reversible

### Code Rollback
- Remove blueprint registration
- Remove frontend components
- Revert environment variables

## 10. Success Metrics

### Technical Metrics
- API response times < 200ms
- 99.9% uptime
- Zero data loss
- Successful feature flag toggles

### Business Metrics
- User adoption rate
- Agent execution frequency
- Feature engagement
- Customer satisfaction

## 11. Post-Launch Tasks

### Immediate (Week 1)
- [ ] Monitor error rates
- [ ] Collect user feedback
- [ ] Fix critical bugs
- [ ] Performance optimization

### Short-term (Month 1)
- [ ] Add more agent types
- [ ] Implement scheduling
- [ ] Add advanced features
- [ ] User training materials

### Long-term (Quarter 1)
- [ ] AI-powered agent suggestions
- [ ] Advanced analytics
- [ ] Third-party integrations
- [ ] Enterprise features

## 12. Approval Checkpoint

### Review Required
- [ ] Schema changes approved
- [ ] Security review completed
- [ ] Performance impact assessed
- [ ] Rollback plan validated

### Sign-off Required
- [ ] Database administrator
- [ ] Security team
- [ ] Product owner
- [ ] Engineering lead

---

**Next Steps**: After approval, proceed with Phase 1 deployment and begin testing in staging environment.
