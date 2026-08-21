import React, { useEffect, useState, useMemo } from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import { COLORS, RADIUS, SPACING } from "../../constants/theme";
import { marketApi } from "../../api/market.api";
import { useWebSocketStream } from "../../hooks/useWebSocket";
import { formatCurrency, formatAmount } from "../../utils/formatters";

interface OrderBookLevel {
  price: string;
  size: string;
  total: number;
}

interface OrderBookViewProps {
  symbol: string; // e.g. "BTC/USDT"
  currentPrice?: string;
  refreshTrigger?: number;
}

export const OrderBookView: React.FC<OrderBookViewProps> = ({
  symbol,
  currentPrice,
  refreshTrigger,
}) => {
  const [bids, setBids] = useState<[string, string][]>([]);
  const [asks, setAsks] = useState<[string, string][]>([]);
  const [loading, setLoading] = useState(true);

  const cleanSymbol = symbol.replace("/", "_").toUpperCase();
  const [base, quote] = symbol.replace("_", "/").split("/");

  const fetchSnapshot = async () => {
    try {
      const data = await marketApi.getMarketDepth(symbol);
      if (data) {
        setBids(data.bids || []);
        setAsks(data.asks || []);
      }
    } catch (err) {
      console.warn("[OrderBook] Failed to fetch depth:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSnapshot();
    const timer = setInterval(fetchSnapshot, 3000);
    return () => clearInterval(timer);
  }, [symbol, refreshTrigger]);

  useWebSocketStream(`depth:${cleanSymbol}`, () => {
    fetchSnapshot();
  });

  const { formattedAsks, formattedBids, maxTotal, spread } = useMemo(() => {
    let askAccum = 0;
    const askList: OrderBookLevel[] = (asks || []).slice(0, 7).map((item) => {
      const sizeNum = parseFloat(item[1]) || 0;
      askAccum += sizeNum;
      return { price: item[0], size: item[1], total: askAccum };
    });

    let bidAccum = 0;
    const bidList: OrderBookLevel[] = (bids || []).slice(0, 7).map((item) => {
      const sizeNum = parseFloat(item[1]) || 0;
      bidAccum += sizeNum;
      return { price: item[0], size: item[1], total: bidAccum };
    });

    const max = Math.max(askAccum, bidAccum, 1);

    let spreadVal = "0.00";
    if (askList.length > 0 && bidList.length > 0) {
      const lowestAsk = parseFloat(askList[0].price);
      const highestBid = parseFloat(bidList[0].price);
      spreadVal = Math.abs(lowestAsk - highestBid).toFixed(2);
    }

    return {
      formattedAsks: askList.reverse(),
      formattedBids: bidList,
      maxTotal: max,
      spread: spreadVal,
    };
  }, [bids, asks]);

  if (loading && bids.length === 0 && asks.length === 0) {
    return (
      <View style={styles.loadingBox}>
        <ActivityIndicator color={COLORS.electricBlue} size="small" />
        <Text style={styles.loadingText}>Syncing Order Book Feed...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Table Column Headers matching Web */}
      <View style={styles.tableHeader}>
        <Text style={styles.headerCell}>Price ({quote || "USDT"})</Text>
        <Text style={[styles.headerCell, { textAlign: "right" }]}>Size ({base || "BTC"})</Text>
        <Text style={[styles.headerCell, { textAlign: "right" }]}>Total ({base || "BTC"})</Text>
      </View>

      {/* Asks (Sell Orders - Red) */}
      <View style={styles.bookSection}>
        {formattedAsks.length === 0 ? (
          <Text style={styles.emptyRowText}>No sell orders open</Text>
        ) : (
          formattedAsks.map((ask, idx) => {
            const depthWidth = Math.min((ask.total / maxTotal) * 100, 100);
            return (
              <View key={`ask-${idx}`} style={styles.rowWrapper}>
                <View
                  style={[
                    styles.depthBar,
                    { width: `${depthWidth}%`, backgroundColor: COLORS.sellRedMuted },
                  ]}
                />
                <View style={styles.rowContent}>
                  <Text style={[styles.cell, { color: COLORS.sellRed }]}>
                    {parseFloat(ask.price).toFixed(2)}
                  </Text>
                  <Text style={[styles.cell, styles.alignRight]}>
                    {parseFloat(ask.size).toFixed(4)}
                  </Text>
                  <Text style={[styles.cellMuted, styles.alignRight]}>
                    {ask.total.toFixed(4)}
                  </Text>
                </View>
              </View>
            );
          })
        )}
      </View>

      {/* Mid Market Spread Bar matching Web */}
      <View style={styles.spreadBar}>
        <View style={styles.spreadPriceRow}>
          <Text style={styles.spreadPrice}>{currentPrice || "$---"}</Text>
          <Text style={styles.marketPriceTag}>MARKET PRICE</Text>
        </View>
        <Text style={styles.spreadText}>
          Spread: <Text style={{ color: COLORS.electricBlueBright }}>${`${spread}`}</Text>
        </Text>
      </View>

      {/* Bids (Buy Orders - Green) */}
      <View style={styles.bookSection}>
        {formattedBids.length === 0 ? (
          <Text style={styles.emptyRowText}>No buy orders open</Text>
        ) : (
          formattedBids.map((bid, idx) => {
            const depthWidth = Math.min((bid.total / maxTotal) * 100, 100);
            return (
              <View key={`bid-${idx}`} style={styles.rowWrapper}>
                <View
                  style={[
                    styles.depthBar,
                    { width: `${depthWidth}%`, backgroundColor: COLORS.buyGreenMuted },
                  ]}
                />
                <View style={styles.rowContent}>
                  <Text style={[styles.cell, { color: COLORS.buyGreen }]}>
                    {parseFloat(bid.price).toFixed(2)}
                  </Text>
                  <Text style={[styles.cell, styles.alignRight]}>
                    {parseFloat(bid.size).toFixed(4)}
                  </Text>
                  <Text style={[styles.cellMuted, styles.alignRight]}>
                    {bid.total.toFixed(4)}
                  </Text>
                </View>
              </View>
            );
          })
        )}
      </View>
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
    letterSpacing: 0.3,
  },
  bookSection: {
    gap: 2,
  },
  rowWrapper: {
    height: 24,
    justifyContent: "center",
    position: "relative",
  },
  depthBar: {
    position: "absolute",
    right: 0,
    top: 0,
    bottom: 0,
    borderRadius: RADIUS.sm,
  },
  rowContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 2,
  },
  cell: {
    flex: 1,
    fontSize: 12,
    fontWeight: "700",
    fontVariant: ["tabular-nums"],
  },
  cellMuted: {
    flex: 1,
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.textSecondary,
    fontVariant: ["tabular-nums"],
  },
  alignRight: {
    textAlign: "right",
  },
  emptyRowText: {
    color: COLORS.textMuted,
    fontSize: 12,
    textAlign: "center",
    paddingVertical: SPACING.sm,
  },
  spreadBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: COLORS.surfaceElevated,
    borderRadius: RADIUS.md,
    paddingVertical: 8,
    paddingHorizontal: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    marginVertical: SPACING.xs,
  },
  spreadPriceRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: SPACING.sm,
  },
  spreadPrice: {
    fontSize: 15,
    fontWeight: "900",
    color: COLORS.textPrimary,
  },
  marketPriceTag: {
    fontSize: 10,
    fontWeight: "700",
    color: COLORS.textMuted,
  },
  spreadText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: "600",
  },
});
