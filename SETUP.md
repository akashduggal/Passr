# Local Setup & Running with Expo Go

This guide walks you through setting up the Passr project on your machine and running it using **Expo Go** on your phone or simulator.

---

## Prerequisites

Before you begin, ensure you have:

- **Node.js** (v18 or newer recommended) — [Download](https://nodejs.org/)
- **npm** (comes with Node.js) or **Yarn**
- **Expo Go** app installed on your iOS or Android device — [App Store](https://apps.apple.com/app/expo-go/id982107779) | [Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent)
- **Git** (optional, if you're cloning the repo)

---

## Step 1: Get the project

If you have the project as a Git repository:

```bash
git clone <repository-url>
cd passr
```

If you have the project folder already, open a terminal and navigate into it:

```bash
cd /path/to/Passr
```

*(Use the actual path to your project folder.)*

---

## Step 2: Install dependencies

From the project root, run:

```bash
npm install
```

Wait for the install to finish. This installs all required packages (React Native, Expo, etc.).

---

## Step 3: Start the development server

Start the Expo dev server:

```bash
npm start
```

You should see:
- A **QR code** in the terminal
- Options to open in **iOS Simulator**, **Android Emulator**, or **Expo Go** in the browser

Keep this terminal window open while you're developing.

---

## Step 4: Run the app in Expo Go

### On a physical device (recommended)

1. **Install Expo Go** on your iPhone or Android phone (see links above).
2. **Ensure your phone and computer are on the same Wi‑Fi network.**
3. **Scan the QR code:**
   - **iPhone:** Open the Camera app and scan the QR code. Tap the banner to open in Expo Go.
   - **Android:** Open the Expo Go app and tap **“Scan QR code”**, then scan the QR code from the terminal.

The app will load in Expo Go. You can use Passr as you would a normal app.

### Using iOS Simulator (Mac only)

1. With `npm start` running, press **`i`** in the terminal, or run in a **new** terminal:

   ```bash
   npm run ios
   ```

2. Expo will open the app in the iOS Simulator. No Expo Go app is required in this case.

### Using Android Emulator

1. Start an Android emulator (e.g. from Android Studio).
2. With `npm start` running, press **`a`** in the terminal, or run in a **new** terminal:

   ```bash
   npm run android
   ```

3. The app will open in the emulator.

---

## Troubleshooting

| Issue | What to try |
|-------|-------------|
| **QR code scan doesn’t open app** | Confirm phone and computer are on the same Wi‑Fi. Try switching to **Tunnel** mode in the Expo dev tools (press `s` in the terminal and select Tunnel) if you have connection issues. |
| **“Unable to resolve module”** | Run `npm install` again, then restart with `npm start`. |
| **App won’t load / blank screen** | Shake the device (or use the simulator menu) to open the Expo developer menu, then **Reload**. |
| **Port already in use** | Stop any other Expo/React Native processes, or run `npx expo start --port 8082` (or another free port). |

---

## Quick reference

| Command | Description |
|---------|-------------|
| `npm install` | Install dependencies |
| `npm start` | Start Expo dev server (QR code + options) |
| `npm run ios` | Run on iOS Simulator |
| `npm run android` | Run on Android Emulator |
| `npm run web` | Run in web browser |

---

Once the app is running in Expo Go (or a simulator), you can use the **Login** → **Dashboard** flow to explore Passr. The app uses mock data, so no backend or account setup is required.
