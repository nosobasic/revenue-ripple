# Revenue Ripple

## Overview
Revenue Ripple is a full-stack marketing platform built with React (Vite) frontend and Python Flask backend. It offers AI-powered marketing tools, payment processing (Stripe, PayPal), and member management.

## Project Structure
- `/src` - React frontend (Vite + TailwindCSS)
  - `/components` - React components
  - `/pages` - Page components
  - `/lib` - Utilities including Supabase client
  - `/services` - API services
- `/server.py` - Main Flask backend API
- `/server/` - Backend modules (engagement, middleware, routes)
- `/insights/` - Insights integration module

## Development Setup

### Running the App
- **Frontend**: Runs on port 5000 with `npm run dev`
- **Backend**: Runs on port 8000 with `python server.py`
- The Vite dev server proxies API requests to the Flask backend

### Environment Variables Required

#### Backend (secrets)
- `SUPABASE_URL` - Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key
- `STRIPE_SECRET_KEY` - Stripe secret key
- `STRIPE_WEBHOOK_SECRET` - Stripe webhook secret
- `PAYPAL_CLIENT_ID` - PayPal client ID
- `PAYPAL_CLIENT_SECRET` - PayPal client secret
- `OPENAI_API_KEY` - OpenAI API key
- `JWT_SECRET` - JWT secret for authentication
- `GETRESPONSE_API_KEY` - GetResponse API key

#### Frontend (VITE_ prefixed)
- `VITE_SUPABASE_URL` - Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Supabase anonymous key

## Architecture
- Frontend: React 18 with Vite, React Router, TailwindCSS, Framer Motion
- Backend: Flask with Flask-CORS, integrated with Supabase, Stripe, PayPal
- Database: Supabase (PostgreSQL)
- Authentication: Supabase Auth + JWT tokens

## Database Migrations

To set up the database, run these SQL files in your Supabase SQL editor (in order):
1. `database_schema.sql` - Core tables (users, payments, subscriptions, etc.)
2. `db/migrations/community_features.sql` - Community forum tables (posts, replies, upvotes)
3. `db/migrations/ai_visibility.sql` - AI Visibility feature tables (profiles, prompts, results, competitors)

## AI Visibility Feature

The AI Visibility feature tracks how businesses appear in AI chatbots (ChatGPT, Perplexity, Gemini). It functions as "SEO for AI".

### Routes
- `/ai-visibility-tracker` - Public landing/sales page
- `/ai-visibility` - Protected dashboard (requires login)
- `/ai-visibility/setup` - Profile creation wizard

### Backend API Endpoints
- `GET /api/ai-visibility/profile` - Get user's visibility profile
- `POST /api/ai-visibility/profile` - Create visibility profile with competitors
- `GET /api/ai-visibility/prompts` - Get prompts for industry
- `POST /api/ai-visibility/check` - Run visibility check against prompts (uses OpenAI)
- `GET /api/ai-visibility/results` - Get visibility results for a business
- `GET /api/ai-visibility/compare` - Compare business vs competitors

### Key Files
- `src/pages/AIVisibilityDashboard.jsx` - Main dashboard
- `src/pages/AIVisibilitySetup.jsx` - Setup wizard
- `src/pages/AIVisibilityTracker.jsx` - Public landing page
- `docs/ai-visibility-spec.md` - Full feature specification

## Recent Changes
- 2026-01-22: Built AI Visibility feature
  - Created backend API with OpenAI integration (gpt-4o-mini via Replit AI Integrations)
  - Built React dashboard with visibility scores, competitor comparison, prompt results
  - Created setup wizard for profile creation with competitor tracking
  - Added navigation link in navbar for logged-in users
  - Database migration with 5 tables: profiles, prompts, results, competitors, tracked_prompts
  - Confidence scoring: 3 samples per prompt to handle AI non-determinism
  - Heavy caching: results cached daily to control API costs
- 2026-01-22: Fixed community forum database configuration
  - Removed sample data with fake user IDs from migration (would fail on insert)
  - Added helpful error messages when database is not configured (HTTP 503 with setup instructions)
  - All community endpoints now consistently return error code 'DB_NOT_CONFIGURED' when Supabase is missing
- 2026-01-20: Imported from GitHub, configured for Replit environment
  - Updated backend port from 5001 to 8000
  - Configured Vite to allow all hosts for Replit proxy
  - Added graceful fallback for missing Supabase credentials
