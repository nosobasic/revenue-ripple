from flask import Blueprint, request, jsonify, abort
from datetime import datetime
import traceback
from middleware.request_user import require_user
from middleware.supabase_admin import get_supabase_admin

goals_bp = Blueprint('goals', __name__)
supabase = get_supabase_admin()

@goals_bp.route('/api/goals', methods=['GET'])
@require_user
def get_goals(user_id):
    """Get all goals for the authenticated user"""
    try:
        response = supabase.table('user_goals')\
            .select('*')\
            .eq('user_id', user_id)\
            .order('priority', desc=False)\
            .order('created_at', desc=True)\
            .execute()
        
        return jsonify({
            'goals': response.data,
            'total': len(response.data)
        })
    
    except Exception as e:
        print(f"Error fetching goals: {e}")
        print(traceback.format_exc())
        return jsonify({'error': 'Failed to fetch goals'}), 500

@goals_bp.route('/api/goals', methods=['POST'])
@require_user
def create_goal(user_id):
    """Create a new goal"""
    try:
        data = request.get_json()
        
        if not data.get('title'):
            return jsonify({'error': 'Goal title is required'}), 400
        
        goal_data = {
            'user_id': user_id,
            'goal_type': data.get('goal_type', 'custom'),
            'title': data['title'],
            'description': data.get('description'),
            'target_value': data.get('target_value'),
            'current_value': data.get('current_value', 0),
            'target_date': data.get('target_date'),
            'priority': data.get('priority', 3),
            'metadata': data.get('metadata', {})
        }
        
        response = supabase.table('user_goals')\
            .insert(goal_data)\
            .execute()
        
        return jsonify({
            'goal': response.data[0] if response.data else None,
            'message': 'Goal created successfully'
        }), 201
    
    except Exception as e:
        print(f"Error creating goal: {e}")
        print(traceback.format_exc())
        return jsonify({'error': 'Failed to create goal'}), 500

@goals_bp.route('/api/goals/<goal_id>', methods=['PUT'])
@require_user
def update_goal(user_id, goal_id):
    """Update an existing goal"""
    try:
        data = request.get_json()
        
        update_data = {}
        if 'title' in data:
            update_data['title'] = data['title']
        if 'description' in data:
            update_data['description'] = data['description']
        if 'target_value' in data:
            update_data['target_value'] = data['target_value']
        if 'current_value' in data:
            update_data['current_value'] = data['current_value']
        if 'target_date' in data:
            update_data['target_date'] = data['target_date']
        if 'status' in data:
            update_data['status'] = data['status']
            if data['status'] == 'completed':
                update_data['completed_at'] = datetime.utcnow().isoformat()
        if 'priority' in data:
            update_data['priority'] = data['priority']
        if 'metadata' in data:
            update_data['metadata'] = data['metadata']
        
        response = supabase.table('user_goals')\
            .update(update_data)\
            .eq('id', goal_id)\
            .eq('user_id', user_id)\
            .execute()
        
        if not response.data:
            return jsonify({'error': 'Goal not found'}), 404
        
        return jsonify({
            'goal': response.data[0],
            'message': 'Goal updated successfully'
        })
    
    except Exception as e:
        print(f"Error updating goal: {e}")
        print(traceback.format_exc())
        return jsonify({'error': 'Failed to update goal'}), 500

@goals_bp.route('/api/goals/<goal_id>', methods=['DELETE'])
@require_user
def delete_goal(user_id, goal_id):
    """Delete a goal"""
    try:
        response = supabase.table('user_goals')\
            .delete()\
            .eq('id', goal_id)\
            .eq('user_id', user_id)\
            .execute()
        
        if not response.data:
            return jsonify({'error': 'Goal not found'}), 404
        
        return jsonify({'message': 'Goal deleted successfully'})
    
    except Exception as e:
        print(f"Error deleting goal: {e}")
        print(traceback.format_exc())
        return jsonify({'error': 'Failed to delete goal'}), 500

@goals_bp.route('/api/goals/<goal_id>/progress', methods=['POST'])
@require_user
def update_goal_progress(user_id, goal_id):
    """Update progress towards a goal"""
    try:
        data = request.get_json()
        
        if 'current_value' not in data:
            return jsonify({'error': 'current_value is required'}), 400
        
        response = supabase.table('user_goals')\
            .update({
                'current_value': data['current_value']
            })\
            .eq('id', goal_id)\
            .eq('user_id', user_id)\
            .execute()
        
        if not response.data:
            return jsonify({'error': 'Goal not found'}), 404
        
        goal = response.data[0]
        
        if goal.get('target_value') and goal['current_value'] >= goal['target_value']:
            supabase.table('user_goals')\
                .update({
                    'status': 'completed',
                    'completed_at': datetime.utcnow().isoformat()
                })\
                .eq('id', goal_id)\
                .execute()
            
            return jsonify({
                'goal': goal,
                'completed': True,
                'message': 'Congratulations! Goal completed!'
            })
        
        return jsonify({
            'goal': goal,
            'completed': False,
            'message': 'Progress updated'
        })
    
    except Exception as e:
        print(f"Error updating goal progress: {e}")
        print(traceback.format_exc())
        return jsonify({'error': 'Failed to update goal progress'}), 500

