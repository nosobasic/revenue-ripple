from flask import Blueprint, request, jsonify
from datetime import datetime
import traceback
from uuid import uuid5, NAMESPACE_URL
from middleware.request_user import require_user
from middleware.supabase_admin import get_supabase_admin

onboarding_bp = Blueprint('onboarding', __name__)
supabase = get_supabase_admin()

@onboarding_bp.route('/api/onboarding/state', methods=['GET'])
@require_user
def get_onboarding_state(user_id):
    """Get the current onboarding state for a user"""
    try:
        response = supabase.table('user_onboarding_state')\
            .select('*')\
            .eq('user_id', user_id)\
            .execute()
        
        if not response.data:
            initial_state = {
                'user_id': user_id,
                'current_step': 0,
                'total_steps': 5,
                'completed': False,
                'steps_completed': [],
                'data': {}
            }
            
            create_response = supabase.table('user_onboarding_state')\
                .insert(initial_state)\
                .execute()
            
            return jsonify({
                'state': create_response.data[0] if create_response.data else initial_state
            })
        
        return jsonify({
            'state': response.data[0]
        })
    
    except Exception as e:
        print(f"Error fetching onboarding state: {e}")
        print(traceback.format_exc())
        return jsonify({'error': 'Failed to fetch onboarding state'}), 500

@onboarding_bp.route('/api/onboarding/state', methods=['PUT'])
@require_user
def update_onboarding_state(user_id):
    """Update onboarding state"""
    try:
        data = request.get_json()
        
        update_data = {
            'last_interaction': datetime.utcnow().isoformat()
        }
        
        if 'current_step' in data:
            update_data['current_step'] = data['current_step']
        
        if 'steps_completed' in data:
            update_data['steps_completed'] = data['steps_completed']
        
        if 'data' in data:
            existing_state = supabase.table('user_onboarding_state')\
                .select('data')\
                .eq('user_id', user_id)\
                .execute()
            
            if existing_state.data:
                existing_data = existing_state.data[0].get('data', {})
                existing_data.update(data['data'])
                update_data['data'] = existing_data
            else:
                update_data['data'] = data['data']
        
        if 'completed' in data:
            update_data['completed'] = data['completed']
            if data['completed']:
                update_data['completed_at'] = datetime.utcnow().isoformat()
        
        response = supabase.table('user_onboarding_state')\
            .update(update_data)\
            .eq('user_id', user_id)\
            .execute()
        
        if not response.data:
            return jsonify({'error': 'Onboarding state not found'}), 404
        
        return jsonify({
            'state': response.data[0],
            'message': 'Onboarding state updated'
        })
    
    except Exception as e:
        print(f"Error updating onboarding state: {e}")
        print(traceback.format_exc())
        return jsonify({'error': 'Failed to update onboarding state'}), 500

@onboarding_bp.route('/api/onboarding/complete', methods=['POST'])
@require_user
def complete_onboarding(user_id):
    """Mark onboarding as completed"""
    try:
        saved = supabase.table('user_onboarding_state').select('data').eq('user_id', user_id).execute()
        if not saved.data:
            return jsonify({'error': 'Onboarding state not found'}), 404
        profile = saved.data[0].get('data') or {}
        title = (profile.get('goals') or '').strip()
        if not title:
            return jsonify({'error': 'Please save your goal before finishing onboarding'}), 400
        # Stable ID makes completion retries safe, including after a lost response.
        goal_id = str(uuid5(NAMESPACE_URL, f'revenue-ripple:onboarding:{user_id}'))
        supabase.table('user_goals').upsert({
            'id': goal_id, 'user_id': user_id, 'title': title,
            'goal_type': 'custom', 'priority': 1,
            'description': 'Your starting goal from onboarding',
            'metadata': {'source': 'onboarding', 'interests': profile.get('interests', []),
                         'experience': profile.get('experience', ''),
                         'targetRevenue': profile.get('targetRevenue', '')}
        }, on_conflict='id', ignore_duplicates=True).execute()
        response = supabase.table('user_onboarding_state')\
            .update({
                'completed': True,
                'completed_at': datetime.utcnow().isoformat(),
                'current_step': 5
            })\
            .eq('user_id', user_id)\
            .execute()
        
        if not response.data:
            return jsonify({'error': 'Onboarding state not found'}), 404
        
        return jsonify({
            'state': response.data[0],
            'message': 'Onboarding completed!'
        })
    
    except Exception as e:
        print(f"Error completing onboarding: {e}")
        print(traceback.format_exc())
        return jsonify({'error': 'Failed to complete onboarding'}), 500

