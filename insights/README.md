# AI Business Insights Module

This module provides a complete API for managing AI prompts and business insights within the Revenue Ripple Flask application.

## Features

- **JWT Authentication**: Secure endpoints with JWT token validation
- **Pydantic Models**: Type-safe request/response validation
- **PostgreSQL Integration**: Direct connection to Supabase using psycopg3
- **CRUD Operations**: Full Create, Read, Update, Delete functionality for prompts
- **Pagination & Filtering**: Efficient data retrieval with pagination and filters
- **Usage Tracking**: Track how often prompts are used
- **Error Handling**: Comprehensive error responses with proper HTTP status codes

## API Endpoints

### Authentication
All endpoints (except `/health`) require JWT authentication via the `Authorization` header:
```
Authorization: Bearer <your-jwt-token>
```

### Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/insights/api/health` | Health check (no auth required) |
| GET | `/insights/api/prompts` | Get user's prompts with pagination |
| GET | `/insights/api/prompts/<id>` | Get specific prompt by ID |
| POST | `/insights/api/prompts` | Create new prompt |
| PUT | `/insights/api/prompts/<id>` | Update existing prompt |
| DELETE | `/insights/api/prompts/<id>` | Delete prompt (soft delete) |
| POST | `/insights/api/prompts/<id>/use` | Increment usage count |

### Query Parameters

For GET `/insights/api/prompts`:
- `page` (int): Page number (default: 1)
- `per_page` (int): Items per page (default: 20, max: 100)
- `category` (str): Filter by category
- `is_active` (bool): Filter by active status

## Database Schema

The `ai_prompts` table structure:

```sql
CREATE TABLE ai_prompts (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL,
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    category VARCHAR(100) NOT NULL,
    tags JSONB DEFAULT '[]'::jsonb,
    is_active BOOLEAN DEFAULT TRUE,
    usage_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Environment Variables

Add these to your `.env` file:

```bash
# Database connection
SUPABASE_DB_URL=postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres

# JWT authentication
JWT_SECRET=your-jwt-secret-key-here
```

## Installation

1. Install dependencies:
```bash
pip install psycopg2-binary pydantic PyJWT
```

2. Run the database migration:
```sql
-- Execute the contents of create_ai_prompts_table.sql in your Supabase SQL editor
```

3. Register the blueprint in `server.py`:
```python
from insights import insights_bp
app.register_blueprint(insights_bp)
```

## Usage Examples

### Create a Prompt
```bash
curl -X POST http://localhost:5001/insights/api/prompts \
  -H "Authorization: Bearer your-jwt-token" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Marketing Copy Generator",
    "content": "Create compelling marketing copy for...",
    "category": "marketing",
    "tags": ["copywriting", "ads"],
    "is_active": true
  }'
```

### Get User's Prompts
```bash
curl -X GET "http://localhost:5001/insights/api/prompts?page=1&per_page=10&category=marketing" \
  -H "Authorization: Bearer your-jwt-token"
```

### Update a Prompt
```bash
curl -X PUT http://localhost:5001/insights/api/prompts/1 \
  -H "Authorization: Bearer your-jwt-token" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Updated Marketing Copy Generator",
    "content": "Updated content..."
  }'
```

## Testing

Run the test suite:

```bash
python test_insights.py
```

Or with pytest:

```bash
pytest test_insights.py -v
```

## Error Responses

All endpoints return consistent error responses:

```json
{
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": {}
}
```

Common error codes:
- `MISSING_AUTH_HEADER`: No Authorization header
- `INVALID_AUTH_FORMAT`: Wrong Authorization header format
- `INVALID_TOKEN`: Invalid or expired JWT token
- `NOT_FOUND`: Resource not found
- `INVALID_DATA`: Invalid request data
- `SERVER_ERROR`: Internal server error

## Security Features

- **JWT Authentication**: All endpoints require valid JWT tokens
- **Row Level Security**: Database-level security policies
- **User Isolation**: Users can only access their own prompts
- **Input Validation**: Pydantic models validate all inputs
- **SQL Injection Protection**: Parameterized queries with psycopg3

## Performance Optimizations

- **Database Indexes**: Optimized queries with proper indexing
- **Connection Pooling**: Efficient database connection management
- **Pagination**: Large result sets are paginated
- **JSONB for Tags**: Efficient storage and querying of tag arrays

## Contributing

When adding new features:

1. Update Pydantic models in `models.py`
2. Add repository methods in `repo.py`
3. Create endpoints in `routes.py`
4. Add comprehensive tests in `test_insights.py`
5. Update this README with new endpoints