export type OrderSide = "BUY" | "SELL";
export type OrderType = "LIMIT" | "MARKET";
export type OrderStatus = "PENDING" | "OPEN" | "PARTIALLY_FILLED" | "FILLED" | "CANCELLED" | "REJECTED";

export interface User {
  id: string;
  email: string;
  username: string;
  role: string;
}

export interface Asset {
  id: string;
  symbol: string;
  name: string;
  decimals: number;
  isActive: boolean;
}

export interface Market {
  id: string;
  symbol: string; // e.g. "BTC/USDT"
  baseAssetId: string;
  quoteAssetId: string;
  minOrderSize: string;
  maxOrderSize: string;
  tickSize: string;
  stepSize: string;
  isActive: boolean;
  baseAsset: Asset;
  quoteAsset: Asset;
}

export interface MarketStats {
  symbol: string;
  lastPrice?: string;
  change: string; // e.g. "+2.45%" or "-1.10%"
  high?: string;
  low?: string;
  volume: string;
  base: string;
  quote: string;
}

export interface OrderBookLevel {
  price: string;
  size: string;
  total?: string;
}

export interface OrderBookDepth {
  symbol: string;
  bids: [string, string][]; // [price, size]
  asks: [string, string][];
  timestamp: number;
}

export interface Trade {
  price: string;
  quantity: string;
  side: OrderSide;
  timestamp: number;
  tradeId?: string;
}

export interface Order {
  id: string;
  userId: string;
  marketId: string;
  side: OrderSide;
  type: OrderType;
  status: OrderStatus;
  price: string | null;
  quantity: string;
  filledQuantity: string;
  remainingQuantity: string;
  averageFillPrice: string | null;
  createdAt: string | Date;
  updatedAt: string | Date;
  market?: {
    symbol: string;
  };
}

export interface Balance {
  id: string;
  userId: string;
  assetId: string;
  free: string;
  locked: string;
  asset: Asset;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  error?: {
    message: string;
    details?: unknown;
  };
}

export interface Candle {
  time: number;
  open: string;
  high: string;
  low: string;
  close: string;
  volume: string;
}
