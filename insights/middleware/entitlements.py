"""
Entitlements Middleware for AI Business Insights

This module provides JWT authentication and tier-based access control
for the insights API endpoints.
"""

import os
import logging
from functools import wraps
from typing import List, Optional
from flask import request, jsonify, current_app
import jwt
from jwt.exceptions import InvalidTokenError, ExpiredSignatureError, DecodeError
from ..models import ErrorResponse, UserTier, FeatureLimits

logger = logging.getLogger(__name__)


def feature_limits(user_tier: str) -> UserTier:
    """
    Get feature limits for a specific user tier
    
    Args:
        user_tier (str): The user's subscription tier
        
    Returns:
        UserTier: Feature limits for the tier
    """
    limits = {
        "core": UserTier(
            tier="core",
            business_profiles=1,
            ai_queries_per_month=25,
            monitored_systems=1,
            white_label=False
        ),
        "growth": UserTier(
            tier="growth",
            business_profiles=-1,  # -1 indicates unlimited
            ai_queries_per_month=-1,  # -1 indicates unlimited
            monitored_systems=-1,  # -1 indicates unlimited
            white_label=False
        ),
        "partner": UserTier(
            tier="partner",
            business_profiles=-1,  # -1 indicates unlimited
            ai_queries_per_month=-1,  # -1 indicates unlimited
            monitored_systems=-1,  # -1 indicates unlimited
            white_label=True
        )
    }
    
    return limits.get(user_tier, limits["core"])


def get_all_feature_limits() -> FeatureLimits:
    """
    Get all feature limits for all tiers
    
    Returns:
        FeatureLimits: Complete feature limits configuration
    """
    return FeatureLimits(
        core=feature_limits("core"),
        growth=feature_limits("growth"),
        partner=feature_limits("partner")
    )


def verify_jwt_token() -> Optional[dict]:
    """
    Verify JWT token from Authorization header
    
    Returns:
        dict: JWT payload if valid, None otherwise
    """
    auth_header = request.headers.get('Authorization')
    
    if not auth_header:
        return None
    
    try:
        # Extract token from "Bearer <token>" format
        if not auth_header.startswith('Bearer '):
            return None
        
        token = auth_header.split(' ')[1]
        jwt_secret = os.getenv('JWT_SECRET')
        
        if not jwt_secret:
            logger.error("JWT_SECRET environment variable not set")
            return None
        
        # Decode and verify JWT
        payload = jwt.decode(
            token, 
            jwt_secret, 
            algorithms=['HS256'],
            options={'verify_signature': True}
        )
        
        return payload
        
    except (InvalidTokenError, ExpiredSignatureError, DecodeError) as e:
        logger.warning(f"Invalid JWT token: {e}")
        return None
    except Exception as e:
        logger.error(f"JWT verification error: {e}")
        return None


def require_auth(f):
    """Decorator to require JWT authentication"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        payload = verify_jwt_token()
        
        if not payload:
            return jsonify(ErrorResponse(
                error="Authorization required",
                code="UNAUTHORIZED"
            ).dict()), 401
        
        # Extract user_id from sub claim
        user_id = payload.get('sub')
        if not user_id:
            return jsonify(ErrorResponse(
                error="Invalid token: missing user ID",
                code="INVALID_TOKEN"
            ).dict()), 401
        
        # Add user info to request context
        request.user_id = user_id
        request.user_tier = payload.get('tier', 'core')  # Default to core tier
        request.jwt_payload = payload
        
        return f(*args, **kwargs)
    
    return decorated_function


def require_tier(allowed_tiers: List[str]):
    """
    Decorator to require specific subscription tier
    
    Args:
        allowed_tiers (List[str]): List of allowed tiers for this endpoint
    """
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            # First verify authentication
            payload = verify_jwt_token()
            
            if not payload:
                return jsonify(ErrorResponse(
                    error="Authorization required",
                    code="UNAUTHORIZED"
                ).dict()), 401
            
            # Extract user info
            user_id = payload.get('sub')
            user_tier = payload.get('tier', 'core')
            
            if not user_id:
                return jsonify(ErrorResponse(
                    error="Invalid token: missing user ID",
                    code="INVALID_TOKEN"
                ).dict()), 401
            
            # Check tier access
            if user_tier not in allowed_tiers:
                return jsonify(ErrorResponse(
                    error=f"Access denied. Required tier: {', '.join(allowed_tiers)}. Your tier: {user_tier}",
                    code="INSUFFICIENT_TIER"
                ).dict()), 403
            
            # Add user info to request context
            request.user_id = user_id
            request.user_tier = user_tier
            request.jwt_payload = payload
            
            return f(*args, **kwargs)
        
        return decorated_function
    return decorator


def get_user_query_limit(user_tier: str) -> Optional[int]:
    """
    Get the query limit for a user based on their tier
    
    Args:
        user_tier (str): The user's subscription tier
        
    Returns:
        int: Query limit, or None if unlimited
    """
    limits = feature_limits(user_tier)
    
    if limits.ai_queries_per_month == -1:
        return None  # Unlimited
    
    return limits.ai_queries_per_month


def check_monthly_query_limit(user_id: str, user_tier: str, current_usage: int) -> bool:
    """
    Check if user has exceeded their monthly query limit
    
    Args:
        user_id (str): The user ID
        user_tier (str): The user's subscription tier
        current_usage (int): Current monthly usage count
        
    Returns:
        bool: True if within limit, False if exceeded
    """
    limit = get_user_query_limit(user_tier)
    
    if limit is None:
        return True  # Unlimited
    
    return current_usage < limit


def increment_monthly_usage(user_id: str, month: str, year: str) -> int:
    """
    Increment monthly usage counter for a user
    
    Args:
        user_id (str): The user ID
        month (str): Current month (e.g., "01", "02")
        year (str): Current year (e.g., "2024")
        
    Returns:
        int: New usage count
    """
    # This would typically interact with the database
    # For now, we'll return a placeholder
    # In a real implementation, you'd update the usage tracking table
    return 1  # Placeholder


