"""
Flask Blueprint for AI Business Insights API

This module provides the REST API endpoints for managing AI prompts
with JWT authentication, tier-based entitlements, and feature limits.
"""

import logging
from datetime import datetime, date, timedelta
from flask import Blueprint, request, jsonify
from .models import (
    PromptListResponse, PromptOut, ErrorResponse, SuccessResponse, 
    CompetitorOut, CompetitorQuery, AnalyticsQuery, AnalyticsOut, AnalyticsRowOut, AnalyticsTotals
)
from .repo import insights_repo
from .middleware.entitlements import require_tier, get_user_query_limit

logger = logging.getLogger(__name__)

# Create the blueprint
insights_bp = Blueprint('insights', __name__, url_prefix='/insights/api')


@insights_bp.route('/daily', methods=['GET'])
@require_tier(["core", "growth", "partner"])
def get_daily_insight():
    """
    GET /insights/api/daily
    
    Returns cached "Insight of the Day" for the user if available, 
    otherwise generates and stores it. Enforces quotas based on user tier.
    Requires tier in ["core", "growth", "partner"].
    
    Query Parameters:
        business_id: Optional business ID filter
        
    Returns:
        200: Daily insight data
        401: Authentication error
        403: Insufficient tier or quota exceeded
        500: Server error
    """
    try:
        user_id = request.user_id
        user_tier = request.user_tier
        business_id = request.args.get('business_id')
        
        # Check quota for Core tier users
        if user_tier == "core":
            current_month = date.today().replace(day=1)
            monthly_usage = insights_repo.get_monthly_usage(user_id, current_month)
            
            if monthly_usage >= 10:  # Core plan limit
                return jsonify(ErrorResponse(
                    error="Monthly insights quota exceeded. Upgrade to Growth or Partner tier for unlimited insights.",
                    code="QUOTA_EXCEEDED",
                    details={"current_usage": monthly_usage, "limit": 10}
                ).dict()), 403
        
        # Get today's date
        today = date.today()
        
        # Try to get cached insight first
        cached_insight = insights_repo.get_cached_daily_insight(user_id, today, business_id)
        
        if cached_insight:
            # Return cached insight
            return jsonify(cached_insight), 200
        
        # Generate new insight if not cached
        new_insight = insights_repo.generate_daily_insight(user_id, today, business_id)
        
        if not new_insight:
            return jsonify(ErrorResponse(
                error="Failed to generate daily insight",
                code="GENERATION_FAILED"
            ).dict()), 500
        
        # Increment usage count for Core tier users
        if user_tier == "core":
            insights_repo.increment_monthly_usage(user_id, current_month)
        
        return jsonify(new_insight), 200
        
    except Exception as e:
        logger.error(f"Error getting daily insight for user {getattr(request, 'user_id', 'unknown')}: {e}")
        return jsonify(ErrorResponse(
            error="Failed to retrieve daily insight",
            code="SERVER_ERROR"
        ).dict()), 500


@insights_bp.route('/prompts', methods=['GET'])
@require_tier(["core", "growth", "partner"])
def get_prompts():
    """
    GET /insights/api/prompts
    
    Get prompts for the authenticated user with tier-based limits.
    Requires tier in ["core", "growth", "partner"].
    
    Returns:
        200: List of prompts with tier information
        401: Authentication error
        403: Insufficient tier
        500: Server error
    """
    try:
        user_id = request.user_id
        user_tier = request.user_tier
        
        # Get user's query limit based on tier
        query_limit = get_user_query_limit(user_tier)
        
        # Fetch prompts with limit applied
        prompts_data = insights_repo.fetch_prompts(user_id, limit=query_limit)
        
        # Convert to Pydantic models
        prompts = []
        for prompt_data in prompts_data:
            try:
                prompt = PromptOut(**prompt_data)
                prompts.append(prompt)
            except Exception as e:
                logger.warning(f"Failed to parse prompt data: {e}")
                continue
        
        # Get total count for comparison
        total_count = insights_repo.get_prompt_count(user_id)
        
        response = PromptListResponse(
            prompts=prompts,
            total_count=total_count,
            limit_applied=query_limit,
            user_tier=user_tier
        )
        
        return jsonify(response.dict()), 200
        
    except Exception as e:
        logger.error(f"Error getting prompts for user {getattr(request, 'user_id', 'unknown')}: {e}")
        return jsonify(ErrorResponse(
            error="Failed to retrieve prompts",
            code="SERVER_ERROR"
        ).dict()), 500


