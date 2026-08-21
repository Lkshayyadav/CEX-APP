import { create } from "zustand";
import { Market, MarketStats } from "../types";
import { marketApi } from "../api/market.api";
import { globalPriceApi, GlobalMarketTicker, PAIR_CONFIG } from "../api/globalPrice.api";
import { getErrorMessage } from "../utils/errorHandler";

export type MarketCategory = "ALL" | "TRADABLE";

export interface BinanceTick {
  symbol: string; // "BTC/USDT"
  price: number;
  change24h: number;
  changeAmount24h: number;
  high24h: number;
  low24h: number;
  volume24h: number;
  prevClose: number;
  openPrice: number;
}

const INITIAL_MARKETS: Market[] = [
  {
    id: "m-btc",
    symbol: "BTC/USDT",
    baseAssetId: "a-btc",
    quoteAssetId: "a-usdt",
    baseAsset: { id: "a-btc", symbol: "BTC", name: "Bitcoin", decimals: 8, isActive: true },
    quoteAsset: { id: "a-usdt", symbol: "USDT", name: "Tether USD", decimals: 6, isActive: true },
    minOrderSize: "0.0001",
    maxOrderSize: "100.0",
    tickSize: "0.01",
    stepSize: "0.0001",
    isActive: true,
  },
  {
    id: "m-eth",
    symbol: "ETH/USDT",
    baseAssetId: "a-eth",
    quoteAssetId: "a-usdt",
    baseAsset: { id: "a-eth", symbol: "ETH", name: "Ethereum", decimals: 8, isActive: true },
    quoteAsset: { id: "a-usdt", symbol: "USDT", name: "Tether USD", decimals: 6, isActive: true },
    minOrderSize: "0.001",
    maxOrderSize: "1000.0",
    tickSize: "0.01",
    stepSize: "0.001",
    isActive: true,
  },
  {
    id: "m-sol",
    symbol: "SOL/USDT",
    baseAssetId: "a-sol",
    quoteAssetId: "a-usdt",
    baseAsset: { id: "a-sol", symbol: "SOL", name: "Solana", decimals: 9, isActive: true },
    quoteAsset: { id: "a-usdt", symbol: "USDT", name: "Tether USD", decimals: 6, isActive: true },
    minOrderSize: "0.01",
    maxOrderSize: "5000.0",
    tickSize: "0.01",
    stepSize: "0.01",
    isActive: true,
  },
  {
    id: "m-bnb",
    symbol: "BNB/USDT",
    baseAssetId: "a-bnb",
    quoteAssetId: "a-usdt",
    baseAsset: { id: "a-bnb", symbol: "BNB", name: "BNB", decimals: 8, isActive: false },
    quoteAsset: { id: "a-usdt", symbol: "USDT", name: "Tether USD", decimals: 6, isActive: true },
    minOrderSize: "0.01",
    maxOrderSize: "1000.0",
    tickSize: "0.01",
    stepSize: "0.01",
    isActive: false,
  },
  {
    id: "m-xrp",
    symbol: "XRP/USDT",
    baseAssetId: "a-xrp",
    quoteAssetId: "a-usdt",
    baseAsset: { id: "a-xrp", symbol: "XRP", name: "XRP", decimals: 6, isActive: false },
    quoteAsset: { id: "a-usdt", symbol: "USDT", name: "Tether USD", decimals: 6, isActive: true },
    minOrderSize: "1.0",
    maxOrderSize: "100000.0",
    tickSize: "0.0001",
    stepSize: "1.0",
    isActive: false,
  },
  {
    id: "m-doge",
    symbol: "DOGE/USDT",
    baseAssetId: "a-doge",
    quoteAssetId: "a-usdt",
    baseAsset: { id: "a-doge", symbol: "DOGE", name: "Dogecoin", decimals: 8, isActive: false },
    quoteAsset: { id: "a-usdt", symbol: "USDT", name: "Tether USD", decimals: 6, isActive: true },
    minOrderSize: "10.0",
    maxOrderSize: "1000000.0",
    tickSize: "0.00001",
    stepSize: "1.0",
    isActive: false,
  },
  {
    id: "m-ada",
    symbol: "ADA/USDT",
    baseAssetId: "a-ada",
    quoteAssetId: "a-usdt",
    baseAsset: { id: "a-ada", symbol: "ADA", name: "Cardano", decimals: 6, isActive: false },
    quoteAsset: { id: "a-usdt", symbol: "USDT", name: "Tether USD", decimals: 6, isActive: true },
    minOrderSize: "1.0",
    maxOrderSize: "100000.0",
    tickSize: "0.0001",
    stepSize: "1.0",
    isActive: false,
  },
  {
    id: "m-avax",
    symbol: "AVAX/USDT",
    baseAssetId: "a-avax",
    quoteAssetId: "a-usdt",
    baseAsset: { id: "a-avax", symbol: "AVAX", name: "Avalanche", decimals: 8, isActive: false },
    quoteAsset: { id: "a-usdt", symbol: "USDT", name: "Tether USD", decimals: 6, isActive: true },
    minOrderSize: "0.1",
    maxOrderSize: "5000.0",
    tickSize: "0.01",
    stepSize: "0.1",
    isActive: false,
  },
  {
    id: "m-link",
    symbol: "LINK/USDT",
    baseAssetId: "a-link",
    quoteAssetId: "a-usdt",
    baseAsset: { id: "a-link", symbol: "LINK", name: "Chainlink", decimals: 8, isActive: false },
    quoteAsset: { id: "a-usdt", symbol: "USDT", name: "Tether USD", decimals: 6, isActive: true },
    minOrderSize: "0.1",
    maxOrderSize: "5000.0",
    tickSize: "0.01",
    stepSize: "0.1",
    isActive: false,
  },
  {
    id: "m-sui",
    symbol: "SUI/USDT",
    baseAssetId: "a-sui",
    quoteAssetId: "a-usdt",
    baseAsset: { id: "a-sui", symbol: "SUI", name: "Sui", decimals: 8, isActive: false },
    quoteAsset: { id: "a-usdt", symbol: "USDT", name: "Tether USD", decimals: 6, isActive: true },
    minOrderSize: "1.0",
    maxOrderSize: "50000.0",
    tickSize: "0.0001",
    stepSize: "1.0",
    isActive: false,
  },
];

