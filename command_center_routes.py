"""
Command Center API Routes
Feature flag controlled agent management endpoints
"""

from flask import Blueprint, request, jsonify
import os
from datetime import datetime
from functools import wraps

# Create blueprint for command center routes
command_center_bp = Blueprint('command_center', __name__)

# Import supabase client (assuming it's available globally)
# from server import supabase

def is_feature_enabled():
    """Check if Command Center feature is enabled"""
    return os.getenv('REVRIPPLE_COMMAND_CENTER_ENABLED', 'false').lower() == 'true'

def is_write_mode_enabled():
    """Check if write mode is enabled (staging only)"""
    return os.getenv('REVRIPPLE_WRITE_MODE', 'false').lower() == 'true'

def get_user_from_request(request):
    """Extract user ID from request (implement auth middleware)"""
    # TODO: Implement proper auth middleware
    # For now, return mock user ID for development
    auth_header = request.headers.get('Authorization')
    if not auth_header:
        return None
    
    # Mock implementation - replace with real JWT validation
    return 'mock-user-id'

def require_auth(f):
    """Decorator to require authentication"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not is_feature_enabled():
            return jsonify({'error': 'Feature disabled'}), 403
        
        user_id = get_user_from_request(request)
        if not user_id:
            return jsonify({'error': 'Unauthorized'}), 401
        
        # Add user_id to kwargs for use in route handlers
        kwargs['user_id'] = user_id
        return f(*args, **kwargs)
    return decorated_function

def handle_error(error, status_code=500):
    """Standardized error handling"""
    return jsonify({
        'success': False,
        'error': str(error),
        'timestamp': datetime.now().isoformat()
    }), status_code

# Agent Catalog Routes
@command_center_bp.route('/api/agents/catalog', methods=['GET'])
def get_agent_catalog():
    """Get available agent types"""
    if not is_feature_enabled():
        return jsonify({'error': 'Feature disabled'}), 403
    
    try:
        # Mock data for now - replace with real database query
        catalog_data = [
            {
                'id': 'daily-pulse',
                'name': 'Daily Pulse',
                'description': 'Daily business metrics and insights',
                'category': 'analytics',
                'config_schema': {
                    'metrics': ['revenue', 'conversions', 'traffic'],
                    'frequency': 'daily'
                }
            },
            {
                'id': 'weekly-report',
                'name': 'Weekly Report',
                'description': 'Weekly performance summary',
                'category': 'reporting',
                'config_schema': {
                    'sections': ['sales', 'marketing', 'operations'],
                    'format': 'pdf'
                }
            }
        ]
        
        return jsonify({
            'success': True,
            'data': catalog_data,
            'message': 'Agent catalog retrieved successfully'
        })
        
    except Exception as e:
        return handle_error(e, 500)

@command_center_bp.route('/api/agents/catalog/<agent_id>', methods=['GET'])
def get_agent_details(agent_id):
    """Get specific agent details"""
    if not is_feature_enabled():
        return jsonify({'error': 'Feature disabled'}), 403
    
    try:
        # Mock data - replace with real database query
        agent_data = {
            'id': agent_id,
            'name': 'Daily Pulse',
            'description': 'Daily business metrics and insights',
            'category': 'analytics',
            'config_schema': {
                'metrics': ['revenue', 'conversions', 'traffic'],
                'frequency': 'daily'
            },
            'is_active': True
        }
        
        return jsonify({
            'success': True,
            'data': agent_data
        })
        
    except Exception as e:
        return handle_error(e, 500)

# Agent Instances Routes
@command_center_bp.route('/api/agents/list', methods=['POST'])
@require_auth
def list_agent_instances(user_id):
    """List user's agent instances"""
    try:
        # Mock data for now - replace with real database query
        instances_data = [
            {
                'id': 'instance-1',
                'name': 'My Daily Pulse',
                'catalog_id': 'daily-pulse',
                'config': {
                    'metrics': ['revenue', 'conversions'],
                    'frequency': 'daily'
                },
                'is_active': True,
                'created_at': '2024-01-01T00:00:00Z'
            }
        ]
        
        return jsonify({
            'success': True,
            'data': instances_data,
            'pagination': {
                'page': 1,
                'limit': 20,
                'total': 1,
                'pages': 1,
                'has_next': False,
                'has_prev': False
            }
        })
        
    except Exception as e:
        return handle_error(e, 500)

