"""
Test suite for AI Business Insights module

This module provides comprehensive tests for the insights API endpoints
using Flask's test client.
"""

import os
import sys
import json
import jwt
from datetime import datetime, timedelta
from unittest.mock import patch, MagicMock

# Add the current directory to Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from server import app
from insights.models import PromptCreate, PromptUpdate, PaginationParams


class TestInsightsAPI:
    """Test class for insights API endpoints"""
    
    def setup_method(self):
        """Set up test environment before each test"""
        self.app = app.test_client()
        self.app.testing = True
        
        # Test JWT secret
        self.jwt_secret = "test-secret-key"
        os.environ['JWT_SECRET'] = self.jwt_secret
        
        # Test user ID
        self.test_user_id = "123e4567-e89b-12d3-a456-426614174000"
        
        # Create a valid JWT token for testing
        self.valid_token = jwt.encode(
            {
                'sub': self.test_user_id,
                'exp': datetime.utcnow() + timedelta(hours=1),
                'iat': datetime.utcnow()
            },
            self.jwt_secret,
            algorithm='HS256'
        )
        
        # Test headers
        self.auth_headers = {
            'Authorization': f'Bearer {self.valid_token}',
            'Content-Type': 'application/json'
        }
    
    def test_health_check(self):
        """Test the health check endpoint"""
        response = self.app.get('/insights/api/health')
        assert response.status_code == 200
        
        data = json.loads(response.data)
        assert data['message'] == "AI Insights API is healthy"
        assert data['data']['status'] == "ok"
    
    def test_get_prompts_no_auth(self):
        """Test getting prompts without authentication"""
        response = self.app.get('/insights/api/prompts')
        assert response.status_code == 401
        
        data = json.loads(response.data)
        assert data['error'] == "Authorization header required"
        assert data['code'] == "MISSING_AUTH_HEADER"
    
    def test_get_prompts_invalid_auth_format(self):
        """Test getting prompts with invalid auth header format"""
        response = self.app.get(
            '/insights/api/prompts',
            headers={'Authorization': 'InvalidFormat token'}
        )
        assert response.status_code == 401
        
        data = json.loads(response.data)
        assert data['error'] == "Invalid authorization header format. Use 'Bearer <token>'"
        assert data['code'] == "INVALID_AUTH_FORMAT"
    
    def test_get_prompts_invalid_token(self):
        """Test getting prompts with invalid JWT token"""
        response = self.app.get(
            '/insights/api/prompts',
            headers={'Authorization': 'Bearer invalid-token'}
        )
        assert response.status_code == 401
        
        data = json.loads(response.data)
        assert data['error'] == "Invalid token"
        assert data['code'] == "INVALID_TOKEN"
    
    def test_get_prompts_expired_token(self):
        """Test getting prompts with expired JWT token"""
        expired_token = jwt.encode(
            {
                'sub': self.test_user_id,
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
        assert data['error'] == "Token has expired"
        assert data['code'] == "TOKEN_EXPIRED"
    
    @patch('insights.repo.insights_repo.get_user_prompts')
    def test_get_prompts_success(self, mock_get_prompts):
        """Test successful retrieval of prompts"""
        # Mock the repository response
        mock_prompts = [
            MagicMock(
                id=1,
                user_id=self.test_user_id,
                title="Test Prompt",
                content="Test content",
                category="marketing",
                tags=["test", "example"],
                is_active=True,
                usage_count=5,
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow()
            )
        ]
        
        mock_get_prompts.return_value = {
            'prompts': mock_prompts,
            'total_count': 1,
            'page': 1,
            'per_page': 20
        }
        
        response = self.app.get(
            '/insights/api/prompts',
            headers=self.auth_headers
        )
        assert response.status_code == 200
        
        data = json.loads(response.data)
        assert data['total_count'] == 1
        assert len(data['prompts']) == 1
        assert data['prompts'][0]['title'] == "Test Prompt"
        assert data['prompts'][0]['user_id'] == self.test_user_id
        
        # Verify the repository was called with correct parameters
        mock_get_prompts.assert_called_once()
        call_args = mock_get_prompts.call_args
        assert call_args[1]['user_id'] == self.test_user_id
        assert isinstance(call_args[1]['pagination'], PaginationParams)
    
    def test_get_prompts_invalid_pagination(self):
        """Test getting prompts with invalid pagination parameters"""
        response = self.app.get(
            '/insights/api/prompts?page=0&per_page=200',
            headers=self.auth_headers
        )
        assert response.status_code == 400
        
        data = json.loads(response.data)
        assert "Invalid pagination parameters" in data['error']
        assert data['code'] == "INVALID_PARAMS"
    
    def test_get_prompts_with_filters(self):
        """Test getting prompts with category and active filters"""
        with patch('insights.repo.insights_repo.get_user_prompts') as mock_get_prompts:
            mock_get_prompts.return_value = {
                'prompts': [],
                'total_count': 0,
                'page': 1,
                'per_page': 20
            }
            
            response = self.app.get(
                '/insights/api/prompts?category=marketing&is_active=true',
                headers=self.auth_headers
            )
            assert response.status_code == 200
            
            # Verify filters were passed correctly
            call_args = mock_get_prompts.call_args[1]
            assert call_args['category'] == 'marketing'
            assert call_args['is_active'] is True
    
    def test_get_prompts_invalid_active_filter(self):
        """Test getting prompts with invalid is_active filter"""
        response = self.app.get(
            '/insights/api/prompts?is_active=maybe',
            headers=self.auth_headers
        )
        assert response.status_code == 400
        
        data = json.loads(response.data)
        assert "Invalid is_active parameter" in data['error']
        assert data['code'] == "INVALID_PARAMS"
    
    @patch('insights.repo.insights_repo.get_prompt_by_id')
    def test_get_prompt_by_id_success(self, mock_get_prompt):
        """Test successful retrieval of a specific prompt"""
        mock_prompt = MagicMock(
            id=1,
            user_id=self.test_user_id,
            title="Test Prompt",
            content="Test content",
            category="marketing",
            tags=["test"],
            is_active=True,
            usage_count=5,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
        mock_get_prompt.return_value = mock_prompt
        
        response = self.app.get(
            '/insights/api/prompts/1',
            headers=self.auth_headers
        )
        assert response.status_code == 200
        
        data = json.loads(response.data)
        assert data['id'] == 1
        assert data['title'] == "Test Prompt"
        assert data['user_id'] == self.test_user_id
    
    @patch('insights.repo.insights_repo.get_prompt_by_id')
    def test_get_prompt_by_id_not_found(self, mock_get_prompt):
        """Test getting a prompt that doesn't exist"""
        mock_get_prompt.return_value = None
        
        response = self.app.get(
            '/insights/api/prompts/999',
            headers=self.auth_headers
        )
        assert response.status_code == 404
        
        data = json.loads(response.data)
        assert data['error'] == "Prompt not found"
        assert data['code'] == "NOT_FOUND"
    
    @patch('insights.repo.insights_repo.create_prompt')
    def test_create_prompt_success(self, mock_create_prompt):
        """Test successful creation of a prompt"""
        prompt_data = {
            "title": "New Test Prompt",
            "content": "This is a test prompt content",
            "category": "marketing",
            "tags": ["test", "new"],
            "is_active": True
        }
        
        mock_created_prompt = MagicMock(
            id=2,
            user_id=self.test_user_id,
            title=prompt_data['title'],
            content=prompt_data['content'],
            category=prompt_data['category'],
            tags=prompt_data['tags'],
            is_active=prompt_data['is_active'],
            usage_count=0,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
        mock_create_prompt.return_value = mock_created_prompt
        
        response = self.app.post(
            '/insights/api/prompts',
            headers=self.auth_headers,
            data=json.dumps(prompt_data)
        )
        assert response.status_code == 201
        
        data = json.loads(response.data)
        assert data['id'] == 2
        assert data['title'] == prompt_data['title']
        assert data['user_id'] == self.test_user_id
        assert data['usage_count'] == 0
    
    def test_create_prompt_invalid_data(self):
        """Test creating a prompt with invalid data"""
        invalid_data = {
            "title": "",  # Empty title
            "content": "Test content",
            "category": "marketing"
        }
        
        response = self.app.post(
            '/insights/api/prompts',
            headers=self.auth_headers,
            data=json.dumps(invalid_data)
        )
        assert response.status_code == 400
        
        data = json.loads(response.data)
        assert "Invalid request data" in data['error']
        assert data['code'] == "INVALID_DATA"
    
    def test_create_prompt_missing_body(self):
        """Test creating a prompt without request body"""
        response = self.app.post(
            '/insights/api/prompts',
            headers=self.auth_headers
        )
        assert response.status_code == 400
        
        data = json.loads(response.data)
        assert data['error'] == "Request body is required"
        assert data['code'] == "MISSING_BODY"
    
    @patch('insights.repo.insights_repo.update_prompt')
    def test_update_prompt_success(self, mock_update_prompt):
        """Test successful update of a prompt"""
        update_data = {
            "title": "Updated Title",
            "content": "Updated content"
        }
        
        mock_updated_prompt = MagicMock(
            id=1,
            user_id=self.test_user_id,
            title=update_data['title'],
            content=update_data['content'],
            category="marketing",
            tags=["test"],
            is_active=True,
            usage_count=5,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
        mock_update_prompt.return_value = mock_updated_prompt
        
        response = self.app.put(
            '/insights/api/prompts/1',
            headers=self.auth_headers,
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
            headers=self.auth_headers,
            data=json.dumps(update_data)
        )
        assert response.status_code == 404
        
        data = json.loads(response.data)
        assert data['error'] == "Prompt not found"
        assert data['code'] == "NOT_FOUND"
    
    @patch('insights.repo.insights_repo.delete_prompt')
    def test_delete_prompt_success(self, mock_delete_prompt):
        """Test successful deletion of a prompt"""
        mock_delete_prompt.return_value = True
        
        response = self.app.delete(
            '/insights/api/prompts/1',
            headers=self.auth_headers
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
            headers=self.auth_headers
        )
        assert response.status_code == 404
        
        data = json.loads(response.data)
        assert data['error'] == "Prompt not found"
        assert data['code'] == "NOT_FOUND"
    
    @patch('insights.repo.insights_repo.increment_usage_count')
    def test_use_prompt_success(self, mock_increment_usage):
        """Test successful usage count increment"""
        mock_increment_usage.return_value = True
        
        response = self.app.post(
            '/insights/api/prompts/1/use',
            headers=self.auth_headers
        )
        assert response.status_code == 200
        
        data = json.loads(response.data)
        assert data['message'] == "Usage count incremented successfully"
    
    @patch('insights.repo.insights_repo.increment_usage_count')
    def test_use_prompt_not_found(self, mock_increment_usage):
        """Test usage count increment for non-existent prompt"""
        mock_increment_usage.return_value = False
        
        response = self.app.post(
            '/insights/api/prompts/999/use',
            headers=self.auth_headers
        )
        assert response.status_code == 404
        
        data = json.loads(response.data)
        assert data['error'] == "Prompt not found"
        assert data['code'] == "NOT_FOUND"
    
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