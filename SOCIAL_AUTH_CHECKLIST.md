# Final Social Auth Checklist & Resolution Guide

If you are still seeing an "Authorization Error" in Google or Facebook when logging in, it's likely due to one of the following configuration issues. Please follow this checklist to verify your settings.

---

## 🏗️ 1. Provider Status (CRITICAL)

### Google Cloud Console
1. **OAuth Consent Screen**: Ensure the **User Type** is either **Production** or **External**.
2. **Testing Mode**: If the status is "Testing", you **MUST** add your email address (and any other test accounts) under the **Test users** section. Otherwise, Google will show an "Authorization Error (access_denied)" screen.
3. **Verification**: If you see a warning about "Not verified by Google", this is normal for development. Just click **Advanced** -> **Go to trills.in (unsafe)** when testing.

### Facebook Developers
1. **App Mode**: Ensure the app mode at the top is toggled to **Live**.
2. **Permissions**: If in "Development" mode, only users listed under **App Roles** (Developers/Testers) can log in.
3. **Product Settings**: Under **Facebook Login** -> **Settings**, ensure **Client OAuth Login** and **Web OAuth Login** are turned ON.

---

## 🌐 2. Web App (NextAuth)

Verify these URLs in the respective consoles for **trills.in**:

| Provider | Setting | Required Redirect URI |
|----------|---------|-----------------------|
| **Google** | Authorized redirect URIs | `https://www.trills.in/api/auth/callback/google` |
| **Facebook** | Valid OAuth Redirect URIs | `https://www.trills.in/api/auth/callback/facebook` |

**Local Testing (Web):**
If testing on `localhost:3000`, you must also add:
- Google: `http://localhost:3000/api/auth/callback/google`
- Facebook: `http://localhost:3000/api/auth/callback/facebook`

---

## 📱 3. Mobile App (Expo)

This is the most common place for "Authorization Error" (Redirect Mismatch) on mobile.

### Google (Android Standalone/Dev Build)
1. **Android Client ID**: Ensure you have an **Android Client ID** in Google Console.
2. **Package Name**: It MUST match exactly: `in.trills.socialvibe`.
3. **SHA-1 Fingerprint**: It MUST match the one from the build you are actually running.
   - Local debug/dev builds use the debug keystore SHA-1: `5E:8F:16:06:2E:A3:CD:2C:4A:0D:54:78:76:BA:A6:F3:8C:AB:F6:25`
   - Release/Play builds signed from `upload_cert_for_google.pem` use SHA-1: `60:03:82:FA:F2:1B:58:6E:0A:A1:73:79:BA:3B:53:E7:24:19:49:F1`
   - Run `node get_fingerprints.js` to confirm the release certificate fingerprint from `mobile_app/upload_cert_for_google.pem`.
   - Register the matching SHA-1 for the build you are testing in Google Console.

### Facebook (Mobile)
1. **Redirect URI**: For Facebook, you may need to add the deep link scheme to the "Valid OAuth Redirect URIs" list:
   - `trillsauth://`
   - `exp://` (if testing in Expo Go)
2. **Native iOS/Android Settings**: Under **App Settings** -> **Basic**, ensure you have added the **Android** and/or **iOS** platforms with your package name/bundle ID.

---

## 🛠️ 4. Code Fixes Recommended

We need to update a few things in the mobile app's `LoginScreen.js` to ensure it works reliably in different environments:

1. **Disable `preferLocalhost`**: This can break redirects on real devices/builds.
2. **Set correct `redirectUri`**: Ensure it uses the scheme when in standalone mode.
3. **Facebook Auth Settings**: Facebook often requires `response_type: 'token'` or `code` depending on how it's handled.

---

## ✅ Recommendation: Verify Fingerprints

Based on the current project files:
`5E:8F:16:06:2E:A3:CD:2C:4A:0D:54:78:76:BA:A6:F3:8C:AB:F6:25` is the Android debug keystore fingerprint.
`60:03:82:FA:F2:1B:58:6E:0A:A1:73:79:BA:3B:53:E7:24:19:49:F1` is the release/upload certificate fingerprint.

Use the debug SHA-1 when testing a local Android debug/dev build, and the release SHA-1 for release or Play-signed builds.
