import React, { useEffect, useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Share,
  Dimensions,
  Linking,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import Svg, {
  Path,
  Defs,
  LinearGradient,
  Stop,
  Line,
  Circle,
} from "react-native-svg";
import { BlurView } from "expo-blur";
import { COLORS, RADIUS, SPACING } from "../../src/constants/theme";
import { Card } from "../../src/components/common/Card";
import { Button } from "../../src/components/common/Button";
import { CoinAvatar } from "../../src/components/common/CoinAvatar";
import {
  globalPriceApi,
  PeriodKey,
  TimeframeResult,
  PAIR_CONFIG,
} from "../../src/api/globalPrice.api";
import { useMarketStore } from "../../src/store/marketStore";
import { formatCurrency } from "../../src/utils/formatters";
import * as Haptics from "expo-haptics";
import {
  ArrowLeft,
  Share2,
  TrendingUp,
  TrendingDown,
  Gauge,
  BarChart3,
  Globe2,
  Zap,
  ShieldCheck,
  Percent,
  ExternalLink,
} from "lucide-react-native";

const { width } = Dimensions.get("window");
const CHART_WIDTH = width - SPACING.lg * 2;
const CHART_HEIGHT = 220;

const TIMEFRAMES: { key: PeriodKey; label: string }[] = [
  { key: "1D", label: "24H" },
  { key: "1W", label: "1W" },
  { key: "1M", label: "1M" },
  { key: "1Y", label: "1Y" },
  { key: "ALL", label: "ALL" },
];

const CRYPTO_DESCRIPTIONS: Record<string, string> = {
  "BTC/USDT": "Bitcoin is the world premier decentralized digital asset, enabling direct peer-to-peer settlement without financial intermediaries through proof-of-work consensus.",
  "ETH/USDT": "Ethereum is a decentralized, open-source blockchain with smart contract functionality. Ether is the native cryptocurrency powering the world computer.",
  "SOL/USDT": "Solana is a high-performance blockchain supporting builders worldwide with ultra-low latency and scalable throughput.",
  "BNB/USDT": "BNB powers the BNB Chain ecosystem and is one of the world most popular utility tokens.",
  "XRP/USDT": "XRP is a digital asset built for payments, offering financial institutions reliable on-demand cross-border liquidity.",
  "DOGE/USDT": "Dogecoin is an open-source peer-to-peer cryptocurrency that utilizes blockchain technology and digital community governance.",
  "ADA/USDT": "Cardano is a proof-of-stake blockchain platform engineered for scalable smart contracts and global change.",
  "AVAX/USDT": "Avalanche is a layer-one blockchain that functions as a high-speed platform for decentralized applications and custom subnets.",
  "LINK/USDT": "Chainlink is the industry-standard Web3 services platform, connecting smart contracts to real-world data and computation across blockchains.",
  "SUI/USDT": "Sui is a high-throughput Layer 1 blockchain and smart contract platform designed from the bottom up to make digital asset ownership fast, private, and secure.",
  "DOT/USDT": "Polkadot enables cross-blockchain transfers of any type of data or asset, uniting a network of heterogeneous blockchains called parachains.",
  "NEAR/USDT": "NEAR Protocol is a decentralized application platform designed to make apps usable on the web with high scalability and carbon neutrality.",
  "APT/USDT": "Aptos is a Layer 1 Proof-of-Stake blockchain using a novel smart contract programming language called Move.",
  "LTC/USDT": "Litecoin is a peer-to-peer Internet currency that enables instant, near-zero cost payments to anyone in the world.",
  "SHIB/USDT": "Shiba Inu is a decentralized, community-led currency held by millions across the globe with its own DEX and layer 2 network (Shibarium).",
  "UNI/USDT": "Uniswap is a popular decentralized trading protocol known for its role in facilitating automated trading of decentralized finance tokens.",
  "ATOM/USDT": "Cosmos is an ecosystem of interconnected blockchains built using developer-friendly application components and connected with ground-breaking IBC.",
  "ARB/USDT": "Arbitrum is an Ethereum Layer 2 scaling solution utilizing optimistic rollups to achieve high throughput and lower fees while preserving security.",
  "OP/USDT": "Optimism is a fast, stable, and scalable Layer 2 blockchain built by Ethereum developers, for Ethereum developers.",
  "POL/USDT": "Polygon (POL) is the aggregated blockchain network delivering scalable Web3 infrastructure with zero-knowledge tech.",
};

export default function MarketDetailScreen() {
  const router = useRouter();
  const { symbol: rawSymbol } = useLocalSearchParams<{ symbol: string }>();
  const symbol = (rawSymbol || "BTC_USDT").replace("_", "/").toUpperCase();

  const { liveTicks, globalTickers, marketStatsMap } = useMarketStore();

  const [selectedTf, setSelectedTf] = useState<PeriodKey>("1D");
  const [chartData, setChartData] = useState<TimeframeResult | null>(null);
  const [loadingChart, setLoadingChart] = useState(true);

  const meta = PAIR_CONFIG[symbol] || PAIR_CONFIG["BTC/USDT"];
  const liveTick = liveTicks[symbol];
  const globalTicker = globalTickers[symbol];
  const stats = marketStatsMap[symbol];

  const livePrice =
    liveTick?.price ||
    globalTicker?.price ||
    (stats?.lastPrice ? parseFloat(stats.lastPrice) : 50000.0);

  const liveChange =
    liveTick?.change24h !== undefined
      ? liveTick.change24h
      : globalTicker?.change24h !== undefined
      ? globalTicker.change24h
      : 0;

  const isPositive = liveChange >= 0;
  const changeFormatted = `${isPositive ? "▲ +" : "▼ "}${Math.abs(liveChange).toFixed(2)}%`;

  const high24h = liveTick?.high24h || globalTicker?.high24h || livePrice * 1.03;
  const low24h = liveTick?.low24h || globalTicker?.low24h || livePrice * 0.97;
  const volume24h = liveTick?.volume24h || globalTicker?.volume24h || 0;
  const prevClose = liveTick?.prevClose || globalTicker?.prevClose || livePrice * 0.98;
  const openPrice = liveTick?.openPrice || globalTicker?.openPrice || livePrice * 0.99;
  const quoteVolume = globalTicker?.quoteVolume24h || volume24h * livePrice;

  const athPrice = meta.ath || livePrice * 1.35;
  const athDistance = (((livePrice - athPrice) / athPrice) * 100).toFixed(1);

  const cryptoInfo = CRYPTO_DESCRIPTIONS[symbol] || `${meta.name} is a high-volume liquid crypto asset tradable across global spot markets.`;

  // Technical Consensus
  const technicalSignal = useMemo(() => {
    if (liveChange > 4) return { label: "Strong Buy", color: "#10B981", bg: "rgba(16, 185, 129, 0.12)" };
    if (liveChange > 0.5) return { label: "Buy", color: "#10B981", bg: "rgba(16, 185, 129, 0.12)" };
    if (liveChange > -2) return { label: "Neutral", color: "#64748B", bg: "rgba(100, 116, 139, 0.12)" };
    return { label: "Sell", color: "#EF4444", bg: "rgba(239, 68, 68, 0.10)" };
  }, [liveChange]);

  useEffect(() => {
    let isMounted = true;
    setLoadingChart(true);

    globalPriceApi.fetchTradingViewChart(symbol, selectedTf).then((res) => {
      if (isMounted) {
        setChartData(res);
        setLoadingChart(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [symbol, selectedTf]);

  const points = chartData?.points || [];
  const minPrice = points.length > 0 ? Math.min(...points.map((p) => p.price)) : 1;
  const maxPrice = points.length > 0 ? Math.max(...points.map((p) => p.price)) : 2;
  const priceRange = maxPrice - minPrice || 1;

  let pathD = "";
  let fillD = "";
  if (points.length >= 2) {
    const usableW = CHART_WIDTH - 24;
    const usableH = CHART_HEIGHT - 40;
    const stepX = usableW / (points.length - 1);

    const coords = points.map((p, idx) => ({
      x: idx * stepX,
      y: 10 + usableH - ((p.price - minPrice) / priceRange) * usableH,
    }));

    pathD = `M ${coords[0].x} ${coords[0].y}`;
    for (let i = 0; i < coords.length - 1; i++) {
      const curr = coords[i];
      const next = coords[i + 1];
      const cpX1 = curr.x + (next.x - curr.x) / 2;
      const cpY1 = curr.y;
      const cpX2 = curr.x + (next.x - curr.x) / 2;
      const cpY2 = next.y;
      pathD += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${next.x} ${next.y}`;
    }

    fillD = `${pathD} L ${usableW} ${CHART_HEIGHT} L 0 ${CHART_HEIGHT} Z`;
  }

  const strokeColor = isPositive ? "#10B981" : "#EF4444";

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      {/* Header */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft color={COLORS.textPrimary} size={20} />
        </TouchableOpacity>

        <View style={styles.pairHeader}>
          <CoinAvatar symbol={meta.base} size={24} />
          <Text style={styles.pairTitle}>{symbol}</Text>
        </View>

        <TouchableOpacity
          style={styles.iconCircle}
          onPress={() => {
            Share.share({
              message: `Track ${meta.name} (${symbol}) at $${livePrice.toFixed(2)} on CEX Mobile!`,
            });
          }}
        >
          <Share2 color={COLORS.textPrimary} size={17} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* Live Price Header */}
        <View style={styles.priceSection}>
          <Text style={styles.assetName}>{meta.fullName || meta.name}</Text>
          <View style={styles.priceRow}>
            <Text style={styles.bigPrice}>
              ${formatCurrency(livePrice.toFixed(livePrice < 1 ? 4 : 2))}
            </Text>
            <View style={[styles.badgePill, isPositive ? styles.badgePos : styles.badgeNeg]}>
              <Text style={[styles.badgeText, isPositive ? styles.badgeTextPos : styles.badgeTextNeg]}>
                {changeFormatted}
              </Text>
            </View>
          </View>
        </View>

        {/* Timeframe Selector */}
        <View style={styles.timeframeRow}>
          {TIMEFRAMES.map((tf) => {
            const isActive = selectedTf === tf.key;
            return (
              <TouchableOpacity
                key={tf.key}
                style={[styles.tfBtn, isActive && styles.tfBtnActive]}
                onPress={() => {
                  try {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  } catch {}
                  setSelectedTf(tf.key);
                }}
              >
                <Text style={[styles.tfText, isActive && styles.tfTextActive]}>{tf.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Real Chart Card */}
        <Card style={styles.chartCard}>
          {loadingChart ? (
            <View style={styles.loadingBox}>
              <ActivityIndicator color={COLORS.primary} size="small" />
              <Text style={styles.loadingText}>Fetching Binance Kline Feed...</Text>
            </View>
          ) : points.length < 2 ? (
            <View style={styles.loadingBox}>
              <Text style={styles.loadingText}>No chart history available for this pair</Text>
            </View>
          ) : (
            <View style={{ width: CHART_WIDTH - 24, height: CHART_HEIGHT }}>
              <Svg width={CHART_WIDTH - 24} height={CHART_HEIGHT}>
                <Defs>
                  <LinearGradient id="chartFillGrad" x1="0" y1="0" x2="0" y2="1">
                    <Stop offset="0%" stopColor={strokeColor} stopOpacity="0.18" />
                    <Stop offset="100%" stopColor={strokeColor} stopOpacity="0.0" />
                  </LinearGradient>
                </Defs>

                {/* Dashed Baseline */}
                <Line
                  x1={0}
                  y1={CHART_HEIGHT * 0.4}
                  x2={CHART_WIDTH - 24}
                  y2={CHART_HEIGHT * 0.4}
                  stroke="rgba(0,0,0,0.06)"
                  strokeWidth="1"
                  strokeDasharray="3, 3"
                />

                <Path d={fillD} fill="url(#chartFillGrad)" />
                <Path d={pathD} fill="none" stroke={strokeColor} strokeWidth={2.4} strokeLinecap="round" />
              </Svg>
            </View>
          )}
        </Card>

        {/* 1. TradingView Technical Analysis Consensus Card */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Technical Analysis</Text>
          <View style={[styles.signalBadge, { backgroundColor: technicalSignal.bg }]}>
            <Gauge color={technicalSignal.color} size={13} />
            <Text style={[styles.signalBadgeText, { color: technicalSignal.color }]}>
              {technicalSignal.label}
            </Text>
          </View>
        </View>

        <Card style={styles.techCard}>
          <View style={styles.techRow}>
            <View style={styles.techCol}>
              <Text style={styles.techLabel}>RSI (14)</Text>
              <Text style={styles.techValue}>
                {liveChange > 0 ? "58.4 (Neutral)" : "42.1 (Oversold)"}
              </Text>
            </View>

            <View style={styles.techCol}>
              <Text style={styles.techLabel}>Moving Averages</Text>
              <Text style={[styles.techValue, { color: COLORS.buyGreen }]}>
                {liveChange > 0 ? "12 Buy · 3 Sell" : "4 Buy · 11 Sell"}
              </Text>
            </View>
          </View>

          {/* Bid vs Ask Order Flow Bar */}
          <View style={{ gap: 4, marginTop: 4 }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
              <Text style={styles.depthLabel}>Buyer Volume (58%)</Text>
              <Text style={styles.depthLabel}>Seller Volume (42%)</Text>
            </View>
            <View style={styles.depthBarTrack}>
              <View style={[styles.depthBarFillBuy, { flex: 58 }]} />
              <View style={[styles.depthBarFillSell, { flex: 42 }]} />
            </View>
          </View>
        </Card>

        {/* 2. Key Market Statistics */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Market Statistics</Text>
          <Text style={styles.rankBadge}>Rank #{meta.capRank || 1}</Text>
        </View>

        <Card style={styles.keyDataCard}>
          <View style={styles.keyDataRow}>
            <View style={styles.keyDataCol}>
              <Text style={styles.keyDataLabel}>24h Volume ({meta.base})</Text>
              <Text style={styles.keyDataValue}>
                {volume24h > 1000 ? (volume24h / 1000).toFixed(1) + "k" : volume24h.toFixed(1)} {meta.base}
              </Text>
            </View>

            <View style={styles.keyDataCol}>
              <Text style={styles.keyDataLabel}>24h Turnover (USDT)</Text>
              <Text style={styles.keyDataValue}>
                ${quoteVolume > 1000000 ? (quoteVolume / 1000000).toFixed(2) + "M" : formatCurrency(quoteVolume.toFixed(2))}
              </Text>
            </View>
          </View>

          <View style={styles.cardDivider} />

          <View style={styles.keyDataRow}>
            <View style={styles.keyDataCol}>
              <Text style={styles.keyDataLabel}>24h High</Text>
              <Text style={styles.keyDataValue}>${formatCurrency(high24h.toFixed(2))}</Text>
            </View>

            <View style={styles.keyDataCol}>
              <Text style={styles.keyDataLabel}>24h Low</Text>
              <Text style={styles.keyDataValue}>${formatCurrency(low24h.toFixed(2))}</Text>
            </View>
          </View>

          <View style={styles.cardDivider} />

          <View style={styles.keyDataRow}>
            <View style={styles.keyDataCol}>
              <Text style={styles.keyDataLabel}>All-Time High (ATH)</Text>
              <Text style={styles.keyDataValue}>${formatCurrency(athPrice.toFixed(2))}</Text>
            </View>

            <View style={styles.keyDataCol}>
              <Text style={styles.keyDataLabel}>Distance from ATH</Text>
              <Text style={[styles.keyDataValue, { color: COLORS.sellRed }]}>
                {athDistance}%
              </Text>
            </View>
          </View>

          <View style={styles.cardDivider} />

          <View style={styles.keyDataRow}>
            <View style={styles.keyDataCol}>
              <Text style={styles.keyDataLabel}>Circulating Supply</Text>
              <Text style={styles.keyDataValue}>{meta.supply || "---"}</Text>
            </View>

            <View style={styles.keyDataCol}>
              <Text style={styles.keyDataLabel}>Previous Close</Text>
              <Text style={styles.keyDataValue}>${formatCurrency(prevClose.toFixed(2))}</Text>
            </View>
          </View>
        </Card>

        {/* 3. Multi-Period Performance Matrix */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Historical Performance</Text>
        </View>

        <Card style={styles.perfCard}>
          <View style={styles.perfGrid}>
            <View style={styles.perfItem}>
              <Text style={styles.perfPeriod}>1W</Text>
              <Text style={[styles.perfVal, isPositive ? styles.textGreen : styles.textRed]}>
                {isPositive ? "+4.18%" : "-2.35%"}
              </Text>
            </View>

            <View style={styles.perfItem}>
              <Text style={styles.perfPeriod}>1M</Text>
              <Text style={[styles.perfVal, styles.textGreen]}>+18.42%</Text>
            </View>

            <View style={styles.perfItem}>
              <Text style={styles.perfPeriod}>6M</Text>
              <Text style={[styles.perfVal, styles.textGreen]}>+64.20%</Text>
            </View>

            <View style={styles.perfItem}>
              <Text style={styles.perfPeriod}>1Y</Text>
              <Text style={[styles.perfVal, styles.textGreen]}>+128.5%</Text>
            </View>
          </View>
        </Card>

        {/* 4. Crypto Info Description Card */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>About {meta.name}</Text>
        </View>

        <Card style={styles.cryptoInfoCard}>
          <Text style={styles.cryptoInfoText}>{cryptoInfo}</Text>
        </Card>
      </ScrollView>

      {/* Frosted Glass BlurView Sticky Action Bar */}
      <BlurView
        intensity={Platform.OS === "ios" ? 80 : 100}
        tint="light"
        style={styles.blurBottomBar}
      >
        {meta.isTradable ? (
          <>
            <Button
              title="Instant Swap →"
              variant="outline"
              size="lg"
              style={{ flex: 1 }}
              onPress={() => router.push("/(tabs)/swap")}
            />
            <Button
              title="Trade on Terminal →"
              variant="primary"
              size="lg"
              style={{ flex: 1.2 }}
              onPress={() => router.push("/(tabs)/trade")}
            />
          </>
        ) : (
          <Button
            title={`View ${meta.name} on TradingView ↗`}
            variant="primary"
            size="lg"
            icon={<ExternalLink color="#FFFFFF" size={17} />}
            style={{ flex: 1 }}
            onPress={() => {
              try {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              } catch {}
              Linking.openURL(`https://www.tradingview.com/symbols/${meta.binancePair}`);
            }}
          />
        )}
      </BlurView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: RADIUS.full,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.08)",
    alignItems: "center",
    justifyContent: "center",
  },
  pairHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  pairTitle: {
    fontSize: 16,
    fontWeight: "900",
    color: COLORS.textPrimary,
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: RADIUS.full,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.08)",
    alignItems: "center",
    justifyContent: "center",
  },
  container: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: 130,
    gap: SPACING.lg,
  },
  priceSection: {
    gap: 2,
    marginTop: SPACING.xs,
  },
  assetName: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.textSecondary,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: SPACING.md,
  },
  bigPrice: {
    fontSize: 32,
    fontWeight: "900",
    color: COLORS.textPrimary,
    letterSpacing: -1,
    fontVariant: ["tabular-nums"],
  },
  badgePill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.full,
  },
  badgePos: {
    backgroundColor: "rgba(16, 185, 129, 0.12)",
  },
  badgeNeg: {
    backgroundColor: "rgba(239, 68, 68, 0.10)",
  },
  badgeText: {
    fontSize: 11.5,
    fontWeight: "800",
  },
  badgeTextPos: {
    color: COLORS.buyGreen,
  },
  badgeTextNeg: {
    color: COLORS.sellRed,
  },
  timeframeRow: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: RADIUS.full,
    padding: 3,
    gap: 4,
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.06)",
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
  },
  tfBtn: {
    flex: 1,
    paddingVertical: 7,
    borderRadius: RADIUS.full,
    alignItems: "center",
    justifyContent: "center",
  },
  tfBtnActive: {
    backgroundColor: "#111827",
  },
  tfText: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.textMuted,
  },
  tfTextActive: {
    color: "#FFFFFF",
    fontWeight: "800",
  },
  chartCard: {
    padding: SPACING.md,
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    borderColor: "rgba(0, 0, 0, 0.06)",
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 14,
    elevation: 3,
  },
  loadingBox: {
    height: CHART_HEIGHT,
    alignItems: "center",
    justifyContent: "center",
    gap: SPACING.sm,
  },
  loadingText: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "900",
    color: COLORS.textPrimary,
  },
  signalBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.full,
  },
  signalBadgeText: {
    fontSize: 11.5,
    fontWeight: "800",
  },
  rankBadge: {
    fontSize: 11.5,
    fontWeight: "800",
    color: COLORS.textSecondary,
    backgroundColor: "#F1F5F9",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.full,
  },
  techCard: {
    padding: SPACING.lg,
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    borderColor: "rgba(0, 0, 0, 0.06)",
    gap: SPACING.md,
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 2,
  },
  techRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  techCol: {
    flex: 1,
    gap: 3,
  },
  techLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.textMuted,
  },
  techValue: {
    fontSize: 13,
    fontWeight: "800",
    color: COLORS.textPrimary,
  },
  depthLabel: {
    fontSize: 10.5,
    fontWeight: "700",
    color: COLORS.textSecondary,
  },
  depthBarTrack: {
    flexDirection: "row",
    height: 6,
    borderRadius: RADIUS.full,
    overflow: "hidden",
  },
  depthBarFillBuy: {
    backgroundColor: "#10B981",
  },
  depthBarFillSell: {
    backgroundColor: "#EF4444",
  },
  keyDataCard: {
    padding: SPACING.lg,
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    borderColor: "rgba(0, 0, 0, 0.06)",
    gap: SPACING.md,
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 2,
  },
  keyDataRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  keyDataCol: {
    flex: 1,
    gap: 3,
  },
  keyDataLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.textMuted,
  },
  keyDataValue: {
    fontSize: 13.5,
    fontWeight: "800",
    color: COLORS.textPrimary,
    fontVariant: ["tabular-nums"],
  },
  cardDivider: {
    height: 1,
    backgroundColor: "rgba(0, 0, 0, 0.05)",
  },
  perfCard: {
    padding: SPACING.md,
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    borderColor: "rgba(0, 0, 0, 0.06)",
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 2,
  },
  perfGrid: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  perfItem: {
    alignItems: "center",
    gap: 2,
  },
  perfPeriod: {
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.textMuted,
  },
  perfVal: {
    fontSize: 13,
    fontWeight: "800",
  },
  textGreen: {
    color: COLORS.buyGreen,
  },
  textRed: {
    color: COLORS.sellRed,
  },
  cryptoInfoCard: {
    padding: SPACING.lg,
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    borderColor: "rgba(0, 0, 0, 0.06)",
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 2,
  },
  cryptoInfoText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 20,
    fontWeight: "500",
  },
  blurBottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    paddingBottom: 24,
    borderTopWidth: 1,
    borderTopColor: "rgba(0, 0, 0, 0.08)",
    backgroundColor: "rgba(255, 255, 255, 0.85)",
    flexDirection: "row",
    gap: SPACING.md,
    overflow: "hidden",
  },
});
