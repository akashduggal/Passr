# Push Notifications Guide (Expo + FCM)

This guide explains how to complete the setup for Push Notifications in the Passr app. The code implementation has already been added to the project.

## 1. Firebase Console Setup

You need to configure Firebase for both Android and iOS.

### Android
1. Go to [Firebase Console](https://console.firebase.google.com/).
2. Select your project.
3. Go to **Project Settings** -> **General**.
4. Ensure your Android app (`com.passr.app`) is added.
5. Download `google-services.json` and place it in the root of your project (it is already there, but ensure it's up to date).

### iOS
1. In Firebase Console, add an iOS app with Bundle ID: `com.passr.app`.
2. Download `GoogleService-Info.plist`.
3. Place this file in the root of your project.
4. **Important**: You must add the path to `app.json` under `expo.ios.googleServicesFile`:
   ```json
   "ios": {
     "googleServicesFile": "./GoogleService-Info.plist",
     ...
   }
   ```

## 2. Expo Credentials Setup

To send notifications via Expo's Push Service (which routes to FCM for Android and APNs for iOS), you need to upload credentials to Expo.

### Android (FCM)
1. In Firebase Console, go to **Project Settings** -> **Service accounts**.
2. Click **Generate new private key** to download a JSON file (e.g., `project-name-firebase-adminsdk-xxxxx.json`).
3. **Keep this file safe** and do not commit it to Git.
4. Run this command in your terminal:
   ```bash
   npx eas-cli credentials
   ```
5. Follow the interactive prompts:
   - Select **Android** -> **Development** (or Production).
   - Select **Upload a new FCM Server Key** (or similar option for Google Service Account).
   - When asked for the **Google Service Account Key**, provide the **path** to the JSON file you just downloaded (e.g., `/Users/akash/Downloads/passr-firebase-adminsdk.json`).

### iOS (APNs)
1. You need an Apple Developer Account.
2. Go to [Apple Developer Portal](https://developer.apple.com/account/resources/authkeys/list).
3. Create a new Key with "Apple Push Notifications service (APNs)" enabled.
4. Download the `.p8` file.
5. Run `eas credentials:create` for iOS or upload it via the [Expo Dashboard](https://expo.dev/accounts/[your-account]/projects/passr/credentials).

## 3. Build the App

Since `expo-notifications` requires native code changes, you must rebuild your Development Client.

```bash
# For Android
eas build --profile development --platform android

# For iOS
eas build --profile development --platform ios
```

Install the new build on your device/emulator.

## 4. Testing Notifications

1. Open the app on a physical device (Push Notifications do not work on Simulators for iOS; they work on Android Emulators with Google Play Services).
2. Login to the app.
3. Check the Metro bundler logs (terminal). You should see:
   ```
   Expo Push Token: ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]
   ```
4. Copy this token.
5. Go to [Expo Push Notifications Tool](https://expo.dev/notifications).
6. Paste the token and send a test message.
7. You should receive the notification on your device.

## Code Overview

- **`src/services/PushNotificationService.js`**: Handles permission requests and token generation.
- **`src/context/NotificationContext.js`**: Initializes the service when the user logs in and listens for incoming notifications.
- **`app.json`**: Configured with `expo-notifications` plugin and `google-services.json`.
