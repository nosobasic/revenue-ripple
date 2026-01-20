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

## Recent Changes
- 2026-01-20: Imported from GitHub, configured for Replit environment
  - Updated backend port from 5001 to 8000
  - Configured Vite to allow all hosts for Replit proxy
  - Added graceful fallback for missing Supabase credentials
