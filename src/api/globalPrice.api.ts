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
  { binancePair: string; base: string; name: string; fullName: string; isTradable: boolean; ath: number; supply: string; capRank: number }
> = {
  "BTC/USDT": {
    binancePair: "BTCUSDT",
    base: "BTC",
    name: "Bitcoin",
    fullName: "Bitcoin / TetherUS",
    isTradable: true,
    ath: 108900.0,
    supply: "19.79M BTC",
    capRank: 1,
  },
  "ETH/USDT": {
    binancePair: "ETHUSDT",
    base: "ETH",
    name: "Ethereum",
    fullName: "Ethereum / TetherUS",
    isTradable: true,
    ath: 4891.7,
    supply: "120.4M ETH",
    capRank: 2,
  },
  "SOL/USDT": {
    binancePair: "SOLUSDT",
    base: "SOL",
    name: "Solana",
    fullName: "Solana / TetherUS",
    isTradable: true,
    ath: 260.0,
    supply: "471.8M SOL",
    capRank: 3,
  },
  "BNB/USDT": {
    binancePair: "BNBUSDT",
    base: "BNB",
    name: "BNB",
    fullName: "BNB / TetherUS",
    isTradable: false,
    ath: 720.6,
    supply: "145.8M BNB",
    capRank: 4,
  },
  "XRP/USDT": {
    binancePair: "XRPUSDT",
    base: "XRP",
    name: "XRP",
    fullName: "XRP / TetherUS",
    isTradable: false,
    ath: 3.84,
    supply: "56.9B XRP",
    capRank: 5,
  },
  "DOGE/USDT": {
    binancePair: "DOGEUSDT",
    base: "DOGE",
    name: "Dogecoin",
    fullName: "Dogecoin / TetherUS",
    isTradable: false,
    ath: 0.737,
    supply: "147.2B DOGE",
    capRank: 6,
  },
  "ADA/USDT": {
    binancePair: "ADAUSDT",
    base: "ADA",
    name: "Cardano",
    fullName: "Cardano / TetherUS",
    isTradable: false,
    ath: 3.10,
    supply: "35.7B ADA",
    capRank: 7,
  },
  "AVAX/USDT": {
    binancePair: "AVAXUSDT",
    base: "AVAX",
    name: "Avalanche",
    fullName: "Avalanche / TetherUS",
    isTradable: false,
    ath: 146.2,
    supply: "406.8M AVAX",
    capRank: 8,
  },
  "LINK/USDT": {
    binancePair: "LINKUSDT",
    base: "LINK",
    name: "Chainlink",
    fullName: "Chainlink / TetherUS",
    isTradable: false,
    ath: 52.88,
    supply: "608.1M LINK",
    capRank: 9,
  },
  "SUI/USDT": {
    binancePair: "SUIUSDT",
    base: "SUI",
    name: "Sui",
    fullName: "Sui / TetherUS",
    isTradable: false,
    ath: 3.92,
    supply: "2.85B SUI",
    capRank: 10,
  },
  "DOT/USDT": {
    binancePair: "DOTUSDT",
    base: "DOT",
    name: "Polkadot",
    fullName: "Polkadot / TetherUS",
    isTradable: false,
    ath: 55.0,
    supply: "1.43B DOT",
    capRank: 11,
  },
  "NEAR/USDT": {
    binancePair: "NEARUSDT",
    base: "NEAR",
    name: "NEAR Protocol",
    fullName: "NEAR / TetherUS",
    isTradable: false,
    ath: 20.42,
    supply: "1.21B NEAR",
    capRank: 12,
  },
  "APT/USDT": {
    binancePair: "APTUSDT",
    base: "APT",
    name: "Aptos",
    fullName: "Aptos / TetherUS",
    isTradable: false,
    ath: 19.90,
    supply: "513.2M APT",
    capRank: 13,
  },
  "LTC/USDT": {
    binancePair: "LTCUSDT",
    base: "LTC",
    name: "Litecoin",
    fullName: "Litecoin / TetherUS",
    isTradable: false,
    ath: 412.9,
    supply: "75.1M LTC",
    capRank: 14,
  },
  "SHIB/USDT": {
    binancePair: "SHIBUSDT",
    base: "SHIB",
    name: "Shiba Inu",
    fullName: "Shiba Inu / TetherUS",
    isTradable: false,
    ath: 0.000088,
    supply: "589.2T SHIB",
    capRank: 15,
  },
  "UNI/USDT": {
    binancePair: "UNIUSDT",
    base: "UNI",
    name: "Uniswap",
    fullName: "Uniswap / TetherUS",
    isTradable: false,
    ath: 44.97,
    supply: "600.4M UNI",
    capRank: 16,
  },
  "ATOM/USDT": {
    binancePair: "ATOMUSDT",
    base: "ATOM",
    name: "Cosmos",
    fullName: "Cosmos / TetherUS",
    isTradable: false,
    ath: 44.7,
    supply: "392.5M ATOM",
    capRank: 17,
  },
  "ARB/USDT": {
    binancePair: "ARBUSDT",
    base: "ARB",
    name: "Arbitrum",
    fullName: "Arbitrum / TetherUS",
    isTradable: false,
    ath: 2.40,
    supply: "4.09B ARB",
    capRank: 18,
  },
  "OP/USDT": {
    binancePair: "OPUSDT",
    base: "OP",
    name: "Optimism",
    fullName: "Optimism / TetherUS",
    isTradable: false,
    ath: 4.85,
    supply: "1.25B OP",
    capRank: 19,
  },
  "POL/USDT": {
    binancePair: "POLUSDT",
    base: "POL",
    name: "Polygon (POL)",
    fullName: "Polygon Ecosystem / TetherUS",
    isTradable: false,
    ath: 2.92,
    supply: "7.96B POL",
    capRank: 20,
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
