# 📘 Phase 2: Authentication System (Login, Register, Zustand Auth Store)

---

## 🎯 Phase Goals
1. Connect to live authentication endpoints on Render (`POST /auth/login`, `POST /auth/register`, `GET /auth/me`).
2. Build a global **Zustand State Store (`authStore.ts`)** for managing login session, user profile, and token lifecycle.
3. Implement **Token Hydration on Startup**: Automatically reads the encrypted JWT from `SecureStore` on app launch and restores user session without asking them to re-login.
4. Build a reusable **`Input.tsx`** component with floating label, focus ring, left icon, password visibility toggle (`Eye` / `EyeOff`), and error message.
5. Create modern **Login Screen (`app/(auth)/login.tsx`)** and **Register Screen (`app/(auth)/register.tsx`)** with keyboard avoidance (`KeyboardAvoidingView`).
6. Add an **Auth Status Banner** on the Home screen to easily test Sign In, Register, and Logout.

---

## 📁 Created / Modified Files & What They Do

### 1. `src/api/auth.api.ts` (Auth REST API Endpoints)
* **What it does**:
  * `login(payload)`: Calls `POST https://cex-s97i.onrender.com/api/v1/auth/login` with `identifier` (email or username) and `password`. Returns user object & Bearer `accessToken`.
  * `register(payload)`: Calls `POST https://cex-s97i.onrender.com/api/v1/auth/register` with `email`, `username`, `password`.
  * `getMe()`: Calls `GET https://cex-s97i.onrender.com/api/v1/auth/me` to verify token validity and get fresh profile info.

---

### 2. `src/store/authStore.ts` (Zustand State Management)
* **What it does**:
  * Manages global auth state: `user`, `token`, `isAuthenticated`, `isLoading`, `isHydrating`, `error`.
  * **`login()`**: Calls API, stores token in hardware `SecureStore`, sets `isAuthenticated = true`.
  * **`register()`**: Calls register API, then automatically logs the user in.
  * **`logout()`**: Clears `SecureStore` and resets state to guest.
  * **`hydrate()`**: Runs once when app launches. Checks if token exists in `SecureStore` → calls `/auth/me` → restores session seamlessly.

> **💡 Mobile Concept for SuperKalam**:
> In React Web, developers often use Context API or Redux. In mobile, **Zustand** is preferred because it is lightweight (<1KB), has zero boilerplate, does not trigger unnecessary component tree re-renders, and works synchronously outside the React render loop (e.g. inside Axios interceptors).

---

### 3. `src/components/common/Input.tsx` (Custom Input Component)
* **What it does**:
  * Wraps React Native `<TextInput>`.
  * Supports `leftIcon` (e.g. `<Mail />`, `<Lock />`, `<User />`).
  * Has built-in **Password Visibility Toggle**: Taps `<Eye />` or `<EyeOff />` to toggle `secureTextEntry`.
  * Highlights border with Gold accent (`COLORS.primary`) when focused.
  * Shows validation error message in Crimson Red below input when `error` is passed.

---

### 4. `app/(auth)/login.tsx` (Login Screen)
* **What it does**:
  * Form inputs for Email/Username and Password.
  * Form validation before submission.
  * Red Alert Banner if invalid credentials or server errors occur.
  * Submits to `useAuthStore.login()`, on success redirects to Home (`router.replace("/")`).
  * Switch link to Register page.
  * Uses `<KeyboardAvoidingView>` and `keyboardShouldPersistTaps="handled"` so the keyboard never blocks inputs or submit buttons.

> **💡 Mobile Concept for SuperKalam**:
> On mobile phones, when a user taps an input, the on-screen keyboard pops up and can cover buttons. Wrapping screens in `<KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined}>` automatically scrolls content into view above the keyboard.

---

### 5. `app/(auth)/register.tsx` (Registration Screen)
* **What it does**:
  * Inputs for: Email Address, Username (minimum 3 chars), Password (minimum 6 chars), and Confirm Password.
  * Checks that passwords match before sending network request.
  * On success, registers on backend and automatically signs user in.

---

### 6. `app/_layout.tsx` (Root Layout Update)
* **What it does**:
  * Calls `useAuthStore.getState().hydrate()` inside `useEffect` on app startup.
  * Ensures when a user reopens the app, their login state is instantly restored from `SecureStore`.

---

### 7. `app/index.tsx` (Home Screen Auth Card)
* **What it does**:
  * Displays user profile if logged in (`@username` + email + **Logout** button).
  * If guest, displays **Sign In** and **Register** buttons navigating to `/(auth)/login` and `/(auth)/register`.

---

## 🧪 How to Test Phase 2

1. Make sure Expo dev server is running:
   ```bash
   cd /home/lakshay-yadav/CEX-APP
   npx expo start
   ```
2. Open the app on your phone / emulator.
3. Tap **"Register"** → Enter a test email (e.g. `trader1@test.com`), username (`trader1`), and password (`password123`).
4. Tap **"Create Account & Sign In"** → You will be logged in and redirected to Home where your username `@trader1` is displayed!
5. Close and reopen the app → Your session persists automatically due to SecureStore hydration!
6. Tap **"Logout"** → Returns to Guest state.
7. Tap **"Sign In"** → Enter `trader1` and `password123` → Logs you back in immediately.


---

## 💎 Ultra-Pro Luxury Design Upgrades (Mockup Aligned)

Following the modern crypto fintech visual reference:
1. **Large Portfolio Typography**: Implemented `$25,076.08` with whole numbers in bold `42px` and `.08` cents in muted slate.
2. **Action Pills**: Quick action buttons for **Send** (`↗`), **Receive** (`↙`), **Trade / Swap** (`⇄` in neon lime), and **Deposit** (`+`).
3. **Featured Glowing Sparklines**: Built custom SVG spline curves with neon drop-shadow gradients (`COLORS.neonGreen` for BTC, `COLORS.electricBlue` for ETH).
4. **Coin Avatars**: Dedicated `<CoinAvatar />` components with coin-specific brand badges (BTC Gold, ETH Blue, SOL Cyan, USDT Green, INR Teal).