@insights_bp.route('/suggestions', methods=['GET'])
@require_tier(["core", "growth", "partner"])
def get_suggestions():
    """
    GET /insights/api/suggestions
    
    Get AI-powered suggestions for the authenticated user.
    Requires tier in ["core", "growth", "partner"].
    
    Query Parameters:
        q: Optional seed text for suggestions
        business_id: Optional business ID filter
        
    Returns:
        200: List of suggestions
        401: Authentication error
        403: Insufficient tier or quota exceeded
        500: Server error
    """
    try:
        user_id = request.user_id
        user_tier = request.user_tier
        q = request.args.get('q')
        business_id = request.args.get('business_id')
        
        # Check quota for Core tier users
        if user_tier == "core":
            current_month = date.today().replace(day=1)
            monthly_usage = insights_repo.get_monthly_usage(user_id, current_month)
            
            if monthly_usage >= 10:  # Core plan limit
                return jsonify(ErrorResponse(
                    error="Monthly insights quota exceeded. Upgrade to Growth or Partner tier for unlimited insights.",
                    code="QUOTA_EXCEEDED",
                    details={"current_usage": monthly_usage, "limit": 10}
                ).dict()), 403
        
        # Fetch suggestions
        suggestions_data = insights_repo.fetch_suggestions(user_id, q=q, business_id=business_id)
        
        # Increment usage count for Core tier users
        if user_tier == "core":
            insights_repo.increment_monthly_usage(user_id, current_month)
        
        return jsonify(suggestions_data), 200
        
    except Exception as e:
        logger.error(f"Error getting suggestions for user {getattr(request, 'user_id', 'unknown')}: {e}")
        return jsonify(ErrorResponse(
            error="Failed to retrieve suggestions",
            code="SERVER_ERROR"
        ).dict()), 500


@insights_bp.route('/prompts/<int:prompt_id>', methods=['GET'])
@require_tier(["core", "growth", "partner"])
def get_prompt(prompt_id: int):
    """
    GET /insights/api/prompts/<prompt_id>
    
    Get a specific prompt by ID for the authenticated user.
    Requires tier in ["core", "growth", "partner"].
    
    Args:
        prompt_id (int): The prompt ID
        
    Returns:
        200: Prompt details
        401: Authentication error
        403: Insufficient tier
        404: Prompt not found
        500: Server error
    """
    try:
        user_id = request.user_id
        
        # Fetch all prompts and find the specific one
        prompts_data = insights_repo.fetch_prompts(user_id)
        
        # Find the specific prompt
        target_prompt = None
        for prompt_data in prompts_data:
            if prompt_data['id'] == prompt_id:
                target_prompt = prompt_data
                break
        
        if not target_prompt:
            return jsonify(ErrorResponse(
                error="Prompt not found",
                code="NOT_FOUND"
            ).dict()), 404
        
        # Convert to Pydantic model
        prompt = PromptOut(**target_prompt)
        
        return jsonify(prompt.dict()), 200
        
    except Exception as e:
        logger.error(f"Error getting prompt {prompt_id} for user {getattr(request, 'user_id', 'unknown')}: {e}")
        return jsonify(ErrorResponse(
            error="Failed to retrieve prompt",
            code="SERVER_ERROR"
        ).dict()), 500


