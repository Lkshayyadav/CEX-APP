import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  RefreshControl,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { COLORS, RADIUS, SPACING, SHADOWS } from "../../src/constants/theme";
import { Card } from "../../src/components/common/Card";
import { Button } from "../../src/components/common/Button";
import { Badge } from "../../src/components/common/Badge";
import { CoinAvatar } from "../../src/components/common/CoinAvatar";
import { Sparkline } from "../../src/components/trading/Sparkline";
import { MarketListItem } from "../../src/components/trading/MarketListItem";
import { PriceFlashText } from "../../src/components/common/PriceFlashText";
import { Skeleton } from "../../src/components/common/Skeleton";
import { ProfileModal } from "../../src/components/common/ProfileModal";
import { NotificationsModal } from "../../src/components/common/NotificationsModal";
import { DepositModal } from "../../src/components/wallet/DepositModal";
import { useAuthStore } from "../../src/store/authStore";
import { useMarketStore, MarketCategory } from "../../src/store/marketStore";
import { useBalanceStore } from "../../src/store/balanceStore";
import { formatCurrency } from "../../src/utils/formatters";
import * as Haptics from "expo-haptics";
import {
  RefreshCw,
  Plus,
  Bell,
  Search,
  X,
  User as UserIcon,
  LogIn,
  ArrowRightLeft,
  Flame,
} from "lucide-react-native";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const FEATURE_CARD_WIDTH = (SCREEN_WIDTH - SPACING.lg * 2 - SPACING.md) / 2;

const CATEGORIES: { id: MarketCategory; label: string }[] = [
  { id: "ALL", label: "All Markets" },
  { id: "TRADABLE", label: "Tradable on CEX" },
];

