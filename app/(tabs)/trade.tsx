import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS, RADIUS, SPACING } from "../../src/constants/theme";
import { Card } from "../../src/components/common/Card";
import { CoinAvatar } from "../../src/components/common/CoinAvatar";
import { OrderBookView } from "../../src/components/trading/OrderBookView";
import { RecentTradesView } from "../../src/components/trading/RecentTradesView";
import { CandlestickChartView } from "../../src/components/trading/CandlestickChartView";
import { OrderEntryForm } from "../../src/components/trading/OrderEntryForm";
import { OrderCard } from "../../src/components/trading/OrderCard";
import { AuthRequiredGate } from "../../src/components/common/AuthRequiredGate";
import { useAuthStore } from "../../src/store/authStore";
import { useMarketStore } from "../../src/store/marketStore";
import { useOrderStore } from "../../src/store/orderStore";
import { formatCurrency } from "../../src/utils/formatters";
import * as Haptics from "expo-haptics";
import {
  ChevronDown,
  TrendingUp,
  TrendingDown,
  Check,
  X,
  BookOpen,
  Clock,
  BarChart2,
  FileText,
} from "lucide-react-native";

const AVAILABLE_PAIRS = [
  { symbol: "BTC/USDT", base: "BTC", name: "Bitcoin" },
  { symbol: "ETH/USDT", base: "ETH", name: "Ethereum" },
  { symbol: "SOL/USDT", base: "SOL", name: "Solana" },
];

