import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import { COLORS, RADIUS, SPACING } from "../../constants/theme";
import { marketApi } from "../../api/market.api";
import { useWebSocketStream } from "../../hooks/useWebSocket";
import { Trade } from "../../types";

interface RecentTradesViewProps {
  symbol: string; // e.g. "BTC/USDT"
  refreshTrigger?: number;
}

export const RecentTradesView: React.FC<RecentTradesViewProps> = ({ symbol, refreshTrigger }) => {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);

  const cleanSymbol = symbol.replace("/", "_").toUpperCase();
  const [base, quote] = symbol.split("/");

  const fetchInitialTrades = async () => {
    try {
      const data = await marketApi.getMarketTrades(symbol);
      if (data && Array.isArray(data)) {
        setTrades(data.slice(0, 15));
      }
    } catch (err) {
      console.warn("[RecentTrades] Failed to fetch trades:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInitialTrades();
    const timer = setInterval(fetchInitialTrades, 3000);
    return () => clearInterval(timer);
  }, [symbol, refreshTrigger]);

  useWebSocketStream(`trades:${cleanSymbol}`, () => {
    fetchInitialTrades();
  });

  useWebSocketStream(`trade:${cleanSymbol}`, () => {
    fetchInitialTrades();
  });

  useWebSocketStream(`order:${cleanSymbol}`, (event: any) => {
    if (event?.type === "ORDER_MATCHED") {
      fetchInitialTrades();
    }
  });

  if (loading && trades.length === 0) {
    return (
      <View style={styles.loadingBox}>
        <ActivityIndicator color={COLORS.electricBlue} size="small" />
        <Text style={styles.loadingText}>Loading live trades feed...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Column Headers matching Web Screenshot */}
      <View style={styles.tableHeader}>
        <Text style={styles.headerCell}>Time</Text>
        <Text style={[styles.headerCell, { textAlign: "right" }]}>Price ({quote || "USDT"})</Text>
        <Text style={[styles.headerCell, { textAlign: "right" }]}>Size ({base || "BTC"})</Text>
        <Text style={[styles.headerCell, { textAlign: "right" }]}>Side</Text>
      </View>

      {/* Trades Rows */}
      {trades.length === 0 ? (
        <Text style={styles.emptyText}>No trades executed yet in this market</Text>
      ) : (
        trades.map((trade, idx) => {
          const isBuy = trade.side === "BUY";
          const formattedTime = new Date(trade.timestamp || Date.now()).toLocaleTimeString();
          return (
            <View key={`trade-${trade.tradeId || idx}`} style={styles.tradeRow}>
              <Text style={styles.tradeTime}>{formattedTime}</Text>
              <Text
                style={[
                  styles.tradePrice,
                  { color: isBuy ? COLORS.buyGreen : COLORS.sellRed },
                ]}
              >
                {parseFloat(trade.price).toFixed(2)}
              </Text>
              <Text style={styles.tradeQty}>{parseFloat(trade.quantity).toFixed(4)}</Text>
              <View style={styles.sideBadgeCol}>
                <View
                  style={[
                    styles.sidePill,
                    {
                      backgroundColor: isBuy ? "rgba(14, 203, 129, 0.15)" : "rgba(246, 70, 93, 0.15)",
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.sidePillText,
                      { color: isBuy ? COLORS.buyGreen : COLORS.sellRed },
                    ]}
                  >
                    {trade.side}
                  </Text>
                </View>
              </View>
            </View>
          );
        })
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: SPACING.xs,
  },
  loadingBox: {
    paddingVertical: SPACING.xl,
    alignItems: "center",
    gap: SPACING.sm,
  },
  loadingText: {
    color: COLORS.textSecondary,
    fontSize: 12,
  },
  tableHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingBottom: SPACING.xs,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerCell: {
    flex: 1,
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.textMuted,
    textTransform: "uppercase",
  },
  tradeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.03)",
  },
  tradeTime: {
    flex: 1,
    fontSize: 11,
    fontWeight: "500",
    color: COLORS.textSecondary,
    fontVariant: ["tabular-nums"],
  },
  tradePrice: {
    flex: 1,
    fontSize: 12,
    fontWeight: "800",
    textAlign: "right",
    fontVariant: ["tabular-nums"],
  },
  tradeQty: {
    flex: 1,
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.textPrimary,
    textAlign: "right",
    fontVariant: ["tabular-nums"],
  },
  sideBadgeCol: {
    flex: 1,
    alignItems: "flex-end",
  },
  sidePill: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: RADIUS.sm,
  },
  sidePillText: {
    fontSize: 10,
    fontWeight: "800",
  },
  emptyText: {
    color: COLORS.textMuted,
    fontSize: 12,
    textAlign: "center",
    paddingVertical: SPACING.lg,
  },
});
