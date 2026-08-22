import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { COLORS, RADIUS, SPACING, SHADOWS } from "../../src/constants/theme";
import { MarketListItem } from "../../src/components/trading/MarketListItem";
import { CoinAvatar } from "../../src/components/common/CoinAvatar";
import { Badge } from "../../src/components/common/Badge";
import { Card } from "../../src/components/common/Card";
import { Button } from "../../src/components/common/Button";
import { Skeleton } from "../../src/components/common/Skeleton";
import { ProfileModal } from "../../src/components/common/ProfileModal";
import { NotificationsModal } from "../../src/components/common/NotificationsModal";
import { DepositModal } from "../../src/components/wallet/DepositModal";
import { useMarketStore, MarketCategory } from "../../src/store/marketStore";
import { useAuthStore } from "../../src/store/authStore";
import { useBalanceStore } from "../../src/store/balanceStore";
import { formatCurrency } from "../../src/utils/formatters";
import * as Haptics from "expo-haptics";
import {
  Search,
  X,
  TrendingUp,
  ArrowRightLeft,
  ArrowDownLeft,
  Zap,
  Bell,
  User,
  ShieldCheck,
  Flame,
  Layers,
  Eye,
  EyeOff,
  Sparkles,
} from "lucide-react-native";

const { width } = Dimensions.get("window");

const CATEGORIES: { key: MarketCategory; label: string }[] = [
  { key: "ALL", label: "All Markets" },
  { key: "FAVORITES", label: "Watchlist" },
  { key: "TRADABLE", label: "Tradable" },
];

