# Blank Screen Troubleshooting Guide

## Issue Identified: Missing Environment Variables

The blank screen issue was caused by **missing environment variables** that are required for the React app to function properly.

## Root Cause

The app requires these environment variables:
- `VITE_SUPABASE_URL` - Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Your Supabase anonymous key
- `VITE_API_BASE_URL` - Your backend API URL

Without these variables, the Supabase client fails to initialize, causing the entire app to crash with a blank screen.

## Solution Applied

### 1. Created Environment File
Created `.env.local` with placeholder values:
```bash
VITE_SUPABASE_URL=your_supabase_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
VITE_API_BASE_URL=http://localhost:5001
```

### 2. Enhanced Error Handling
- Added fallback values in `src/supabase/client.jsx`
- Improved error handling in `src/context/AuthContext.jsx`
- Added better logging for debugging

### 3. Restarted Development Server
The development server was restarted to pick up the new environment variables.

## How to Fix Permanently

### Step 1: Get Your Supabase Credentials
1. Go to your Supabase project dashboard
2. Navigate to Settings > API
3. Copy your Project URL and anon/public key

### Step 2: Update Environment Variables
Replace the placeholder values in `.env.local` with your actual credentials:

```bash
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-actual-anon-key-here
VITE_API_BASE_URL=http://localhost:5001
```

### Step 3: Restart Development Server
```bash
# Stop the current server
pkill -f "npm run dev"

# Start it again
npm run dev
```

## Verification Steps

1. **Check Console**: Open browser dev tools and look for any errors
2. **Check Network Tab**: Ensure API calls are working
3. **Test Authentication**: Try logging in/out
4. **Test Navigation**: Navigate between different pages

## Common Issues and Solutions

### Issue: Still seeing blank screen
**Solution**: Check browser console for specific error messages

### Issue: "Missing Supabase environment variables" warning
**Solution**: Update `.env.local` with actual Supabase credentials

### Issue: API calls failing
**Solution**: Ensure your backend server is running on port 5001

### Issue: Authentication not working
**Solution**: Verify Supabase credentials and check user table exists

## Debugging Commands

```bash
# Check if environment file exists
ls -la | grep env

# View environment file contents
cat .env.local

# Check if dev server is running
ps aux | grep "npm run dev"

# Test local server
curl -s http://localhost:5173 | head -10
```

## Prevention

1. **Always include environment variables** in your development setup
2. **Use .env.local** for local development (not committed to git)
3. **Add environment variable validation** in your app startup
4. **Provide clear error messages** when environment variables are missing

## Next Steps

1. Update `.env.local` with your actual Supabase credentials
2. Restart the development server
3. Test the application functionality
4. Check that authentication and database operations work correctly

## Support

If you continue to experience issues:
1. Check the browser console for specific error messages
2. Verify your Supabase project is active and accessible
3. Ensure your backend server is running
4. Check that all required database tables exist in Supabase 