@insights_bp.route('/prompts', methods=['POST'])
@require_tier(["core", "growth", "partner"])
def create_prompt():
    """
    POST /insights/api/prompts
    
    Create a new prompt for the authenticated user.
    Requires tier in ["core", "growth", "partner"].
    
    Request Body:
        JSON object with prompt data (title, content, category, tags)
        
    Returns:
        201: Prompt created successfully
        400: Invalid request data
        401: Authentication error
        403: Insufficient tier
        500: Server error
    """
    try:
        # Parse and validate request data
        try:
            data = request.get_json()
            if not data:
                return jsonify(ErrorResponse(
                    error="Request body is required",
                    code="MISSING_BODY"
                ).dict()), 400
            
            # Validate required fields
            required_fields = ['title', 'content', 'category']
            for field in required_fields:
                if field not in data or not data[field]:
                    return jsonify(ErrorResponse(
                        error=f"Missing required field: {field}",
                        code="INVALID_DATA"
                    ).dict()), 400
            
        except Exception as e:
            return jsonify(ErrorResponse(
                error=f"Invalid request data: {str(e)}",
                code="INVALID_DATA"
            ).dict()), 400
        
        user_id = request.user_id
        
        # Create prompt in repository
        created_prompt_data = insights_repo.create_prompt(user_id, data)
        
        # Convert to Pydantic model
        prompt = PromptOut(**created_prompt_data)
        
        return jsonify(prompt.dict()), 201
        
    except Exception as e:
        logger.error(f"Error creating prompt for user {getattr(request, 'user_id', 'unknown')}: {e}")
        return jsonify(ErrorResponse(
            error="Failed to create prompt",
            code="SERVER_ERROR"
        ).dict()), 500


@insights_bp.route('/prompts/<int:prompt_id>', methods=['PUT'])
@require_tier(["core", "growth", "partner"])
def update_prompt(prompt_id: int):
    """
    PUT /insights/api/prompts/<prompt_id>
    
    Update an existing prompt for the authenticated user.
    Requires tier in ["core", "growth", "partner"].
    
    Args:
        prompt_id (int): The prompt ID
        
    Request Body:
        JSON object with fields to update
        
    Returns:
        200: Prompt updated successfully
        400: Invalid request data
        401: Authentication error
        403: Insufficient tier
        404: Prompt not found
        500: Server error
    """
    try:
        # Parse and validate request data
        try:
            data = request.get_json()
            if not data:
                return jsonify(ErrorResponse(
                    error="Request body is required",
                    code="MISSING_BODY"
                ).dict()), 400
            
        except Exception as e:
            return jsonify(ErrorResponse(
                error=f"Invalid request data: {str(e)}",
                code="INVALID_DATA"
            ).dict()), 400
        
        user_id = request.user_id
        
        # Update prompt in repository
        updated_prompt_data = insights_repo.update_prompt(prompt_id, user_id, data)
        
        if not updated_prompt_data:
            return jsonify(ErrorResponse(
                error="Prompt not found",
                code="NOT_FOUND"
            ).dict()), 404
        
        # Convert to Pydantic model
        prompt = PromptOut(**updated_prompt_data)
        
        return jsonify(prompt.dict()), 200
        
    except Exception as e:
        logger.error(f"Error updating prompt {prompt_id} for user {getattr(request, 'user_id', 'unknown')}: {e}")
        return jsonify(ErrorResponse(
            error="Failed to update prompt",
            code="SERVER_ERROR"
        ).dict()), 500


@insights_bp.route('/prompts/<int:prompt_id>', methods=['DELETE'])
@require_tier(["core", "growth", "partner"])
def delete_prompt(prompt_id: int):
    """
    DELETE /insights/api/prompts/<prompt_id>
    
    Delete (soft delete) a prompt for the authenticated user.
    Requires tier in ["core", "growth", "partner"].
    
    Args:
        prompt_id (int): The prompt ID
        
    Returns:
        200: Prompt deleted successfully
        401: Authentication error
        403: Insufficient tier
        404: Prompt not found
        500: Server error
    """
    try:
        user_id = request.user_id
        
        success = insights_repo.delete_prompt(prompt_id, user_id)
        
        if not success:
            return jsonify(ErrorResponse(
                error="Prompt not found",
                code="NOT_FOUND"
            ).dict()), 404
        
        return jsonify(SuccessResponse(
            message="Prompt deleted successfully"
        ).dict()), 200
        
    except Exception as e:
        logger.error(f"Error deleting prompt {prompt_id} for user {getattr(request, 'user_id', 'unknown')}: {e}")
        return jsonify(ErrorResponse(
            error="Failed to delete prompt",
            code="SERVER_ERROR"
        ).dict()), 500


