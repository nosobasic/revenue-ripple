"""
Engagement Score Calculator
Calculates engagement scores based on user events and applies scoring rules.
"""
from datetime import datetime, timedelta
import os
from supabase import create_client, Client

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

supabase = None
if SUPABASE_URL and SUPABASE_KEY:
    try:
        supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
    except Exception as e:
        print(f"⚠️ Failed to initialize Supabase client: {e}")

# Scoring rules
SCORING_RULES = {
    'briefing_opened': 3,
    'briefing_read': 5,
    'module_viewed': 2,
    'module_completed': 5,
    'ai_interaction': 1,
    'daily_login': 2,
}

# Inactivity penalty
INACTIVITY_DAYS = 7
INACTIVITY_PENALTY = -5

# Segment thresholds
SEGMENT_THRESHOLDS = {
    'hot': 30,
    'warm': 10,
    'cold': 1,
    'at_risk': 0,
}

def get_segment(score):
    """Determine user segment based on score"""
    if score >= SEGMENT_THRESHOLDS['hot']:
        return 'hot'
    elif score >= SEGMENT_THRESHOLDS['warm']:
        return 'warm'
    elif score >= SEGMENT_THRESHOLDS['cold']:
        return 'cold'
    else:
        return 'at_risk'

def calculate_user_score(user_id, last_calculated_at=None):
    """
    Calculate engagement score for a single user
    
    Args:
        user_id: User ID to calculate score for
        last_calculated_at: Optional timestamp to only process events after this time
    
    Returns:
        dict with score, segment, last_event_at
    """
    if not supabase:
        raise Exception("Database not configured")

    # Get all events for this user since last calculation
    query = supabase.table('ve_content_user_events')\
        .select('*')\
        .eq('user_id', user_id)\
        .order('created_at', desc=False)

    if last_calculated_at:
        query = query.gte('created_at', last_calculated_at)

    result = query.execute()
    events = result.data if result.data else []

    # Calculate score from events
    # For incremental updates, we only process new events
    # For full recalculation, we process all events
    score = 0
    daily_logins = set()  # Track unique daily logins
    last_event_at = None

    for event in events:
        event_type = event.get('event_type')
        event_date = event.get('created_at')
        
        if event_date:
            try:
                # Handle different date formats
                if 'Z' in event_date:
                    event_date_obj = datetime.fromisoformat(event_date.replace('Z', '+00:00'))
                else:
                    event_date_obj = datetime.fromisoformat(event_date)
                
                # Remove timezone for comparison
                if event_date_obj.tzinfo:
                    event_date_obj = event_date_obj.replace(tzinfo=None)
                
                if not last_event_at or event_date_obj > last_event_at:
                    last_event_at = event_date_obj
            except Exception as e:
                print(f"Error parsing date {event_date}: {e}")
                continue

        # Apply scoring rules
        if event_type in SCORING_RULES:
            # Special handling for daily_login - only count once per day
            if event_type == 'daily_login':
                if event_date:
                    date_str = event_date.split('T')[0]  # YYYY-MM-DD
                    if date_str not in daily_logins:
                        score += SCORING_RULES[event_type]
                        daily_logins.add(date_str)
            else:
                score += SCORING_RULES[event_type]

    # Get existing score
    existing_score_result = supabase.table('ve_engagement_scores')\
        .select('score')\
        .eq('user_id', user_id)\
        .execute()

    if existing_score_result.data and last_calculated_at:
        # Incremental update: add new points to existing score
        base_score = existing_score_result.data[0].get('score', 0)
        score = base_score + score
    else:
        # Full recalculation: calculate from all events (not just new ones)
        # Re-fetch all events for full calculation
        if not last_calculated_at:
            all_events_result = supabase.table('ve_content_user_events')\
                .select('*')\
                .eq('user_id', user_id)\
                .order('created_at', desc=False)\
                .execute()
            
            all_events = all_events_result.data if all_events_result.data else []
            score = 0
            daily_logins = set()
            last_event_at = None
            
            for event in all_events:
                event_type = event.get('event_type')
                event_date = event.get('created_at')
                
                if event_date:
                    try:
                        if 'Z' in event_date:
                            event_date_obj = datetime.fromisoformat(event_date.replace('Z', '+00:00'))
                        else:
                            event_date_obj = datetime.fromisoformat(event_date)
                        if event_date_obj.tzinfo:
                            event_date_obj = event_date_obj.replace(tzinfo=None)
                        if not last_event_at or event_date_obj > last_event_at:
                            last_event_at = event_date_obj
                    except Exception:
                        continue
                
                if event_type in SCORING_RULES:
                    if event_type == 'daily_login':
                        if event_date:
                            date_str = event_date.split('T')[0]
                            if date_str not in daily_logins:
                                score += SCORING_RULES[event_type]
                                daily_logins.add(date_str)
                    else:
                        score += SCORING_RULES[event_type]

    # Apply inactivity penalty
    if last_event_at:
        try:
            # Ensure last_event_at is timezone-naive for comparison
            if isinstance(last_event_at, str):
                if 'Z' in last_event_at:
                    last_event_at = datetime.fromisoformat(last_event_at.replace('Z', '+00:00'))
                else:
                    last_event_at = datetime.fromisoformat(last_event_at)
            if last_event_at.tzinfo:
                last_event_at = last_event_at.replace(tzinfo=None)
            
            days_since_last_event = (datetime.utcnow() - last_event_at).days
            if days_since_last_event >= INACTIVITY_DAYS:
                score += INACTIVITY_PENALTY
        except Exception as e:
            print(f"Error calculating inactivity penalty: {e}")

    # Ensure score doesn't go below a certain threshold (optional)
    # score = max(score, -50)  # Cap at -50

    segment = get_segment(score)

    return {
        'score': score,
        'segment': segment,
        'last_event_at': last_event_at.isoformat() if last_event_at else None,
    }

