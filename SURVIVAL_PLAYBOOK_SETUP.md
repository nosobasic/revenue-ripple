# Survival Playbook Setup Guide

## Overview
This guide explains how to set up the Survival Playbook landing page and its integration with GetResponse.

## Environment Variables Required

The following environment variables need to be configured in your deployment (Render, Vercel, etc.):

### GetResponse Configuration
```bash
# Main GetResponse API Key (used for book giveaway and survival playbook)
GETRESPONSE_API_KEY=your_getresponse_api_key_here

# GetResponse Campaign ID (your main list/campaign ID)
GETRESPONSE_CAMPAIGN_ID=your_getresponse_campaign_id_here

# Optional: GetResponse Base URL (defaults to https://api.getresponse.com)
GETRESPONSE_BASE_URL=https://api.getresponse.com
```

### Other Required Variables
```bash
# Supabase Configuration
SUPABASE_URL=your_supabase_url_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here

# Stripe Configuration
STRIPE_SECRET_KEY=your_stripe_secret_key_here
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret_here

# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key_here
```

## Features Implemented

### 1. Landing Page (`/survival-playbook`)
- **Headline**: "Free Guide: The Survival Systems Playbook"
- **Subhead**: "Learn how to capture leads, nurture them, and close sales without burning out."
- **Benefits**: Lead capture systems, nurture sequences, close more sales
- **Form**: Email and name collection with validation
- **UTM Tracking**: Automatically captures and stores UTM parameters
- **CTA**: "Get the Playbook" button

### 2. API Route (`/api/getresponse/survival-playbook`)
- Accepts email, name, and UTM parameters
- Adds contacts to GetResponse with `survival-playbook` tag
- Handles duplicate contacts gracefully
- Stores UTM parameters as custom fields
- Rate limiting (3 attempts per IP per hour)
- Database logging (if Supabase is configured)

### 3. Thank You Page (`/thank-you-survival-playbook`)
- **Message**: "You're in. Check your inbox for The Survival Systems Playbook"
- **Download Link**: Direct download of the PDF file
- **Secondary CTA**: "Upgrade your system today" (links to main site)
- **Share Functionality**: Social sharing capabilities

### 4. UTM Helper Utility (`src/utils/utm.js`)
- Parse UTM parameters from URL
- Store UTM parameters in sessionStorage
- Retrieve UTM parameters for form submission
- Google Analytics integration (if configured)

## GetResponse Integration Details

### Tags Applied
- `survival-playbook` - Applied to all contacts from this landing page

### Custom Fields Used
- `source` - Set to "ig" as specified
- `utm_source` - UTM source parameter
- `utm_medium` - UTM medium parameter  
- `utm_campaign` - UTM campaign parameter
- `utm_term` - UTM term parameter
- `utm_content` - UTM content parameter

### Duplicate Handling
- If contact already exists, the system will update their tags to include `survival-playbook`
- No duplicate contacts are created

## File Structure

```
src/
├── pages/
│   ├── SurvivalPlaybook.jsx          # Landing page
│   └── ThankYouSurvivalPlaybook.jsx  # Thank you page
├── utils/
│   └── utm.js                        # UTM parameter helper
└── App.jsx                           # Updated with new routes

server.py                             # Updated with new API endpoint
public/assets/downloads/
└── The Survival Systems Playbook.pdf # The lead magnet file
```

## Routes Added

- `/survival-playbook` - Landing page
- `/thank-you-survival-playbook` - Thank you page
- `/api/getresponse/survival-playbook` - API endpoint

## Testing

### Test the Landing Page
1. Visit `/survival-playbook`
2. Fill out the form with test data
3. Submit and verify redirect to thank you page

### Test the API
```bash
curl -X POST https://your-domain.com/api/getresponse/survival-playbook \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "source": "ig",
    "utm_source": "facebook",
    "utm_medium": "social",
    "utm_campaign": "survival-playbook"
  }'
```

### Test UTM Parameters
Visit: `/survival-playbook?utm_source=facebook&utm_medium=social&utm_campaign=survival-playbook`

## Deployment Notes

1. **Environment Variables**: Ensure all required environment variables are set in your deployment platform
2. **PDF File**: Make sure `The Survival Systems Playbook.pdf` is in the `public/assets/downloads/` directory
3. **GetResponse Setup**: Verify your GetResponse API key and campaign ID are correct
4. **Database**: The system will work without Supabase, but logging will be disabled

## Customization

### Changing the Lead Magnet
1. Replace the PDF file in `public/assets/downloads/`
2. Update the filename references in the components
3. Update the alt text and descriptions

### Modifying the Form
1. Edit `src/pages/SurvivalPlaybook.jsx`
2. Update validation rules in the `validateForm` function
3. Modify the API call in `handleSubmit`

### Styling Changes
1. Update Tailwind classes in the components
2. Modify the color scheme by changing the gradient classes
3. Update the branding elements

## Support

For questions or issues:
- Check the server logs for API errors
- Verify environment variables are set correctly
- Test the GetResponse API connection
- Ensure the PDF file is accessible