@command_center_bp.route('/api/agents/create', methods=['POST'])
@require_auth
def create_agent_instance(user_id):
    """Create new agent instance"""
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['name', 'catalog_id']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Missing required field: {field}'}), 400
        
        # Mock creation - replace with real database insert
        instance_data = {
            'id': 'new-instance-id',
            'name': data['name'],
            'catalog_id': data['catalog_id'],
            'config': data.get('config', {}),
            'is_active': True,
            'created_at': datetime.now().isoformat()
        }
        
        if is_write_mode_enabled():
            # TODO: Implement real database insert
            pass
        
        return jsonify({
            'success': True,
            'data': instance_data,
            'message': 'Agent instance created successfully'
        })
        
    except Exception as e:
        return handle_error(e, 500)

@command_center_bp.route('/api/agents/update', methods=['POST'])
@require_auth
def update_agent_instance(user_id):
    """Update agent instance"""
    try:
        data = request.get_json()
        instance_id = data.get('id')
        
        if not instance_id:
            return jsonify({'error': 'Instance ID required'}), 400
        
        # Mock update - replace with real database update
        updated_data = {
            'id': instance_id,
            'name': data.get('name', 'Updated Agent'),
            'config': data.get('config', {}),
            'updated_at': datetime.now().isoformat()
        }
        
        if is_write_mode_enabled():
            # TODO: Implement real database update
            pass
        
        return jsonify({
            'success': True,
            'data': updated_data,
            'message': 'Agent instance updated successfully'
        })
        
    except Exception as e:
        return handle_error(e, 500)

@command_center_bp.route('/api/agents/delete', methods=['POST'])
@require_auth
def delete_agent_instance(user_id):
    """Delete agent instance"""
    try:
        data = request.get_json()
        instance_id = data.get('id')
        
        if not instance_id:
            return jsonify({'error': 'Instance ID required'}), 400
        
        if is_write_mode_enabled():
            # TODO: Implement real database delete
            pass
        
        return jsonify({
            'success': True,
            'message': 'Agent instance deleted successfully'
        })
        
    except Exception as e:
        return handle_error(e, 500)

# Agent Execution Routes
@command_center_bp.route('/api/agents/run', methods=['POST'])
@require_auth
def run_agent(user_id):
    """Execute an agent instance"""
    try:
        data = request.get_json()
        instance_id = data.get('instance_id')
        
        if not instance_id:
            return jsonify({'error': 'instance_id required'}), 400
        
        # Mock execution - replace with real agent execution
        run_data = {
            'id': 'run-' + str(datetime.now().timestamp()),
            'instance_id': instance_id,
            'status': 'pending',
            'started_at': datetime.now().isoformat()
        }
        
        if is_write_mode_enabled():
            # TODO: Implement real database insert for run record
            pass
        
        return jsonify({
            'success': True,
            'data': run_data,
            'message': 'Agent execution started (simulated)'
        })
        
    except Exception as e:
        return handle_error(e, 500)

@command_center_bp.route('/api/agents/runs/<run_id>', methods=['GET'])
@require_auth
def get_run_status(run_id, user_id):
    """Get run status and results"""
    try:
        # Mock data - replace with real database query
        run_data = {
            'id': run_id,
            'status': 'completed',
            'started_at': '2024-01-01T00:00:00Z',
            'finished_at': '2024-01-01T00:05:00Z',
            'output_json': {
                'metrics': {
                    'revenue': 15000,
                    'conversions': 25,
                    'traffic': 1200
                }
            }
        }
        
        return jsonify({
            'success': True,
            'data': run_data
        })
        
    except Exception as e:
        return handle_error(e, 500)