def calculate_all_scores():
    """
    Calculate engagement scores for all users
    This is the main function called by the daily batch job
    """
    if not supabase:
        raise Exception("Database not configured")

    # Get all users
    users_result = supabase.table('users').select('id').execute()
    users = users_result.data if users_result.data else []

    users_processed = 0
    errors = []

    for user in users:
        try:
            user_id = user['id']
            
            # Get last calculated time
            existing_score_result = supabase.table('ve_engagement_scores')\
                .select('last_calculated_at')\
                .eq('user_id', user_id)\
                .execute()

            last_calculated_at = None
            if existing_score_result.data:
                last_calc_str = existing_score_result.data[0].get('last_calculated_at')
                if last_calc_str:
                    last_calculated_at = last_calc_str

            # Calculate score
            score_data = calculate_user_score(user_id, last_calculated_at)

            # Update or insert engagement score
            upsert_data = {
                'user_id': user_id,
                'score': score_data['score'],
                'segment': score_data['segment'],
                'last_event_at': score_data['last_event_at'],
                'last_calculated_at': datetime.utcnow().isoformat(),
                'updated_at': datetime.utcnow().isoformat(),
            }

            supabase.table('ve_engagement_scores')\
                .upsert([upsert_data], on_conflict='user_id')\
                .execute()

            # Update users table
            supabase.table('users')\
                .update({
                    'value_engine_segment': score_data['segment'],
                    'value_engine_last_seen': score_data['last_event_at'],
                })\
                .eq('id', user_id)\
                .execute()

            users_processed += 1

        except Exception as e:
            error_msg = f"Error calculating score for user {user.get('id', 'unknown')}: {str(e)}"
            print(f"❌ {error_msg}")
            errors.append(error_msg)

    return {
        'users_processed': users_processed,
        'errors': errors,
        'timestamp': datetime.utcnow().isoformat(),
    }

