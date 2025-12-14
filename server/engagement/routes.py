from flask import Blueprint, request, jsonify
from datetime import datetime
import os
from supabase import create_client, Client

engagement_bp = Blueprint('engagement', __name__)

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

supabase = None
if SUPABASE_URL and SUPABASE_KEY:
    try:
        supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
    except Exception as e:
        print(f"⚠️ Failed to initialize Supabase client: {e}")

@engagement_bp.route('/api/engagement/track', methods=['POST'])
def track_event():
    """Track an engagement event"""
    try:
        data = request.json
        user_id = data.get('user_id')
        event_type = data.get('event_type')
        content_id = data.get('content_id')
        event_source = data.get('event_source', 'web')
        duration_seconds = data.get('duration_seconds')
        metadata = data.get('metadata', {})

        if not user_id or not event_type:
            return jsonify({'error': 'user_id and event_type are required'}), 400

        if not supabase:
            return jsonify({'error': 'Database not configured'}), 500

        event_data = {
            'user_id': user_id,
            'event_type': event_type,
            'event_source': event_source,
            'created_at': datetime.utcnow().isoformat(),
        }

        if content_id:
            event_data['content_id'] = content_id
        if duration_seconds is not None:
            event_data['duration_seconds'] = duration_seconds
        if metadata:
            event_data['metadata'] = metadata

        result = supabase.table('ve_content_user_events').insert([event_data]).execute()

        # Update users.value_engine_last_seen
        supabase.table('users').update({
            'value_engine_last_seen': datetime.utcnow().isoformat()
        }).eq('id', user_id).execute()

        return jsonify({'success': True, 'event_id': result.data[0]['id'] if result.data else None}), 200

    except Exception as e:
        print(f"❌ Error tracking engagement event: {str(e)}")
        return jsonify({'error': str(e)}), 500

@engagement_bp.route('/api/engagement/score', methods=['GET'])
def get_engagement_score():
    """Get current user's engagement score and segment"""
    try:
        user_id = request.args.get('user_id')
        if not user_id:
            return jsonify({'error': 'user_id is required'}), 400

        if not supabase:
            return jsonify({'error': 'Database not configured'}), 500

        # Get engagement score
        result = supabase.table('ve_engagement_scores').select('*').eq('user_id', user_id).execute()

        if result.data:
            score_data = result.data[0]
            return jsonify({
                'score': score_data.get('score', 0),
                'segment': score_data.get('segment'),
                'last_event_at': score_data.get('last_event_at'),
                'last_calculated_at': score_data.get('last_calculated_at'),
            }), 200
        else:
            # Return default if no score exists yet
            return jsonify({
                'score': 0,
                'segment': None,
                'last_event_at': None,
                'last_calculated_at': None,
            }), 200

    except Exception as e:
        print(f"❌ Error getting engagement score: {str(e)}")
        return jsonify({'error': str(e)}), 500

@engagement_bp.route('/api/engagement/history', methods=['GET'])
def get_engagement_history():
    """Get user's engagement event history"""
    try:
        user_id = request.args.get('user_id')
        limit = int(request.args.get('limit', 50))
        offset = int(request.args.get('offset', 0))

        if not user_id:
            return jsonify({'error': 'user_id is required'}), 400

        if not supabase:
            return jsonify({'error': 'Database not configured'}), 500

        result = supabase.table('ve_content_user_events')\
            .select('*')\
            .eq('user_id', user_id)\
            .order('created_at', desc=True)\
            .limit(limit)\
            .offset(offset)\
            .execute()

        return jsonify({
            'events': result.data,
            'count': len(result.data)
        }), 200

    except Exception as e:
        print(f"❌ Error getting engagement history: {str(e)}")
        return jsonify({'error': str(e)}), 500

@engagement_bp.route('/api/engagement/recalculate', methods=['POST'])
def recalculate_scores():
    """Manual trigger for score recalculation (admin only)"""
    try:
        # TODO: Add admin authentication check
        from .scoreCalculator import calculate_all_scores
        
        result = calculate_all_scores()
        return jsonify({
            'success': True,
            'users_processed': result.get('users_processed', 0),
            'message': 'Score recalculation completed'
        }), 200

    except Exception as e:
        print(f"❌ Error recalculating scores: {str(e)}")
        return jsonify({'error': str(e)}), 500