@onboarding_bp.route('/api/feature-tours', methods=['GET'])
@require_user
def get_feature_tours(user_id):
    """Get all available feature tours"""
    try:
        user_response = supabase.table('users')\
            .select('role')\
            .eq('id', user_id)\
            .execute()
        
        user_role = 'member'
        if user_response.data:
            user_role = user_response.data[0].get('role', 'member')
        
        tours_response = supabase.table('feature_tours')\
            .select('*')\
            .eq('active', True)\
            .order('priority', desc=False)\
            .execute()
        
        tours = [
            tour for tour in tours_response.data
            if user_role in tour.get('target_audience', [])
        ]
        
        progress_response = supabase.table('user_tour_progress')\
            .select('*')\
            .eq('user_id', user_id)\
            .execute()
        
        progress_map = {
            p['tour_id']: p
            for p in progress_response.data
        }
        
        for tour in tours:
            tour['progress'] = progress_map.get(tour['id'])
        
        return jsonify({
            'tours': tours
        })
    
    except Exception as e:
        print(f"Error fetching feature tours: {e}")
        print(traceback.format_exc())
        return jsonify({'error': 'Failed to fetch feature tours'}), 500

@onboarding_bp.route('/api/feature-tours/<tour_id>/start', methods=['POST'])
@require_user
def start_feature_tour(user_id, tour_id):
    """Start a feature tour"""
    try:
        tour_response = supabase.table('feature_tours')\
            .select('*')\
            .eq('id', tour_id)\
            .execute()
        
        if not tour_response.data:
            return jsonify({'error': 'Tour not found'}), 404
        
        existing_progress = supabase.table('user_tour_progress')\
            .select('*')\
            .eq('user_id', user_id)\
            .eq('tour_id', tour_id)\
            .execute()
        
        if existing_progress.data:
            return jsonify({
                'progress': existing_progress.data[0],
                'message': 'Tour already started'
            })
        
        progress_data = {
            'user_id': user_id,
            'tour_id': tour_id,
            'current_step': 0,
            'completed': False,
            'skipped': False
        }
        
        response = supabase.table('user_tour_progress')\
            .insert(progress_data)\
            .execute()
        
        return jsonify({
            'progress': response.data[0] if response.data else None,
            'message': 'Tour started'
        }), 201
    
    except Exception as e:
        print(f"Error starting tour: {e}")
        print(traceback.format_exc())
        return jsonify({'error': 'Failed to start tour'}), 500

@onboarding_bp.route('/api/feature-tours/<tour_id>/progress', methods=['PUT'])
@require_user
def update_tour_progress(user_id, tour_id):
    """Update progress on a feature tour"""
    try:
        data = request.get_json()
        
        update_data = {}
        
        if 'current_step' in data:
            update_data['current_step'] = data['current_step']
        
        if 'completed' in data:
            update_data['completed'] = data['completed']
            if data['completed']:
                update_data['completed_at'] = datetime.utcnow().isoformat()
        
        if 'skipped' in data:
            update_data['skipped'] = data['skipped']
        
        response = supabase.table('user_tour_progress')\
            .update(update_data)\
            .eq('user_id', user_id)\
            .eq('tour_id', tour_id)\
            .execute()
        
        if not response.data:
            return jsonify({'error': 'Tour progress not found'}), 404
        
        return jsonify({
            'progress': response.data[0],
            'message': 'Progress updated'
        })
    
    except Exception as e:
        print(f"Error updating tour progress: {e}")
        print(traceback.format_exc())
        return jsonify({'error': 'Failed to update tour progress'}), 500

@onboarding_bp.route('/api/feature-tours/<tour_id>/skip', methods=['POST'])
@require_user
def skip_tour(user_id, tour_id):
    """Skip a feature tour"""
    try:
        response = supabase.table('user_tour_progress')\
            .update({
                'skipped': True,
                'completed': False
            })\
            .eq('user_id', user_id)\
            .eq('tour_id', tour_id)\
            .execute()
        
        if not response.data:
            progress_data = {
                'user_id': user_id,
                'tour_id': tour_id,
                'current_step': 0,
                'completed': False,
                'skipped': True
            }
            
            response = supabase.table('user_tour_progress')\
                .insert(progress_data)\
                .execute()
        
        return jsonify({
            'progress': response.data[0] if response.data else None,
            'message': 'Tour skipped'
        })
    
    except Exception as e:
        print(f"Error skipping tour: {e}")
        print(traceback.format_exc())
        return jsonify({'error': 'Failed to skip tour'}), 500
