# 📘 Phase 6: Live L2 Order Book & Recent Trades Stream

---

## 🎯 Phase Goals
1. Connect to live L2 depth snapshot API (`GET /markets/:symbol/depth`) and WebSocket depth stream (`depth:BTC_USDT`).
2. Build **`OrderBookView.tsx`**:
   * Asks in Crimson Red (`#F6465D`) with dynamic horizontal depth volume bars.
   * Mid-market price and real-time spread calculation in Electric Blue.
   * Bids in Emerald Green (`#0ECB81`) with dynamic horizontal depth volume bars.
3. Build **`RecentTradesView.tsx`**:
   * Live streaming trade execution feed from `trade:BTC_USDT`.
   * Real-time trade price, size, and timestamp with green/red side indicators.
4. Add a **3-Way View Switcher** on the Market Detail Screen (`Chart` | `Order Book` | `Trades`).

---

## 📁 Created / Modified Files & What They Do

### 1. `src/components/trading/OrderBookView.tsx` (Real-Time L2 Order Book)
* **What it does**:
  * Loads initial order book snapshot from REST API, then listens to WebSocket `depth:<SYMBOL>` stream for instant updates.
  * Calculates cumulative depth percentages using `useMemo()` to render background depth volume bars without lagging the main UI thread.
  * Displays mid-market price and dynamic spread.

---

### 2. `src/components/trading/RecentTradesView.tsx` (Live Trade Fills Feed)
* **What it does**:
  * Subscribes to `trade:<SYMBOL>` stream.
  * Prepends new trade fills with formatted prices, token amounts, and execution timestamps (`HH:mm:ss`).

---

### 3. `app/market/[symbol].tsx` (Upgraded with Segmented View Switcher)
* **What it does**:
  * Segmented tabs: **Chart** 📊, **Order Book** 📖, and **Trades** ⏱️.
  * Seamlessly toggles between the glowing SVG price chart, the live L2 depth book, and trade fill history!

---

## 🧪 How to Test Phase 6

1. In your Expo terminal:
   ```bash
   cd /home/lakshay-yadav/CEX-APP
   npx expo start
   ```
2. Open any market (e.g. **BTC/USDT** or **ETH/USDT**).
3. Tap **"Order Book"** on the segment bar: Watch the live red & green depth bars and spread calculate in real time!
4. Tap **"Trades"**: See the real-time execution feed.
