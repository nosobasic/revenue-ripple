# Revenue Ripple - Context Map & Architecture Analysis

## 1. Package Managers, Frameworks, Runtime Versions

### Frontend Stack
- **Package Manager**: npm (Node.js)
- **Framework**: React 18.2.0 with Vite 5.0.0
- **Build Tool**: Vite with TypeScript support
- **UI Library**: Radix UI components, Tailwind CSS 3.3.5
- **State Management**: React Context (AuthContext, AIAssistantContext)
- **Routing**: React Router DOM 6.20.0
- **Charts**: Chart.js 4.4.0 with react-chartjs-2
- **Animations**: Framer Motion 10.18.0
- **Icons**: React Icons 4.11.0, Lucide React 0.513.0

### Backend Stack
- **Runtime**: Python 3.x
- **Framework**: Flask with flask-cors
- **Database**: Supabase (PostgreSQL)
- **ORM**: Direct Supabase client (no ORM)
- **Payments**: Stripe, PayPal REST SDK
- **Email**: GetResponse API integration
- **AI**: OpenAI integration
- **Deployment**: Gunicorn WSGI server

## 2. Backend Framework and Routes

### Flask Application Structure
- **Main File**: `server.py` (2033+ lines)
- **CORS**: Enabled for production domains + localhost
- **Blueprint**: `ai_assistant.py` (AI functionality)

### Existing API Routes
```
GET  /                           - Health check
POST /create-payment-intent      - Stripe payment intent
POST /create-tripwire-session    - Digital Marketing Domination book
POST /create-membership-session  - Revenue Ripple membership
POST /create-reseller-session    - Reseller subscription
POST /create-pro-reseller-session - Pro reseller subscription
POST /create-founders-annual-session - Founder Annual subscription
POST /create-founders-monthly-session - Founder Monthly subscription
GET  /founders-spots-remaining   - Spots counter API
POST /webhook                    - Stripe webhook handler
POST /paypal/payout              - PayPal payout creation
```

### Route Patterns
- **Auth**: No explicit auth middleware, relies on Supabase client-side
- **Error Handling**: Try/catch with JSON responses
- **CORS**: Configured for specific origins
- **Rate Limiting**: None implemented

## 3. Authentication Flow

### Frontend Auth (React)
- **Provider**: `src/context/AuthContext.jsx`
- **Storage**: localStorage with key "revenue-ripple-auth-token"
- **Client**: Supabase client in `src/supabase/client.jsx`
- **Session Management**: Automatic via Supabase auth state changes
- **User Data**: Fetched from `users` table with role-based permissions

### Backend Auth
- **No explicit auth middleware** in Flask routes
- **Supabase Service Role**: Used for server-side operations
- **User Context**: Retrieved via Supabase client in frontend
- **Protected Routes**: Handled by React `ProtectedRoute` component

### User Roles
- `admin` - Full system access
- `member` - Basic membership access
- `reseller` - Reseller program access
- `pro_reseller` - Pro reseller access
- `affiliate` - Affiliate program access

## 4. Database Code Location

### Database Client
- **File**: `src/supabase/client.jsx` (Frontend)
- **Server**: Direct Supabase client in `server.py`
- **No ORM**: Direct SQL queries via Supabase client

### Database Operations
- **Location**: Scattered throughout `server.py`
- **Pattern**: Direct `supabase.table().insert/update/select()`
- **Transactions**: Not explicitly used
- **Migrations**: SQL files in root directory

### Existing Tables (from SQL files)
```
users                    - Main user accounts
tripwire_purchases       - Book purchases
subscriptions           - Membership subscriptions
founders_annual_members - Founder Annual tracking
commissions             - Affiliate commissions
payouts                 - PayPal payouts
webhook_logs            - Stripe webhook processing
user_progress           - Course completion tracking
user_module_completion  - Module-level tracking
user_onboarding         - Onboarding flow
user_milestones         - Achievement tracking
feature_waitlist        - Feature waitlist
book_giveaway_submissions - Marketing form
api_keys                - DevOps integration
activity_log            - System activity
```

## 5. Environment Variables