interface MarketState {
  markets: Market[];
  marketStatsMap: Record<string, MarketStats>;
  globalTickers: Record<string, GlobalMarketTicker>;
  liveTicks: Record<string, BinanceTick>;
  selectedCategory: MarketCategory;
  searchQuery: string;
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;

  initBinanceSocket: () => void;
  fetchMarkets: () => Promise<void>;
  refreshMarkets: () => Promise<void>;
  fetchStatsForMarket: (symbol: string) => Promise<void>;
  fetchAllStats: () => Promise<void>;
  fetchGlobalTickers: () => Promise<void>;
  setSelectedCategory: (category: MarketCategory) => void;
  setSearchQuery: (query: string) => void;
  getFilteredMarkets: () => Market[];
}

let binanceWs: WebSocket | null = null;
let pendingTickBuffer: Record<string, BinanceTick> = {};
let batchFlushTimer: any = null;

export const useMarketStore = create<MarketState>((set, get) => ({
  markets: INITIAL_MARKETS,
  marketStatsMap: {},
  globalTickers: {},
  liveTicks: {},
  selectedCategory: "ALL",
  searchQuery: "",
  isLoading: false,
  isRefreshing: false,
  error: null,

  initBinanceSocket: () => {
    if (binanceWs && (binanceWs.readyState === WebSocket.OPEN || binanceWs.readyState === WebSocket.CONNECTING)) {
      return;
    }

    // Set up a 500ms batch flush loop so JS thread is NEVER overloaded by 100 ticks/sec
    if (!batchFlushTimer) {
      batchFlushTimer = setInterval(() => {
        if (Object.keys(pendingTickBuffer).length > 0) {
          const updates = { ...pendingTickBuffer };
          pendingTickBuffer = {};
          set((state) => ({
            liveTicks: {
              ...state.liveTicks,
              ...updates,
            },
          }));
        }
      }, 500);
    }

    try {
      const streams = Object.values(PAIR_CONFIG)
        .map((p) => `${p.binancePair.toLowerCase()}@ticker`)
        .join("/");

      binanceWs = new WebSocket(`wss://stream.binance.com:9443/ws/${streams}`);

      binanceWs.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data && data.s) {
            const matchedEntry = Object.entries(PAIR_CONFIG).find(
              ([_, val]) => val.binancePair === data.s
            );
            if (!matchedEntry) return;

            const [symKey] = matchedEntry;
            const price = parseFloat(data.c) || 0;
            const change24h = parseFloat(data.P) || 0;
            const changeAmount24h = parseFloat(data.p) || 0;
            const high24h = parseFloat(data.h) || 0;
            const low24h = parseFloat(data.l) || 0;
            const volume24h = parseFloat(data.v) || 0;
            const prevClose = parseFloat(data.x) || 0;
            const openPrice = parseFloat(data.o) || 0;

            // Buffer the tick instead of calling set() 100x per second!
            pendingTickBuffer[symKey] = {
              symbol: symKey,
              price,
              change24h,
              changeAmount24h,
              high24h,
              low24h,
              volume24h,
              prevClose,
              openPrice,
            };
          }
        } catch {}
      };

      binanceWs.onerror = () => {
        binanceWs?.close();
      };

      binanceWs.onclose = () => {
        binanceWs = null;
        setTimeout(() => get().initBinanceSocket(), 2000);
      };
    } catch {}
  },

  fetchGlobalTickers: async () => {
    try {
      const tickers = await globalPriceApi.fetchLiveMarketTickers();
      if (tickers && Object.keys(tickers).length > 0) {
        set({ globalTickers: tickers });
      }
    } catch (err) {
      console.warn("[MarketStore] Failed to fetch global tickers:", err);
    }
  },

  fetchMarkets: async () => {
    set({ isLoading: true, error: null });
    get().initBinanceSocket();

    try {
      await Promise.all([get().fetchAllStats(), get().fetchGlobalTickers()]);
      set({ isLoading: false });
    } catch (err) {
      set({ error: getErrorMessage(err), isLoading: false });
      await get().fetchGlobalTickers();
    }
  },

  refreshMarkets: async () => {
    set({ isRefreshing: true });
    get().initBinanceSocket();

    try {
      await Promise.all([get().fetchAllStats(), get().fetchGlobalTickers()]);
    } catch {
      await get().fetchGlobalTickers();
    } finally {
      set({ isRefreshing: false });
    }
  },

  fetchStatsForMarket: async (symbol: string) => {
    try {
      const stats = await marketApi.getMarketStats(symbol);
      set((state) => ({
        marketStatsMap: { ...state.marketStatsMap, [symbol]: stats },
      }));
    } catch (err) {
      // Non-tradable pairs might not have match engine stats
    }
  },

  fetchAllStats: async () => {
    const { markets, fetchStatsForMarket } = get();
    await Promise.allSettled(
      markets.filter((m) => m.isActive).map((m) => fetchStatsForMarket(m.symbol))
    );
  },

  setSelectedCategory: (category: MarketCategory) => {
    set({ selectedCategory: category });
  },

  setSearchQuery: (query: string) => {
    set({ searchQuery: query });
  },

  getFilteredMarkets: () => {
    const { markets, selectedCategory, searchQuery } = get();

    return markets.filter((market) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesSym = market.symbol.toLowerCase().includes(q);
        const matchesBase = market.baseAsset?.symbol?.toLowerCase().includes(q);
        const matchesName = market.baseAsset?.name?.toLowerCase().includes(q);
        if (!matchesSym && !matchesBase && !matchesName) {
          return false;
        }
      }

      if (selectedCategory === "TRADABLE") {
        return market.isActive === true;
      }

      return true;
    });
  },
}));
