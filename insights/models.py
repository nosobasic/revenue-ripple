"""
Pydantic models for AI Business Insights API

This module defines the data models used for request/response validation
and database query results.
"""

from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field


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