@goals_bp.route('/api/goals/stats', methods=['GET'])
@require_user
def get_goal_stats(user_id):
    """Get statistics about user's goals"""
    try:
        response = supabase.table('user_goals')\
            .select('status, priority')\
            .eq('user_id', user_id)\
            .execute()
        
        goals = response.data
        
        stats = {
            'total': len(goals),
            'active': len([g for g in goals if g['status'] == 'active']),
            'completed': len([g for g in goals if g['status'] == 'completed']),
            'abandoned': len([g for g in goals if g['status'] == 'abandoned']),
            'high_priority': len([g for g in goals if g['priority'] == 1 and g['status'] == 'active']),
        }
        
        return jsonify(stats)
    
    except Exception as e:
        print(f"Error fetching goal stats: {e}")
        print(traceback.format_exc())
        return jsonify({'error': 'Failed to fetch goal stats'}), 500

@goals_bp.route('/api/goals/<goal_id>/milestones', methods=['GET'])
@require_user
def get_goal_milestones(user_id, goal_id):
    """Get milestones for a specific goal"""
    try:
        goal_response = supabase.table('user_goals')\
            .select('id')\
            .eq('id', goal_id)\
            .eq('user_id', user_id)\
            .execute()
        
        if not goal_response.data:
            return jsonify({'error': 'Goal not found'}), 404
        
        milestones_response = supabase.table('goal_milestones')\
            .select('*')\
            .eq('goal_id', goal_id)\
            .order('created_at', desc=False)\
            .execute()
        
        return jsonify({
            'milestones': milestones_response.data
        })
    
    except Exception as e:
        print(f"Error fetching milestones: {e}")
        print(traceback.format_exc())
        return jsonify({'error': 'Failed to fetch milestones'}), 500

@goals_bp.route('/api/goals/<goal_id>/milestones', methods=['POST'])
@require_user
def create_milestone(user_id, goal_id):
    """Create a new milestone for a goal"""
    try:
        goal_response = supabase.table('user_goals')\
            .select('id')\
            .eq('id', goal_id)\
            .eq('user_id', user_id)\
            .execute()
        
        if not goal_response.data:
            return jsonify({'error': 'Goal not found'}), 404
        
        data = request.get_json()
        
        if not data.get('title'):
            return jsonify({'error': 'Milestone title is required'}), 400
        
        milestone_data = {
            'goal_id': goal_id,
            'title': data['title'],
            'description': data.get('description'),
            'target_value': data.get('target_value')
        }
        
        response = supabase.table('goal_milestones')\
            .insert(milestone_data)\
            .execute()
        
        return jsonify({
            'milestone': response.data[0] if response.data else None,
            'message': 'Milestone created successfully'
        }), 201
    
    except Exception as e:
        print(f"Error creating milestone: {e}")
        print(traceback.format_exc())
        return jsonify({'error': 'Failed to create milestone'}), 500

@goals_bp.route('/api/goals/<goal_id>/milestones/<milestone_id>', methods=['PUT'])
@require_user
def update_milestone(user_id, goal_id, milestone_id):
    """Mark a milestone as completed"""
    try:
        goal_response = supabase.table('user_goals')\
            .select('id')\
            .eq('id', goal_id)\
            .eq('user_id', user_id)\
            .execute()
        
        if not goal_response.data:
            return jsonify({'error': 'Goal not found'}), 404
        
        data = request.get_json()
        
        update_data = {}
        if 'completed' in data:
            update_data['completed'] = data['completed']
            if data['completed']:
                update_data['completed_at'] = datetime.utcnow().isoformat()
        
        response = supabase.table('goal_milestones')\
            .update(update_data)\
            .eq('id', milestone_id)\
            .eq('goal_id', goal_id)\
            .execute()
        
        if not response.data:
            return jsonify({'error': 'Milestone not found'}), 404
        
        return jsonify({
            'milestone': response.data[0],
            'message': 'Milestone updated successfully'
        })
    
    except Exception as e:
        print(f"Error updating milestone: {e}")
        print(traceback.format_exc())
        return jsonify({'error': 'Failed to update milestone'}), 500
