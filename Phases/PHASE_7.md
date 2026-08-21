# 📘 Phase 7: Interactive Order Placement & Execution (BUY / SELL)

---

## 🎯 Phase Goals
1. Connect to live Order submission and cancellation endpoints (`POST /orders`, `GET /orders`, `DELETE /orders/:id`).
2. Build **`orderStore.ts` (Zustand)** to manage placing orders, optimistic updates, and instant haptic notification triggers.
3. Build **`OrderEntryForm.tsx`**:
   * Large **BUY** (Emerald Green) & **SELL** (Crimson Red) toggle buttons.
   * **LIMIT** and **MARKET** order type tabs.
   * Real-time **Order Price** and **Order Amount** input fields.
   * **Quick % Selectors**: 1-tap `25%`, `50%`, `75%`, and `100%` percentage buttons.
   * Dynamic **Estimated Order Total** calculation in USD.
   * Instant validation, error handling, and success banners.
4. Mount `OrderEntryForm` directly onto the **Trade Tab** alongside the live L2 depth order book.

---

## 📁 Created / Modified Files & What They Do

### 1. `src/api/order.api.ts` (Order REST Endpoints)
* **What it does**:
  * `createOrder(payload)`: Submits `marketSymbol`, `side`, `type`, `price`, and `quantity` to the Redis queue for instant matching by the engine.
  * `getUserOrders()`: Fetches all historical and active user orders.
  * `cancelOrder(id)`: Cancels open order and unlocks balance.

---

### 2. `src/store/orderStore.ts` (Zustand Order State)
* **What it does**:
  * Tracks `orders`, `isSubmitting`, `error`, and `successMessage`.
  * Triggers `Haptics.notificationAsync(Success)` on successful execution or `Haptics.notificationAsync(Error)` on failure.

---

### 3. `src/components/trading/OrderEntryForm.tsx`
* **What it does**:
  * Comprehensive trading ticket form.
  * Automatically calculates order value as you type.
  * Submits live orders to the matching engine.

---

### 4. `app/(tabs)/trade.tsx` (Complete Interactive Trading Terminal)
* **What it does**:
  * Top pair selector (`BTC/USDT`, `ETH/USDT`, `SOL/USDT`, `BTC/INR`).
  * Live Order Placement Ticket.
  * Real-time L2 Order Book & Recent Trades live stream below the form.

---

## 🧪 How to Test Phase 7

1. Make sure you are signed in (via Login screen with your web account).
2. Open the **Trade** tab.
3. Select **BUY** or **SELL**, choose **LIMIT**, enter a price and quantity (or tap **50%**).
4. Tap **"Place BUY Order"** → You will feel a success vibration and see a green confirmation banner as your order is queued and matched on Render!
