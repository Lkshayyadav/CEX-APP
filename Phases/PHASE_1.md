# 📘 Phase 1: Project Scaffolding & Core Architecture

---

## 🎯 Phase Goals
1. Initialize a clean, modern **Expo (SDK 57) + TypeScript** project.
2. Establish a **Binance-grade Dark Trading Design System** (`theme.ts`).
3. Set up **Hardware-Backed Mobile Security** via `expo-secure-store`.
4. Configure an **Axios REST API Client** connected to live Render backend.
5. Create reusable atomic UI components (`Button`, `Card`, `Badge`).
6. Build a live verification screen (`app/index.tsx`) to confirm backend connectivity.

---

## 📁 Created Files & What They Do

### 1. `app.json` & `package.json`
* **What it does**:
  * Configures the app name (`CEX-APP`), Android package name (`com.lakshay.cexapp`), and deep link URL scheme (`cex://`).
  * Sets `"main": "expo-router/entry"` in `package.json` so Expo uses file-based routing.

### 2. `eas.json` (Android Build Configuration)
* **What it does**:
  * Configures Expo Application Services (EAS).
  * Allows you to run `eas build -p android --profile preview` anytime to generate a ready-to-install `.apk` file for Android.

### 3. `src/constants/theme.ts` (Design System)
* **What it does**:
  * Centralizes all color tokens, spacing, and border radiuses.
  * `COLORS.buyGreen` (`#0ECB81`): Emerald green for buy buttons & positive market gains.
  * `COLORS.sellRed` (`#F6465D`): Crimson red for sell buttons & negative market drops.
  * `COLORS.background` (`#0B0E14`): Obsidian dark background.
  * `COLORS.surface` (`#121722`): Card container background.

### 4. `src/constants/config.ts` (Configuration)
* **What it does**:
  * Holds single source of truth URLs:
    * REST API: `https://cex-s97i.onrender.com/api/v1`
    * WebSocket: `wss://cex-s97i.onrender.com`

### 5. `src/types/index.ts` (TypeScript Models)
* **What it does**:
  * Contains strict domain types:
    * `Market`, `Asset`, `Order`, `Balance`, `OrderBookDepth`, `Trade`, `ApiResponse<T>`.

### 6. `src/utils/storage.ts` (Hardware Secure Storage)
* **What it does**:
  * Wraps `expo-secure-store`.
* **Key Concept for Mobile Interviews**:
  * Web browsers store JWT tokens in `localStorage`.
  * In React Native, `localStorage` does not exist and standard `AsyncStorage` is unencrypted plaintext.
  * We use `expo-secure-store` which writes to the **Android Keystore** and **iOS Keychain** (hardware encryption chips).

### 7. `src/api/client.ts` (Axios Network Client)
* **What it does**:
  * Configures Axios with base URL `https://cex-s97i.onrender.com/api/v1`.
  * **Request Interceptor**: Automatically pulls the encrypted JWT token from `storage` and attaches `Authorization: Bearer <token>` to outgoing requests.
  * **Response Interceptor**: Intercepts `401 Unauthorized` errors for clean session expiry handling.

### 8. `src/components/common/Button.tsx`
* **What it does**:
  * Reusable touch button component with:
    * Multiple styles (`primary`, `buy`, `sell`, `outline`, `ghost`).
    * Built-in spinner (`<ActivityIndicator>`) when `loading={true}`.
    * Native **Haptic Feedback** vibration (`expo-haptics`) on tap.

### 9. `src/components/common/Card.tsx` & `Badge.tsx`
* **`Card.tsx`**: Standard surface card container with obsidian borders.
* **`Badge.tsx`**: Computes positive (+green) vs negative (-red) percentage pill tags (e.g. `+2.84%`).

### 10. `app/_layout.tsx` (Root Layout)
* **What it does**:
  * Top-level layout wrapped in `<SafeAreaProvider>` and `<StatusBar style="light" />` for edge-to-edge mobile display.

### 11. `app/index.tsx` (Verification Screen)
* **What it does**:
  * Calls `GET https://cex-s97i.onrender.com/api/v1/markets` on load.
  * Displays a real-time status card showing backend online health.
  * Renders cards for active markets (`BTC/INR`, `BTC/USDT`, `ETH/USDT`, `SOL/USDT`).

---

## 🧪 Verification & Testing
To run the app:
```bash
cd /home/lakshay-yadav/CEX-APP
npx expo start
```
* Press **`a`** for Android Emulator.
* Or scan the QR code with **Expo Go** on your phone.
