import axios from "axios";

export interface GlobalMarketTicker {
  symbol: string; // e.g. "BTC/USDT"
  binancePair: string; // "BTCUSDT"
  baseSymbol: string; // "BTC"
  name: string;
  fullName: string;
  isTradable: boolean;
  price: number;
  change24h: number;
  changeAmount24h: number;
  prevClose: number;
  openPrice: number;
  high24h: number;
  low24h: number;
  volume24h: number;
  quoteVolume24h: number;
  sparkline: number[];
}

export type PeriodKey = "1D" | "1W" | "1M" | "6M" | "YTD" | "1Y" | "5Y" | "ALL";

export interface TimeframeResult {
  points: { time: number; price: number }[];
  firstPrice: number;
  lastPrice: number;
  gainPct: number;
  changeAmount: number;
  timeLabels: { label: string; xPct: number }[];
}

const BINANCE_API = "https://api.binance.com/api/v3";

export const PAIR_CONFIG: Record<
  string,
  { binancePair: string; base: string; name: string; fullName: string; isTradable: boolean }
> = {
  "BTC/USDT": {
    binancePair: "BTCUSDT",
    base: "BTC",
    name: "Bitcoin",
    fullName: "Bitcoin / TetherUS",
    isTradable: true,
  },
  "ETH/USDT": {
    binancePair: "ETHUSDT",
    base: "ETH",
    name: "Ethereum",
    fullName: "Ethereum / TetherUS",
    isTradable: true,
  },
  "SOL/USDT": {
    binancePair: "SOLUSDT",
    base: "SOL",
    name: "Solana",
    fullName: "Solana / TetherUS",
    isTradable: true,
  },
  "BNB/USDT": {
    binancePair: "BNBUSDT",
    base: "BNB",
    name: "BNB",
    fullName: "BNB / TetherUS",
    isTradable: false,
  },
  "XRP/USDT": {
    binancePair: "XRPUSDT",
    base: "XRP",
    name: "XRP",
    fullName: "XRP / TetherUS",
    isTradable: false,
  },
  "DOGE/USDT": {
    binancePair: "DOGEUSDT",
    base: "DOGE",
    name: "Dogecoin",
    fullName: "Dogecoin / TetherUS",
    isTradable: false,
  },
  "ADA/USDT": {
    binancePair: "ADAUSDT",
    base: "ADA",
    name: "Cardano",
    fullName: "Cardano / TetherUS",
    isTradable: false,
  },
  "AVAX/USDT": {
    binancePair: "AVAXUSDT",
    base: "AVAX",
    name: "Avalanche",
    fullName: "Avalanche / TetherUS",
    isTradable: false,
  },
  "LINK/USDT": {
    binancePair: "LINKUSDT",
    base: "LINK",
    name: "Chainlink",
    fullName: "Chainlink / TetherUS",
    isTradable: false,
  },
  "SUI/USDT": {
    binancePair: "SUIUSDT",
    base: "SUI",
    name: "Sui",
    fullName: "Sui / TetherUS",
    isTradable: false,
  },
};

const TIMEFRAME_CONFIGS: Record<PeriodKey, { interval: string; limit: number; labelFmt: string }> = {
  "1D": { interval: "15m", limit: 96, labelFmt: "time" },
  "1W": { interval: "1h", limit: 168, labelFmt: "day" },
  "1M": { interval: "4h", limit: 180, labelFmt: "date" },
  "6M": { interval: "1d", limit: 180, labelFmt: "month" },
  "YTD": { interval: "1d", limit: 240, labelFmt: "month" },
  "1Y": { interval: "1d", limit: 365, labelFmt: "month" },
  "5Y": { interval: "1w", limit: 260, labelFmt: "year" },
  "ALL": { interval: "1M", limit: 100, labelFmt: "year" },
};

let cachedTickers: Record<string, GlobalMarketTicker> = {};
let lastFetchTime = 0;