export default function TradeScreen() {
  const [selectedPair, setSelectedPair] = useState(AVAILABLE_PAIRS[0]);
  const [panelMode, setPanelMode] = useState<"CHART" | "ORDERBOOK" | "TRADES">("CHART");
  const [pairModalVisible, setPairModalVisible] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const { isAuthenticated, isDemoMode } = useAuthStore();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { liveTicks, globalTickers, marketStatsMap, fetchStatsForMarket } = useMarketStore();
  const { orders, fetchOrders } = useOrderStore();

  useEffect(() => {
    fetchStatsForMarket(selectedPair.symbol);
    if (isAuthenticated) {
      fetchOrders();
    }
  }, [selectedPair.symbol, isAuthenticated]);

  const handleRefresh = async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
    setIsRefreshing(true);
    setRefreshTrigger((prev) => prev + 1);
    await fetchStatsForMarket(selectedPair.symbol);
    if (isAuthenticated) {
      await fetchOrders();
    }
    setIsRefreshing(false);
  };

  const currentStats = marketStatsMap[selectedPair.symbol];
  const liveTick = liveTicks[selectedPair.symbol];
  const globalTicker = globalTickers[selectedPair.symbol];

  const livePriceNum =
    liveTick?.price ||
    globalTicker?.price ||
    (currentStats?.lastPrice ? parseFloat(currentStats.lastPrice) : 50000.0);

  const livePrice = `$${formatCurrency(livePriceNum.toFixed(2))}`;

  const changePct =
    liveTick?.change24h !== undefined
      ? liveTick.change24h
      : globalTicker?.change24h !== undefined
      ? globalTicker.change24h
      : 0;

  const isPositive = changePct >= 0;

  const openOrders = orders.filter(
    (o) =>
      (o.status === "OPEN" || o.status === "PARTIALLY_FILLED") &&
      (!o.market?.symbol || o.market?.symbol === selectedPair.symbol)
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={COLORS.primary}
            colors={[COLORS.primary]}
          />
        }
      >
        {/* Header: Market Pair Selector & Current Price */}
        <View style={styles.headerRow}>
          <TouchableOpacity
            style={styles.pairDropdown}
            activeOpacity={0.75}
            onPress={() => setPairModalVisible(true)}
          >
            <CoinAvatar symbol={selectedPair.base} size={32} />
            <View>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                <Text style={styles.pairTitle}>{selectedPair.symbol}</Text>
                <ChevronDown color={COLORS.textSecondary} size={16} />
              </View>
              <Text style={styles.pairSub}>{selectedPair.name}</Text>
            </View>
          </TouchableOpacity>

          <View style={{ alignItems: "flex-end" }}>
            <Text style={styles.livePriceText}>{livePrice}</Text>
            <View style={[styles.badgePill, isPositive ? styles.badgePos : styles.badgeNeg]}>
              <Text style={[styles.badgeText, isPositive ? styles.badgeTextPos : styles.badgeTextNeg]}>
                {isPositive ? "▲ +" : "▼ "}{Math.abs(changePct).toFixed(2)}%
              </Text>
            </View>
          </View>
        </View>

        {/* View Mode Switcher: Chart vs OrderBook vs Trades */}
        <View style={styles.viewModeSwitcher}>
          <TouchableOpacity
            style={[styles.viewModeBtn, panelMode === "CHART" && styles.viewModeBtnActive]}
            onPress={() => setPanelMode("CHART")}
            activeOpacity={0.75}
          >
            <BarChart2 color={panelMode === "CHART" ? "#FFFFFF" : COLORS.textMuted} size={15} />
            <Text style={[styles.viewModeText, panelMode === "CHART" && styles.viewModeTextActive]}>
              Chart
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.viewModeBtn, panelMode === "ORDERBOOK" && styles.viewModeBtnActive]}
            onPress={() => setPanelMode("ORDERBOOK")}
            activeOpacity={0.75}
          >
            <BookOpen color={panelMode === "ORDERBOOK" ? "#FFFFFF" : COLORS.textMuted} size={15} />
            <Text style={[styles.viewModeText, panelMode === "ORDERBOOK" && styles.viewModeTextActive]}>
              Order Book
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

        {/* Chart / OrderBook / Trades Panel */}
        {panelMode === "CHART" ? (
          <CandlestickChartView symbol={selectedPair.symbol} />
        ) : panelMode === "ORDERBOOK" ? (
          <Card style={styles.panelCard}>
            <OrderBookView
              symbol={selectedPair.symbol}
              currentPrice={livePrice}
              refreshTrigger={refreshTrigger}
            />
          </Card>
        ) : (
          <Card style={styles.panelCard}>
            <RecentTradesView symbol={selectedPair.symbol} refreshTrigger={refreshTrigger} />
          </Card>
        )}

        {/* Order Placement Form or Auth Gate */}
        {!isAuthenticated && !isDemoMode ? (
          <AuthRequiredGate
            title="Sign In to Trade Spot"
            description="Sign in or register an account to place limit and market orders on the live matching engine."
          />
        ) : (
          <OrderEntryForm
            symbol={selectedPair.symbol}
            defaultPrice={`${livePriceNum}`}
            onSuccess={handleRefresh}
          />
        )}

        {/* Open Orders Section */}
        <View style={styles.openOrdersHeader}>
          <Text style={styles.openOrdersTitle}>Open Orders ({openOrders.length})</Text>
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
    gap: SPACING.sm + 2,
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
  livePriceText: {
    fontSize: 18,
    fontWeight: "900",
    color: COLORS.textPrimary,
    fontVariant: ["tabular-nums"],
  },
  badgePill: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: RADIUS.full,
    marginTop: 2,
  },
  badgePos: {
    backgroundColor: "rgba(16, 185, 129, 0.12)",
  },
  badgeNeg: {
    backgroundColor: "rgba(239, 68, 68, 0.10)",
  },
  badgeText: {
    fontSize: 10.5,
    fontWeight: "800",
  },
  badgeTextPos: {
    color: COLORS.buyGreen,
  },
  badgeTextNeg: {
    color: COLORS.sellRed,
  },
  viewModeSwitcher: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: RADIUS.full,
    padding: 3,
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.06)",
    gap: 4,
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
  },
  viewModeBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    borderRadius: RADIUS.full,
    gap: 5,
  },
  viewModeBtnActive: {
    backgroundColor: "#111827",
  },
  viewModeText: {
    fontSize: 11.5,
    fontWeight: "700",
    color: COLORS.textMuted,
  },
  viewModeTextActive: {
    color: "#FFFFFF",
    fontWeight: "800",
  },
  panelCard: {
    padding: SPACING.md,
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.06)",
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
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
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
  },
  emptyOrdersText: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.6)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: RADIUS.xxl,
    borderTopRightRadius: RADIUS.xxl,
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.08)",
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
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.06)",
  },
  pairRowActive: {
    borderColor: "#111827",
    backgroundColor: "#F1F5F9",
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
