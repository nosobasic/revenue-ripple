# Authentication & Navigation Test Guide

## Overview
This guide helps verify that the recent authentication and navigation fixes are working correctly. The main issues addressed were:
- White screen with perpetual loading
- Session loss after page refresh
- Navigation state not being preserved

## Test Scenarios

### 1. Basic Authentication Flow
**Test Steps:**
1. Navigate to the application
2. Go to `/login` page
3. Enter valid credentials and login
4. Verify you're redirected to the dashboard
5. **Expected Result**: No white screen, smooth transition to dashboard

### 2. Session Persistence Test
**Test Steps:**
1. Login to the application
2. Navigate to a protected page (e.g., `/dashboard`, `/courses`)
3. Refresh the page (F5 or Ctrl+R)
4. **Expected Result**: Page should reload without requiring re-authentication

### 3. Navigation Between Protected Routes
**Test Steps:**
1. Login to the application
2. Navigate to `/dashboard`
3. Click on navigation links to other protected routes:
   - Training (`/training`)
   - Courses (`/courses`)
   - Profile (`/profile`)
4. **Expected Result**: Smooth navigation without loading screens or authentication prompts

### 4. Deep Link Access Test
**Test Steps:**
1. Login to the application
2. Copy a deep link URL (e.g., `/courses/digital-marketing`)
3. Open the URL in a new browser tab
4. **Expected Result**: Should load the page directly without redirecting to login (if session is valid)

### 5. Protected Route Access (Unauthenticated)
**Test Steps:**
1. Ensure you're logged out (clear browser storage if needed)
2. Try to access a protected route directly (e.g., `/dashboard`)
3. **Expected Result**: Should redirect to login page without white screen

### 6. Admin Route Protection
**Test Steps:**
1. Login with a non-admin account
2. Try to access admin routes (e.g., `/admin`)
3. **Expected Result**: Should show "Access Denied" message, not white screen

### 7. Error Recovery Test
**Test Steps:**
1. Login to the application
2. Disconnect from internet
3. Try to navigate between pages
4. Reconnect to internet
5. **Expected Result**: Application should recover gracefully

### 8. Loading States Test
**Test Steps:**
1. Open application with network throttling enabled (slow 3G)
2. Navigate to login page
3. Enter credentials and login
4. **Expected Result**: Should see appropriate loading indicators, not white screen

## Console Monitoring

During testing, monitor the browser console for:

### Expected Log Messages:
- `"Main entry loaded"`
- `"App component loaded"`
- `"Auth state changed: [event] [user_id]"`
- `"ProtectedRoute: [user_info]"`

### Warning Signs:
- Multiple rapid "Auth state changed" events
- Errors related to localStorage
- Uncaught exceptions during navigation

## Browser Storage Inspection

Check the browser's localStorage for:
- `revenue-ripple-auth-token`: Should contain valid Supabase session data
- No stale manual auth tokens
- Proper session structure

## Performance Checks

### Loading Time Expectations:
- Initial app load: < 3 seconds
- Navigation between routes: < 1 second
- Authentication check: < 500ms

### Memory Usage:
- No significant memory leaks during navigation
- Clean component unmounting (check React DevTools)

## Common Issues to Watch For

### 🚨 Red Flags:
- White screen that lasts > 5 seconds
- Infinite loading spinners
- Session loss after page refresh
- Multiple login prompts
- Console errors during navigation

### ✅ Good Signs:
- Smooth transitions between pages
- Session persistence across refreshes
- Appropriate loading indicators
- Clean error messages when needed

## Debugging Steps

If issues persist:

1. **Clear Browser Storage**:
   ```javascript
   // Run in browser console
   localStorage.clear();
   sessionStorage.clear();
   ```

2. **Check Network Tab**:
   - Look for failed authentication requests
   - Verify Supabase API calls are successful

3. **React DevTools**:
   - Check AuthContext state
   - Verify component mounting/unmounting

4. **Console Debugging**:
   - Enable verbose logging
   - Check for authentication state changes

## Test Environment Setup

### Prerequisites:
- Valid Supabase credentials configured
- Development server running (`npm run dev`)
- Browser with developer tools enabled

### Recommended Test Browsers:
- Chrome (latest)
- Firefox (latest)
- Safari (if on macOS)

## Reporting Issues

If you encounter problems, please capture:
1. Browser console logs
2. Network tab activity
3. Steps to reproduce
4. Expected vs actual behavior
5. Browser and OS information

## Success Criteria

All tests pass when:
- ✅ No white screens during navigation
- ✅ Sessions persist across page refreshes
- ✅ Smooth transitions between routes
- ✅ Proper error handling
- ✅ Appropriate loading states
- ✅ Clean console logs (no errors)

## Notes

- Tests should be performed in both development and production environments
- Clear browser cache between test runs for accurate results
- Test with different user roles (member, admin, affiliate)
- Verify mobile responsiveness of loading states