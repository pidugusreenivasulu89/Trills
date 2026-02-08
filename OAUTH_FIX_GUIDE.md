# OAuth Callback Error Fix Guide for trills.in

## Problem
Getting "OAuthCallback" error when trying to log in with Google/Facebook on https://www.trills.in

## Root Cause
The OAuth redirect URIs in Google Cloud Console and Facebook Developer Console might not include the production URL, or the environment variables in AWS Amplify are not set correctly.

## Solution

### Step 1: Fix Google OAuth
1. Go to [Google Cloud Console - Credentials](https://console.cloud.google.com/apis/credentials)
2. Find OAuth 2.0 Client ID: `1001936941616-m4m2f9bad6edsppqm7dkjp68rtauk7dc`
3. Click **Edit** (pencil icon)
4. Under **Authorized redirect URIs**, ensure you have:
   - `https://www.trills.in/api/auth/callback/google`
5. Click **Save**

### Step 2: Fix Facebook OAuth
1. Go to [Facebook Developers](https://developers.facebook.com/apps/1667532970748314)
2. In the left sidebar, click **Facebook Login** → **Settings**
3. Under **Valid OAuth Redirect URIs**, ensure you have:
   - `https://www.trills.in/api/auth/callback/facebook`
4. Click **Save Changes**

### Step 3: Verify AWS Amplify Environment Variables
1. Go to [AWS Amplify Console](https://console.aws.amazon.com/amplify/)
2. Select your **Trills** app
3. Click **App settings** → **Environment variables**
4. Verify these variables exist with correct values:

| Variable Name | Value |
|--------------|-------|
| NEXTAUTH_URL | https://www.trills.in |
| NEXTAUTH_SECRET | trills_super_secret_key_123456789 |
| GOOGLE_CLIENT_ID | 1001936941616-m4m2f9bad6edsppqm7dkjp68rtauk7dc |
| GOOGLE_CLIENT_SECRET | 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 |
| FACEBOOK_CLIENT_ID | 1667532970748314 |
| FACEBOOK_CLIENT_SECRET | 0cee8babf96a5756cc7d48cb13917258 |
| MONGODB_URI | mongodb+srv://pidugusreenivasulu89_db_user:ZDD9BIj8MEpsnYFU@trills.qi32cmf.mongodb.net/trills?appName=Trills |

5. If any are missing, click **Add variable** and add them
6. If any are incorrect, click **Edit** and fix them

### Step 4: Redeploy
1. In AWS Amplify Console, go to **Deployments**
2. Find the latest successful build
3. Click **Redeploy this version**
4. Wait for the build to complete (usually 3-5 minutes)

### Step 5: Test
1. Go to https://www.trills.in/login
2. Try logging in with Google or Facebook
3. You should be redirected to the feed page after successful login

## Alternative: Use Email/Password Login
If OAuth is still not working, users can:
1. Go to https://www.trills.in/register
2. Create an account with email/password
3. Log in at https://www.trills.in/login using the email form

## Common Issues

### Issue: "redirect_uri_mismatch" error
**Solution**: The redirect URI in Google/Facebook console doesn't match. Make sure it's exactly:
- Google: `https://www.trills.in/api/auth/callback/google`
- Facebook: `https://www.trills.in/api/auth/callback/facebook`

### Issue: Environment variables not taking effect
**Solution**: After updating environment variables in Amplify, you MUST redeploy the app for changes to take effect.

### Issue: Still getting OAuthCallback error after fixing
**Solution**: 
1. Clear browser cache and cookies for trills.in
2. Try in an incognito/private window
3. Check browser console (F12) for detailed error messages

## Files Modified in This Fix
- `app/api/auth/[...nextauth]/route.js` - Added debug mode and better Google OAuth config
- `components/Providers.js` - Added error handling for Amplify config
- `app/feed/error.js` - Created custom error page for better debugging
- `app/feed/page.js` - Added error handling and loading states