export default function MarketsScreen() {
  const router = useRouter();
  const scrollRef = useRef<ScrollView>(null);
  const searchInputRef = useRef<TextInput>(null);

  const { user, isAuthenticated, isDemoMode } = useAuthStore();
  const { balances, totalPortfolioUsd, fetchBalances } = useBalanceStore();

  const {
    markets,
    marketStatsMap,
    globalTickers,
    liveTicks,
    searchQuery,
    selectedCategory,
    isLoading,
    isRefreshing,
    error,
    fetchMarkets,
    refreshMarkets,
    setSearchQuery,
    setSelectedCategory,
    getFilteredMarkets,
  } = useMarketStore();

  const [profileModalVisible, setProfileModalVisible] = useState(false);
  const [notifModalVisible, setNotifModalVisible] = useState(false);
  const [depositModalVisible, setDepositModalVisible] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  useEffect(() => {
    fetchMarkets();
    if (isAuthenticated) {
      fetchBalances();
    }
  }, [isAuthenticated]);

  const filteredMarkets = getFilteredMarkets().filter(
    (m) => !m.symbol.includes("INR")
  );

  const displayTotalNumber =
    isAuthenticated
      ? totalPortfolioUsd
      : isDemoMode
      ? 25076.08
      : 0.00;

  const formattedBalance = formatCurrency(displayTotalNumber, 2);
  const [wholePart, decimalPart] = formattedBalance.split(".");

  // Dynamic font size for large balances ($10M+)
  const wholeFontSize = wholePart.length > 12 ? 26 : wholePart.length > 9 ? 30 : 36;

  const btcLive = liveTicks["BTC/USDT"];
  const ethLive = liveTicks["ETH/USDT"];
  const btcTicker = globalTickers["BTC/USDT"];
  const ethTicker = globalTickers["ETH/USDT"];

  const btcPrice = btcLive?.price || btcTicker?.price || 77446.00;
  const btcChange = btcLive?.change24h !== undefined ? btcLive.change24h : btcTicker?.change24h;

  const ethPrice = ethLive?.price || ethTicker?.price || 2439.18;
  const ethChange = ethLive?.change24h !== undefined ? ethLive.change24h : ethTicker?.change24h;

  const triggerHaptic = (style = Haptics.ImpactFeedbackStyle.Light) => {
    try {
      Haptics.impactAsync(style);
    } catch {}
  };

  const handleSearchFocus = () => {
    setIsSearchFocused(true);
    // Smoothly scroll down so the search bar stays clearly visible above the keyboard
    setTimeout(() => {
      scrollRef.current?.scrollTo({ y: 310, animated: true });
    }, 150);
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    Keyboard.dismiss();
    setIsSearchFocused(false);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={styles.container}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={async () => {
                triggerHaptic(Haptics.ImpactFeedbackStyle.Medium);
                await refreshMarkets();
                if (isAuthenticated) await fetchBalances();
              }}
              tintColor={COLORS.electricBlue}
              colors={[COLORS.electricBlue]}
            />
          }
        >
          {/* Top App Bar */}
          <View style={styles.topBar}>
            <TouchableOpacity
              activeOpacity={0.72}
              onPress={() => {
                triggerHaptic();
                setProfileModalVisible(true);
              }}
              style={styles.userProfileBtn}
            >
              <View style={styles.avatarCircle}>
                <UserIcon
                  color={isAuthenticated ? COLORS.buyGreen : isDemoMode ? COLORS.electricBlueBright : COLORS.textMuted}
                  size={20}
                />
              </View>
              <View>
                <Text style={styles.greetingText}>
                  {isAuthenticated && user ? `@${user.username}` : isDemoMode ? "Demo Account" : "Guest Mode"}
                </Text>
                <Text style={styles.profileSubText}>
                  {isAuthenticated ? "Live Account · Tap to view" : isDemoMode ? "Simulated Demo Mode" : "Tap to Sign In"}
                </Text>
              </View>
            </TouchableOpacity>

            <View style={styles.topRightIcons}>
              <TouchableOpacity
                style={styles.iconCircle}
                activeOpacity={0.72}
                onPress={() => {
                  triggerHaptic();
                  setNotifModalVisible(true);
                }}
              >
                <Bell color={COLORS.textPrimary} size={18} />
              </TouchableOpacity>

              {!isAuthenticated && !isDemoMode ? (
                <TouchableOpacity
                  style={[styles.iconCircle, { backgroundColor: COLORS.electricBlue }]}
                  activeOpacity={0.72}
                  onPress={() => {
                    triggerHaptic();
                    router.push("/(auth)/login");
                  }}
                >
                  <LogIn color="#FFFFFF" size={16} />
                </TouchableOpacity>
              ) : null}
            </View>
          </View>

          {/* Luxury Glassmorphism Portfolio Card with Safe Overflow */}
          <Card style={styles.balanceCard}>
            <View style={styles.balanceHeader}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 6, flexShrink: 1 }}>
                <Text style={styles.balanceLabel}>
                  {isAuthenticated ? "Total Net Valuation" : isDemoMode ? "Simulated Demo Balance" : "Wallet Balance"}
                </Text>
                <View style={styles.usdtPill}>
                  <Text style={styles.usdtPillText}>USD</Text>
                </View>
                {isDemoMode ? (
                  <View style={styles.demoBadge}>
                    <Text style={styles.demoBadgeText}>DEMO</Text>
                  </View>
                ) : null}
              </View>
              <Badge change={displayTotalNumber > 0 ? "+0.00%" : "0.00%"} />
            </View>

            <View style={styles.balanceAmountRow}>
              <Text style={styles.currencySign}>$</Text>
              <Text
                style={[styles.balanceWhole, { fontSize: wholeFontSize }]}
                numberOfLines={1}
                adjustsFontSizeToFit
              >
                {wholePart}
              </Text>
              <Text style={styles.balanceDecimals}>.{decimalPart || "00"}</Text>
            </View>

            {/* Action Buttons: Deposit, Swap, Trade */}
            <View style={styles.actionsRow}>
              <TouchableOpacity
                style={styles.actionItem}
                activeOpacity={0.75}
                onPress={() => {
                  triggerHaptic();
                  if (!isAuthenticated && !isDemoMode) router.push("/(auth)/login");
                  else setDepositModalVisible(true);
                }}
              >
                <View style={styles.actionCircle}>
                  <Plus color={COLORS.textPrimary} size={20} />
                </View>
                <Text style={styles.actionLabel}>Deposit</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionItem}
                activeOpacity={0.75}
                onPress={() => {
                  triggerHaptic();
                  router.push("/(tabs)/swap");
                }}
              >
                <View style={styles.actionCircle}>
                  <ArrowRightLeft color={COLORS.electricBlueBright} size={20} />
                </View>
                <Text style={styles.actionLabel}>Swap</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionItem}
                activeOpacity={0.75}
                onPress={() => {
                  triggerHaptic(Haptics.ImpactFeedbackStyle.Medium);
                  router.push("/(tabs)/trade");
                }}
              >
                <View style={[styles.actionCircle, styles.actionCircleTrade, SHADOWS.glowBlue]}>
                  <RefreshCw color="#FFFFFF" size={20} />
                </View>
                <Text
                  style={[styles.actionLabel, { color: COLORS.electricBlueBright, fontWeight: "700" }]}
                >
                  Trade
                </Text>
              </TouchableOpacity>
            </View>
          </Card>

          {/* Featured Markets Header */}
          <View style={styles.sectionHeader}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
              <Flame color="#F97316" size={18} />
              <Text style={styles.sectionTitle}>Featured Highlights</Text>
            </View>
            <View style={styles.liveStreamBadge}>
              <View style={styles.pulsingDot} />
              <Text style={styles.liveIndicatorText}>Live Stream</Text>
            </View>
          </View>

          {/* Real Live Highlight Cards Grid: BTC & ETH */}
          <View style={styles.featureRow}>
            {/* BTC Card */}
            <TouchableOpacity
              style={{ width: FEATURE_CARD_WIDTH }}
              activeOpacity={0.75}
              onPress={() => {
                triggerHaptic();
                router.push("/market/BTC_USDT");
              }}
            >
              <Card style={[styles.miniFeatureCard, { borderColor: "rgba(59, 130, 246, 0.25)" }]}>
                <View style={styles.miniCardTop}>
                  <CoinAvatar symbol="BTC" size={32} />
                  <Badge
                    change={
                      btcChange !== undefined
                        ? `${btcChange >= 0 ? "+" : ""}${btcChange.toFixed(2)}%`
                        : "+0.00%"
                    }
                  />
                </View>
                <PriceFlashText price={btcPrice} style={styles.miniPrice} />
                <Text style={styles.miniSymbol}>BTC / USDT</Text>
                <View style={{ marginTop: SPACING.sm, alignItems: "center" }}>
                  <Sparkline
                    data={btcTicker?.sparkline}
                    isPositive={(btcChange || 0) >= 0}
                    width={FEATURE_CARD_WIDTH - 32}
                    height={36}
                    color={COLORS.electricBlueBright}
                  />
                </View>
              </Card>
            </TouchableOpacity>

            {/* ETH Card */}
            <TouchableOpacity
              style={{ width: FEATURE_CARD_WIDTH }}
              activeOpacity={0.75}
              onPress={() => {
                triggerHaptic();
                router.push("/market/ETH_USDT");
              }}
            >
              <Card style={[styles.miniFeatureCard, { borderColor: "rgba(139, 92, 246, 0.25)" }]}>
                <View style={styles.miniCardTop}>
                  <CoinAvatar symbol="ETH" size={32} />
                  <Badge
                    change={
                      ethChange !== undefined
                        ? `${ethChange >= 0 ? "+" : ""}${ethChange.toFixed(2)}%`
                        : "+0.00%"
                    }
                  />
                </View>
                <PriceFlashText price={ethPrice} style={styles.miniPrice} />
                <Text style={styles.miniSymbol}>ETH / USDT</Text>
                <View style={{ marginTop: SPACING.sm, alignItems: "center" }}>
                  <Sparkline
                    data={ethTicker?.sparkline}
                    isPositive={(ethChange || 0) >= 0}
                    width={FEATURE_CARD_WIDTH - 32}
                    height={36}
                    color={COLORS.radiantPurple}
                  />
                </View>
              </Card>
            </TouchableOpacity>
          </View>

          {/* Search Bar - Fixed Font Padding & Auto-Scroll on Keyboard */}
          <View style={[styles.searchContainer, isSearchFocused && styles.searchContainerActive]}>
            <Search color={isSearchFocused ? COLORS.electricBlueBright : COLORS.textMuted} size={18} />
            <TextInput
              ref={searchInputRef}
              placeholder="Search coin or pair (e.g. BTC, ETH, SOL)..."
              placeholderTextColor={COLORS.textMuted}
              value={searchQuery}
              onChangeText={setSearchQuery}
              onFocus={handleSearchFocus}
              onBlur={() => setIsSearchFocused(false)}
              style={styles.searchInput}
              autoCapitalize="none"
              returnKeyType="search"
              onSubmitEditing={() => Keyboard.dismiss()}
            />
            {searchQuery ? (
              <TouchableOpacity onPress={handleClearSearch} style={styles.clearSearchBtn}>
                <X color={COLORS.textSecondary} size={16} />
              </TouchableOpacity>
            ) : null}
          </View>

          {/* 2 Clear Category Filter Pills */}
          <View style={styles.categoryRow}>
            {CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                style={[
                  styles.categoryPill,
                  selectedCategory === cat.id && styles.categoryPillActive,
                ]}
                onPress={() => {
                  triggerHaptic();
                  setSelectedCategory(cat.id);
                }}
                activeOpacity={0.75}
              >
                <Text
                  style={[
                    styles.categoryText,
                    selectedCategory === cat.id && styles.categoryTextActive,
                  ]}
                >
                  {cat.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Live Markets List */}
          <View style={styles.marketList}>
            {isLoading && markets.length === 0 ? (
              <View style={{ gap: SPACING.md }}>
                <Skeleton height={68} borderRadius={RADIUS.xl} />
                <Skeleton height={68} borderRadius={RADIUS.xl} />
                <Skeleton height={68} borderRadius={RADIUS.xl} />
              </View>
            ) : error && markets.length === 0 ? (
              <Card style={styles.errorCard}>
                <Text style={styles.errorText}>{error}</Text>
                <Button title="Retry Sync" size="sm" variant="outline" onPress={fetchMarkets} />
              </Card>
            ) : filteredMarkets.length === 0 ? (
              <Card style={styles.emptyCard}>
                <Text style={styles.emptyTitle}>No matching markets found</Text>
                <Text style={styles.emptySub}>Try searching for BTC, ETH, SOL, or DOGE</Text>
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
    paddingTop: SPACING.md,
    paddingBottom: 120,
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
    width: 42,
    height: 42,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.surfaceElevated,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  greetingText: {
    fontSize: 15,
    fontWeight: "900",
    color: COLORS.textPrimary,
  },
  profileSubText: {
    fontSize: 11.5,
    color: COLORS.textSecondary,
    marginTop: 1,
  },
  topRightIcons: {
    flexDirection: "row",
    gap: SPACING.sm,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
    alignItems: "center",
    justifyContent: "center",
  },
  balanceCard: {
    padding: SPACING.xl,
    backgroundColor: COLORS.surface,
    borderColor: "rgba(59, 130, 246, 0.22)",
    gap: SPACING.lg,
    overflow: "hidden",
  },
  balanceHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  balanceLabel: {
    fontSize: 12.5,
    fontWeight: "700",
    color: COLORS.textSecondary,
    letterSpacing: 0.2,
  },
  demoBadge: {
    backgroundColor: "rgba(59, 130, 246, 0.18)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: RADIUS.sm,
  },
  demoBadgeText: {
    color: COLORS.electricBlueBright,
    fontSize: 10,
    fontWeight: "800",
  },
  balanceAmountRow: {
    flexDirection: "row",
    alignItems: "baseline",
    flexWrap: "nowrap",
  },
  currencySign: {
    fontSize: 22,
    fontWeight: "700",
    color: COLORS.textSecondary,
    marginRight: 2,
  },
  balanceWhole: {
    fontWeight: "900",
    color: COLORS.textPrimary,
    letterSpacing: -1,
    flexShrink: 1,
  },
  balanceDecimals: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.textSecondary,
  },
  usdtPill: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: RADIUS.xs,
    backgroundColor: "rgba(255, 255, 255, 0.06)",
  },
  usdtPillText: {
    fontSize: 10,
    fontWeight: "800",
    color: COLORS.textMuted,
  },
  actionsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingTop: SPACING.xs,
  },
  actionItem: {
    alignItems: "center",
    gap: SPACING.xs + 2,
  },
  actionCircle: {
    width: 52,
    height: 52,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.surfaceElevated,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
    alignItems: "center",
    justifyContent: "center",
  },
  actionCircleTrade: {
    backgroundColor: COLORS.electricBlue,
    borderColor: COLORS.electricBlueBright,
  },
  actionLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.textSecondary,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "900",
    color: COLORS.textPrimary,
  },
  liveStreamBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "rgba(16, 185, 129, 0.12)",
    paddingHorizontal: 8,
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
    fontSize: 11,
    fontWeight: "800",
    color: COLORS.buyGreen,
  },
  featureRow: {
    flexDirection: "row",
    gap: SPACING.md,
  },
  miniFeatureCard: {
    padding: SPACING.md,
    backgroundColor: COLORS.surface,
  },
  miniCardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.sm,
  },
  miniPrice: {
    fontSize: 16,
    fontWeight: "900",
    color: COLORS.textPrimary,
    fontVariant: ["tabular-nums"],
  },
  miniSymbol: {
    fontSize: 11.5,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
    paddingHorizontal: SPACING.md,
    height: 48,
    gap: SPACING.sm,
  },
  searchContainerActive: {
    borderColor: COLORS.electricBlueBright,
    backgroundColor: COLORS.surfaceElevated,
  },
  searchInput: {
    flex: 1,
    color: COLORS.textPrimary,
    fontSize: 13.5,
    fontWeight: "600",
    paddingVertical: 0,
    textAlignVertical: "center",
    includeFontPadding: false,
  },
  clearSearchBtn: {
    padding: 4,
  },
  categoryRow: {
    flexDirection: "row",
    gap: SPACING.sm,
  },
  categoryPill: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.07)",
    alignItems: "center",
  },
  categoryPillActive: {
    backgroundColor: COLORS.electricBlue,
    borderColor: COLORS.electricBlueBright,
  },
  categoryText: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.textSecondary,
  },
  categoryTextActive: {
    color: "#FFFFFF",
  },
  marketList: {
    gap: SPACING.md,
  },
  errorCard: {
    borderColor: COLORS.sellRed,
    backgroundColor: COLORS.sellRedMuted,
    gap: SPACING.md,
  },
  errorText: {
    color: COLORS.sellRed,
    fontSize: 13,
    fontWeight: "600",
  },
  emptyCard: {
    padding: SPACING.xl,
    alignItems: "center",
    gap: SPACING.xs,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: COLORS.textPrimary,
  },
  emptySub: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
});
