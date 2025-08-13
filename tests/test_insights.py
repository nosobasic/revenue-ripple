"""
Test suite for AI Business Insights module

This module provides comprehensive tests for the insights API endpoints
using Flask's test client with tier-based entitlements.
"""

import os
import sys
import json
import jwt
from datetime import datetime, timedelta
from unittest.mock import patch, MagicMock

# Add the current directory to Python path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from server import app
from insights.models import PromptOut


class TestInsightsAPI:
    """Test class for insights API endpoints with tier-based entitlements"""
    
    def setup_method(self):
        """Set up test environment before each test"""
        self.app = app.test_client()
        self.app.testing = True
        
        # Test JWT secret
        self.jwt_secret = "test-secret-key"
        os.environ['JWT_SECRET'] = self.jwt_secret
        
        # Test user IDs
        self.core_user_id = "123e4567-e89b-12d3-a456-426614174000"
        self.growth_user_id = "456e7890-e89b-12d3-a456-426614174001"
        self.partner_user_id = "789e0123-e89b-12d3-a456-426614174002"
        self.basic_user_id = "999e9999-e89b-12d3-a456-426614174999"
        
        # Create valid JWT tokens for different tiers
        self.core_token = jwt.encode(
            {
                'sub': self.core_user_id,
                'tier': 'core',
                'exp': datetime.utcnow() + timedelta(hours=1),
                'iat': datetime.utcnow()
            },
            self.jwt_secret,
            algorithm='HS256'
        )
        
        self.growth_token = jwt.encode(
            {
                'sub': self.growth_user_id,
                'tier': 'growth',
                'exp': datetime.utcnow() + timedelta(hours=1),
                'iat': datetime.utcnow()
            },
            self.jwt_secret,
            algorithm='HS256'
        )
        
        self.partner_token = jwt.encode(
            {
                'sub': self.partner_user_id,
                'tier': 'partner',
                'exp': datetime.utcnow() + timedelta(hours=1),
                'iat': datetime.utcnow()
            },
            self.jwt_secret,
            algorithm='HS256'
        )
        
        self.basic_token = jwt.encode(
            {
                'sub': self.basic_user_id,
                'tier': 'basic',
                'exp': datetime.utcnow() + timedelta(hours=1),
                'iat': datetime.utcnow()
            },
            self.jwt_secret,
            algorithm='HS256'
        )
        
        # Test headers for different tiers
        self.core_headers = {
            'Authorization': f'Bearer {self.core_token}',
            'Content-Type': 'application/json'
        }
        
        self.growth_headers = {
            'Authorization': f'Bearer {self.growth_token}',
            'Content-Type': 'application/json'
        }
        
        self.partner_headers = {
            'Authorization': f'Bearer {self.partner_token}',
            'Content-Type': 'application/json'
        }
        
        self.basic_headers = {
            'Authorization': f'Bearer {self.basic_token}',
            'Content-Type': 'application/json'
        }
    
    def test_health_check(self):
        """Test the health check endpoint"""
        response = self.app.get('/insights/api/health')
        assert response.status_code == 200
        
        data = json.loads(response.data)
        assert data['message'] == "AI Insights API is healthy"
        assert data['data']['status'] == "ok"
        assert data['data']['tier_system'] == "enabled"
    
    def test_get_prompts_unauthorized(self):
        """Test getting prompts without authentication"""
        response = self.app.get('/insights/api/prompts')
        assert response.status_code == 401
        
        data = json.loads(response.data)
        assert data['error'] == "Authorization required"
        assert data['code'] == "UNAUTHORIZED"
    
    def test_get_prompts_wrong_tier(self):
        """Test getting prompts with insufficient tier"""
        response = self.app.get(
            '/insights/api/prompts',
            headers=self.basic_headers
        )
        assert response.status_code == 403
        
        data = json.loads(response.data)
        assert "Access denied" in data['error']
        assert data['code'] == "INSUFFICIENT_TIER"
        assert "basic" in data['error']
    
    def test_get_prompts_invalid_token(self):
        """Test getting prompts with invalid JWT token"""
        response = self.app.get(
            '/insights/api/prompts',
            headers={'Authorization': 'Bearer invalid-token'}
        )
        assert response.status_code == 401
        
        data = json.loads(response.data)
        assert data['error'] == "Authorization required"
        assert data['code'] == "UNAUTHORIZED"
    
    def test_get_prompts_expired_token(self):
        """Test getting prompts with expired JWT token"""
        expired_token = jwt.encode(
            {
                'sub': self.core_user_id,
                'tier': 'core',
                'exp': datetime.utcnow() - timedelta(hours=1),  # Expired
                'iat': datetime.utcnow() - timedelta(hours=2)
            },
            self.jwt_secret,
            algorithm='HS256'
        )
        
        response = self.app.get(
            '/insights/api/prompts',
            headers={'Authorization': f'Bearer {expired_token}'}
        )
        assert response.status_code == 401
        
        data = json.loads(response.data)
        assert data['error'] == "Authorization required"
        assert data['code'] == "UNAUTHORIZED"
    
    @patch('insights.repo.insights_repo.fetch_prompts')
    @patch('insights.repo.insights_repo.get_prompt_count')
    def test_get_prompts_core_tier_limited(self, mock_get_count, mock_fetch_prompts):
        """Test that core tier user gets limited results"""
        # Mock repository responses
        mock_prompts = [
            {
                'id': i,
                'user_id': self.core_user_id,
                'title': f"Test Prompt {i}",
                'content': f"Test content {i}",
                'category': "marketing",
                'tags': ["test"],
                'is_active': True,
                'usage_count': 0,
                'created_at': datetime.utcnow(),
                'updated_at': datetime.utcnow()
            }
            for i in range(1, 31)  # 30 prompts total
        ]
        
        # Core tier should only get 25 prompts (limit)
        mock_fetch_prompts.return_value = mock_prompts[:25]
        mock_get_count.return_value = 30
        
        response = self.app.get(
            '/insights/api/prompts',
            headers=self.core_headers
        )
        assert response.status_code == 200
        
        data = json.loads(response.data)
        assert len(data['prompts']) == 25  # Limited to 25
        assert data['total_count'] == 30  # Total available
        assert data['limit_applied'] == 25  # Limit was applied
        assert data['user_tier'] == "core"
        
        # Verify the repository was called with correct limit
        mock_fetch_prompts.assert_called_once_with(self.core_user_id, limit=25)
    
    @patch('insights.repo.insights_repo.fetch_prompts')
    @patch('insights.repo.insights_repo.get_prompt_count')
    def test_get_prompts_growth_tier_unlimited(self, mock_get_count, mock_fetch_prompts):
        """Test that growth tier user gets unlimited results"""
        # Mock repository responses
        mock_prompts = [
            {
                'id': i,
                'user_id': self.growth_user_id,
                'title': f"Test Prompt {i}",
                'content': f"Test content {i}",
                'category': "marketing",
                'tags': ["test"],
                'is_active': True,
                'usage_count': 0,
                'created_at': datetime.utcnow(),
                'updated_at': datetime.utcnow()
            }
            for i in range(1, 51)  # 50 prompts total
        ]
        
        # Growth tier should get all prompts (no limit)
        mock_fetch_prompts.return_value = mock_prompts
        mock_get_count.return_value = 50
        
        response = self.app.get(
            '/insights/api/prompts',
            headers=self.growth_headers
        )
        assert response.status_code == 200
        
        data = json.loads(response.data)
        assert len(data['prompts']) == 50  # All prompts
        assert data['total_count'] == 50  # Total available
        assert data['limit_applied'] is None  # No limit applied
        assert data['user_tier'] == "growth"
        
        # Verify the repository was called without limit
        mock_fetch_prompts.assert_called_once_with(self.growth_user_id, limit=None)
    
    @patch('insights.repo.insights_repo.fetch_prompts')
    @patch('insights.repo.insights_repo.get_prompt_count')
    def test_get_prompts_partner_tier_unlimited(self, mock_get_count, mock_fetch_prompts):
        """Test that partner tier user gets unlimited results"""
        # Mock repository responses
        mock_prompts = [
            {
                'id': i,
                'user_id': self.partner_user_id,
                'title': f"Test Prompt {i}",
                'content': f"Test content {i}",
                'category': "marketing",
                'tags': ["test"],
                'is_active': True,
                'usage_count': 0,
                'created_at': datetime.utcnow(),
                'updated_at': datetime.utcnow()
            }
            for i in range(1, 101)  # 100 prompts total
        ]
        
        # Partner tier should get all prompts (no limit)
        mock_fetch_prompts.return_value = mock_prompts
        mock_get_count.return_value = 100
        
        response = self.app.get(
            '/insights/api/prompts',
            headers=self.partner_headers
        )
        assert response.status_code == 200
        
        data = json.loads(response.data)
        assert len(data['prompts']) == 100  # All prompts
        assert data['total_count'] == 100  # Total available
        assert data['limit_applied'] is None  # No limit applied
        assert data['user_tier'] == "partner"
        
        # Verify the repository was called without limit
        mock_fetch_prompts.assert_called_once_with(self.partner_user_id, limit=None)
    
    @patch('insights.repo.insights_repo.fetch_prompts')
    def test_get_prompt_by_id_core_tier(self, mock_fetch_prompts):
        """Test getting a specific prompt with core tier"""
        mock_prompts = [
            {
                'id': 1,
                'user_id': self.core_user_id,
                'title': "Test Prompt",
                'content': "Test content",
                'category': "marketing",
                'tags': ["test"],
                'is_active': True,
                'usage_count': 5,
                'created_at': datetime.utcnow(),
                'updated_at': datetime.utcnow()
            }
        ]
        
        mock_fetch_prompts.return_value = mock_prompts
        
        response = self.app.get(
            '/insights/api/prompts/1',
            headers=self.core_headers
        )
        assert response.status_code == 200
        
        data = json.loads(response.data)
        assert data['id'] == 1
        assert data['title'] == "Test Prompt"
        assert data['user_id'] == self.core_user_id
    
    @patch('insights.repo.insights_repo.fetch_prompts')
    def test_get_prompt_by_id_not_found(self, mock_fetch_prompts):
        """Test getting a prompt that doesn't exist"""
        mock_fetch_prompts.return_value = []
        
        response = self.app.get(
            '/insights/api/prompts/999',
            headers=self.core_headers
        )
        assert response.status_code == 404
        
        data = json.loads(response.data)
        assert data['error'] == "Prompt not found"
        assert data['code'] == "NOT_FOUND"
    
    @patch('insights.repo.insights_repo.create_prompt')
    def test_create_prompt_core_tier(self, mock_create_prompt):
        """Test creating a prompt with core tier"""
        prompt_data = {
            "title": "New Test Prompt",
            "content": "This is a test prompt content",
            "category": "marketing",
            "tags": ["test", "new"]
        }
        
        mock_created_prompt = {
            'id': 2,
            'user_id': self.core_user_id,
            'title': prompt_data['title'],
            'content': prompt_data['content'],
            'category': prompt_data['category'],
            'tags': prompt_data['tags'],
            'is_active': True,
            'usage_count': 0,
            'created_at': datetime.utcnow(),
            'updated_at': datetime.utcnow()
        }
        mock_create_prompt.return_value = mock_created_prompt
        
        response = self.app.post(
            '/insights/api/prompts',
            headers=self.core_headers,
            data=json.dumps(prompt_data)
        )
        assert response.status_code == 201
        
        data = json.loads(response.data)
        assert data['id'] == 2
        assert data['title'] == prompt_data['title']
        assert data['user_id'] == self.core_user_id
    
    def test_create_prompt_missing_required_fields(self):
        """Test creating a prompt with missing required fields"""
        invalid_data = {
            "title": "",  # Empty title
            "content": "Test content"
            # Missing category
        }
        
        response = self.app.post(
            '/insights/api/prompts',
            headers=self.core_headers,
            data=json.dumps(invalid_data)
        )
        assert response.status_code == 400
        
        data = json.loads(response.data)
        assert "Missing required field" in data['error']
        assert data['code'] == "INVALID_DATA"
    
    @patch('insights.repo.insights_repo.update_prompt')
    def test_update_prompt_growth_tier(self, mock_update_prompt):
        """Test updating a prompt with growth tier"""
        update_data = {
            "title": "Updated Title",
            "content": "Updated content"
        }
        
        mock_updated_prompt = {
            'id': 1,
            'user_id': self.growth_user_id,
            'title': update_data['title'],
            'content': update_data['content'],
            'category': "marketing",
            'tags': ["test"],
            'is_active': True,
            'usage_count': 5,
            'created_at': datetime.utcnow(),
            'updated_at': datetime.utcnow()
        }
        mock_update_prompt.return_value = mock_updated_prompt
        
        response = self.app.put(
            '/insights/api/prompts/1',
            headers=self.growth_headers,
            data=json.dumps(update_data)
        )
        assert response.status_code == 200
        
        data = json.loads(response.data)
        assert data['title'] == update_data['title']
        assert data['content'] == update_data['content']
    
    @patch('insights.repo.insights_repo.update_prompt')
    def test_update_prompt_not_found(self, mock_update_prompt):
        """Test updating a prompt that doesn't exist"""
        mock_update_prompt.return_value = None
        
        update_data = {"title": "Updated Title"}
        
        response = self.app.put(
            '/insights/api/prompts/999',
            headers=self.core_headers,
            data=json.dumps(update_data)
        )
        assert response.status_code == 404
        
        data = json.loads(response.data)
        assert data['error'] == "Prompt not found"
        assert data['code'] == "NOT_FOUND"
    
    @patch('insights.repo.insights_repo.delete_prompt')
    def test_delete_prompt_partner_tier(self, mock_delete_prompt):
        """Test deleting a prompt with partner tier"""
        mock_delete_prompt.return_value = True
        
        response = self.app.delete(
            '/insights/api/prompts/1',
            headers=self.partner_headers
        )
        assert response.status_code == 200
        
        data = json.loads(response.data)
        assert data['message'] == "Prompt deleted successfully"
    
    @patch('insights.repo.insights_repo.delete_prompt')
    def test_delete_prompt_not_found(self, mock_delete_prompt):
        """Test deleting a prompt that doesn't exist"""
        mock_delete_prompt.return_value = False
        
        response = self.app.delete(
            '/insights/api/prompts/999',
            headers=self.core_headers
        )
        assert response.status_code == 404
        
        data = json.loads(response.data)
        assert data['error'] == "Prompt not found"
        assert data['code'] == "NOT_FOUND"
    
    @patch('insights.repo.insights_repo.increment_usage_count')
    def test_use_prompt_core_tier(self, mock_increment_usage):
        """Test incrementing usage count with core tier"""
        mock_increment_usage.return_value = True
        
        response = self.app.post(
            '/insights/api/prompts/1/use',
            headers=self.core_headers
        )
        assert response.status_code == 200
        
        data = json.loads(response.data)
        assert data['message'] == "Usage count incremented successfully"
    
    @patch('insights.repo.insights_repo.increment_usage_count')
    def test_use_prompt_not_found(self, mock_increment_usage):
        """Test incrementing usage for non-existent prompt"""
        mock_increment_usage.return_value = False
        
        response = self.app.post(
            '/insights/api/prompts/999/use',
            headers=self.core_headers
        )
        assert response.status_code == 404
        
        data = json.loads(response.data)
        assert data['error'] == "Prompt not found"
        assert data['code'] == "NOT_FOUND"
    
    def test_get_user_limits_core_tier(self):
        """Test getting user limits for core tier"""
        response = self.app.get(
            '/insights/api/limits',
            headers=self.core_headers
        )
        assert response.status_code == 200
        
        data = json.loads(response.data)
        assert data['tier'] == "core"
        assert data['business_profiles'] == 1
        assert data['ai_queries_per_month'] == 25
        assert data['monitored_systems'] == 1
        assert data['white_label'] is False
    
    def test_get_user_limits_growth_tier(self):
        """Test getting user limits for growth tier"""
        response = self.app.get(
            '/insights/api/limits',
            headers=self.growth_headers
        )
        assert response.status_code == 200
        
        data = json.loads(response.data)
        assert data['tier'] == "growth"
        assert data['business_profiles'] == -1  # Unlimited
        assert data['ai_queries_per_month'] == -1  # Unlimited
        assert data['monitored_systems'] == -1  # Unlimited
        assert data['white_label'] is False
    
    def test_get_user_limits_partner_tier(self):
        """Test getting user limits for partner tier"""
        response = self.app.get(
            '/insights/api/limits',
            headers=self.partner_headers
        )
        assert response.status_code == 200
        
        data = json.loads(response.data)
        assert data['tier'] == "partner"
        assert data['business_profiles'] == -1  # Unlimited
        assert data['ai_queries_per_month'] == -1  # Unlimited
        assert data['monitored_systems'] == -1  # Unlimited
        assert data['white_label'] is True
    
    def test_404_error_handler(self):
        """Test 404 error handler"""
        response = self.app.get('/insights/api/nonexistent')
        assert response.status_code == 404
        
        data = json.loads(response.data)
        assert data['error'] == "Endpoint not found"
        assert data['code'] == "NOT_FOUND"
    
    def test_405_error_handler(self):
        """Test 405 error handler"""
        response = self.app.post('/insights/api/health')
        assert response.status_code == 405
        
        data = json.loads(response.data)
        assert data['error'] == "Method not allowed"
        assert data['code'] == "METHOD_NOT_ALLOWED"


def run_tests():
    """Run all tests"""
    import pytest
    
    # Run tests with pytest
    pytest.main([__file__, '-v'])


if __name__ == '__main__':
    run_tests()


