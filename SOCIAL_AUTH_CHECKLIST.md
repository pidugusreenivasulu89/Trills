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
   - Release builds signed from `upload_cert_for_google.pem` use the upload certificate SHA-1: `60:03:82:FA:F2:1B:58:6E:0A:A1:73:79:BA:3B:53:E7:24:19:49:F1`
   - Google Play installs may be re-signed by Play App Signing. In that case, Google sign-in needs the **App signing key certificate** SHA-1 from Play Console, which can be different from the upload certificate.
   - Run `node mobile_app/get_fingerprints.js` from the repository root, or `node get_fingerprints.js` from `mobile_app`, to confirm local debug/upload fingerprints.
   - Register the matching SHA-1 for the build you are testing in Google Console.

### Google Developer Error 10
If the app shows `Code: 10 - DEVELOPER_ERROR`, fix Google Cloud Console first:

1. Open Google Cloud Console -> APIs & Services -> Credentials.
2. Create or edit an **OAuth client ID** with Application type **Android**.
3. Set package name to `in.trills.socialvibe`.
4. Add the SHA-1 for the exact installed build:
   - Debug/dev build: `5E:8F:16:06:2E:A3:CD:2C:4A:0D:54:78:76:BA:A6:F3:8C:AB:F6:25`
   - Upload certificate: `60:03:82:FA:F2:1B:58:6E:0A:A1:73:79:BA:3B:53:E7:24:19:49:F1`
   - Play Store install: use Play Console -> Setup -> App integrity -> App signing key certificate -> SHA-1.
5. Confirm `mobile_app/src/utils/nativeSocialAuth.js` uses a **Web Application** OAuth client ID for `webClientId`.

### Facebook (Mobile)
1. **Redirect URI**: Add the app deep link callback to Facebook Login -> Settings -> Valid OAuth Redirect URIs:
   - `trillsauth://facebook-auth`
   - `trillsauth://`
   - `exp://` (if testing in Expo Go)
2. **Native iOS/Android Settings**: Under **App Settings** -> **Basic**, ensure you have added the **Android** and/or **iOS** platforms with your package name/bundle ID.
3. **Android Key Hashes**: Under the Android platform settings, add the Facebook key hash for the installed build. Run `node mobile_app/get_fingerprints.js` to print debug/upload key hashes.
   - Debug/dev build key hash: `Xo8WBi6jzSxKDVR4drqm84yr9iU=`
   - Upload certificate key hash: `YAOC+vIbWG4KoXN5ujtT5yQZSfE=`
   - Google Play build: generate the Facebook key hash from the Play Console app signing certificate; the upload key hash may not be enough.

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
