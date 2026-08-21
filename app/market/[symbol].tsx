import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  Share,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import Svg, { Path, Defs, LinearGradient, Stop, Circle, Line, Text as SvgText } from "react-native-svg";
import { COLORS, RADIUS, SPACING } from "../../src/constants/theme";
import { Card } from "../../src/components/common/Card";
import { Button } from "../../src/components/common/Button";
import { CoinAvatar } from "../../src/components/common/CoinAvatar";
import { PriceFlashText } from "../../src/components/common/PriceFlashText";
import { useMarketStore } from "../../src/store/marketStore";
import { globalPriceApi, PeriodKey, TimeframeResult, PAIR_CONFIG } from "../../src/api/globalPrice.api";
import { formatCurrency } from "../../src/utils/formatters";
import * as Haptics from "expo-haptics";
import {
  ArrowLeft,
  Share2,
} from "lucide-react-native";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CHART_WIDTH = SCREEN_WIDTH - 48;
const CHART_HEIGHT = 210;

const TIMEFILTERS: { key: PeriodKey; label: string; defaultGain: string; tvParam: string }[] = [
  { key: "1D", label: "1 day", defaultGain: "+6.13%", tvParam: "1D" },
  { key: "1W", label: "1 week", defaultGain: "+22.11%", tvParam: "7D" },
  { key: "1M", label: "1 month", defaultGain: "+16.49%", tvParam: "1M" },
  { key: "6M", label: "6 months", defaultGain: "+14.06%", tvParam: "6M" },
  { key: "YTD", label: "Year to date", defaultGain: "-11.54%", tvParam: "YTD" },
  { key: "1Y", label: "1 year", defaultGain: "-32.15%", tvParam: "12M" },
  { key: "5Y", label: "5 years", defaultGain: "+57.19%", tvParam: "60M" },
  { key: "ALL", label: "All time", defaultGain: "+1.67K%", tvParam: "ALL" },
];

const CRYPTO_INFO_DESCRIPTIONS: Record<string, string> = {
  BTC: "Bitcoin, the first and most popular cryptocurrency, is known for its price volatility driven by institutional demand, regulations, and global events, while Tether (USDT) is widely used as a stable trading pair to avoid converting back to fiat. Together, Bitcoin and Tether play a central role in crypto liquidity.",
  ETH: "Ethereum is a decentralized global software platform powered by blockchain technology. It is best known for its native cryptocurrency, Ether (ETH), which facilitates smart contracts, decentralized finance (DeFi), NFT ecosystems, and layer-2 scaling networks.",
  SOL: "Solana is a high-performance Layer-1 blockchain built for mass adoption. It supports builders globally with high throughput, 400ms block times, and sub-cent transaction fees through its unique Proof-of-History (PoH) consensus.",
  BNB: "BNB powers the BNB Chain ecosystem, one of the worlds most popular blockchains for decentralized applications and utility tokens with fast block times and low transaction gas fees.",
  XRP: "XRP is an open-source, permissionless, and decentralized blockchain technology designed to facilitate fast, low-cost cross-border payments and currency transfers for institutions worldwide.",
  DOGE: "Dogecoin is an open-source peer-to-peer cryptocurrency created as a lighthearted alternative to traditional cryptocurrencies, known for its vibrant global community and micro-tipping utility.",
  ADA: "Cardano is a proof-of-stake blockchain platform that says its goal is to allow changemakers, innovators and visionaries to bring about positive global change through evidence-based development.",
  AVAX: "Avalanche is an umbrella platform for launching decentralized finance (DeFi) applications, financial assets, trading and other services with sub-second finality.",
  LINK: "Chainlink is the industry-standard Web3 services platform that has enabled trillions of dollars in transaction volume across DeFi, on-chain finance, and enterprise smart contracts.",
  SUI: "Sui is a high-throughput Layer 1 blockchain and smart contract platform designed from the bottom up to make digital asset ownership fast, private, secure, and accessible to everyone.",
};

