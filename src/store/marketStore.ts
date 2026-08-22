import { create } from "zustand";
import { Market, MarketStats } from "../types";
import { marketApi } from "../api/market.api";
import { globalPriceApi, GlobalMarketTicker, PAIR_CONFIG } from "../api/globalPrice.api";
import { getErrorMessage } from "../utils/errorHandler";
import { storage } from "../utils/storage";

export type MarketCategory = "ALL" | "FAVORITES" | "GAINERS" | "LOSERS" | "LAYER1" | "DEFI" | "TRADABLE";

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

const FAVORITES_STORAGE_KEY = "cex_user_favorite_markets";

const INITIAL_MARKETS: Market[] = Object.entries(PAIR_CONFIG).map(([sym, meta]) => ({
  id: `m-${meta.base.toLowerCase()}`,
  symbol: sym,
  baseAssetId: `a-${meta.base.toLowerCase()}`,
  quoteAssetId: "a-usdt",
  baseAsset: {
    id: `a-${meta.base.toLowerCase()}`,
    symbol: meta.base,
    name: meta.name,
    decimals: 8,
    isActive: true,
  },
  quoteAsset: {
    id: "a-usdt",
    symbol: "USDT",
    name: "Tether USD",
    decimals: 6,
    isActive: true,
  },
  minOrderSize: "0.001",
  maxOrderSize: "1000000.0",
  tickSize: "0.01",
  stepSize: "0.001",
  isActive: meta.isTradable,
}));

const LAYER1_SYMBOLS = ["BTC/USDT", "ETH/USDT", "SOL/USDT", "BNB/USDT", "ADA/USDT", "AVAX/USDT", "DOT/USDT", "NEAR/USDT", "APT/USDT", "ATOM/USDT"];
const DEFI_SYMBOLS = ["UNI/USDT", "LINK/USDT", "ARB/USDT", "OP/USDT", "POL/USDT"];

interface MarketState {
  markets: Market[];
  marketStatsMap: Record<string, MarketStats>;
  globalTickers: Record<string, GlobalMarketTicker>;
  liveTicks: Record<string, BinanceTick>;
  favorites: string[];
  selectedCategory: MarketCategory;
  searchQuery: string;
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;

  initBinanceSocket: () => void;
  loadFavorites: () => Promise<void>;
  toggleFavorite: (symbol: string) => Promise<void>;
  isFavorite: (symbol: string) => boolean;
  fetchMarkets: () => Promise<void>;
  refreshMarkets: () => Promise<void>;
  fetchStatsForMarket: (symbol: string) => Promise<void>;
  fetchAllStats: () => Promise<void>;
  fetchGlobalTickers: () => Promise<void>;
  setSelectedCategory: (category: MarketCategory) => void;
  setSearchQuery: (query: string) => void;
  getFilteredMarkets: () => Market[];
  getHotMovers: () => Market[];
}

let binanceWs: WebSocket | null = null;
let pendingTickBuffer: Record<string, BinanceTick> = {};
let batchFlushTimer: any = null;

export const useMarketStore = create<MarketState>((set, get) => ({
  markets: INITIAL_MARKETS,
  marketStatsMap: {},
  globalTickers: {},
  liveTicks: {},
  favorites: ["BTC/USDT", "ETH/USDT", "SOL/USDT"],
  selectedCategory: "ALL",
  searchQuery: "",
  isLoading: false,
  isRefreshing: false,
  error: null,

  initBinanceSocket: () => {
    if (binanceWs && (binanceWs.readyState === WebSocket.OPEN || binanceWs.readyState === WebSocket.CONNECTING)) {
      return;
    }

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
      }, 400);
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

  loadFavorites: async () => {
    try {
      const stored = await storage.getItem(FAVORITES_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          set({ favorites: parsed });
        }
      }
    } catch {}
  },

  toggleFavorite: async (symbol: string) => {
    const { favorites } = get();
    const isFav = favorites.includes(symbol);
    const updated = isFav ? favorites.filter((s) => s !== symbol) : [...favorites, symbol];
    set({ favorites: updated });
    try {
      await storage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(updated));
    } catch {}
  },

  isFavorite: (symbol: string) => {
    return get().favorites.includes(symbol);
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
    get().loadFavorites();

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
    } catch (err) {}
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

  getHotMovers: () => {
    const { markets, liveTicks, globalTickers } = get();
    return [...markets].sort((a, b) => {
      const changeA = Math.abs(liveTicks[a.symbol]?.change24h ?? globalTickers[a.symbol]?.change24h ?? 0);
      const changeB = Math.abs(liveTicks[b.symbol]?.change24h ?? globalTickers[b.symbol]?.change24h ?? 0);
      return changeB - changeA;
    }).slice(0, 6);
  },

  getFilteredMarkets: () => {
    const { markets, selectedCategory, searchQuery, favorites, liveTicks, globalTickers } = get();

    let list = markets.filter((market) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesSym = market.symbol.toLowerCase().includes(q);
        const matchesBase = market.baseAsset?.symbol?.toLowerCase().includes(q);
        const matchesName = market.baseAsset?.name?.toLowerCase().includes(q);
        if (!matchesSym && !matchesBase && !matchesName) {
          return false;
        }
      }

      if (selectedCategory === "FAVORITES") {
        return favorites.includes(market.symbol);
      }
      if (selectedCategory === "LAYER1") {
        return LAYER1_SYMBOLS.includes(market.symbol);
      }
      if (selectedCategory === "DEFI") {
        return DEFI_SYMBOLS.includes(market.symbol);
      }
      if (selectedCategory === "TRADABLE") {
        return market.isActive === true;
      }

      return true;
    });

    if (selectedCategory === "GAINERS") {
      list = [...list].sort((a, b) => {
        const cA = liveTicks[a.symbol]?.change24h ?? globalTickers[a.symbol]?.change24h ?? 0;
        const cB = liveTicks[b.symbol]?.change24h ?? globalTickers[b.symbol]?.change24h ?? 0;
        return cB - cA;
      });
    } else if (selectedCategory === "LOSERS") {
      list = [...list].sort((a, b) => {
        const cA = liveTicks[a.symbol]?.change24h ?? globalTickers[a.symbol]?.change24h ?? 0;
        const cB = liveTicks[b.symbol]?.change24h ?? globalTickers[b.symbol]?.change24h ?? 0;
        return cA - cB;
      });
    }

    return list;
  },
}));
