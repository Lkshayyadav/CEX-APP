import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from "react-native";
import { useRouter } from "expo-router";
import { COLORS, RADIUS, SPACING } from "../../constants/theme";
import { Card } from "../common/Card";
import { CoinAvatar } from "../common/CoinAvatar";
import { TradingViewAreaChart } from "./TradingViewAreaChart";
import { PriceFlashText } from "../common/PriceFlashText";
import { Market, MarketStats } from "../../types";
import { GlobalMarketTicker } from "../../api/globalPrice.api";
import { BinanceTick, useMarketStore } from "../../store/marketStore";
import * as Haptics from "expo-haptics";
import { Star } from "lucide-react-native";

const { width } = Dimensions.get("window");

interface MarketListItemProps {
  market: Market;
  stats?: MarketStats;
  globalTicker?: GlobalMarketTicker;
  liveTick?: BinanceTick;
}

export const MarketListItem: React.FC<MarketListItemProps> = ({
  market,
  stats,
  globalTicker,
  liveTick,
}) => {
  const router = useRouter();
  const cleanParam = market.symbol.replace("/", "_");
  const isFavorite = useMarketStore((state) => state.isFavorite(market.symbol));
  const toggleFavorite = useMarketStore((state) => state.toggleFavorite);

  const livePriceNum =
    liveTick?.price ||
    globalTicker?.price ||
    (stats?.lastPrice ? parseFloat(stats.lastPrice) : 0);

  const changePct =
    liveTick?.change24h !== undefined
      ? liveTick.change24h
      : globalTicker?.change24h !== undefined
      ? globalTicker.change24h
      : 0;

  const isPositive = changePct >= 0;
  const changeFormatted = `${isPositive ? "▲ +" : "▼ "}${Math.abs(changePct).toFixed(2)}%`;

  const baseSym = market.baseAsset?.symbol || "BTC";

  const handlePress = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
    router.push(`/market/${cleanParam}`);
  };

  const handleToggleStar = (e: any) => {
    e.stopPropagation?.();
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {}
    toggleFavorite(market.symbol);
  };

  const cardWidth = width - SPACING.lg * 2;
  const chartWidth = cardWidth - 36;

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={handlePress}
    >
      <Card style={styles.card}>
        {/* Top Row: Coin Icon + Symbol Tag & Percentage Badge */}
        <View style={styles.topRow}>
          <View style={styles.tokenTagRow}>
            <CoinAvatar symbol={baseSym} size={28} />
            <Text style={styles.pairTagText}>{baseSym}/USD</Text>
            <TouchableOpacity
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              onPress={handleToggleStar}
              style={{ marginLeft: 4 }}
            >
              <Star
                size={15}
                color={isFavorite ? "#F59E0B" : "rgba(0, 0, 0, 0.2)"}
                fill={isFavorite ? "#F59E0B" : "transparent"}
              />
            </TouchableOpacity>
          </View>

          <View style={[styles.badgePill, isPositive ? styles.badgePositive : styles.badgeNegative]}>
            <Text style={[styles.badgeText, isPositive ? styles.badgeTextPos : styles.badgeTextNeg]}>
              {changeFormatted}
            </Text>
          </View>
        </View>

        {/* Large Bold High-Contrast Price */}
        <View style={styles.priceRow}>
          {livePriceNum > 0 ? (
            <PriceFlashText
              price={livePriceNum}
              style={styles.priceText}
              decimals={livePriceNum < 1 ? 4 : 2}
            />
          ) : (
            <Text style={styles.priceText}>$---</Text>
          )}
        </View>

        {/* High-Resolution TradingView Area Chart */}
        <View style={styles.chartContainer}>
          <TradingViewAreaChart
            data={globalTicker?.sparkline}
            isPositive={isPositive}
            width={chartWidth}
            height={56}
            prevClose={globalTicker?.prevClose}
            currentPrice={livePriceNum}
          />
        </View>
      </Card>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    paddingVertical: 16,
    paddingHorizontal: 18,
    backgroundColor: "#FFFFFF",
    borderColor: "rgba(0, 0, 0, 0.06)",
    borderRadius: 24,
    gap: 4,
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 14,
    elevation: 3,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  tokenTagRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  pairTagText: {
    fontSize: 14.5,
    fontWeight: "900",
    color: COLORS.textPrimary,
    letterSpacing: -0.2,
  },
  badgePill: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
  },
  badgePositive: {
    backgroundColor: "rgba(16, 185, 129, 0.12)",
  },
  badgeNegative: {
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
  priceRow: {
    marginTop: 1,
  },
  priceText: {
    fontSize: 27,
    fontWeight: "900",
    color: COLORS.textPrimary,
    letterSpacing: -0.8,
    fontVariant: ["tabular-nums"],
  },
  chartContainer: {
    marginTop: 4,
    alignItems: "center",
    justifyContent: "center",
  },
});