export default function MarketDetailScreen() {
  const router = useRouter();
  const { symbol } = useLocalSearchParams<{ symbol: string }>();

  const cleanSymbol = (symbol || "BTC_USDT").replace("_", "/");
  const baseAsset = cleanSymbol.split("/")[0] || "BTC";

  const pairMeta = PAIR_CONFIG[cleanSymbol] || PAIR_CONFIG["BTC/USDT"];
  const isTradable = pairMeta?.isTradable ?? false;

  const liveTick = useMarketStore((state) => state.liveTicks[cleanSymbol]);
  const globalTicker = useMarketStore((state) => state.globalTickers[cleanSymbol]);
  const initBinanceSocket = useMarketStore((state) => state.initBinanceSocket);
  const fetchGlobalTickers = useMarketStore((state) => state.fetchGlobalTickers);

  const [selectedPeriod, setSelectedPeriod] = useState<PeriodKey>("1D");
  const [timeframeData, setTimeframeData] = useState<TimeframeResult | null>(null);
  const [loadingChart, setLoadingChart] = useState(true);
  const [touchIndex, setTouchIndex] = useState<number | null>(null);

  const cryptoInfo = CRYPTO_INFO_DESCRIPTIONS[baseAsset] || CRYPTO_INFO_DESCRIPTIONS.BTC;

  const fetchChart = async (period: PeriodKey) => {
    setLoadingChart(true);
    const data = await globalPriceApi.fetchTradingViewChart(cleanSymbol, period);
    if (data) {
      setTimeframeData(data);
    }
    setLoadingChart(false);
  };

  useEffect(() => {
    initBinanceSocket();
    fetchGlobalTickers();
    fetchChart(selectedPeriod);
  }, [cleanSymbol, selectedPeriod]);

  const livePrice =
    liveTick?.price ||
    globalTicker?.price ||
    (baseAsset === "BTC" ? 77446.00 : baseAsset === "ETH" ? 2439.18 : 91.75);

  const liveChangePct =
    liveTick?.change24h !== undefined
      ? liveTick.change24h
      : globalTicker?.change24h !== undefined
      ? globalTicker.change24h
      : 6.13;

  const liveChangeAmount =
    liveTick?.changeAmount24h !== undefined
      ? liveTick.changeAmount24h
      : globalTicker?.changeAmount24h !== undefined
      ? globalTicker.changeAmount24h
      : 4478.84;

  const periodGainPct =
    selectedPeriod === "1D"
      ? liveChangePct
      : typeof timeframeData?.gainPct === "number"
      ? timeframeData.gainPct
      : liveChangePct;

  const periodChangeAmount =
    selectedPeriod === "1D"
      ? liveChangeAmount
      : typeof timeframeData?.changeAmount === "number"
      ? timeframeData.changeAmount
      : liveChangeAmount;

  const isPositive = periodGainPct >= 0;

  const liveVolume = liveTick?.volume24h || globalTicker?.volume24h || 40770;
  const formattedVolume =
    (liveVolume > 1000 ? (liveVolume / 1000).toFixed(2) + " K " : liveVolume.toFixed(2) + " ") + baseAsset;

  const livePrevClose = liveTick?.prevClose || globalTicker?.prevClose || 73025.15;
  const liveOpen = liveTick?.openPrice || globalTicker?.openPrice || 73027.02;
  const liveHigh = liveTick?.high24h || globalTicker?.high24h || 79500.00;
  const liveLow = liveTick?.low24h || globalTicker?.low24h || 72498.00;

  const historyPoints = timeframeData?.points || [];

  const handleShare = async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}

    const binancePair = globalTicker?.binancePair || (baseAsset + "USDT");
    const activeFilter = TIMEFILTERS.find((f) => f.key === selectedPeriod) || TIMEFILTERS[0];
    const tvUrl = `https://in.tradingview.com/symbols/${binancePair}/?timeframe=${activeFilter.tvParam}`;

    const title = `${globalTicker?.fullName || baseAsset + " / TetherUS"} on TradingView`;
    const message = `Check out ${globalTicker?.fullName || baseAsset + " / TetherUS"} on TradingView!

Price: $${formatCurrency((displayedPrice || livePrice).toFixed(2))} USDT (${isPositive ? "+" : ""}${periodGainPct.toFixed(2)}% in ${activeFilter.label})

View live chart:
${tvUrl}`;

    try {
      await Share.share({
        title,
        message,
        url: tvUrl,
      });
    } catch (err) {
      console.warn("Share error:", err);
    }
  };

  const { pathD, closedPathD, coordinates, timeLabels, prevCloseY } = useMemo(() => {
    if (historyPoints.length < 2) {
      return { pathD: "", closedPathD: "", coordinates: [], timeLabels: [], prevCloseY: 0 };
    }

    const prices = historyPoints.map((p) => p.price);
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    const range = max - min || 1;
    const paddingY = 16;
    const plotHeight = CHART_HEIGHT - paddingY * 2 - 20;

    const coords = historyPoints.map((p, idx) => {
      const x = (idx / (historyPoints.length - 1)) * (CHART_WIDTH - 10) + 5;
      const y = CHART_HEIGHT - paddingY - 20 - ((p.price - min) / range) * plotHeight;
      return { x, y, price: p.price, time: p.time };
    });

    let d = "M " + coords[0].x + " " + coords[0].y;
    for (let i = 0; i < coords.length - 1; i++) {
      const p0 = coords[i];
      const p1 = coords[i + 1];
      const midX = (p0.x + p1.x) / 2;
      d += " Q " + p0.x + " " + p0.y + ", " + midX + " " + ((p0.y + p1.y) / 2) + " T " + p1.x + " " + p1.y;
    }

    const closed = d + " L " + (CHART_WIDTH - 5) + " " + (CHART_HEIGHT - 20) + " L 5 " + (CHART_HEIGHT - 20) + " Z";

    const labels = (timeframeData?.timeLabels || []).map((tl) => ({
      label: tl.label,
      x: tl.xPct * (CHART_WIDTH - 20) + 10,
    }));

    const prevY = CHART_HEIGHT - paddingY - 20 - ((livePrevClose - min) / range) * plotHeight;

    return {
      pathD: d,
      closedPathD: closed,
      coordinates: coords,
      timeLabels: labels,
      prevCloseY: Math.max(Math.min(prevY, CHART_HEIGHT - 25), 20),
    };
  }, [historyPoints, timeframeData, livePrevClose]);

  const touchedPoint = touchIndex !== null && coordinates[touchIndex] ? coordinates[touchIndex] : null;
  const displayedPrice = touchedPoint ? touchedPoint.price : livePrice;

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Top Header Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity
          style={styles.iconCircle}
          onPress={() => {
            try {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            } catch {}
            router.back();
          }}
        >
          <ArrowLeft color={COLORS.textPrimary} size={20} />
        </TouchableOpacity>

        <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
          <Text style={styles.tradingViewBrand}>TradingView</Text>
        </View>

        <TouchableOpacity style={styles.iconCircle} onPress={handleShare} activeOpacity={0.75}>
          <Share2 color={COLORS.electricBlueBright} size={18} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* Main Price Header matching TradingView Screenshot */}
        <View style={styles.priceHeader}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: SPACING.sm }}>
            <CoinAvatar symbol={baseAsset} size={42} />
            <View>
              <Text style={styles.assetFullName}>{globalTicker?.fullName || (baseAsset + " / TetherUS")}</Text>
              <View style={styles.sourceTagRow}>
                <Text style={styles.sourceTagText}>{(globalTicker?.binancePair || (baseAsset + "USDT")) + " • Binance"}</Text>
                <View style={[styles.liveGreenDot, { backgroundColor: isPositive ? "#10B981" : "#EF4444" }]} />
                {!isTradable ? (
                  <View style={styles.infoOnlyBadge}>
                    <Text style={styles.infoOnlyBadgeText}>Market Info</Text>
                  </View>
                ) : null}
              </View>
            </View>
          </View>

          <View style={styles.priceRow}>
            {touchedPoint ? (
              <Text style={styles.bigPrice}>{"$" + formatCurrency(touchedPoint.price.toFixed(2))}</Text>
            ) : (
              <PriceFlashText price={livePrice} style={styles.bigPrice} />
            )}
            <Text style={styles.usdtBadge}>USDT</Text>

            <Text
              style={[
                styles.changeText,
                { color: isPositive ? "#10B981" : "#EF4444" },
              ]}
            >
              {(isPositive ? "+" : "") + formatCurrency(periodChangeAmount.toFixed(2)) + " (" + (isPositive ? "+" : "") + periodGainPct.toFixed(2) + "%)"}
            </Text>
          </View>

          <Text style={styles.timestampText}>
            As of today at {new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} GMT+5:30 · Live Feed
          </Text>
        </View>

        {/* Real Historical Curve Graph with Dynamic Color Gradient */}
        <Card style={styles.chartCard}>
          {loadingChart && historyPoints.length === 0 ? (
            <View style={styles.chartLoadingBox}>
              <ActivityIndicator color={COLORS.electricBlue} size="small" />
              <Text style={styles.chartLoadingText}>Syncing {selectedPeriod} TradingView curve...</Text>
            </View>
          ) : (
            <View style={{ position: "relative" }}>
              <Svg width={CHART_WIDTH} height={CHART_HEIGHT}>
                <Defs>
                  <LinearGradient id="tvGrad" x1="0" y1="0" x2="0" y2="1">
                    <Stop
                      offset="0%"
                      stopColor={isPositive ? "#10B981" : "#EF4444"}
                      stopOpacity="0.32"
                    />
                    <Stop
                      offset="100%"
                      stopColor={isPositive ? "#10B981" : "#EF4444"}
                      stopOpacity="0.0"
                    />
                  </LinearGradient>
                </Defs>

                {/* Dotted Reference Line for 1D mode */}
                {selectedPeriod === "1D" ? (
                  <Line
                    x1="0"
                    y1={prevCloseY}
                    x2={CHART_WIDTH}
                    y2={prevCloseY}
                    stroke="rgba(255, 255, 255, 0.12)"
                    strokeDasharray="4, 4"
                    strokeWidth="1"
                  />
                ) : null}

                {/* Area Gradient Fill */}
                <Path d={closedPathD} fill="url(#tvGrad)" />

                {/* Smooth Price Line */}
                <Path
                  d={pathD}
                  fill="none"
                  stroke={isPositive ? "#10B981" : "#EF4444"}
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />

                {/* Active Touch Point */}
                {touchedPoint ? (
                  <Circle
                    cx={touchedPoint.x}
                    cy={touchedPoint.y}
                    r="5"
                    fill={isPositive ? "#10B981" : "#EF4444"}
                    stroke="#FFFFFF"
                    strokeWidth="2"
                  />
                ) : null}

                {/* Dynamic Time Axis Labels along bottom */}
                {timeLabels.map((tl, idx) => (
                  <SvgText
                    key={"time-" + idx}
                    x={tl.x}
                    y={CHART_HEIGHT - 6}
                    fill="#64748B"
                    fontSize="9.5"
                    fontWeight="600"
                    textAnchor="middle"
                  >
                    {tl.label}
                  </SvgText>
                ))}
              </Svg>

              {/* Prev Close Floating Badge for 1D */}
              {selectedPeriod === "1D" ? (
                <View style={[styles.prevCloseBadge, { top: prevCloseY - 10 }]}>
                  <Text style={styles.prevCloseText}>
                    {"Prev close: $" + formatCurrency(livePrevClose.toFixed(2))}
                  </Text>
                </View>
              ) : null}
            </View>
          )}
        </Card>

        {/* Scrollable Timeframe Filter Cards matching TradingView Screenshots */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.timeFiltersScroll}
        >
          {TIMEFILTERS.map((tf) => {
            const isSelected = selectedPeriod === tf.key;
            const displayGain = isSelected && timeframeData ? (timeframeData.gainPct >= 0 ? "+" : "") + timeframeData.gainPct.toFixed(2) + "%" : tf.defaultGain;
            const isGainPos = !displayGain.startsWith("-");

            return (
              <TouchableOpacity
                key={tf.key}
                style={[
                  styles.timeFilterCard,
                  isSelected && styles.timeFilterCardActive,
                ]}
                onPress={() => {
                  try {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  } catch {}
                  setSelectedPeriod(tf.key);
                  setTouchIndex(null);
                }}
                activeOpacity={0.75}
              >
                <Text style={[styles.tfCardTitle, isSelected && styles.tfCardTitleActive]}>
                  {tf.label}
                </Text>
                <Text
                  style={[
                    styles.tfCardGain,
                    { color: isGainPos ? "#10B981" : "#EF4444" },
                  ]}
                >
                  {displayGain}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Key Data Points matching TradingView Screenshot */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Key data points</Text>
        </View>

        <Card style={styles.keyDataCard}>
          <View style={styles.keyDataRow}>
            <View style={styles.keyDataCol}>
              <Text style={styles.keyDataLabel}>Volume</Text>
              <Text style={styles.keyDataValue}>{formattedVolume}</Text>
            </View>

            <View style={styles.keyDataCol}>
              <Text style={styles.keyDataLabel}>Previous close</Text>
              <Text style={styles.keyDataValue}>
                {"$" + formatCurrency(livePrevClose.toFixed(2)) + " USDT"}
              </Text>
            </View>
          </View>

          <View style={styles.cardDivider} />

          <View style={styles.keyDataRow}>
            <View style={styles.keyDataCol}>
              <Text style={styles.keyDataLabel}>Open</Text>
              <Text style={styles.keyDataValue}>
                {"$" + formatCurrency(liveOpen.toFixed(2)) + " USDT"}
              </Text>
            </View>

            <View style={styles.keyDataCol}>
              <Text style={styles.keyDataLabel}>Day range</Text>
              <Text style={styles.keyDataValue}>
                {"$" + formatCurrency(liveLow.toFixed(2)) + " — $" + formatCurrency(liveHigh.toFixed(2))}
              </Text>
            </View>
          </View>
        </Card>

        {/* Crypto Info Card matching TradingView Screenshot */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Crypto info</Text>
        </View>

        <Card style={styles.cryptoInfoCard}>
          <Text style={styles.cryptoInfoText}>{cryptoInfo}</Text>
        </Card>
      </ScrollView>

      {/* Sticky Action Bar */}
      <View style={styles.bottomBar}>
        {isTradable ? (
          <>
            <Button
              title="Instant Swap →"
              variant="outline"
              size="lg"
              style={{ flex: 1 }}
              onPress={() => {
                try {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                } catch {}
                router.push("/(tabs)/swap");
              }}
            />
            <Button
              title="Trade on Terminal →"
              variant="primary"
              size="lg"
              style={{ flex: 1.2 }}
              onPress={() => {
                try {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                } catch {}
                router.push("/(tabs)/trade");
              }}
            />
          </>
        ) : (
          <Button
            title="Share on TradingView ↗"
            variant="outline"
            size="lg"
            style={{ flex: 1 }}
            onPress={handleShare}
          />
        )}
      </View>
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
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.08)",
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
    alignItems: "center",
    justifyContent: "center",
  },
  tradingViewBrand: {
    fontSize: 16,
    fontWeight: "900",
    color: COLORS.textPrimary,
    letterSpacing: -0.3,
  },
  container: {
    padding: SPACING.lg,
    paddingBottom: 110,
    gap: SPACING.lg,
  },
  priceHeader: {
    gap: 4,
  },
  assetFullName: {
    fontSize: 18,
    fontWeight: "900",
    color: COLORS.textPrimary,
  },
  sourceTagRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 2,
  },
  sourceTagText: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontWeight: "700",
  },
  liveGreenDot: {
    width: 6,
    height: 6,
    borderRadius: RADIUS.full,
    backgroundColor: "#10B981",
  },
  infoOnlyBadge: {
    backgroundColor: "rgba(100, 116, 139, 0.2)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: "rgba(100, 116, 139, 0.3)",
  },
  infoOnlyBadgeText: {
    fontSize: 9.5,
    fontWeight: "700",
    color: COLORS.textSecondary,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "baseline",
    flexWrap: "wrap",
    gap: 6,
    marginTop: SPACING.xs,
  },
  bigPrice: {
    fontSize: 30,
    fontWeight: "900",
    color: COLORS.textPrimary,
    fontVariant: ["tabular-nums"],
  },
  usdtBadge: {
    fontSize: 12,
    fontWeight: "800",
    color: COLORS.textMuted,
    marginRight: 4,
  },
  changeText: {
    fontSize: 15,
    fontWeight: "800",
    fontVariant: ["tabular-nums"],
  },
  timestampText: {
    fontSize: 12,
    color: COLORS.textMuted,
    fontWeight: "500",
    marginTop: 2,
  },
  chartCard: {
    padding: SPACING.md,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
  },
  chartLoadingBox: {
    height: CHART_HEIGHT,
    alignItems: "center",
    justifyContent: "center",
    gap: SPACING.sm,
  },
  chartLoadingText: {
    color: COLORS.textSecondary,
    fontSize: 12,
  },
  prevCloseBadge: {
    position: "absolute",
    right: 8,
    backgroundColor: "rgba(18, 24, 40, 0.85)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  prevCloseText: {
    fontSize: 9,
    fontWeight: "700",
    color: COLORS.textMuted,
  },
  timeFiltersScroll: {
    gap: SPACING.sm,
  },
  timeFilterCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
    alignItems: "center",
    minWidth: 80,
    gap: 2,
  },
  timeFilterCardActive: {
    borderColor: COLORS.electricBlueBright,
    backgroundColor: COLORS.surfaceElevated,
  },
  tfCardTitle: {
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.textMuted,
  },
  tfCardTitleActive: {
    color: COLORS.textPrimary,
  },
  tfCardGain: {
    fontSize: 11,
    fontWeight: "800",
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
  keyDataCard: {
    padding: SPACING.md,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    gap: SPACING.md,
  },
  keyDataRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  keyDataCol: {
    flex: 1,
    gap: 2,
  },
  keyDataLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.textMuted,
  },
  keyDataValue: {
    fontSize: 13,
    fontWeight: "800",
    color: COLORS.textPrimary,
    fontVariant: ["tabular-nums"],
    marginTop: 2,
  },
  cardDivider: {
    height: 1,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
  },
  cryptoInfoCard: {
    padding: SPACING.lg,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
  },
  cryptoInfoText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(8, 11, 17, 0.96)",
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    paddingBottom: 24,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.08)",
    flexDirection: "row",
    gap: SPACING.md,
  },
});
