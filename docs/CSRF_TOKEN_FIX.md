# Fixing NextAuth CSRF Token Error

## Problem

You're experiencing a `MissingCSRF` error when trying to sign in with NextAuth.js. This error occurs when the CSRF token is missing during the authentication process.

## Root Cause

The CSRF token error typically happens due to:

1. Missing or incorrect `AUTH_SECRET` environment variable
2. Incorrect cookie configuration
3. Missing `NEXTAUTH_URL` environment variable
4. Improper session handling

## Solution

### 1. Create Environment Variables

Create a `.env.local` file in your project root with the following essential variables:

```bash
# NextAuth Configuration
AUTH_SECRET=gu8cfkfXMKlQYvGcFA2ZB1AfQ18ogbFgZvkFRNL+gtw=
NEXTAUTH_SECRET=gu8cfkfXMKlQYvGcFA2ZB1AfQ18ogbFgZvkFRNL+gtw=

# Google OAuth (required for sign-in)
AUTH_GOOGLE_ID=your-google-client-id
AUTH_GOOGLE_SECRET=your-google-client-secret

# NextAuth URL (important for CSRF protection)
NEXTAUTH_URL=http://localhost:3000

# Database
DATABASE_URL=your-database-url
```

### 2. Generate a New Secret (if needed)

If you need to generate a new secret, run:

```bash
node scripts/generate-auth-secret.js
```

### 3. Verify Google OAuth Setup

Make sure your Google OAuth credentials are properly configured:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create or select a project
3. Enable the Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google` (for development)
   - `https://yourdomain.com/api/auth/callback/google` (for production)

### 4. Restart Your Development Server

After adding the environment variables, restart your development server:

```bash
npm run dev
# or
yarn dev
```

## Changes Made

### 1. Updated `auth.ts`

- Added proper CSRF protection settings
- Configured secure cookies for production
- Added proper cookie names and options

### 2. Updated `AuthProvider.tsx`

- Added session refetch settings
- Improved session management

### 3. Updated `signin/page.tsx`

- Added better error handling for CSRF errors
- Improved authentication flow
- Added redirect handling

### 4. Created Environment Template

- Created `env.example` with all required variables
- Created secret generation script

## Testing the Fix

1. Make sure your `.env.local` file is properly configured
2. Restart your development server
3. Try signing in with Google
4. Check the browser console for any remaining errors

## Common Issues and Solutions

### Issue: Still getting CSRF errors

**Solution**:

- Clear browser cookies and cache
- Make sure `NEXTAUTH_URL` matches your actual URL
- Verify the secret is properly set

### Issue: Google OAuth not working

**Solution**:

- Check that Google OAuth credentials are correct
- Verify redirect URIs are properly configured
- Make sure the Google+ API is enabled

### Issue: Session not persisting

**Solution**:

- Check that cookies are being set properly
- Verify the database connection
- Make sure the session strategy is correct

## Production Deployment

For production, make sure to:

1. Set `NODE_ENV=production`
2. Use HTTPS URLs in `NEXTAUTH_URL`
3. Use secure cookies (already configured)
4. Set proper environment variables in your hosting platform

## Security Notes

- Never commit your `.env.local` file to version control
- Keep your `AUTH_SECRET` secure and random
- Use different secrets for development and production
- Regularly rotate your secrets

## Additional Resources

- [NextAuth.js Documentation](https://next-auth.js.org/)
- [NextAuth.js CSRF Protection](https://next-auth.js.org/configuration/options#csrf-protection)
- [Google OAuth Setup](https://next-auth.js.org/providers/google)
