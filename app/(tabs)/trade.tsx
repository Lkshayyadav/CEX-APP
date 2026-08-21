import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS, RADIUS, SPACING } from "../../src/constants/theme";
import { Card } from "../../src/components/common/Card";
import { Badge } from "../../src/components/common/Badge";
import { CoinAvatar } from "../../src/components/common/CoinAvatar";
import { ConnectionStatusBadge } from "../../src/components/common/ConnectionStatusBadge";
import { CandlestickChartView } from "../../src/components/trading/CandlestickChartView";
import { OrderBookView } from "../../src/components/trading/OrderBookView";
import { OrderEntryForm } from "../../src/components/trading/OrderEntryForm";
import { RecentTradesView } from "../../src/components/trading/RecentTradesView";
import { OrderCard } from "../../src/components/trading/OrderCard";
import { useMarketStore } from "../../src/store/marketStore";
import { useOrderStore } from "../../src/store/orderStore";
import { useAuthStore } from "../../src/store/authStore";
import { useWebSocketStream } from "../../src/hooks/useWebSocket";
import { formatCurrency } from "../../src/utils/formatters";
import {
  ChevronDown,
  BarChart2,
  BookOpen,
  Clock,
  Check,
  X,
  FileText,
  Activity,
  Zap,
} from "lucide-react-native";

// ONLY THE 3 REAL MARKETS FROM WEB (No fake INR)
const AVAILABLE_PAIRS = [
  { symbol: "BTC/USDT", name: "Bitcoin", base: "BTC", quote: "USDT" },
  { symbol: "ETH/USDT", name: "Ethereum", base: "ETH", quote: "USDT" },
  { symbol: "SOL/USDT", name: "Solana", base: "SOL", quote: "USDT" },
];

