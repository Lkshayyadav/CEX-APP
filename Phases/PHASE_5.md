# 📘 Phase 5: Real-Time WebSocket Engine (Auto-Reconnect & Mobile Lifecycle)

---

## 🎯 Phase Goals
1. Connect directly to the production Render WebSocket Gateway (`wss://cex-s97i.onrender.com`).
2. Build a high-performance **Singleton WebSocket Manager (`src/hooks/useWebSocket.ts`)**.
3. Implement **Subscription Management**: Sends JSON RPC frames `{"method":"SUBSCRIBE","params":["channel"]}` and handles multiplexed live streams (`depth:<SYMBOL>`, `trade:<SYMBOL>`, `order:<SYMBOL>`).
4. Implement **Mobile Battery & Data Optimization (`AppState` Lifecycle Listener)**:
   * When user puts app in background or minimizes phone → closes socket to save mobile battery and cellular data.
   * When user reopens app → reconnects immediately and automatically resubscribes to all active channels without missing a beat!
5. Build **`ConnectionStatusBadge.tsx`**: Live visual status badge showing Neon Green pulse ("WS Live") or Crimson Red ("Reconnecting").
6. Hook WebSocket streaming listeners to Market Detail and Trade screens.

---

## 📁 Created / Modified Files & What They Do

### 1. `src/hooks/useWebSocket.ts` (WebSocket Singleton & Custom Hooks)
* **What it does**:
  * Manages global connection to `wss://cex-s97i.onrender.com`.
  * **Subscription Queue**: Tracks active stream subscriptions in memory. If connection drops, it automatically resubscribes upon reconnection.
  * **`useWebSocketStatus()`**: Hook returning boolean `isConnected` state.
  * **`useWebSocketStream(channel, onMessage)`**: Reusable hook that handles subscribe on component mount and clean unsubscribe on component unmount.

> **💡 Mobile Engineering Concept for SuperKalam**:
> Mobile operating systems (Android & iOS) freeze background threads to conserve battery. Keeping a persistent WebSocket open in the background drains battery and causes OS kills. Our `WebSocketManager` attaches an `AppState.addEventListener("change")` listener, gracefully disconnecting when the app goes into the background and restoring the connection instantly when foregrounded.

---

### 2. `src/components/common/ConnectionStatusBadge.tsx`
* **What it does**:
  * Real-time visual pill with a pulsing dot.
  * Displays **"WS Live"** in Neon Green when connected to Render WebSocket server.
  * Displays **"Reconnecting"** in Crimson Red if network is lost.

---

### 3. `app/market/[symbol].tsx` (Live Trade Stream Integration)
* **What it does**:
  * Subscribes to `trade:BTC_USDT` / `trade:ETH_USDT` / `trade:SOL_USDT` using `useWebSocketStream`.
  * When a trade match occurs in the backend matching engine, the live price updates in real-time on screen.

---

### 4. `app/(tabs)/trade.tsx` (Trade Screen Stream Status)
* **What it does**:
  * Integrates the live WebSocket connection status badge.

---

## 🧪 How to Test Phase 5

1. Run the app in your terminal:
   ```bash
   cd /home/lakshay-yadav/CEX-APP
   npx expo start
   ```
2. Open the **Trade** tab or any **Market Detail Screen** (e.g. `BTC/USDT`).
3. Notice the top badge displays **"WS Live"** in glowing green, confirming active WebSocket protocol connection with your Render server.
4. **Test Background Lifecycle**: Minimize the app on your phone, then reopen it — watch the console log `[WebSocket] App foregrounded. Reconnecting WebSocket...` and the badge stay rock-solid green!
