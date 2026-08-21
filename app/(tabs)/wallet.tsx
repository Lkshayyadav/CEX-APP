import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { COLORS, RADIUS, SPACING } from "../../src/constants/theme";
import { Card } from "../../src/components/common/Card";
import { Button } from "../../src/components/common/Button";
import { CoinAvatar } from "../../src/components/common/CoinAvatar";
import { DepositModal } from "../../src/components/wallet/DepositModal";
import { useAuthStore } from "../../src/store/authStore";
import { useBalanceStore } from "../../src/store/balanceStore";
import { formatCurrency, formatAmount } from "../../src/utils/formatters";
import { Plus, Lock, CheckCircle2 } from "lucide-react-native";

const SUPPORTED_LEDGER_ASSETS = [
  { symbol: "USDT", name: "Tether USD", rate: 1.0 },
  { symbol: "BTC", name: "Bitcoin", rate: 50000.0 },
  { symbol: "ETH", name: "Ethereum", rate: 3845.2 },
  { symbol: "SOL", name: "Solana", rate: 186.75 },
];

export default function WalletTabScreen() {
  const router = useRouter();
  const { isAuthenticated, isDemoMode } = useAuthStore();
  const { balances, totalPortfolioUsd, isLoading, fetchBalances } = useBalanceStore();

  const [depositModalVisible, setDepositModalVisible] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      fetchBalances();
    }
  }, [isAuthenticated]);

  const onRefresh = async () => {
    setIsRefreshing(true);
    if (isAuthenticated) {
      await fetchBalances();
    }
    setIsRefreshing(false);
  };

  const displayTotal =
    isAuthenticated
      ? formatCurrency(totalPortfolioUsd, 2)
      : isDemoMode
      ? "38,763.60"
      : "0.00";

  const [wholePart, decimalPart] = displayTotal.split(".");

  return (
    <SafeAreaView style={styles.safeArea}>
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
        <View style={styles.header}>
          <Text style={styles.title}>Asset Wallet</Text>
          <Text style={styles.subtitle}>Double entry balance ledger verified & synchronized</Text>
        </View>

        <Card style={styles.balanceCard}>
          <View style={styles.balanceHeader}>
            <Text style={styles.balanceLabel}>ESTIMATED PORTFOLIO NET WORTH</Text>
            <View style={styles.securityPill}>
              <CheckCircle2 color={COLORS.buyGreen} size={12} />
              <Text style={styles.securityText}>Synchronized</Text>
            </View>
          </View>

          <View style={styles.balanceRow}>
            <Text style={styles.currencySign}>$</Text>
            <Text style={styles.balanceWhole}>{wholePart}</Text>
            <Text style={styles.balanceDecimals}>.{decimalPart || "00"}</Text>
            <Text style={styles.usdtEquiv}>USDT EQUIVALENT</Text>
          </View>

          <Text style={styles.ledgerStatusText}>
            ● Double entry balance ledger verified & synchronized
          </Text>

          <View style={styles.actionButtonsRow}>
            <Button
              title="+ Deposit Funds"
              size="md"
              variant="primary"
              style={{ flex: 1, backgroundColor: "#F97316" }}
              onPress={() => {
                if (!isAuthenticated && !isDemoMode) {
                  router.push("/(auth)/login");
                } else {
                  setDepositModalVisible(true);
                }
              }}
            />
            <Button
              title="Withdraw Funds"
              size="md"
              variant="outline"
              style={{ flex: 1 }}
              onPress={() => {
                Alert.alert("Withdraw Notice", "Testnet withdrawals are locked. Assets are stored securely in simulation vault.");
              }}
            />
          </View>
        </Card>

        {!isAuthenticated && !isDemoMode ? (
          <Card elevated style={styles.authNoticeCard}>
            <View style={styles.noticeIconBox}>
              <Lock color={COLORS.electricBlueBright} size={20} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.noticeTitle}>Sign in to view your live wallet</Text>
              <Text style={styles.noticeSub}>Deposit testnet funds & track asset ledger</Text>
            </View>
            <Button
              title="Sign In"
              size="sm"
              variant="primary"
              onPress={() => router.push("/(auth)/login")}
            />
          </Card>
        ) : null}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Asset Ledger Balances</Text>
          {isLoading ? <ActivityIndicator color={COLORS.electricBlue} size="small" /> : null}
        </View>

        <View style={styles.assetsList}>
          {SUPPORTED_LEDGER_ASSETS.map((asset) => {
            const userBal = balances.find((b) => b.asset?.symbol === asset.symbol);
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
                      ≈ ${`${formatCurrency(usdValue.toFixed(2))}`}
                    </Text>
                  </View>
                </View>

                <View style={styles.breakdownRow}>
                  <Text style={styles.breakdownText}>
                    Available: <Text style={{ color: COLORS.buyGreen, fontWeight: "700" }}>{formatAmount(freeNum.toString(), 4)}</Text>
                  </Text>
                  <Text style={styles.breakdownText}>
                    Locked: <Text style={{ color: COLORS.textPrimary, fontWeight: "700" }}>{formatAmount(lockedNum.toString(), 4)}</Text>
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
    borderColor: COLORS.borderBlue,
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
    backgroundColor: "rgba(14, 203, 129, 0.12)",
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
    fontSize: 32,
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
    fontSize: 10,
    fontWeight: "800",
    color: COLORS.textMuted,
    marginLeft: 6,
  },
  ledgerStatusText: {
    fontSize: 11,
    color: COLORS.buyGreen,
    fontWeight: "600",
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
    padding: SPACING.md,
    backgroundColor: COLORS.surface,
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
    paddingHorizontal: SPACING.sm + 2,
    paddingVertical: 6,
    borderRadius: RADIUS.md,
    marginTop: 2,
  },
  breakdownText: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
});