export default function TradeTabScreen() {
  const [selectedPair, setSelectedPair] = useState(AVAILABLE_PAIRS[0]);
  const [panelMode, setPanelMode] = useState<"CHART" | "ORDERBOOK" | "TRADES">("CHART");
  const [pairModalVisible, setPairModalVisible] = useState(false);
  const [livePrice, setLivePrice] = useState<string>("$---");
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const { marketStatsMap, fetchStatsForMarket } = useMarketStore();
  const { orders, fetchOrders } = useOrderStore();
  const { isAuthenticated } = useAuthStore();

  const cleanSymbol = selectedPair.symbol.replace("/", "_").toUpperCase();
  const currentStats = marketStatsMap[selectedPair.symbol];

  const handleRefresh = () => {
    setRefreshTrigger((prev) => prev + 1);
    if (isAuthenticated) fetchOrders();
  };

  useEffect(() => {
    fetchStatsForMarket(selectedPair.symbol);
    if (isAuthenticated) {
      fetchOrders();
    }
  }, [selectedPair.symbol, isAuthenticated]);

  useWebSocketStream(`trade:${cleanSymbol}`, (payload: any) => {
    if (payload?.trades && payload.trades.length > 0) {
      const latest = payload.trades[0];
      if (latest?.price) {
        setLivePrice(`$${formatCurrency(latest.price)}`);
      }
    }
  });

  const openOrders = orders.filter(
    (o) =>
      (o.market?.symbol === selectedPair.symbol || !o.market) &&
      (o.status === "OPEN" || o.status === "PARTIALLY_FILLED" || o.status === "PENDING")
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* Top Header & Pair Dropdown */}
        <View style={styles.headerRow}>
          <TouchableOpacity
            style={styles.pairDropdown}
            activeOpacity={0.75}
            onPress={() => setPairModalVisible(true)}
          >
            <CoinAvatar symbol={selectedPair.base} size={36} />
            <View>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                <Text style={styles.pairTitle}>{selectedPair.symbol}</Text>
                <ChevronDown color={COLORS.textSecondary} size={16} />
              </View>
              <Text style={styles.pairSub}>{selectedPair.name}</Text>
            </View>
          </TouchableOpacity>

          <View style={{ alignItems: "flex-end", gap: 4 }}>
            <ConnectionStatusBadge />
            <Badge change={currentStats?.change || "+0.00%"} />
          </View>
        </View>

        {/* 24h Ticker Statistics Bar matching Web Screenshot #1 */}
        <Card style={styles.statsBar}>
          <View style={styles.statCol}>
            <Text style={styles.statLabel}>24H CHANGE</Text>
            <Text
              style={[
                styles.statVal,
                {
                  color: (currentStats?.change || "+").startsWith("+")
                    ? COLORS.buyGreen
                    : COLORS.sellRed,
                },
              ]}
            >
              {currentStats?.change || "+0.00%"}
            </Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statCol}>
            <Text style={styles.statLabel}>24H HIGH</Text>
            <Text style={styles.statVal}>
              {currentStats?.high ? `$${formatCurrency(currentStats.high)}` : "$---"}
            </Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statCol}>
            <Text style={styles.statLabel}>24H LOW</Text>
            <Text style={styles.statVal}>
              {currentStats?.low ? `$${formatCurrency(currentStats.low)}` : "$---"}
            </Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statCol}>
            <Text style={styles.statLabel}>24H VOL ({selectedPair.base})</Text>
            <Text style={styles.statVal}>
              {currentStats?.volume ? parseFloat(currentStats.volume).toFixed(1) : "---"}
            </Text>
          </View>
        </Card>

        {/* Latency Tag */}
        <View style={styles.latencyRow}>
          <Zap color={COLORS.buyGreen} size={13} />
          <Text style={styles.latencyText}>Matching Latency: &lt; 0.4ms</Text>
        </View>

        {/* View Switcher: Candles Chart vs Live Order Book vs Recent Trades */}
        <View style={styles.viewModeSwitcher}>
          <TouchableOpacity
            style={[styles.viewModeBtn, panelMode === "CHART" && styles.viewModeBtnActive]}
            onPress={() => setPanelMode("CHART")}
            activeOpacity={0.75}
          >
            <BarChart2 color={panelMode === "CHART" ? "#FFFFFF" : COLORS.textMuted} size={15} />
            <Text style={[styles.viewModeText, panelMode === "CHART" && styles.viewModeTextActive]}>
              TradingView Chart
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.viewModeBtn, panelMode === "ORDERBOOK" && styles.viewModeBtnActive]}
            onPress={() => setPanelMode("ORDERBOOK")}
            activeOpacity={0.75}
          >
            <BookOpen color={panelMode === "ORDERBOOK" ? "#FFFFFF" : COLORS.textMuted} size={15} />
            <Text style={[styles.viewModeText, panelMode === "ORDERBOOK" && styles.viewModeTextActive]}>
              Live Order Book
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.viewModeBtn, panelMode === "TRADES" && styles.viewModeBtnActive]}
            onPress={() => setPanelMode("TRADES")}
            activeOpacity={0.75}
          >
            <Clock color={panelMode === "TRADES" ? "#FFFFFF" : COLORS.textMuted} size={15} />
            <Text style={[styles.viewModeText, panelMode === "TRADES" && styles.viewModeTextActive]}>
              Recent Trades
            </Text>
          </TouchableOpacity>
        </View>

        {/* Active Panel (Chart / OrderBook / Trades) */}
        <Card style={styles.panelCard}>
          {panelMode === "CHART" ? (
            <CandlestickChartView symbol={selectedPair.symbol} />
          ) : panelMode === "ORDERBOOK" ? (
            <OrderBookView
              symbol={selectedPair.symbol}
              currentPrice={livePrice}
              refreshTrigger={refreshTrigger}
            />
          ) : (
            <RecentTradesView symbol={selectedPair.symbol} refreshTrigger={refreshTrigger} />
          )}
        </Card>

        {/* Live Order Placement Ticket (Submits to POST /orders) */}
        <OrderEntryForm
          symbol={selectedPair.symbol}
          defaultPrice={currentStats?.lastPrice || "50000"}
          onSuccess={handleRefresh}
        />

        {/* Live Open Orders Section */}
        <View style={styles.openOrdersHeader}>
          <Text style={styles.openOrdersTitle}>
            Open Orders ({openOrders.length})
          </Text>
        </View>

        {openOrders.length === 0 ? (
          <Card style={styles.emptyOrdersCard}>
            <FileText color={COLORS.textMuted} size={24} />
            <Text style={styles.emptyOrdersText}>No active open orders for {selectedPair.symbol}</Text>
          </Card>
        ) : (
          openOrders.map((o) => <OrderCard key={o.id} order={o} />)
        )}
      </ScrollView>

      {/* Pair Selection Modal */}
      <Modal visible={pairModalVisible} transparent animationType="slide" onRequestClose={() => setPairModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Trading Market</Text>
              <TouchableOpacity style={styles.closeBtn} onPress={() => setPairModalVisible(false)}>
                <X color={COLORS.textSecondary} size={20} />
              </TouchableOpacity>
            </View>

            <View style={styles.pairList}>
              {AVAILABLE_PAIRS.map((pair) => (
                <TouchableOpacity
                  key={pair.symbol}
                  style={[
                    styles.pairRow,
                    selectedPair.symbol === pair.symbol && styles.pairRowActive,
                  ]}
                  onPress={() => {
                    setSelectedPair(pair);
                    setPairModalVisible(false);
                  }}
                >
                  <CoinAvatar symbol={pair.base} size={36} />
                  <View style={{ flex: 1, marginLeft: SPACING.md }}>
                    <Text style={styles.pairRowTitle}>{pair.symbol}</Text>
                    <Text style={styles.pairRowSub}>{pair.name}</Text>
                  </View>
                  {selectedPair.symbol === pair.symbol ? (
                    <Check color={COLORS.buyGreen} size={20} />
                  ) : null}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    padding: SPACING.lg,
    paddingBottom: 110,
    gap: SPACING.lg,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: SPACING.xs,
  },
  pairDropdown: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.md,
  },
  pairTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: COLORS.textPrimary,
  },
  pairSub: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  statsBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: SPACING.md,
    backgroundColor: COLORS.surface,
  },
  statCol: {
    alignItems: "center",
  },
  statLabel: {
    fontSize: 9.5,
    color: COLORS.textMuted,
    fontWeight: "800",
    letterSpacing: 0.3,
  },
  statVal: {
    fontSize: 12,
    fontWeight: "800",
    color: COLORS.textPrimary,
    marginTop: 2,
    fontVariant: ["tabular-nums"],
  },
  statDivider: {
    width: 1,
    backgroundColor: COLORS.border,
  },
  latencyRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginTop: -8,
  },
  latencyText: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontWeight: "600",
  },
  viewModeSwitcher: {
    flexDirection: "row",
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.full,
    padding: 4,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
    gap: 4,
  },
  viewModeBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    paddingHorizontal: 6,
    borderRadius: RADIUS.full,
    gap: 5,
  },
  viewModeBtnActive: {
    backgroundColor: COLORS.surfaceHighlight,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.14)",
  },
  viewModeText: {
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.textMuted,
  },
  viewModeTextActive: {
    color: COLORS.textPrimary,
  },
  panelCard: {
    padding: SPACING.md,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  openOrdersHeader: {
    marginTop: SPACING.xs,
  },
  openOrdersTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: COLORS.textPrimary,
  },
  emptyOrdersCard: {
    padding: SPACING.xl,
    alignItems: "center",
    gap: SPACING.xs,
    backgroundColor: COLORS.surface,
  },
  emptyOrdersText: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.75)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    backgroundColor: "#111728",
    borderTopLeftRadius: RADIUS.xxl,
    borderTopRightRadius: RADIUS.xxl,
    borderWidth: 1,
    borderColor: COLORS.borderBlue,
    padding: SPACING.xl,
    paddingBottom: 40,
    gap: SPACING.md,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: COLORS.textPrimary,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.surfaceElevated,
    alignItems: "center",
    justifyContent: "center",
  },
  pairList: {
    gap: SPACING.sm,
  },
  pairRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.surfaceElevated,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  pairRowActive: {
    borderColor: COLORS.electricBlueBright,
    backgroundColor: "rgba(59, 130, 246, 0.12)",
  },
  pairRowTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: COLORS.textPrimary,
  },
  pairRowSub: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
});