@engagement_bp.route('/api/engagement/stats', methods=['GET'])
def get_engagement_stats():
    """Get engagement statistics for admin dashboard"""
    try:
        if not supabase:
            return jsonify({'error': 'Database not configured'}), 500

        # Get segment counts
        segments_result = supabase.table('ve_engagement_scores')\
            .select('segment')\
            .execute()

        segments = segments_result.data if segments_result.data else []
        segment_counts = {
            'hot': 0,
            'warm': 0,
            'cold': 0,
            'at_risk': 0,
        }

        for score in segments:
            segment = score.get('segment')
            if segment in segment_counts:
                segment_counts[segment] += 1

        return jsonify({
            'segments': segment_counts,
        }), 200

    except Exception as e:
        print(f"❌ Error getting engagement stats: {str(e)}")
        return jsonify({'error': str(e)}), 500

@engagement_bp.route('/api/engagement/at-risk-users', methods=['GET'])
def get_at_risk_users():
    """Get list of at-risk users with last_seen"""
    try:
        if not supabase:
            return jsonify({'error': 'Database not configured'}), 500

        # Get at-risk users from engagement_scores
        at_risk_scores = supabase.table('ve_engagement_scores')\
            .select('user_id, score, last_event_at')\
            .eq('segment', 'at_risk')\
            .order('last_event_at', desc=False)\
            .execute()

        at_risk_user_ids = [score['user_id'] for score in (at_risk_scores.data or [])]

        # Also check users table for at_risk segment
        users_result = supabase.table('users')\
            .select('id, email, name, value_engine_segment, value_engine_last_seen')\
            .eq('value_engine_segment', 'at_risk')\
            .execute()

        # Combine and get unique user IDs
        all_at_risk_ids = set(at_risk_user_ids)
        for user in (users_result.data or []):
            all_at_risk_ids.add(user['id'])

        # Get full user details
        if all_at_risk_ids:
            users_details = supabase.table('users')\
                .select('id, email, name, value_engine_last_seen, value_engine_segment')\
                .in_('id', list(all_at_risk_ids))\
                .execute()

            # Get scores for these users
            scores_map = {}
            for score in (at_risk_scores.data or []):
                scores_map[score['user_id']] = {
                    'score': score.get('score', 0),
                    'last_event_at': score.get('last_event_at'),
                }

            # Combine user data with scores
            at_risk_users = []
            for user in (users_details.data or []):
                user_id = user['id']
                score_data = scores_map.get(user_id, {})
                at_risk_users.append({
                    'id': user_id,
                    'email': user.get('email'),
                    'name': user.get('name', 'Unknown'),
                    'last_seen': user.get('value_engine_last_seen') or score_data.get('last_event_at'),
                    'score': score_data.get('score', 0),
                })

            # Sort by last_seen (oldest first)
            at_risk_users.sort(key=lambda x: x['last_seen'] or '1970-01-01')
        else:
            at_risk_users = []

        return jsonify({
            'users': at_risk_users,
            'count': len(at_risk_users),
        }), 200

    except Exception as e:
        print(f"❌ Error getting at-risk users: {str(e)}")
        return jsonify({'error': str(e)}), 500

@engagement_bp.route('/api/engagement/popular-content', methods=['GET'])
def get_popular_content():
    """Get most opened content items in the past 7 days"""
    try:
        from datetime import datetime, timedelta

        if not supabase:
            return jsonify({'error': 'Database not configured'}), 500

        # Calculate date 7 days ago
        seven_days_ago = (datetime.utcnow() - timedelta(days=7)).isoformat()

        # Get events from past 7 days
        events_result = supabase.table('ve_content_user_events')\
            .select('content_id, event_type')\
            .eq('event_type', 'briefing_opened')\
            .gte('created_at', seven_days_ago)\
            .execute()

        events = events_result.data if events_result.data else []

        # Count opens per content item
        content_counts = {}
        for event in events:
            content_id = event.get('content_id')
            if content_id:
                content_counts[content_id] = content_counts.get(content_id, 0) + 1

        # Get content details for top items
        if content_counts:
            # Sort by count and get top 10
            sorted_content = sorted(content_counts.items(), key=lambda x: x[1], reverse=True)[:10]
            content_ids = [item[0] for item in sorted_content]

            # Fetch content details
            content_result = supabase.table('ve_content_items')\
                .select('id, title, content_type, level, created_at')\
                .in_('id', content_ids)\
                .execute()

            content_map = {item['id']: item for item in (content_result.data or [])}

            # Combine counts with content details
            popular_content = []
            for content_id, count in sorted_content:
                content = content_map.get(content_id, {})
                popular_content.append({
                    'id': content_id,
                    'title': content.get('title', 'Unknown'),
                    'content_type': content.get('content_type', 'unknown'),
                    'level': content.get('level', 'free'),
                    'opens': count,
                    'created_at': content.get('created_at'),
                })
        else:
            popular_content = []

        return jsonify({
            'content': popular_content,
            'period': '7 days',
        }), 200

    except Exception as e:
        print(f"❌ Error getting popular content: {str(e)}")
        return jsonify({'error': str(e)}), 500