@command_center_bp.route('/api/agents/runs/list', methods=['POST'])
@require_auth
def list_agent_runs(user_id):
    """List user's agent runs"""
    try:
        data = request.get_json() or {}
        page = data.get('page', 1)
        limit = data.get('limit', 20)
        
        # Mock data - replace with real database query
        runs_data = [
            {
                'id': 'run-1',
                'instance_id': 'instance-1',
                'status': 'completed',
                'started_at': '2024-01-01T00:00:00Z',
                'finished_at': '2024-01-01T00:05:00Z'
            }
        ]
        
        return jsonify({
            'success': True,
            'data': runs_data,
            'pagination': {
                'page': page,
                'limit': limit,
                'total': 1,
                'pages': 1,
                'has_next': False,
                'has_prev': False
            }
        })
        
    except Exception as e:
        return handle_error(e, 500)

# Credentials Management Routes
@command_center_bp.route('/api/credentials/upsert', methods=['POST'])
@require_auth
def upsert_credentials(user_id):
    """Save or update credentials"""
    try:
        data = request.get_json()
        
        required_fields = ['instance_id', 'credential_type']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Missing required field: {field}'}), 400
        
        # Mock credentials data
        credentials_data = {
            'id': 'cred-' + str(datetime.now().timestamp()),
            'instance_id': data['instance_id'],
            'credential_type': data['credential_type'],
            'created_at': datetime.now().isoformat()
        }
        
        if is_write_mode_enabled():
            # TODO: Implement real encrypted storage
            pass
        
        return jsonify({
            'success': True,
            'data': credentials_data,
            'message': 'Credentials saved successfully'
        })
        
    except Exception as e:
        return handle_error(e, 500)

@command_center_bp.route('/api/credentials/list', methods=['POST'])
@require_auth
def list_credentials(user_id):
    """List user's credentials"""
    try:
        data = request.get_json() or {}
        instance_id = data.get('instance_id')
        
        # Mock data - replace with real database query
        credentials_data = [
            {
                'id': 'cred-1',
                'instance_id': instance_id or 'instance-1',
                'credential_type': 'api_key',
                'created_at': '2024-01-01T00:00:00Z'
            }
        ]
        
        return jsonify({
            'success': True,
            'data': credentials_data
        })
        
    except Exception as e:
        return handle_error(e, 500)

# n8n Webhook Callback
@command_center_bp.route('/api/webhooks/n8n/run-callback', methods=['POST'])
def n8n_run_callback():
    """Handle n8n execution callbacks"""
    if not is_feature_enabled():
        return jsonify({'error': 'Feature disabled'}), 403
    
    try:
        # Validate shared secret
        secret = request.headers.get('X-Webhook-Secret')
        expected_secret = os.getenv('N8N_WEBHOOK_SECRET')
        
        if not expected_secret or secret != expected_secret:
            return jsonify({'error': 'Invalid secret'}), 401
        
        data = request.get_json()
        
        # Validate payload structure
        required_fields = ['user_id', 'instance_id', 'agent_id', 'status']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Missing field: {field}'}), 400
        
        # Log the callback
        print(f"n8n callback received: {data}")
        
        if is_write_mode_enabled():
            # TODO: Update run status in database
            pass
        
        return jsonify({
            'success': True,
            'message': 'Callback processed successfully'
        })
        
    except Exception as e:
        return handle_error(e, 500)

# Health check for Command Center
@command_center_bp.route('/api/command-center/health', methods=['GET'])
def command_center_health():
    """Command Center health check"""
    return jsonify({
        'success': True,
        'feature_enabled': is_feature_enabled(),
        'write_mode': is_write_mode_enabled(),
        'timestamp': datetime.now().isoformat()
    })
