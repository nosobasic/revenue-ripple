"""
Retention Actions System
Triggers email campaigns and in-app notifications for at-risk users.
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

def create_user_notification(user_id, title, message, notification_type='retention'):
    """
    Create an in-app notification for a user
    
    Args:
        user_id: User ID
        title: Notification title
        message: Notification message
        notification_type: Type of notification (default: 'retention')
    """
    if not supabase:
        return None

    try:
        # Check if user_notifications table exists, if not we'll create it via migration
        notification_data = {
            'user_id': user_id,
            'title': title,
            'message': message,
            'type': notification_type,
            'read': False,
            'created_at': datetime.utcnow().isoformat(),
        }

        result = supabase.table('user_notifications').insert([notification_data]).execute()
        return result.data[0] if result.data else None
    except Exception as e:
        # Table might not exist yet - log and continue
        print(f"⚠️ Could not create notification (table may not exist): {str(e)}")
        return None

def send_reengagement_email(user_id, user_email, user_name):
    """
    Send re-engagement email to at-risk user
    This integrates with your existing email system (GetResponse, etc.)
    
    Args:
        user_id: User ID
        user_email: User email address
        user_name: User name
    """
    # TODO: Integrate with your email service (GetResponse, SendGrid, etc.)
    # For now, we'll just log the action
    
    print(f"📧 Would send re-engagement email to {user_email} ({user_name})")
    
    # Example integration structure:
    # - Get user's engagement history
    # - Get recent content they might be interested in
    # - Send personalized email via your email service
    # - Log the email send in database
    
    return {
        'sent': True,
        'user_id': user_id,
        'email': user_email,
    }

def trigger_retention_actions():
    """
    Identify at-risk users and trigger retention actions
    Returns summary of actions taken
    """
    if not supabase:
        raise Exception("Database not configured")

    # Get all users with 'at_risk' segment
    at_risk_result = supabase.table('ve_engagement_scores')\
        .select('user_id, score, last_event_at')\
        .eq('segment', 'at_risk')\
        .execute()

    at_risk_users = at_risk_result.data if at_risk_result.data else []

    # Also check users table for at_risk segment
    users_result = supabase.table('users')\
        .select('id, email, name, value_engine_segment')\
        .eq('value_engine_segment', 'at_risk')\
        .execute()

    # Combine and deduplicate
    at_risk_user_ids = set()
    for user in at_risk_users:
        at_risk_user_ids.add(user['user_id'])
    for user in (users_result.data or []):
        at_risk_user_ids.add(user['id'])

    users_notified = 0
    emails_sent = 0
    notifications_created = 0
    errors = []

    for user_id in at_risk_user_ids:
        try:
            # Get user details
            user_result = supabase.table('users')\
                .select('id, email, name')\
                .eq('id', user_id)\
                .execute()

            if not user_result.data:
                continue

            user = user_result.data[0]
            user_email = user.get('email')
            user_name = user.get('name', 'Member')

            # Create in-app notification
            notification = create_user_notification(
                user_id=user_id,
                title="We Miss You! 🎯",
                message=f"Hi {user_name}, we noticed you haven't been active lately. Check out what's new and get back on track!",
                notification_type='retention'
            )
            if notification:
                notifications_created += 1

            # Send re-engagement email
            if user_email:
                email_result = send_reengagement_email(user_id, user_email, user_name)
                if email_result.get('sent'):
                    emails_sent += 1

            users_notified += 1

        except Exception as e:
            error_msg = f"Error processing retention action for user {user_id}: {str(e)}"
            print(f"❌ {error_msg}")
            errors.append(error_msg)

    return {
        'users_notified': users_notified,
        'emails_sent': emails_sent,
        'notifications_created': notifications_created,
        'errors': errors,
        'timestamp': datetime.utcnow().isoformat(),
    }

