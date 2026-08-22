import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { COLORS, RADIUS, SPACING } from "../../src/constants/theme";
import { Card } from "../../src/components/common/Card";
import { Button } from "../../src/components/common/Button";
import { CoinAvatar } from "../../src/components/common/CoinAvatar";
import { DepositModal } from "../../src/components/wallet/DepositModal";
import { AuthRequiredGate } from "../../src/components/common/AuthRequiredGate";
import { useAuthStore } from "../../src/store/authStore";
import { useBalanceStore } from "../../src/store/balanceStore";
import { formatCurrency, formatAmount } from "../../src/utils/formatters";
import * as Haptics from "expo-haptics";
import { ShieldCheck,
  Eye,
  EyeOff, Plus, Lock, ArrowDownLeft, ArrowRightLeft } from "lucide-react-native";

const SUPPORTED_LEDGER_ASSETS = [
  { symbol: "BTC", name: "Bitcoin", rate: 65000 },
  { symbol: "ETH", name: "Ethereum", rate: 3500 },
  { symbol: "SOL", name: "Solana", rate: 145 },
  { symbol: "USDT", name: "Tether USD", rate: 1.0 },
];

export default function WalletScreen() {
  const router = useRouter();
  const { isAuthenticated, isDemoMode } = useAuthStore();
  const { balances, totalPortfolioUsd, isLoading, fetchBalances } = useBalanceStore();

  const [depositModalVisible, setDepositModalVisible] = useState(false);
  const [isBalanceHidden, setIsBalanceHidden] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    fetchBalances();
  }, []);

  const onRefresh = async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
    setIsRefreshing(true);
    await fetchBalances();
    setIsRefreshing(false);
  };

  const totalValNum = totalPortfolioUsd || (isDemoMode ? 10000.0 : 0);
  const [wholePart, decimalPart] = totalValNum.toFixed(2).split(".");

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.electricBlue}
            colors={[COLORS.electricBlue]}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Asset Portfolio</Text>
          <Text style={styles.subtitle}>On-chain ledger balances & wallet reserves</Text>
        </View>

        {/* Executive Portfolio Balance Card */}
        <Card style={styles.balanceCard}>
          <View style={styles.balanceHeader}>
            <Text style={styles.balanceLabel}>TOTAL ESTIMATED VALUE</Text>
            <View style={styles.securityPill}>
              <ShieldCheck color={COLORS.buyGreen} size={13} />
              <Text style={styles.securityText}>LEDGER SYNCHRONIZED</Text>
            </View>
          </View>

          <View style={styles.balanceRow}>
            <Text style={styles.currencySign}>$</Text>
            <Text style={styles.balanceWhole}>{wholePart}</Text>
            <Text style={styles.balanceDecimals}>.{decimalPart || "00"}</Text>
            <Text style={styles.usdtEquiv}>USD</Text>
          </View>

          {/* Action Buttons Matrix */}
          <View style={styles.actionButtonsRow}>
            <Button
              title="+ Deposit Funds"
              size="md"
              variant="primary"
              style={{ flex: 1 }}
              onPress={() => {
                if (!isAuthenticated && !isDemoMode) {
                  router.push("/(auth)/login");
                } else {
                  setDepositModalVisible(true);
                }
              }}
            />
            <Button
              title="Instant Swap →"
              size="md"
              variant="outline"
              style={{ flex: 1 }}
              onPress={() => router.push("/(tabs)/swap")}
            />
          </View>
        </Card>

        {!isAuthenticated && !isDemoMode ? (
          <AuthRequiredGate
            title="Sign In to Access Ledger"
            description="Sign in or register an account to view your real cryptocurrency balances, deposit testnet funds, and manage assets."
          />
        ) : null}

        {/* Section Header */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Asset Balances</Text>
          {isLoading ? <ActivityIndicator color={COLORS.electricBlue} size="small" /> : null}
        </View>

        {/* Real Asset Ledger Cards */}
        <View style={styles.assetsList}>
          {SUPPORTED_LEDGER_ASSETS.map((asset) => {
            const userBal = balances.find((b) => b.asset?.symbol?.toUpperCase() === asset.symbol);
            const freeNum = userBal ? parseFloat(userBal.free) : 0;
            const lockedNum = userBal ? parseFloat(userBal.locked) : 0;
            const totalNum = freeNum + lockedNum;
            const usdValue = totalNum * asset.rate;

            return (
              <Card key={asset.symbol} style={styles.assetCard}>
                <View style={styles.assetRow}>
                  <CoinAvatar symbol={asset.symbol} size={38} />
                  <View style={{ flex: 1, marginLeft: SPACING.md }}>
                    <Text style={styles.assetSymbol}>{asset.symbol}</Text>
                    <Text style={styles.assetName}>{asset.name}</Text>
                  </View>

                  <View style={{ alignItems: "flex-end" }}>
                    <Text style={styles.assetTotalAmount}>
                      {formatAmount(totalNum.toString(), 4)} {asset.symbol}
                    </Text>
                    <Text style={styles.assetUsdValue}>
                      ≈ ${formatCurrency(usdValue.toFixed(2))}
                    </Text>
                  </View>
                </View>

                <View style={styles.breakdownRow}>
                  <Text style={styles.breakdownText}>
                    Available: <Text style={{ color: COLORS.buyGreen, fontWeight: "700" }}>{formatAmount(freeNum.toString(), 4)}</Text>
                  </Text>
                  <Text style={styles.breakdownText}>
                    Locked in Orders: <Text style={{ color: COLORS.textPrimary, fontWeight: "700" }}>{formatAmount(lockedNum.toString(), 4)}</Text>
                  </Text>
                </View>
              </Card>
            );
          })}
        </View>
      </ScrollView>

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
    padding: SPACING.lg,
    paddingBottom: 110,
    gap: SPACING.lg,
  },
  header: {
    marginTop: SPACING.xs,
    gap: 2,
  },
  title: {
    fontSize: 22,
    fontWeight: "900",
    color: COLORS.textPrimary,
  },
  subtitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  balanceCard: {
    padding: SPACING.lg,
    backgroundColor: COLORS.surface,
    borderColor: "rgba(255, 255, 255, 0.08)",
    borderRadius: 22,
    gap: SPACING.md,
  },
  balanceHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  balanceLabel: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  securityPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(16, 185, 129, 0.12)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.full,
  },
  securityText: {
    fontSize: 10,
    fontWeight: "700",
    color: COLORS.buyGreen,
  },
  balanceRow: {
    flexDirection: "row",
    alignItems: "baseline",
    flexWrap: "wrap",
  },
  currencySign: {
    fontSize: 22,
    fontWeight: "700",
    color: COLORS.textSecondary,
  },
  balanceWhole: {
    fontSize: 34,
    fontWeight: "900",
    color: COLORS.textPrimary,
    letterSpacing: -0.5,
  },
  balanceDecimals: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.textSecondary,
  },
  usdtEquiv: {
    fontSize: 10.5,
    fontWeight: "800",
    color: COLORS.textMuted,
    marginLeft: 6,
  },
  actionButtonsRow: {
    flexDirection: "row",
    gap: SPACING.md,
    paddingTop: SPACING.xs,
  },
  authNoticeCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.md,
    padding: SPACING.md,
    backgroundColor: COLORS.surfaceElevated,
    borderColor: COLORS.borderBlue,
    borderRadius: 18,
  },
  noticeIconBox: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.md,
    backgroundColor: "rgba(59, 130, 246, 0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  noticeTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: COLORS.textPrimary,
  },
  noticeSub: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 2,
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
  assetsList: {
    gap: SPACING.md,
  },
  assetCard: {
    padding: SPACING.md + 2,
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    borderColor: "rgba(255, 255, 255, 0.08)",
    gap: SPACING.sm,
  },
  assetRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  assetSymbol: {
    fontSize: 15,
    fontWeight: "800",
    color: COLORS.textPrimary,
  },
  assetName: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 1,
  },
  assetTotalAmount: {
    fontSize: 14,
    fontWeight: "800",
    color: COLORS.textPrimary,
    fontVariant: ["tabular-nums"],
  },
  assetUsdValue: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 2,
    fontVariant: ["tabular-nums"],
  },
  breakdownRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: COLORS.surfaceElevated,
    paddingHorizontal: SPACING.sm + 4,
    paddingVertical: 7,
    borderRadius: RADIUS.md,
    marginTop: 2,
  },
  breakdownText: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
});
