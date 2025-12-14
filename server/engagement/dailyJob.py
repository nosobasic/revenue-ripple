"""
Daily Engagement Score Calculation Job
Runs daily to recalculate engagement scores and trigger retention actions.
"""
from datetime import datetime
from .scoreCalculator import calculate_all_scores
from .retentionActions import trigger_retention_actions
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def run_daily_engagement_job():
    """
    Main function to run the daily engagement job
    This should be called by a scheduler (cron, APScheduler, etc.)
    """
    logger.info("Starting daily engagement score calculation job...")
    start_time = datetime.utcnow()

    try:
        # Step 1: Calculate all engagement scores
        logger.info("Calculating engagement scores for all users...")
        score_result = calculate_all_scores()
        
        logger.info(f"Score calculation completed: {score_result['users_processed']} users processed")
        if score_result.get('errors'):
            logger.warning(f"Errors encountered: {len(score_result['errors'])} errors")
            for error in score_result['errors'][:5]:  # Log first 5 errors
                logger.warning(f"  - {error}")

        # Step 2: Trigger retention actions for at-risk users
        logger.info("Triggering retention actions for at-risk users...")
        retention_result = trigger_retention_actions()
        
        logger.info(f"Retention actions completed: {retention_result.get('users_notified', 0)} users notified")

        # Calculate duration
        duration = (datetime.utcnow() - start_time).total_seconds()

        logger.info(f"Daily engagement job completed in {duration:.2f} seconds")
        
        return {
            'success': True,
            'score_calculation': score_result,
            'retention_actions': retention_result,
            'duration_seconds': duration,
            'timestamp': datetime.utcnow().isoformat(),
        }

    except Exception as e:
        logger.error(f"Error running daily engagement job: {str(e)}", exc_info=True)
        return {
            'success': False,
            'error': str(e),
            'timestamp': datetime.utcnow().isoformat(),
        }

if __name__ == '__main__':
    # For testing - can be run directly
    result = run_daily_engagement_job()
    print(f"Job result: {result}")

