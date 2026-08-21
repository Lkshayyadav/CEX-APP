export const APP_CONFIG = {
  appName: "CEX Mobile",
  version: "1.0.0",
  // Production Render Backend API & WebSocket URLs
  apiUrl: "https://cex-s97i.onrender.com/api/v1",
  wsUrl: "wss://cex-s97i.onrender.com",
  // Default trading pairs available on exchange
  defaultMarkets: ["BTC/USDT", "ETH/USDT", "SOL/USDT", "BTC/INR"],
  // Secure store keys
  tokenStorageKey: "cex_auth_token",
  userStorageKey: "cex_user_data",
};
