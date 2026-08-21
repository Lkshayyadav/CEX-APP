# 📘 Phase 8: Wallet, Asset Balances & Simulated Deposit Modal

---

## 🎯 Phase Goals
1. Connect to live Balance endpoints on Render (`GET /balances`, `GET /balances/:asset`, `POST /balances/deposit`).
2. Build **`balanceStore.ts` (Zustand)** to compute total portfolio USD valuation by multiplying free and locked balances by current market exchange rates.
3. Build **`DepositModal.tsx`**:
   * Slide-up modal sheet with backdrop blur overlay.
   * Asset selector chips (`USDT`, `BTC`, `ETH`, `SOL`, `INR`).
   * 1-Tap quick deposit chips (e.g. `+1000 USDT`, `+0.1 BTC`, `+1.0 ETH`).
   * Custom decimal amount input.
   * Instant deposit mutation with native haptic vibration feedback.
4. Upgrade **`app/(tabs)/wallet.tsx`**:
   * Live portfolio balance display.
   * Individual asset cards with **Free (Available)** vs **Locked (in Open Orders)** quantities.

---

## 📁 Created / Modified Files & What They Do

### 1. `src/api/balance.api.ts` (Balance REST Endpoints)
* **What it does**:
  * `getBalances()`: Returns all user asset accounts from PostgreSQL.
  * `deposit(payload)`: Credited testnet funds instantly on backend.

---

### 2. `src/store/balanceStore.ts` (Zustand Balance State)
* **What it does**:
  * Calculates real-time aggregate USD portfolio balance.
  * Triggers `depositFunds()` with optimistic refresh and haptics.

---

### 3. `src/components/wallet/DepositModal.tsx` (Slide-Up Sheet)
* **What it does**:
  * Clean bottom sheet modal allowing simulated deposits of any active exchange asset.

---

### 4. `app/(tabs)/wallet.tsx` (Wallet Screen)
* **What it does**:
  * Renders live user balances, locked order margins, and opens the deposit modal.

---

## 🧪 How to Test Phase 8

1. In your Expo app:
   ```bash
   cd /home/lakshay-yadav/CEX-APP
   npx expo start
   ```
2. Open the **Wallet** tab.
3. Tap **"Deposit Funds"** → The slide-up modal appears.
4. Select **USDT** or **BTC**, tap **+1000** or enter an amount, and tap **"Confirm Deposit"**.
5. You will feel a success vibration, the modal will close, and your portfolio balance will instantly increase!