@insights_bp.route('/prompts/<int:prompt_id>/use', methods=['POST'])
@require_tier(["core", "growth", "partner"])
def use_prompt(prompt_id: int):
    """
    POST /insights/api/prompts/<prompt_id>/use
    
    Increment the usage count for a prompt.
    Requires tier in ["core", "growth", "partner"].
    
    Args:
        prompt_id (int): The prompt ID
        
    Returns:
        200: Usage count incremented successfully
        401: Authentication error
        403: Insufficient tier
        404: Prompt not found
        500: Server error
    """
    try:
        user_id = request.user_id
        
        success = insights_repo.increment_usage_count(prompt_id, user_id)
        
        if not success:
            return jsonify(ErrorResponse(
                error="Prompt not found",
                code="NOT_FOUND"
            ).dict()), 404
        
        return jsonify(SuccessResponse(
            message="Usage count incremented successfully"
        ).dict()), 200
        
    except Exception as e:
        logger.error(f"Error incrementing usage for prompt {prompt_id}: {e}")
        return jsonify(ErrorResponse(
            error="Failed to increment usage count",
            code="SERVER_ERROR"
        ).dict()), 500


@insights_bp.route('/competitors', methods=['GET'])
@require_tier(["growth", "partner"])
def get_competitors():
    """
    GET /insights/api/competitors
    
    Get a list of competitors for the authenticated user.
    Requires tier in ["growth", "partner"].
    
    Query Parameters:
        industry: Optional industry filter
        limit: Maximum number of results (default: 50, max: 250)
    
    Returns:
        200: List of competitors
        401: Authentication error
        403: Insufficient tier
        500: Server error
    """
    try:
        # Parse and validate query parameters
        try:
            query_data = CompetitorQuery(**request.args)
        except Exception as e:
            return jsonify(ErrorResponse(
                error=f"Invalid query parameters: {str(e)}",
                code="INVALID_PARAMS"
            ).dict()), 400
        
        user_id = request.user_id
        
        # Fetch competitors
        competitors_data = insights_repo.fetch_competitors(
            user_id=user_id,
            industry=query_data.industry,
            limit=query_data.limit
        )
        
        # Convert to Pydantic models
        competitors = []
        for competitor_data in competitors_data:
            try:
                competitor = CompetitorOut(**competitor_data)
                competitors.append(competitor)
            except Exception as e:
                logger.warning(f"Failed to parse competitor data: {e}")
                continue
        
        return jsonify(competitors), 200
        
    except Exception as e:
        logger.error(f"Error getting competitors for user {getattr(request, 'user_id', 'unknown')}: {e}")
        return jsonify(ErrorResponse(
            error="Failed to retrieve competitors",
            code="SERVER_ERROR"
        ).dict()), 500


