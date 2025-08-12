"""
Database repository for AI Business Insights

This module handles all database operations using psycopg3
for the AI prompts functionality with tier-based limits.
"""

import os
import logging
from typing import List, Optional, Dict, Any
from contextlib import contextmanager
import psycopg
from psycopg.rows import dict_row
from .models import PromptOut
from datetime import date

logger = logging.getLogger(__name__)


class InsightsRepository:
    """Repository for AI insights and prompts database operations"""
    
    def __init__(self):
        self.db_url = os.getenv('SUPABASE_DB_URL')
        if not self.db_url:
            raise ValueError("SUPABASE_DB_URL environment variable is required")
    
    @contextmanager
    def get_connection(self):
        """Get a database connection with proper error handling"""
        conn = None
        try:
            conn = psycopg.connect(
                self.db_url,
                row_factory=dict_row,
                autocommit=False
            )
            yield conn
        except psycopg.Error as e:
            logger.error(f"Database connection error: {e}")
            if conn:
                conn.rollback()
            raise
        finally:
            if conn:
                conn.close()
    
    def fetch_prompts(self, user_id: str, limit: Optional[int] = None) -> List[Dict[str, Any]]:
        """
        Fetch prompts for a specific user with optional limit
        
        Args:
            user_id: The user ID to get prompts for
            limit: Optional limit on number of prompts to return
            
        Returns:
            List of prompt dictionaries
        """
        try:
            with self.get_connection() as conn:
                with conn.cursor() as cur:
                    # Build the base query
                    query = """
                        SELECT 
                            id, user_id, title, content, category, 
                            tags, is_active, usage_count, 
                            created_at, updated_at
                        FROM ai_prompts 
                        WHERE user_id = %s AND is_active = TRUE
                        ORDER BY created_at DESC
                    """
                    
                    params = [user_id]
                    
                    # Add limit if specified
                    if limit is not None:
                        query += " LIMIT %s"
                        params.append(limit)
                    
                    # Execute query
                    cur.execute(query, params)
                    rows = cur.fetchall()
                    
                    # Convert to list of dictionaries
                    prompts = []
                    for row in rows:
                        try:
                            # Handle tags array conversion
                            if row['tags'] and isinstance(row['tags'], str):
                                # If tags is stored as JSON string, parse it
                                import json
                                row['tags'] = json.loads(row['tags'])
                            elif not row['tags']:
                                row['tags'] = []
                            
                            prompts.append(dict(row))
                        except Exception as e:
                            logger.warning(f"Failed to parse prompt row {row.get('id')}: {e}")
                            continue
                    
                    return prompts
                    
        except Exception as e:
            logger.error(f"Error fetching prompts for user {user_id}: {e}")
            raise
    
    def get_prompt_count(self, user_id: str) -> int:
        """
        Get total count of prompts for a user
        
        Args:
            user_id: The user ID
            
        Returns:
            Total number of prompts
        """
        try:
            with self.get_connection() as conn:
                with conn.cursor() as cur:
                    query = """
                        SELECT COUNT(*) as total
                        FROM ai_prompts 
                        WHERE user_id = %s AND is_active = TRUE
                    """
                    
                    cur.execute(query, [user_id])
                    result = cur.fetchone()
                    
                    return result['total'] if result else 0
                    
        except Exception as e:
            logger.error(f"Error getting prompt count for user {user_id}: {e}")
            raise
    
    def get_monthly_usage(self, user_id: str, month: str, year: str) -> int:
        """
        Get monthly usage count for a user
        
        Args:
            user_id: The user ID
            month: Month (e.g., "01", "02")
            year: Year (e.g., "2024")
            
        Returns:
            Monthly usage count
        """
        try:
            with self.get_connection() as conn:
                with conn.cursor() as cur:
                    query = """
                        SELECT COALESCE(SUM(usage_count), 0) as total_usage
                        FROM ai_prompts 
                        WHERE user_id = %s 
                        AND EXTRACT(MONTH FROM created_at) = %s
                        AND EXTRACT(YEAR FROM created_at) = %s
                    """
                    
                    cur.execute(query, [user_id, int(month), int(year)])
                    result = cur.fetchone()
                    
                    return result['total_usage'] if result else 0
                    
        except Exception as e:
            logger.error(f"Error getting monthly usage for user {user_id}: {e}")
            raise
    
    def create_prompt(self, user_id: str, prompt_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Create a new prompt for a user
        
        Args:
            user_id: The user ID
            prompt_data: Dictionary with prompt data
            
        Returns:
            Created prompt dictionary
        """
        try:
            with self.get_connection() as conn:
                with conn.cursor() as cur:
                    query = """
                        INSERT INTO ai_prompts (
                            user_id, title, content, category, tags, is_active
                        ) VALUES (%s, %s, %s, %s, %s, %s)
                        RETURNING 
                            id, user_id, title, content, category, 
                            tags, is_active, usage_count, 
                            created_at, updated_at
                    """
                    
                    # Convert tags list to JSON string for storage
                    tags_json = None
                    if prompt_data.get('tags'):
                        import json
                        tags_json = json.dumps(prompt_data['tags'])
                    
                    params = [
                        user_id,
                        prompt_data['title'],
                        prompt_data['content'],
                        prompt_data['category'],
                        tags_json,
                        prompt_data.get('is_active', True)
                    ]
                    
                    cur.execute(query, params)
                    row = cur.fetchone()
                    conn.commit()
                    
                    # Handle tags array conversion for response
                    if row['tags'] and isinstance(row['tags'], str):
                        import json
                        row['tags'] = json.loads(row['tags'])
                    elif not row['tags']:
                        row['tags'] = []
                    
                    return dict(row)
                    
        except Exception as e:
            logger.error(f"Error creating prompt for user {user_id}: {e}")
            raise
    
    def update_prompt(self, prompt_id: int, user_id: str, update_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """
        Update an existing prompt
        
        Args:
            prompt_id: The prompt ID
            user_id: The user ID (for security)
            update_data: Dictionary with fields to update
            
        Returns:
            Updated prompt dictionary if found, None otherwise
        """
        try:
            with self.get_connection() as conn:
                with conn.cursor() as cur:
                    # Build dynamic update query
                    set_clauses = []
                    params = []
                    
                    for field, value in update_data.items():
                        if value is not None and field in ['title', 'content', 'category', 'is_active']:
                            set_clauses.append(f"{field} = %s")
                            params.append(value)
                        elif field == 'tags' and value is not None:
                            set_clauses.append("tags = %s")
                            import json
                            params.append(json.dumps(value))
                    
                    if not set_clauses:
                        return None
                    
                    set_clauses.append("updated_at = NOW()")
                    
                    query = f"""
                        UPDATE ai_prompts 
                        SET {', '.join(set_clauses)}
                        WHERE id = %s AND user_id = %s
                        RETURNING 
                            id, user_id, title, content, category, 
                            tags, is_active, usage_count, 
                            created_at, updated_at
                    """
                    
                    params.extend([prompt_id, user_id])
                    cur.execute(query, params)
                    row = cur.fetchone()
                    
                    if not row:
                        return None
                    
                    conn.commit()
                    
                    # Handle tags array conversion for response
                    if row['tags'] and isinstance(row['tags'], str):
                        import json
                        row['tags'] = json.loads(row['tags'])
                    elif not row['tags']:
                        row['tags'] = []
                    
                    return dict(row)
                    
        except Exception as e:
            logger.error(f"Error updating prompt {prompt_id} for user {user_id}: {e}")
            raise
    
    def delete_prompt(self, prompt_id: int, user_id: str) -> bool:
        """
        Delete a prompt (soft delete by setting is_active = False)
        
        Args:
            prompt_id: The prompt ID
            user_id: The user ID (for security)
            
        Returns:
            True if deleted, False if not found
        """
        try:
            with self.get_connection() as conn:
                with conn.cursor() as cur:
                    query = """
                        UPDATE ai_prompts 
                        SET is_active = FALSE, updated_at = NOW()
                        WHERE id = %s AND user_id = %s
                    """
                    cur.execute(query, [prompt_id, user_id])
                    conn.commit()
                    
                    return cur.rowcount > 0
                    
        except Exception as e:
            logger.error(f"Error deleting prompt {prompt_id} for user {user_id}: {e}")
            raise
    
    def increment_usage_count(self, prompt_id: int, user_id: str) -> bool:
        """
        Increment the usage count for a prompt
        
        Args:
            prompt_id: The prompt ID
            user_id: The user ID (for security)
            
        Returns:
            True if updated, False if not found
        """
        try:
            with self.get_connection() as conn:
                with conn.cursor() as cur:
                    query = """
                        UPDATE ai_prompts 
                        SET usage_count = usage_count + 1, updated_at = NOW()
                        WHERE id = %s AND user_id = %s
                    """
                    cur.execute(query, [prompt_id, user_id])
                    conn.commit()
                    
                    return cur.rowcount > 0
                    
        except Exception as e:
            logger.error(f"Error incrementing usage for prompt {prompt_id}: {e}")
            raise

    def fetch_competitors(self, user_id: str, industry: Optional[str] = None, limit: int = 50) -> List[Dict[str, Any]]:
        """
        Fetch competitors for a specific user with optional filtering
        
        Args:
            user_id: The user ID to get competitors for
            industry: Optional industry filter
            limit: Maximum number of competitors to return (default 50, max 250)
            
        Returns:
            List of competitor dictionaries
        """
        try:
            with self.get_connection() as conn:
                with conn.cursor() as cur:
                    # Build the base query
                    query = """
                        SELECT 
                            id, user_id, name, industry, website, 
                            last_seen, score
                        FROM competitors 
                        WHERE user_id = %s
                    """
                    
                    params = [user_id]
                    
                    # Add industry filter if provided
                    if industry:
                        query += " AND LOWER(industry) = LOWER(%s)"
                        params.append(industry)
                    
                    # Add ordering and limit
                    query += " ORDER BY last_seen DESC LIMIT %s"
                    params.append(limit)
                    
                    # Execute query
                    cur.execute(query, params)
                    rows = cur.fetchall()
                    
                    # Convert to list of dictionaries
                    competitors = []
                    for row in rows:
                        try:
                            competitors.append(dict(row))
                        except Exception as e:
                            logger.warning(f"Failed to parse competitor row {row.get('id')}: {e}")
                            continue
                    
                    return competitors
                    
        except Exception as e:
            logger.error(f"Error fetching competitors for user {user_id}: {e}")
            raise

    def fetch_analytics(self, user_id: str, business_id: Optional[str], 
                       from_dt: date, to_dt: date, group_by: str, 
                       metric_keys: List[str]) -> Dict[str, Any]:
        """
        Fetch analytics data for a specific user with time-series grouping
        
        Args:
            user_id: The user ID to get analytics for
            business_id: Optional business ID filter
            from_dt: Start date for the analytics window
            to_dt: End date for the analytics window
            group_by: Grouping period ('day', 'week', 'month')
            metric_keys: List of metrics to include in the response
            
        Returns:
            Dictionary with 'rows' and 'totals' keys
        """
        try:
            with self.get_connection() as conn:
                with conn.cursor() as cur:
                    # Build dynamic SELECT clause for requested metrics
                    metric_columns = []
                    for metric in metric_keys:
                        if metric in ['impressions', 'clicks', 'conversions', 'rev']:
                            metric_columns.append(f"SUM({metric}) as {metric}")
                    
                    if not metric_columns:
                        # Default to all metrics if none specified
                        metric_columns = [
                            "SUM(impressions) as impressions",
                            "SUM(clicks) as clicks", 
                            "SUM(conversions) as conversions",
                            "SUM(rev) as rev"
                        ]
                    
                    # Build the main query for time-series data
                    query = f"""
                        SELECT 
                            date_trunc(%s, occurred_at) as period_start,
                            date_trunc(%s, occurred_at) + interval '1 {group_by}' as period_end,
                            {', '.join(metric_columns)}
                        FROM analytics_events 
                        WHERE user_id = %s 
                        AND occurred_at >= %s 
                        AND occurred_at < %s
                    """
                    
                    params = [group_by, group_by, user_id, from_dt, to_dt]
                    
                    # Add business_id filter if provided
                    if business_id:
                        query += " AND business_id = %s"
                        params.append(business_id)
                    
                    query += " GROUP BY period_start ORDER BY period_start ASC"
                    
                    # Execute query for time-series data
                    cur.execute(query, params)
                    rows = cur.fetchall()
                    
                    # Convert to list of dictionaries
                    analytics_rows = []
                    for row in rows:
                        try:
                            row_dict = dict(row)
                            analytics_rows.append(row_dict)
                        except Exception as e:
                            logger.warning(f"Failed to parse analytics row: {e}")
                            continue
                    
                    # Build totals query
                    totals_query = f"""
                        SELECT {', '.join(metric_columns)}
                        FROM analytics_events 
                        WHERE user_id = %s 
                        AND occurred_at >= %s 
                        AND occurred_at < %s
                    """
                    
                    totals_params = [user_id, from_dt, to_dt]
                    
                    if business_id:
                        totals_query += " AND business_id = %s"
                        totals_params.append(business_id)
                    
                    # Execute totals query
                    cur.execute(totals_query, totals_params)
                    totals_row = cur.fetchone()
                    
                    totals = dict(totals_row) if totals_row else {}
                    
                    return {
                        "rows": analytics_rows,
                        "totals": totals
                    }
                    
        except Exception as e:
            logger.error(f"Error fetching analytics for user {user_id}: {e}")
            raise


# Global repository instance
insights_repo = InsightsRepository()
