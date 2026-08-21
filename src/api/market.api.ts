import { api } from "./client";
import { Market, MarketStats, OrderBookDepth, Trade, Candle, Asset, ApiResponse } from "../types";

export const marketApi = {
  async getMarkets(): Promise<Market[]> {
    const res = await api.get<ApiResponse<Market[]>>("/markets");
    return res.data.data;
  },

  async getMarketBySymbol(symbol: string): Promise<Market> {
    const clean = symbol.replace("/", "-");
    const res = await api.get<ApiResponse<Market>>(`/markets/${clean}`);
    return res.data.data;
  },

  async getMarketStats(symbol: string): Promise<MarketStats> {
    const clean = symbol.replace("/", "-");
    const res = await api.get<ApiResponse<MarketStats>>(`/markets/${clean}/stats`);
    return res.data.data;
  },

  async getMarketDepth(symbol: string): Promise<OrderBookDepth> {
    const clean = symbol.replace("/", "-");
    const res = await api.get<ApiResponse<OrderBookDepth>>(`/markets/${clean}/depth`);
    return res.data.data;
  },

  async getMarketTrades(symbol: string): Promise<Trade[]> {
    const clean = symbol.replace("/", "-");
    const res = await api.get<ApiResponse<Trade[]>>(`/markets/${clean}/trades`);
    return res.data.data;
  },

  async getMarketCandles(symbol: string, interval = "1m"): Promise<Candle[]> {
    const clean = symbol.replace("/", "-");
    const res = await api.get<ApiResponse<Candle[]>>(`/markets/${clean}/candles`, {
      params: { interval },
    });
    return res.data.data || [];
  },

  async getAssets(): Promise<Asset[]> {
    const res = await api.get<ApiResponse<Asset[]>>("/assets");
    return res.data.data;
  },
};
