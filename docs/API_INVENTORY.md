# API Inventory & Command Center Routes

## Existing API Routes Analysis

### Current Flask Routes (from server.py)
```
GET  /                           - Health check
POST /create-payment-intent      - Stripe payment intent
POST /create-tripwire-session    - Digital Marketing Domination book
POST /create-membership-session  - Revenue Ripple membership
POST /create-reseller-session    - Reseller subscription
POST /create-pro-reseller-session - Pro reseller subscription
POST /create-founders-annual-session - Founder Annual subscription
POST /create-founders-monthly-session - Founder Monthly subscription
GET  /founders-spots-remaining   - Spots counter API
POST /webhook                    - Stripe webhook handler
POST /paypal/payout              - PayPal payout creation
```

### Current Auth Pattern
- **No explicit auth middleware** in Flask routes
- **Supabase client-side auth** with JWT tokens
- **Service role** used for server-side operations
- **No rate limiting** implemented

### Current Error Handling
```python
try:
    # operation
    return jsonify({'success': True, 'data': result})
except Exception as e:
    return jsonify({'error': str(e)}), 400
```

### Current Response Format
```json
{
  "success": true,
  "data": {...},
  "error": "message"
}
```

## Proposed Command Center Routes

### Agent Management Routes
```python
# Agent Catalog
GET  /api/agents/catalog          - List available agents
GET  /api/agents/catalog/:id      - Get specific agent details

# Agent Instances
POST /api/agents/list             - List user's agent instances
POST /api/agents/create           - Create new agent instance
POST /api/agents/update           - Update agent instance
POST /api/agents/delete           - Delete agent instance

# Agent Execution
POST /api/agents/run              - Execute agent
GET  /api/agents/runs/:id         - Get run status/results
POST /api/agents/runs/list        - List user's runs

# Credentials Management
POST /api/credentials/upsert      - Save/update credentials
POST /api/credentials/list        - List user's credentials
POST /api/credentials/delete      - Delete credentials

# Webhooks
POST /api/webhooks/n8n/run-callback - n8n execution callback
```

### Route Implementation Plan

#### 1. Agent Catalog Routes
```python
@app.route('/api/agents/catalog', methods=['GET'])
def get_agent_catalog():
    """Get available agent types"""
    if not is_feature_enabled():
        return jsonify({'error': 'Feature disabled'}), 403
    
    try:
        # Read-only query to agent_catalog
        result = supabase.table('agent_catalog').select('*').eq('is_active', True).execute()
        return jsonify({'success': True, 'data': result.data})
    except Exception as e:
        return jsonify({'error': str(e)}), 500
```

#### 2. Agent Instances Routes
```python
@app.route('/api/agents/list', methods=['POST'])
def list_agent_instances():
    """List user's agent instances"""
    if not is_feature_enabled():
        return jsonify({'error': 'Feature disabled'}), 403
    
    try:
        # Get user from request (implement auth middleware)
        user_id = get_user_from_request(request)
        if not user_id:
            return jsonify({'error': 'Unauthorized'}), 401
        
        # Read user's instances
        result = supabase.table('agent_instances').select('*').eq('user_id', user_id).execute()
        return jsonify({'success': True, 'data': result.data})
    except Exception as e:
        return jsonify({'error': str(e)}), 500
```

#### 3. Agent Execution Routes
```python
@app.route('/api/agents/run', methods=['POST'])
def run_agent():
    """Execute an agent instance"""
    if not is_feature_enabled():
        return jsonify({'error': 'Feature disabled'}), 403
    
    try:
        data = request.get_json()
        user_id = get_user_from_request(request)
        instance_id = data.get('instance_id')
        
        if not instance_id:
            return jsonify({'error': 'instance_id required'}), 400
        
        # Create run record
        run_data = {
            'user_id': user_id,
            'instance_id': instance_id,
            'status': 'pending'
        }
        
        if is_write_mode_enabled():
            result = supabase.table('agent_runs').insert(run_data).execute()
            return jsonify({'success': True, 'data': result.data})
        else:
            # Read-only mode - return mock data
            return jsonify({'success': True, 'data': {'id': 'mock-run-id', 'status': 'simulated'}})
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500
```

