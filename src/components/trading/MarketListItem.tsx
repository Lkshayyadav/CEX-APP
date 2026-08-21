import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { COLORS, RADIUS, SPACING } from "../../constants/theme";
import { Card } from "../common/Card";
import { Badge } from "../common/Badge";
import { CoinAvatar } from "../common/CoinAvatar";
import { Sparkline } from "./Sparkline";
import { PriceFlashText } from "../common/PriceFlashText";
import { Market, MarketStats } from "../../types";
import { GlobalMarketTicker } from "../../api/globalPrice.api";
import { BinanceTick } from "../../store/marketStore";
import * as Haptics from "expo-haptics";

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
  const changeFormatted = `${isPositive ? "+" : ""}${changePct.toFixed(2)}%`;

  const volume = liveTick?.volume24h || globalTicker?.volume24h || 0;
  const volumeFormatted =
    volume > 1000
      ? (volume / 1000).toFixed(1) + "k"
      : volume > 0
      ? volume.toFixed(0)
      : "---";

  const baseSym = market.baseAsset?.symbol || "BTC";
  const coinName = market.baseAsset?.name || "Crypto";

  const handlePress = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
    router.push(`/market/${cleanParam}`);
  };

  return (
    <TouchableOpacity
      activeOpacity={0.72}
      onPress={handlePress}
    >
      <Card style={styles.card}>
        {/* Left Column: Icon + Name */}
        <View style={styles.leftCol}>
          <CoinAvatar symbol={baseSym} size={36} />
          <View style={styles.titleWrapper}>
            <View style={{ flexDirection: "row", alignItems: "baseline", gap: 3 }}>
              <Text style={styles.symbolText}>{baseSym}</Text>
              <Text style={styles.quoteText}>/USDT</Text>
            </View>
            <Text style={styles.nameText} numberOfLines={1} ellipsizeMode="tail">
              {coinName} · {volumeFormatted}
            </Text>
          </View>
        </View>

        {/* Center Column: Sparkline */}
        <View style={styles.centerSparkline}>
          <Sparkline
            data={globalTicker?.sparkline}
            isPositive={isPositive}
            width={58}
            height={24}
          />
        </View>

        {/* Right Column: Price Flash & 24h Badge */}
        <View style={styles.rightCol}>
          {livePriceNum > 0 ? (
            <PriceFlashText
              price={livePriceNum}
              style={styles.priceText}
              decimals={livePriceNum < 1 ? 4 : 2}
            />
          ) : (
            <Text style={styles.priceText}>$---</Text>
          )}
          <Badge change={changeFormatted} />
        </View>
      </Card>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 14,
    backgroundColor: COLORS.surface,
    borderColor: "rgba(255, 255, 255, 0.06)",
    borderRadius: RADIUS.lg,
    overflow: "hidden",
  },
  leftCol: {
    flex: 2,
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
    overflow: "hidden",
  },
  titleWrapper: {
    flex: 1,
    justifyContent: "center",
  },
  symbolText: {
    fontSize: 14.5,
    fontWeight: "900",
    color: COLORS.textPrimary,
    letterSpacing: -0.2,
  },
  quoteText: {
    fontSize: 10.5,
    fontWeight: "700",
    color: COLORS.textMuted,
  },
  nameText: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 1,
  },
  centerSparkline: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 2,
  },
  rightCol: {
    flex: 1.8,
    alignItems: "flex-end",
    justifyContent: "center",
    gap: 4,
  },
  priceText: {
    fontSize: 14.5,
    fontWeight: "900",
    fontVariant: ["tabular-nums"],
  },
});