export const globalPriceApi = {
  async fetchLiveMarketTickers(force = false): Promise<Record<string, GlobalMarketTicker>> {
    const now = Date.now();
    if (!force && Object.keys(cachedTickers).length > 0 && now - lastFetchTime < 2000) {
      return cachedTickers;
    }

    try {
      const symbols = Object.values(PAIR_CONFIG).map((p) => p.binancePair);
      const symbolsQuery = JSON.stringify(symbols);
      const res = await axios.get(
        `${BINANCE_API}/ticker/24hr?symbols=${encodeURIComponent(symbolsQuery)}`,
        { timeout: 4000 }
      );

      if (Array.isArray(res.data)) {
        const result: Record<string, GlobalMarketTicker> = { ...cachedTickers };

        for (const item of res.data) {
          const matchedEntry = Object.entries(PAIR_CONFIG).find(
            ([_, val]) => val.binancePair === item.symbol
          );
          if (!matchedEntry) continue;

          const [symKey, meta] = matchedEntry;
          const lastPrice = parseFloat(item.lastPrice) || 0;
          const priceChange = parseFloat(item.priceChange) || 0;
          const priceChangePercent = parseFloat(item.priceChangePercent) || 0;
          const prevClose = parseFloat(item.prevClosePrice) || 0;
          const openPrice = parseFloat(item.openPrice) || 0;
          const highPrice = parseFloat(item.highPrice) || 0;
          const lowPrice = parseFloat(item.lowPrice) || 0;
          const volume = parseFloat(item.volume) || 0;
          const quoteVolume = parseFloat(item.quoteVolume) || 0;

          result[symKey] = {
            symbol: symKey,
            binancePair: meta.binancePair,
            baseSymbol: meta.base,
            name: meta.name,
            fullName: meta.fullName,
            isTradable: meta.isTradable,
            price: lastPrice,
            change24h: priceChangePercent,
            changeAmount24h: priceChange,
            prevClose,
            openPrice,
            high24h: highPrice,
            low24h: lowPrice,
            volume24h: volume,
            quoteVolume24h: quoteVolume,
            sparkline: result[symKey]?.sparkline || [],
          };
        }

        lastFetchTime = now;
        cachedTickers = result;
        return result;
      }
    } catch (err) {
      console.warn("[Binance API] Ticker fetch error:", err);
    }

    return cachedTickers;
  },

  async fetchTradingViewChart(
    symbol: string,
    period: PeriodKey
  ): Promise<TimeframeResult | null> {
    const meta = PAIR_CONFIG[symbol] || PAIR_CONFIG["BTC/USDT"];
    const cfg = TIMEFRAME_CONFIGS[period] || TIMEFRAME_CONFIGS["1D"];

    try {
      const res = await axios.get(
        `${BINANCE_API}/klines?symbol=${meta.binancePair}&interval=${cfg.interval}&limit=${cfg.limit}`,
        { timeout: 4500 }
      );

      if (Array.isArray(res.data) && res.data.length > 0) {
        const raw = res.data;
        const firstPrice = parseFloat(raw[0][1]) || 1;
        const lastPrice = parseFloat(raw[raw.length - 1][4]) || firstPrice;
        const gainPct = parseFloat((((lastPrice - firstPrice) / firstPrice) * 100).toFixed(2)) || 0;
        const changeAmount = parseFloat((lastPrice - firstPrice).toFixed(2)) || 0;

        const step = Math.max(Math.floor(raw.length / 60), 1);
        const sampled: { time: number; price: number }[] = [];

        for (let i = 0; i < raw.length; i += step) {
          sampled.push({
            time: Math.floor(raw[i][0] / 1000),
            price: parseFloat(raw[i][4]) || firstPrice,
          });
        }
        const lastRaw = raw[raw.length - 1];
        if (sampled[sampled.length - 1]?.time !== Math.floor(lastRaw[0] / 1000)) {
          sampled.push({ time: Math.floor(lastRaw[0] / 1000), price: parseFloat(lastRaw[4]) || lastPrice });
        }

        const timeLabels: { label: string; xPct: number }[] = [];
        const labelIndices = [0.1, 0.3, 0.5, 0.7, 0.9];

        labelIndices.forEach((pct) => {
          const rawIdx = Math.min(Math.floor((raw.length - 1) * pct), raw.length - 1);
          const d = new Date(raw[rawIdx][0]);
          let label = "";

          if (cfg.labelFmt === "time") {
            label = d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false });
          } else if (cfg.labelFmt === "day") {
            label = `${d.getDate()}`;
          } else if (cfg.labelFmt === "date") {
            label = `${d.toLocaleDateString([], { month: "short", day: "numeric" })}`;
          } else if (cfg.labelFmt === "month") {
            label = `${d.toLocaleDateString([], { month: "short" })}`;
          } else if (cfg.labelFmt === "year") {
            label = `${d.getFullYear()}`;
          }

          timeLabels.push({ label, xPct: pct });
        });

        return {
          points: sampled,
          firstPrice,
          lastPrice,
          gainPct,
          changeAmount,
          timeLabels,
        };
      }
    } catch (err) {
      console.warn(`[Binance API] Kline chart query for ${symbol} (${period}):`, err);
    }

    return null;
  },
};
