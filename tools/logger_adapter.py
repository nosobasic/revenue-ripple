"""
Logger Adapter for Command Center
Ships errors to existing logging tools and Slack webhooks
"""

import os
import json
import requests
import logging
from datetime import datetime
from typing import Dict, Any, Optional

class CommandCenterLogger:
    """Enhanced logger for Command Center with Slack integration"""
    
    def __init__(self):
        self.slack_webhook_url = os.getenv('REV_LOG_SLACK_URL')
        self.environment = os.getenv('ENVIRONMENT', 'development')
        self.app_name = 'Revenue Ripple Command Center'
        
        # Setup standard logging
        self.logger = logging.getLogger('command_center')
        self.logger.setLevel(logging.INFO)
        
        # Create formatter
        formatter = logging.Formatter(
            '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
        )
        
        # Console handler
        console_handler = logging.StreamHandler()
        console_handler.setFormatter(formatter)
        self.logger.addHandler(console_handler)
    
    def log_info(self, message: str, context: Optional[Dict[str, Any]] = None):
        """Log info message"""
        self._log('INFO', message, context)
    
    def log_warning(self, message: str, context: Optional[Dict[str, Any]] = None):
        """Log warning message"""
        self._log('WARNING', message, context)
    
    def log_error(self, message: str, context: Optional[Dict[str, Any]] = None):
        """Log error message"""
        self._log('ERROR', message, context)
        self._send_slack_alert(message, context, 'error')
    
    def log_critical(self, message: str, context: Optional[Dict[str, Any]] = None):
        """Log critical error and send Slack alert"""
        self._log('CRITICAL', message, context)
        self._send_slack_alert(message, context, 'critical')
    
    def log_agent_execution(self, user_id: str, instance_id: str, status: str, 
                           duration: Optional[float] = None, error: Optional[str] = None):
        """Log agent execution with context"""
        context = {
            'user_id': user_id,
            'instance_id': instance_id,
            'status': status,
            'duration_seconds': duration,
            'error': error,
            'timestamp': datetime.now().isoformat()
        }
        
        if status == 'failed' or error:
            self.log_error(f"Agent execution failed: {status}", context)
        else:
            self.log_info(f"Agent execution completed: {status}", context)
    
    def log_api_request(self, endpoint: str, method: str, status_code: int, 
                       duration: float, user_id: Optional[str] = None):
        """Log API request with performance metrics"""
        context = {
            'endpoint': endpoint,
            'method': method,
            'status_code': status_code,
            'duration_ms': duration * 1000,
            'user_id': user_id,
            'timestamp': datetime.now().isoformat()
        }
        
        if status_code >= 500:
            self.log_error(f"5xx error on {method} {endpoint}", context)
        elif status_code >= 400:
            self.log_warning(f"4xx error on {method} {endpoint}", context)
        else:
            self.log_info(f"API request: {method} {endpoint}", context)
    
    def _log(self, level: str, message: str, context: Optional[Dict[str, Any]] = None):
        """Internal logging method"""
        log_data = {
            'message': message,
            'level': level,
            'app': self.app_name,
            'environment': self.environment,
            'timestamp': datetime.now().isoformat()
        }
        
        if context:
            log_data['context'] = context
        
        # Use appropriate logging level
        if level == 'INFO':
            self.logger.info(json.dumps(log_data))
        elif level == 'WARNING':
            self.logger.warning(json.dumps(log_data))
        elif level == 'ERROR':
            self.logger.error(json.dumps(log_data))
        elif level == 'CRITICAL':
            self.logger.critical(json.dumps(log_data))
    
    def _send_slack_alert(self, message: str, context: Optional[Dict[str, Any]], 
                         severity: str = 'error'):
        """Send alert to Slack webhook"""
        if not self.slack_webhook_url:
            return
        
        try:
            # Create Slack message
            slack_message = {
                'text': f'🚨 {self.app_name} Alert',
                'attachments': [
                    {
                        'color': 'danger' if severity == 'critical' else 'warning',
                        'fields': [
                            {
                                'title': 'Environment',
                                'value': self.environment,
                                'short': True
                            },
                            {
                                'title': 'Severity',
                                'value': severity.upper(),
                                'short': True
                            },
                            {
                                'title': 'Message',
                                'value': message,
                                'short': False
                            },
                            {
                                'title': 'Timestamp',
                                'value': datetime.now().strftime('%Y-%m-%d %H:%M:%S UTC'),
                                'short': True
                            }
                        ]
                    }
                ]
            }
            
            # Add context if available
            if context:
                context_text = '\n'.join([f'{k}: {v}' for k, v in context.items()])
                slack_message['attachments'][0]['fields'].append({
                    'title': 'Context',
                    'value': f'```{context_text}```',
                    'short': False
                })
            
            # Send to Slack
            response = requests.post(
                self.slack_webhook_url,
                json=slack_message,
                timeout=10
            )
            
            if response.status_code != 200:
                self.logger.error(f"Failed to send Slack alert: {response.status_code}")
                
        except Exception as e:
            self.logger.error(f"Error sending Slack alert: {str(e)}")

# Global logger instance
command_center_logger = CommandCenterLogger()

# Convenience functions
def log_info(message: str, context: Optional[Dict[str, Any]] = None):
    """Log info message"""
    command_center_logger.log_info(message, context)

def log_warning(message: str, context: Optional[Dict[str, Any]] = None):
    """Log warning message"""
    command_center_logger.log_warning(message, context)

def log_error(message: str, context: Optional[Dict[str, Any]] = None):
    """Log error message"""
    command_center_logger.log_error(message, context)

def log_critical(message: str, context: Optional[Dict[str, Any]] = None):
    """Log critical error"""
    command_center_logger.log_critical(message, context)

def log_agent_execution(user_id: str, instance_id: str, status: str, 
                       duration: Optional[float] = None, error: Optional[str] = None):
    """Log agent execution"""
    command_center_logger.log_agent_execution(user_id, instance_id, status, duration, error)

def log_api_request(endpoint: str, method: str, status_code: int, 
                  duration: float, user_id: Optional[str] = None):
    """Log API request"""
    command_center_logger.log_api_request(endpoint, method, status_code, duration, user_id)
