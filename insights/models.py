"""
Pydantic models for AI Business Insights API

This module defines the data models used for request/response validation
and database query results.
"""

from datetime import datetime, date
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field, validator


class PromptOut(BaseModel):
    """Model for prompt output data"""
    id: int = Field(..., description="Prompt ID")
    user_id: str = Field(..., description="User ID who owns the prompt")
    title: str = Field(..., description="Prompt title")
    content: str = Field(..., description="Prompt content")
    category: str = Field(..., description="Prompt category")
    tags: Optional[List[str]] = Field(default=[], description="Prompt tags")
    is_active: bool = Field(..., description="Whether the prompt is active")
    usage_count: int = Field(default=0, description="Number of times prompt was used")
    created_at: datetime = Field(..., description="Creation timestamp")
    updated_at: Optional[datetime] = Field(None, description="Last update timestamp")
    
    class Config:
        from_attributes = True


class PromptSuggestionOut(BaseModel):
    """Model for prompt suggestion output data"""
    id: str = Field(..., description="Suggestion ID")
    user_id: str = Field(..., description="User ID who owns the suggestion")
    business_id: Optional[str] = Field(None, description="Business ID filter")
    suggestion: str = Field(..., description="The suggestion text")
    score: Optional[float] = Field(None, description="Relevance score")
    created_at: datetime = Field(..., description="Creation timestamp")
    
    class Config:
        from_attributes = True
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }


class PromptSuggestionQuery(BaseModel):
    """Model for prompt suggestion query parameters"""
    q: Optional[str] = Field(None, description="Seed text for suggestions")
    business_id: Optional[str] = Field(None, description="Business ID filter")


class CompetitorOut(BaseModel):
    """Model for competitor output data"""
    id: str = Field(..., description="Competitor ID")
    user_id: str = Field(..., description="User ID who owns the competitor")
    name: str = Field(..., description="Competitor name")
    industry: str = Field(..., description="Industry")
    website: Optional[str] = Field(None, description="Website URL")
    last_seen: datetime = Field(..., description="Last seen timestamp")
    score: Optional[float] = Field(None, description="Relevance score")
    
    class Config:
        from_attributes = True
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }


class CompetitorQuery(BaseModel):
    """Model for competitor query parameters"""
    industry: Optional[str] = Field(None, description="Industry filter")
    limit: int = Field(default=50, ge=1, le=250, description="Result limit")


class AnalyticsQuery(BaseModel):
    """Model for analytics query parameters"""
    business_id: Optional[str] = Field(None, description="Business ID filter")
    from_: Optional[str] = Field(None, alias="from", description="Start date (YYYY-MM-DD)")
    to: Optional[str] = Field(None, description="End date (YYYY-MM-DD)")
    group_by: Optional[str] = Field(default="day", description="Grouping period")
    metrics: Optional[str] = Field(default="impressions,clicks,conversions,rev", description="CSV of metrics")
    
    @validator('from_', 'to')
    def validate_date_format(cls, v):
        if v is not None:
            try:
                datetime.strptime(v, '%Y-%m-%d')
            except ValueError:
                raise ValueError('Date must be in YYYY-MM-DD format')
        return v
    
    @validator('group_by')
    def validate_group_by(cls, v):
        if v not in ['day', 'week', 'month']:
            raise ValueError('group_by must be one of: day, week, month')
        return v
    
    @validator('metrics')
    def validate_metrics(cls, v):
        if v:
            valid_metrics = {'impressions', 'clicks', 'conversions', 'rev'}
            requested_metrics = set(v.split(','))
            # Only allow valid metrics, ignore unknown ones
            return ','.join(requested_metrics.intersection(valid_metrics))
        return v


class AnalyticsRowOut(BaseModel):
    """Model for analytics time-series row"""
    period_start: datetime = Field(..., description="Period start timestamp")
    period_end: datetime = Field(..., description="Period end timestamp")
    impressions: Optional[int] = Field(None, description="Impressions count")
    clicks: Optional[int] = Field(None, description="Clicks count")
    conversions: Optional[int] = Field(None, description="Conversions count")
    rev: Optional[float] = Field(None, description="Revenue amount")
    
    class Config:
        from_attributes = True
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }


class AnalyticsTotals(BaseModel):
    """Model for analytics summary totals"""
    impressions: Optional[int] = Field(None, description="Total impressions")
    clicks: Optional[int] = Field(None, description="Total clicks")
    conversions: Optional[int] = Field(None, description="Total conversions")
    rev: Optional[float] = Field(None, description="Total revenue")


class AnalyticsOut(BaseModel):
    """Model for analytics response"""
    rows: List[AnalyticsRowOut] = Field(..., description="Time-series data rows")
    totals: AnalyticsTotals = Field(..., description="Summary totals")


class PromptListResponse(BaseModel):
    """Model for list of prompts response"""
    prompts: List[PromptOut] = Field(..., description="List of prompts")
    total_count: int = Field(..., description="Total number of prompts")
    limit_applied: Optional[int] = Field(None, description="Query limit applied")
    user_tier: str = Field(..., description="User's subscription tier")


class ErrorResponse(BaseModel):
    """Model for error responses"""
    error: str = Field(..., description="Error message")
    code: str = Field(..., description="Error code")
    details: Optional[dict] = Field(None, description="Additional error details")


class SuccessResponse(BaseModel):
    """Model for success responses"""
    message: str = Field(..., description="Success message")
    data: Optional[dict] = Field(None, description="Response data")


class UserTier(BaseModel):
    """Model for user tier information"""
    tier: str = Field(..., description="User's subscription tier")
    business_profiles: int = Field(..., description="Number of allowed business profiles")
    ai_queries_per_month: int = Field(..., description="Monthly AI query limit")
    monitored_systems: int = Field(..., description="Number of monitored systems")
    white_label: bool = Field(..., description="White-label features enabled")


class FeatureLimits(BaseModel):
    """Model for feature limits by tier"""
    core: UserTier = Field(..., description="Core tier limits")
    growth: UserTier = Field(..., description="Growth tier limits")
    partner: UserTier = Field(..., description="Partner tier limits")