@insights_bp.route('/analytics', methods=['GET'])
@require_tier(["growth", "partner"])
def get_analytics():
    """
    GET /insights/api/analytics
    
    Get analytics data for the authenticated user with time-series grouping.
    Requires tier in ["growth", "partner"].
    
    Query Parameters:
        business_id: Optional business ID filter
        from: Start date (YYYY-MM-DD, default: 30 days ago)
        to: End date (YYYY-MM-DD, default: today)
        group_by: Grouping period (day/week/month, default: day)
        metrics: CSV of metrics to include (default: impressions,clicks,conversions,rev)
    
    Returns:
        200: Analytics data with time-series rows and totals
        400: Invalid query parameters
        401: Authentication error
        403: Insufficient tier
        500: Server error
    """
    try:
        # Parse and validate query parameters
        try:
            query_data = AnalyticsQuery(**request.args)
        except Exception as e:
            return jsonify(ErrorResponse(
                error=f"Invalid query parameters: {str(e)}",
                code="INVALID_PARAMS"
            ).dict()), 400
        
        user_id = request.user_id
        
        # Set default date range if not provided (last 30 days)
        today = date.today()
        
        if query_data.from_ is None:
            from_dt = today - timedelta(days=30)
        else:
            from_dt = datetime.strptime(query_data.from_, '%Y-%m-%d').date()
        
        if query_data.to is None:
            to_dt = today
        else:
            to_dt = datetime.strptime(query_data.to, '%Y-%m-%d').date()
        
        # Validate date range
        if from_dt > to_dt:
            return jsonify(ErrorResponse(
                error="Start date must be before or equal to end date",
                code="INVALID_DATE_RANGE"
            ).dict()), 400
        
        # Enforce maximum window of 366 days
        max_window = timedelta(days=366)
        if (to_dt - from_dt) > max_window:
            # Clamp to maximum window
            from_dt = to_dt - max_window
        
        # Parse metrics
        metric_keys = []
        if query_data.metrics:
            metric_keys = [m.strip() for m in query_data.metrics.split(',') if m.strip()]
        
        # Default to all metrics if none specified
        if not metric_keys:
            metric_keys = ['impressions', 'clicks', 'conversions', 'rev']
        
        # Fetch analytics data
        analytics_data = insights_repo.fetch_analytics(
            user_id=user_id,
            business_id=query_data.business_id,
            from_dt=from_dt,
            to_dt=to_dt,
            group_by=query_data.group_by,
            metric_keys=metric_keys
        )
        
        # Convert rows to Pydantic models
        rows = []
        for row_data in analytics_data['rows']:
            try:
                row = AnalyticsRowOut(**row_data)
                rows.append(row)
            except Exception as e:
                logger.warning(f"Failed to parse analytics row: {e}")
                continue
        
        # Convert totals to Pydantic model
        totals = AnalyticsTotals(**analytics_data['totals'])
        
        # Create response
        response = AnalyticsOut(rows=rows, totals=totals)
        
        return jsonify(response.dict()), 200
        
    except Exception as e:
        logger.error(f"Error getting analytics for user {getattr(request, 'user_id', 'unknown')}: {e}")
        return jsonify(ErrorResponse(
            error="internal_error",
            code="INTERNAL_ERROR"
        ).dict()), 500


@insights_bp.route('/health', methods=['GET'])
def health_check():
    """
    GET /insights/api/health
    
    Health check endpoint for the insights API.
    
    Returns:
        200: API is healthy
    """
    return jsonify(SuccessResponse(
        message="AI Insights API is healthy",
        data={"status": "ok", "version": "1.0.0", "tier_system": "enabled"}
    ).dict()), 200


@insights_bp.route('/limits', methods=['GET'])
@require_tier(["core", "growth", "partner"])
def get_user_limits():
    """
    GET /insights/api/limits
    
    Get the current user's feature limits based on their tier.
    Requires tier in ["core", "growth", "partner"].
    
    Returns:
        200: User's feature limits
        401: Authentication error
        403: Insufficient tier
        500: Server error
    """
    try:
        from .middleware.entitlements import feature_limits
        
        user_tier = request.user_tier
        limits = feature_limits(user_tier)
        
        return jsonify(limits.dict()), 200
        
    except Exception as e:
        logger.error(f"Error getting limits for user {getattr(request, 'user_id', 'unknown')}: {e}")
        return jsonify(ErrorResponse(
            error="Failed to retrieve user limits",
            code="SERVER_ERROR"
        ).dict()), 500


# Error handlers for the blueprint
@insights_bp.errorhandler(404)
def not_found(error):
    return jsonify(ErrorResponse(
        error="Endpoint not found",
        code="NOT_FOUND"
    ).dict()), 404


@insights_bp.errorhandler(405)
def method_not_allowed(error):
    return jsonify(ErrorResponse(
        error="Method not allowed",
        code="METHOD_NOT_ALLOWED"
    ).dict()), 405


@insights_bp.errorhandler(500)
def internal_error(error):
    logger.error(f"Internal server error: {error}")
    return jsonify(ErrorResponse(
        error="Internal server error",
        code="INTERNAL_ERROR"
    ).dict()), 500
