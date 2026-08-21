# 📘 Phase 3: Navigation & Bottom Tab Bar Layout (Expo Router)

---

## 🎯 Phase Goals
1. Implement a **Floating Glassmorphic Bottom Tab Bar** inspired by institutional crypto mobile apps.
2. Build 4 primary core tabs:
   * **Markets** (`app/(tabs)/index.tsx`) — Live crypto tickers, portfolio overview, glowing sparklines.
   * **Trade** (`app/(tabs)/trade.tsx`) — Fast market pair switcher, 24h high/low bar, Buy/Sell prompt.
   * **Wallet** (`app/(tabs)/wallet.tsx`) — Total asset balance breakdown (BTC, ETH, SOL, USDT, INR), deposit/withdraw CTAs.
   * **Orders** (`app/(tabs)/orders.tsx`) — Tab switcher for Open Orders & Trade History with clean empty states.
3. Build a dedicated **Market Detail Screen** (`app/market/[symbol].tsx`) with deep link handling (`cex://market/BTC_USDT`), time range switcher (`24h`, `7d`, `1m`, `1y`, `All`), and bottom floating Buy/Sell action buttons.
4. Add **Tactile Haptic Feedback** (`expo-haptics`) on every tab press.
5. Support **Safe Area Insets** so the floating dock stays perfectly above home bars on all Android and iOS devices.

---

## 📁 Created / Modified Files & What They Do

### 1. `app/(tabs)/_layout.tsx` (Floating Bottom Tab Bar)
* **What it does**:
  * Renders a floating, pill-shaped bottom tab bar with subtle glass borders (`rgba(255, 255, 255, 0.09)`) and shadow elevation.
  * **Center Highlighted Action Button**: The **Trade** tab has a distinctive elevated circle with a scale animation and Neon Green focus glow (`#22C55E`).
  * Triggers `Haptics.impactAsync(Light)` on every tab switch.
  * Dynamically calculates bottom clearance using `useSafeAreaInsets()`.

---

### 2. `app/(tabs)/index.tsx` (Markets Tab)
* **What it does**:
  * Top bar with user avatar, verified account tag, and Notification bell.
  * Hero portfolio card: **`$25,076.08`** with **Send**, **Receive**, **Trade**, and **Deposit** quick action buttons.
  * Featured market cards with custom SVG glowing spline charts (`<Sparkline />`).
  * Live trading pairs list connected to `https://cex-s97i.onrender.com/api/v1/markets`.

---

### 3. `app/(tabs)/trade.tsx` (Trade Tab)
* **What it does**:
  * Dropdown selector for active pairs (`BTC/USDT`, `ETH/USDT`, `SOL/USDT`, `BTC/INR`).
  * 24h High, 24h Low, and Ultra-Low Latency engine metrics bar.
  * Large **BUY** (Emerald Green) / **SELL** (Crimson Red) toggle buttons.
  * Quick-launch button opening the full interactive order book for the selected pair.

---

### 4. `app/(tabs)/wallet.tsx` (Wallet Tab)
* **What it does**:
  * Total crypto valuation card (`$38,763.60`) with **Deposit Funds** and **Withdraw** action buttons.
  * Individual crypto asset holdings (USDT, BTC, ETH, SOL, INR) with coin badges, token quantities, and USD equivalent values.
  * Shows an inline sign-in prompt if browsing as a guest.

---

### 5. `app/(tabs)/orders.tsx` (Orders Tab)
* **What it does**:
  * Segmented filter switcher between **Open Orders** and **Trade History**.
  * Polished empty state container with an instant "Start Trading" CTA button.

---

### 6. `app/market/[symbol].tsx` (Dynamic Market Detail Route)
* **What it does**:
  * Reads the `symbol` parameter from the URL (e.g. `/market/BTC_USDT` or via deep link `cex://market/BTC_USDT`).
  * Back navigation button (`<ArrowLeft />`), Favorite star, and Share icons.
  * Hero price display with daily dollar change.
  * **Time Range Selector**: `24h`, `7d`, `1m`, `1y`, `All` pills with active highlight.
  * Market statistics grid: 24h High, 24h Low, 24h Volume, All-Time High.
  * Fixed bottom dock with dual **BUY** & **SELL** buttons.

> **💡 Mobile Concept for SuperKalam**:
> Expo Router supports **Dynamic Routes** using the `[param].tsx` naming convention (just like Next.js App Router). This automatically creates deep linkable endpoints like `cex://market/ETH_USDT` that can be triggered from push notifications, SMS links, or external browser campaigns.

---

### 7. `app/_layout.tsx` (Root Stack Navigator)
* **What it does**:
  * Defines the top-level stack containing `(tabs)`, `(auth)`, and `market/[symbol]` with smooth `slide_from_right` transitions.

---

## 🧪 How to Test Phase 3

Inside `/home/lakshay-yadav/CEX-APP`:
```bash
npx expo start
```
1. Look at the bottom of the screen: The **Floating Tab Bar** is active!
2. Tap between **Markets**, **Trade**, **Wallet**, and **Orders** — feel the haptic tap feedback and see each screen load smoothly.
3. On the Markets or Trade screen, tap any coin card (e.g. **BTC/USDT**) — it transitions directly into the dedicated **Market Detail Screen** (`app/market/[symbol].tsx`) with time range pills and live statistics.
4. Tap the back arrow to return to the tabs seamlessly.