export default function MarketsScreen() {
  const router = useRouter();

  // Stores
  const {
    markets,
    marketStatsMap,
    globalTickers,
    liveTicks,
    selectedCategory,
    searchQuery,
    isLoading,
    isRefreshing,
    error,
    fetchMarkets,
    refreshMarkets,
    setSelectedCategory,
    setSearchQuery,
    getFilteredMarkets,
    getHotMovers,
  } = useMarketStore();

  const { user, isDemoMode } = useAuthStore();
  const { totalPortfolioUsd, fetchBalances } = useBalanceStore();

  // Modal States
  const [profileModalVisible, setProfileModalVisible] = useState(false);
  const [notifModalVisible, setNotifModalVisible] = useState(false);
  const [depositModalVisible, setDepositModalVisible] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isBalanceHidden, setIsBalanceHidden] = useState(false);

  useEffect(() => {
    fetchMarkets();
    fetchBalances();
  }, []);

  const onRefresh = useCallback(async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
    await Promise.all([refreshMarkets(), fetchBalances()]);
  }, []);

  const filteredMarkets = useMemo(() => getFilteredMarkets(), [
    markets,
    selectedCategory,
    searchQuery,
    liveTicks,
    globalTickers,
  ]);

  const hotMovers = useMemo(() => getHotMovers(), [markets, liveTicks, globalTickers]);

  const handleCategorySelect = (cat: MarketCategory) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
    setSelectedCategory(cat);
  };

  const handleClearSearch = () => {
    setSearchQuery("");
  };

  // Dynamic greeting
  const greetingPrefix = useMemo(() => {
    const hr = new Date().getHours();
    if (hr < 12) return "Good morning";
    if (hr < 18) return "Good afternoon";
    return "Good evening";
  }, []);

  const totalValNum = totalPortfolioUsd || (isDemoMode ? 10000.0 : 0);
  const [wholePart, decimalPart] = totalValNum.toFixed(2).split(".");

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={onRefresh}
              tintColor={COLORS.primary}
              colors={[COLORS.primary]}
            />
          }
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* 1. Clean Top Bar: Time-of-Day Greeting & Live Feed Status */}
          <View style={styles.topBar}>
            <TouchableOpacity
              activeOpacity={0.75}
              style={styles.userProfileBtn}
              onPress={() => setProfileModalVisible(true)}
            >
              <View style={styles.avatarCircle}>
                <User color={COLORS.textPrimary} size={18} />
              </View>
              <View>
                <Text style={styles.greetingText}>
                  {greetingPrefix}, {user?.username ? `@${user.username}` : isDemoMode ? "Demo Trader" : "Lakshay"}
                </Text>
                <View style={styles.liveStatusRow}>
                  <View style={styles.pulsingGreenDot} />
                  <Text style={styles.liveStatusText}>
                    {isDemoMode ? "Simulated Sandbox" : "Live Binance Feed"}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>

            <View style={styles.topRightIcons}>
              <TouchableOpacity
                style={styles.iconCircle}
                activeOpacity={0.7}
                onPress={() => setNotifModalVisible(true)}
              >
                <Bell color={COLORS.textPrimary} size={17} />
                <View style={styles.notifBadgeDot} />
              </TouchableOpacity>
            </View>
          </View>

          {/* 2. Executive Portfolio Balance Card with Split Typography & Eye Toggle */}
          <Card style={styles.balanceCard}>
            <View style={styles.balanceHeader}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                <Text style={styles.balanceLabel}>TOTAL ASSETS (USD)</Text>
                <TouchableOpacity
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  onPress={() => {
                    try {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    } catch {}
                    setIsBalanceHidden(!isBalanceHidden);
                  }}
                  activeOpacity={0.7}
                  style={styles.eyeBtn}
                >
                  {isBalanceHidden ? (
                    <EyeOff color={COLORS.textMuted} size={15} />
                  ) : (
                    <Eye color={COLORS.textSecondary} size={15} />
                  )}
                </TouchableOpacity>

                {isDemoMode ? (
                  <View style={styles.demoBadge}>
                    <Text style={styles.demoBadgeText}>DEMO</Text>
                  </View>
                ) : null}
              </View>
              <View style={styles.pnlPill}>
                <TrendingUp color={COLORS.buyGreen} size={13} />
                <Text style={styles.pnlText}>+$342.80 (+4.12%)</Text>
              </View>
            </View>

            {/* Split Integer + Decimal Typography with Overflow Protection */}
            {isBalanceHidden ? (
              <View style={styles.hiddenBalanceRow}>
                <Text style={styles.hiddenBalanceText}>$ ••••••••</Text>
              </View>
            ) : (
              <View style={styles.balanceAmountRow}>
                <Text style={styles.currencySign}>$</Text>
                <Text
                  style={[
                    styles.balanceWhole,
                    wholePart.length > 9 && { fontSize: 24 },
                    wholePart.length > 13 && { fontSize: 20 },
                  ]}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {formatCurrency(wholePart).replace("$", "")}
                </Text>
                <Text
                  style={[
                    styles.balanceDecimals,
                    wholePart.length > 9 && { fontSize: 16 },
                  ]}
                >
                  .{decimalPart || "00"}
                </Text>
              </View>
            )}

            {/* Quick Action Matrix */}
            <View style={styles.actionsRow}>
              <TouchableOpacity
                style={styles.actionItem}
                activeOpacity={0.75}
                onPress={() => setDepositModalVisible(true)}
              >
                <View style={styles.actionCircle}>
                  <ArrowDownLeft color={COLORS.textPrimary} size={20} />
                </View>
                <Text style={styles.actionLabel}>Deposit</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionItem}
                activeOpacity={0.75}
                onPress={() => router.push("/(tabs)/swap")}
              >
                <View style={styles.actionCircle}>
                  <ArrowRightLeft color={COLORS.electricBlue} size={20} />
                </View>
                <Text style={styles.actionLabel}>Swap</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionItem}
                activeOpacity={0.75}
                onPress={() => router.push("/(tabs)/trade")}
              >
                <View style={[styles.actionCircle, styles.actionCircleTrade]}>
                  <Zap color="#FFFFFF" size={20} />
                </View>
                <Text style={[styles.actionLabel, { color: COLORS.textPrimary, fontWeight: "800" }]}>
                  Trade
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionItem}
                activeOpacity={0.75}
                onPress={() => router.push("/(tabs)/wallet")}
              >
                <View style={styles.actionCircle}>
                  <Layers color={COLORS.textPrimary} size={20} />
                </View>
                <Text style={styles.actionLabel}>Portfolio</Text>
              </TouchableOpacity>
            </View>
          </Card>

          {/* 3. 24h Hot Movers Carousel */}
          <View style={styles.sectionWrap}>
            <View style={styles.sectionHeader}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                <Flame color="#FF7A00" size={18} />
                <Text style={styles.sectionTitle}>24h Hot Movers</Text>
              </View>
              <View style={styles.liveStreamBadge}>
                <View style={styles.pulsingDot} />
                <Text style={styles.liveIndicatorText}>LIVE FEED</Text>
              </View>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.hotMoversScroll}
            >
              {hotMovers.map((m) => {
                const tick = liveTicks[m.symbol] || globalTickers[m.symbol];
                const price = tick?.price || 0;
                const change = tick?.change24h || 0;
                const isPos = change >= 0;
                const cleanSym = m.symbol.replace("/", "_");

                return (
                  <TouchableOpacity
                    key={`mover-${m.id}`}
                    activeOpacity={0.75}
                    onPress={() => {
                      try {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      } catch {}
                      router.push(`/market/${cleanSym}`);
                    }}
                  >
                    <Card style={styles.hotMoverCard}>
                      <View style={styles.hotMoverTop}>
                        <CoinAvatar symbol={m.baseAsset?.symbol || "BTC"} size={26} />
                        <Badge change={`${isPos ? "+" : ""}${change.toFixed(2)}%`} />
                      </View>
                      <Text style={styles.hotMoverSymbol}>{m.baseAsset?.symbol}</Text>
                      <Text style={styles.hotMoverPrice}>
                        ${price > 0 ? (price < 1 ? price.toFixed(4) : price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })) : "---"}
                      </Text>
                    </Card>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          {/* 4. Search Bar */}
          <View style={[styles.searchContainer, isSearchFocused && styles.searchContainerActive]}>
            <Search color={isSearchFocused ? COLORS.primary : COLORS.textMuted} size={18} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search coin, symbol, or network..."
              placeholderTextColor={COLORS.textMuted}
              value={searchQuery}
              onChangeText={setSearchQuery}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
              autoCorrect={false}
              autoCapitalize="none"
              returnKeyType="search"
            />
            {searchQuery ? (
              <TouchableOpacity onPress={handleClearSearch} style={styles.clearSearchBtn}>
                <X color={COLORS.textSecondary} size={16} />
              </TouchableOpacity>
            ) : null}
          </View>

          {/* 5. Compressed 3-Tab Segmented Control (Fixed Width, No Scroll) */}
          <View style={styles.segmentedTabsWrap}>
            {CATEGORIES.map((cat) => {
              const isActive = selectedCategory === cat.key;
              return (
                <TouchableOpacity
                  key={cat.key}
                  style={[styles.segmentTab, isActive && styles.segmentTabActive]}
                  onPress={() => handleCategorySelect(cat.key)}
                  activeOpacity={0.75}
                >
                  <Text style={[styles.segmentTabText, isActive && styles.segmentTabTextActive]}>
                    {cat.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* 6. Market Pairs List */}
          <View style={styles.marketList}>
            {isLoading && markets.length === 0 ? (
              <View style={{ gap: SPACING.md }}>
                <Skeleton height={70} borderRadius={RADIUS.lg} />
                <Skeleton height={70} borderRadius={RADIUS.lg} />
                <Skeleton height={70} borderRadius={RADIUS.lg} />
                <Skeleton height={70} borderRadius={RADIUS.lg} />
              </View>
            ) : error && markets.length === 0 ? (
              <Card style={styles.errorCard}>
                <Text style={styles.errorText}>{error}</Text>
                <Button title="Retry Sync" size="sm" variant="outline" onPress={fetchMarkets} />
              </Card>
            ) : filteredMarkets.length === 0 ? (
              <Card style={styles.emptyCard}>
                <Sparkles color={COLORS.textMuted} size={32} />
                <Text style={styles.emptyTitle}>
                  {selectedCategory === "FAVORITES" ? "No Watchlist Favorites Yet" : "No matching markets found"}
                </Text>
                <Text style={styles.emptySub}>
                  {selectedCategory === "FAVORITES"
                    ? "Tap the star icon next to any coin to pin it to your watchlist."
                    : "Try searching for BTC, ETH, SOL, or DOGE"}
                </Text>
                {searchQuery ? (
                  <Button
                    title="Clear Search"
                    size="sm"
                    variant="outline"
                    onPress={handleClearSearch}
                    style={{ marginTop: SPACING.sm }}
                  />
                ) : null}
              </Card>
            ) : (
              filteredMarkets.map((market) => (
                <MarketListItem
                  key={market.id}
                  market={market}
                  stats={marketStatsMap[market.symbol]}
                  globalTicker={globalTickers[market.symbol]}
                  liveTick={liveTicks[market.symbol]}
                />
              ))
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Modals */}
      <ProfileModal
        visible={profileModalVisible}
        onClose={() => setProfileModalVisible(false)}
      />

      <NotificationsModal
        visible={notifModalVisible}
        onClose={() => setNotifModalVisible(false)}
      />

      <DepositModal
        visible={depositModalVisible}
        onClose={() => setDepositModalVisible(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.sm,
    paddingBottom: 110,
    gap: SPACING.lg,
  },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  userProfileBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm + 2,
  },
  avatarCircle: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.full,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.08)",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  greetingText: {
    fontSize: 15,
    fontWeight: "900",
    color: COLORS.textPrimary,
  },
  liveStatusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginTop: 1,
  },
  pulsingGreenDot: {
    width: 6,
    height: 6,
    borderRadius: RADIUS.full,
    backgroundColor: "#10B981",
  },
  liveStatusText: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontWeight: "600",
  },
  topRightIcons: {
    flexDirection: "row",
    gap: SPACING.sm,
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: RADIUS.full,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.06)",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  notifBadgeDot: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 7,
    height: 7,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.sellRed,
  },
  balanceCard: {
    padding: SPACING.xl,
    backgroundColor: "#FFFFFF",
    borderColor: "rgba(0, 0, 0, 0.06)",
    borderRadius: 24,
    gap: SPACING.md,
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 4,
  },
  eyeBtn: {
    padding: 2,
    marginLeft: 2,
  },
  hiddenBalanceRow: {
    paddingVertical: 4,
  },
  hiddenBalanceText: {
    fontSize: 28,
    fontWeight: "900",
    color: COLORS.textPrimary,
    letterSpacing: 2,
  },
  balanceHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  balanceLabel: {
    fontSize: 11.5,
    fontWeight: "800",
    color: COLORS.textSecondary,
    letterSpacing: 0.5,
  },
  demoBadge: {
    backgroundColor: "rgba(37, 99, 235, 0.1)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: RADIUS.xs,
  },
  demoBadgeText: {
    color: COLORS.electricBlue,
    fontSize: 9.5,
    fontWeight: "800",
  },
  pnlPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(16, 185, 129, 0.12)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.full,
  },
  pnlText: {
    color: COLORS.buyGreen,
    fontSize: 11.5,
    fontWeight: "800",
  },
  balanceAmountRow: {
    flexDirection: "row",
    alignItems: "baseline",
  },
  currencySign: {
    fontSize: 22,
    fontWeight: "700",
    color: COLORS.textSecondary,
    marginRight: 2,
  },
  balanceWhole: {
    fontSize: 34,
    fontWeight: "900",
    color: COLORS.textPrimary,
    letterSpacing: -1,
    fontVariant: ["tabular-nums"],
  },
  balanceDecimals: {
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.textSecondary,
    fontVariant: ["tabular-nums"],
  },
  actionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: SPACING.xs,
  },
  actionItem: {
    alignItems: "center",
    gap: 6,
    flex: 1,
  },
  actionCircle: {
    width: 48,
    height: 48,
    borderRadius: RADIUS.full,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.08)",
    alignItems: "center",
    justifyContent: "center",
  },
  actionCircleTrade: {
    backgroundColor: "#111827",
    borderColor: "#111827",
  },
  actionLabel: {
    fontSize: 11.5,
    fontWeight: "700",
    color: COLORS.textSecondary,
  },
  sectionWrap: {
    gap: SPACING.sm,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sectionTitle: {
    fontSize: 15.5,
    fontWeight: "800",
    color: COLORS.textPrimary,
  },
  liveStreamBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "rgba(16, 185, 129, 0.1)",
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: RADIUS.full,
  },
  pulsingDot: {
    width: 6,
    height: 6,
    borderRadius: RADIUS.full,
    backgroundColor: "#10B981",
  },
  liveIndicatorText: {
    fontSize: 10,
    fontWeight: "800",
    color: COLORS.buyGreen,
  },
  hotMoversScroll: {
    gap: SPACING.sm,
    paddingRight: SPACING.md,
  },
  hotMoverCard: {
    width: 124,
    padding: 12,
    backgroundColor: "#FFFFFF",
    borderColor: "rgba(0, 0, 0, 0.06)",
    borderRadius: 18,
    gap: 6,
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  hotMoverTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  hotMoverSymbol: {
    fontSize: 13,
    fontWeight: "800",
    color: COLORS.textPrimary,
    marginTop: 2,
  },
  hotMoverPrice: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.textSecondary,
    fontVariant: ["tabular-nums"],
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.06)",
    paddingHorizontal: SPACING.md,
    height: 46,
    gap: SPACING.sm,
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
  },
  searchContainerActive: {
    borderColor: "#111827",
  },
  searchInput: {
    flex: 1,
    color: COLORS.textPrimary,
    fontSize: 13,
    fontWeight: "600",
  },
  clearSearchBtn: {
    padding: 4,
  },
  segmentedTabsWrap: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: RADIUS.full,
    padding: 4,
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.06)",
    gap: 4,
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
  },
  segmentTab: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: RADIUS.full,
    alignItems: "center",
    justifyContent: "center",
  },
  segmentTabActive: {
    backgroundColor: "#111827",
  },
  segmentTabText: {
    fontSize: 12.5,
    fontWeight: "700",
    color: COLORS.textMuted,
  },
  segmentTabTextActive: {
    color: "#FFFFFF",
    fontWeight: "800",
  },
  marketList: {
    gap: SPACING.sm + 2,
  },
  errorCard: {
    borderColor: COLORS.sellRed,
    backgroundColor: COLORS.sellRedMuted,
    gap: SPACING.md,
    padding: SPACING.lg,
  },
  errorText: {
    color: COLORS.sellRed,
    fontSize: 13,
    fontWeight: "600",
  },
  emptyCard: {
    padding: SPACING.xxl,
    alignItems: "center",
    gap: SPACING.xs,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: COLORS.textPrimary,
    marginTop: SPACING.xs,
  },
  emptySub: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: "center",
    lineHeight: 18,
  },
});