#### 4. n8n Webhook Callback
```python
@app.route('/api/webhooks/n8n/run-callback', methods=['POST'])
def n8n_run_callback():
    """Handle n8n execution callbacks"""
    if not is_feature_enabled():
        return jsonify({'error': 'Feature disabled'}), 403
    
    try:
        # Validate shared secret
        secret = request.headers.get('X-Webhook-Secret')
        if secret != os.getenv('N8N_WEBHOOK_SECRET'):
            return jsonify({'error': 'Invalid secret'}), 401
        
        data = request.get_json()
        
        # Validate payload structure
        required_fields = ['user_id', 'instance_id', 'agent_id', 'status']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Missing field: {field}'}), 400
        
        # Log the callback (read-only for now)
        print(f"n8n callback received: {data}")
        
        if is_write_mode_enabled():
            # Update run status in database
            supabase.table('agent_runs').update({
                'status': data['status'],
                'finished_at': data.get('finished_at'),
                'output_json': data.get('output_json'),
                'error_text': data.get('error_text')
            }).eq('id', data.get('run_id')).execute()
        
        return jsonify({'success': True, 'message': 'Callback processed'})
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500
```

## Feature Flag Implementation

### Environment Variables
```bash
# Command Center Feature Flag
REVRIPPLE_COMMAND_CENTER_ENABLED=true

# Write Mode (staging only)
REVRIPPLE_WRITE_MODE=true

# n8n Integration
N8N_WEBHOOK_SECRET=your_shared_secret
N8N_BASE_URL=https://your-n8n-instance.com
```

### Feature Flag Functions
```python
def is_feature_enabled():
    """Check if Command Center feature is enabled"""
    return os.getenv('REVRIPPLE_COMMAND_CENTER_ENABLED', 'false').lower() == 'true'

def is_write_mode_enabled():
    """Check if write mode is enabled (staging only)"""
    return os.getenv('REVRIPPLE_WRITE_MODE', 'false').lower() == 'true'

def get_user_from_request(request):
    """Extract user ID from request (implement auth middleware)"""
    # TODO: Implement proper auth middleware
    # For now, return mock user ID
    return 'mock-user-id'
```

## Error Handling Standards

### Consistent Error Format
```python
def handle_error(error, status_code=500):
    """Standardized error handling"""
    return jsonify({
        'success': False,
        'error': str(error),
        'timestamp': datetime.now().isoformat()
    }), status_code
```

### Error Categories
- **400**: Bad Request (missing fields, invalid data)
- **401**: Unauthorized (invalid auth, missing tokens)
- **403**: Forbidden (feature disabled, insufficient permissions)
- **404**: Not Found (agent not found, instance not found)
- **429**: Rate Limited (too many requests)
- **500**: Internal Server Error (database errors, external API failures)

## Pagination Standard

### Request Format
```json
{
  "page": 1,
  "limit": 20,
  "sort_by": "created_at",
  "sort_order": "desc"
}
```

### Response Format
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "pages": 5,
    "has_next": true,
    "has_prev": false
  }
}
```

## Security Considerations

### Authentication Middleware
```python
def require_auth(f):
    """Decorator to require authentication"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        # TODO: Implement proper JWT validation
        user_id = get_user_from_request(request)
        if not user_id:
            return jsonify({'error': 'Unauthorized'}), 401
        return f(*args, **kwargs)
    return decorated_function
```

### Rate Limiting
```python
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address

limiter = Limiter(
    app,
    key_func=get_remote_address,
    default_limits=["100 per hour"]
)

@app.route('/api/agents/run', methods=['POST'])
@limiter.limit("10 per minute")
def run_agent():
    # Implementation
```

### Input Validation
```python
def validate_agent_config(config):
    """Validate agent configuration"""
    required_fields = ['name', 'catalog_id']
    for field in required_fields:
        if field not in config:
            raise ValueError(f'Missing required field: {field}')
    return True
```