### Required Environment Variables
```bash
# Supabase
SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY

# Stripe
STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET

# GetResponse
GET_RESPONSE_TRIPWIRE_KEY
GET_RESPONSE_TRIPWIRE_CAMPAIGN_ID
GETRESPONSE_API_KEY
GETRESPONSE_CAMPAIGN_ID
GETRESPONSE_PHONE_FIELD_ID

# PayPal (optional)
PAYPAL_CLIENT_ID
PAYPAL_CLIENT_SECRET
PAYPAL_ENVIRONMENT

# Facebook Conversions API
FACEBOOK_PIXEL_ID
FACEBOOK_ACCESS_TOKEN
```

### Loading Pattern
- **Backend**: `os.getenv()` in `server.py`
- **Frontend**: `import.meta.env.VITE_*` in React components
- **Validation**: Basic existence checks, no comprehensive validation

## 6. Key Files and Purpose

### Frontend Structure
```
src/
├── App.jsx                 - Main app router and route definitions
├── main.jsx               - React app entry point
├── context/
│   ├── AuthContext.jsx    - Authentication state management
│   └── AIAssistantContext.jsx - AI assistant state
├── components/
│   ├── ProtectedRoute.jsx - Route protection wrapper
│   ├── Navbar.jsx        - Navigation component
│   └── [various UI components]
├── pages/
│   ├── Dashboard.jsx      - Main dashboard
│   ├── Checkout.jsx       - Payment checkout
│   ├── FoundersSuccess.jsx - Founder success page
│   └── [various page components]
├── supabase/
│   └── client.jsx         - Supabase client configuration
└── utils/
    ├── authUtils.js       - Authentication utilities
    └── performance.js     - Performance optimization
```

### Backend Structure
```
server.py                  - Main Flask application (2033+ lines)
ai_assistant.py           - AI assistant blueprint
requirements.txt          - Python dependencies
```

### Database Schema Files
```
create_founders_annual_tables.sql    - Founder Annual tables
create_course_completion_tables.sql  - Course tracking tables
create_devops_tables.sql            - DevOps integration tables
create_onboarding_enhancements.sql   - Onboarding tables
create_book_giveaway_table.sql      - Marketing tables
add_payment_fields.sql              - Payment field additions
```

## 7. Data Models and Policies

### User Model (users table)
```sql
- id (UUID, PK)
- email (TEXT)
- name (TEXT)
- role (TEXT) - admin, member, reseller, pro_reseller, affiliate
- plan (TEXT)
- status (TEXT)
- has_paid (BOOLEAN)
- payment_status (TEXT)
- is_founder (BOOLEAN)
- subscription_type (TEXT)
- founder_benefits (JSONB)
- created_at (TIMESTAMPTZ)
- updated_at (TIMESTAMPTZ)
```

### RLS Policies
- **Users table**: Users can read their own data, service role has full access
- **Course tables**: Users can read/write their own progress
- **Founder tables**: Service role full access, users read own data
- **Activity logs**: Users read own, admins read all

### Foreign Keys
- Most tables reference `auth.users(id)` for user relationships
- Cascade deletes configured for data integrity

## 8. Integration Points

### Payment Processing
- **Stripe**: Primary payment processor
- **PayPal**: Secondary for payouts
- **Webhooks**: Stripe webhook handler processes all payment events

### Email Marketing
- **GetResponse**: Email automation and contact management
- **Multiple campaigns**: Tripwire, membership, founders
- **API Integration**: Direct REST API calls

### AI Integration
- **OpenAI**: AI assistant functionality
- **Context**: AIAssistantContext for state management

## 9. Security Considerations

### Current Security
- **RLS**: Enabled on most tables
- **CORS**: Configured for specific origins
- **Auth**: Supabase-based with JWT tokens
- **Secrets**: Environment variable based

### Security Gaps
- **No rate limiting** on API endpoints
- **No input validation** middleware
- **No API versioning**
- **No request logging** for security monitoring

## 10. Performance Considerations

### Current Optimizations
- **React**: Lazy loading for route components
- **Database**: Indexes on frequently queried columns
- **Caching**: localStorage for auth tokens
- **Build**: Vite for fast development and optimized builds

### Performance Gaps
- **No CDN** configuration visible
- **No database connection pooling** explicit
- **No caching strategy** for API responses
- **Large server.py file** (2033+ lines) could be modularized
