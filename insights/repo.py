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

    def get_cached_daily_insight(self, user_id: str, day: date, business_id: Optional[str] = None) -> Optional[Dict[str, Any]]:
        """
        Get cached daily insight for a user on a specific day
        
        Args:
            user_id: The user ID
            day: The date to get insight for
            business_id: Optional business ID filter
            
        Returns:
            Cached insight data or None if not found
        """
        try:
            with self.get_connection() as conn:
                with conn.cursor() as cur:
                    query = """
                        SELECT id, user_id, business_id, day, title, suggestion, source, created_at
                        FROM insight_daily_cache 
                        WHERE user_id = %s AND day = %s
                    """
                    params = [user_id, day]
                    
                    if business_id:
                        query += " AND business_id = %s"
                        params.append(business_id)
                    else:
                        query += " AND business_id IS NULL"
                    
                    cur.execute(query, params)
                    row = cur.fetchone()
                    
                    if row:
                        return dict(row)
                    return None
                    
        except Exception as e:
            logger.error(f"Error getting cached daily insight for user {user_id}: {e}")
            return None

    def generate_daily_insight(self, user_id: str, day: date, business_id: Optional[str] = None) -> Optional[Dict[str, Any]]:
        """
        Generate and cache a new daily insight for a user
        
        Args:
            user_id: The user ID
            day: The date for the insight
            business_id: Optional business ID filter
            
        Returns:
            Generated insight data or None if failed
        """
        try:
            # Generate insight content (this would typically call an AI service)
            # For now, we'll create a placeholder insight
            insight_data = {
                'title': f"Daily Insight for {day.strftime('%B %d, %Y')}",
                'suggestion': f"Based on your business data, here's your personalized insight for {day.strftime('%B %d, %Y')}. Consider optimizing your marketing strategy to improve conversion rates.",
                'source': 'generated'
            }
            
            with self.get_connection() as conn:
                with conn.cursor() as cur:
                    # Insert the new insight into cache
                    query = """
                        INSERT INTO insight_daily_cache 
                        (user_id, business_id, day, title, suggestion, source)
                        VALUES (%s, %s, %s, %s, %s, %s)
                        RETURNING id, user_id, business_id, day, title, suggestion, source, created_at
                    """
                    
                    cur.execute(query, [
                        user_id, business_id, day, 
                        insight_data['title'], insight_data['suggestion'], insight_data['source']
                    ])
                    
                    row = cur.fetchone()
                    conn.commit()
                    
                    if row:
                        return dict(row)
                    return None
                    
        except Exception as e:
            logger.error(f"Error generating daily insight for user {user_id}: {e}")
            return None

    def get_monthly_usage(self, user_id: str, month: date) -> int:
        """
        Get monthly insights usage for a user
        
        Args:
            user_id: The user ID
            month: The month to check (first day of month)
            
        Returns:
            Total usage count for the month
        """
        try:
            with self.get_connection() as conn:
                with conn.cursor() as cur:
                    query = """
                        SELECT COALESCE(SUM(prompts_queries + suggestions_queries), 0) as total_usage
                        FROM insights_usage 
                        WHERE user_id = %s AND month = %s
                    """
                    
                    cur.execute(query, [user_id, month])
                    row = cur.fetchone()
                    
                    return row['total_usage'] if row else 0
                    
        except Exception as e:
            logger.error(f"Error getting monthly usage for user {user_id}: {e}")
            return 0

    def increment_monthly_usage(self, user_id: str, month: date) -> bool:
        """
        Increment monthly insights usage for a user
        
        Args:
            user_id: The user ID
            month: The month to increment (first day of month)
            
        Returns:
            True if successful, False otherwise
        """
        try:
            with self.get_connection() as conn:
                with conn.cursor() as cur:
                    # Try to update existing record, insert if not exists
                    query = """
                        INSERT INTO insights_usage (user_id, month, prompts_queries, suggestions_queries)
                        VALUES (%s, %s, 0, 1)
                        ON CONFLICT (user_id, month) 
                        DO UPDATE SET 
                            suggestions_queries = insights_usage.suggestions_queries + 1,
                            updated_at = NOW()
                    """
                    
                    cur.execute(query, [user_id, month])
                    conn.commit()
                    return True
                    
        except Exception as e:
            logger.error(f"Error incrementing monthly usage for user {user_id}: {e}")
            return False

    def fetch_suggestions(self, user_id: str, q: Optional[str] = None, business_id: Optional[str] = None) -> List[Dict[str, Any]]:
        """
        Fetch AI-powered suggestions for a user
        
        Args:
            user_id: The user ID
            q: Optional seed text for suggestions
            business_id: Optional business ID filter
            
        Returns:
            List of suggestion dictionaries
        """
        try:
            # For now, return mock suggestions
            # In a real implementation, this would call an AI service
            suggestions = [
                {
                    'id': '1',
                    'user_id': user_id,
                    'business_id': business_id,
                    'suggestion': 'Consider implementing A/B testing on your landing pages to improve conversion rates.',
                    'score': 0.85,
                    'created_at': '2024-01-01T00:00:00Z'
                },
                {
                    'id': '2',
                    'user_id': user_id,
                    'business_id': business_id,
                    'suggestion': 'Your email open rates are below industry average. Try personalizing subject lines.',
                    'score': 0.72,
                    'created_at': '2024-01-01T00:00:00Z'
                }
            ]
            
            # Filter by seed text if provided
            if q:
                suggestions = [s for s in suggestions if q.lower() in s['suggestion'].lower()]
            
            return suggestions
            
        except Exception as e:
            logger.error(f"Error fetching suggestions for user {user_id}: {e}")
            return []

    def fetch_competitors(self, user_id: str, industry: Optional[str] = None, limit: int = 50) -> List[Dict[str, Any]]:
        """
        Fetch competitors for a user
        
        Args:
            user_id: The user ID
            industry: Optional industry filter
            limit: Maximum number of results
            
        Returns:
            List of competitor dictionaries
        """
        try:
            # For now, return mock competitors
            # In a real implementation, this would query a competitors database
            competitors = [
                {
                    'id': '1',
                    'user_id': user_id,
                    'name': 'TechCorp Solutions',
                    'industry': 'Technology',
                    'website': 'https://techcorp.com',
                    'last_seen': '2024-01-01T00:00:00Z',
                    'score': 0.92
                },
                {
                    'id': '2',
                    'user_id': user_id,
                    'name': 'InnovateAI',
                    'industry': 'Technology',
                    'website': 'https://innovateai.com',
                    'last_seen': '2024-01-01T00:00:00Z',
                    'score': 0.78
                }
            ]
            
            # Filter by industry if provided
            if industry:
                competitors = [c for c in competitors if c['industry'].lower() == industry.lower()]
            
            return competitors[:limit]
            
        except Exception as e:
            logger.error(f"Error fetching competitors for user {user_id}: {e}")
            return []

    def fetch_analytics(self, user_id: str, business_id: Optional[str] = None, 
                       from_dt: date = None, to_dt: date = None, 
                       group_by: str = 'day', metric_keys: List[str] = None) -> Dict[str, Any]:
        """
        Fetch analytics data for a user
        
        Args:
            user_id: The user ID
            business_id: Optional business ID filter
            from_dt: Start date
            to_dt: End date
            group_by: Grouping period (day/week/month)
            metric_keys: List of metrics to include
            
        Returns:
            Analytics data with rows and totals
        """
        try:
            # For now, return mock analytics
            # In a real implementation, this would query analytics tables
            rows = [
                {
                    'period_start': '2024-01-01T00:00:00Z',
                    'period_end': '2024-01-01T23:59:59Z',
                    'impressions': 1200,
                    'clicks': 68,
                    'conversions': 4,
                    'rev': 850.00
                },
                {
                    'period_start': '2024-01-02T00:00:00Z',
                    'period_end': '2024-01-02T23:59:59Z',
                    'impressions': 1350,
                    'clicks': 72,
                    'conversions': 5,
                    'rev': 920.00
                }
            ]
            
            totals = {
                'impressions': 2550,
                'clicks': 140,
                'conversions': 9,
                'rev': 1770.00
            }
            
            return {
                'rows': rows,
                'totals': totals
            }
            
        except Exception as e:
            logger.error(f"Error fetching analytics for user {user_id}: {e}")
            return {'rows': [], 'totals': {}}

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


# Global repository instance
insights_repo = InsightsRepository()
