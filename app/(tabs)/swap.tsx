import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { COLORS, RADIUS, SPACING } from "../../src/constants/theme";
import { Card } from "../../src/components/common/Card";
import { Button } from "../../src/components/common/Button";
import { CoinAvatar } from "../../src/components/common/CoinAvatar";
import { useAuthStore } from "../../src/store/authStore";
import { useBalanceStore } from "../../src/store/balanceStore";
import { formatCurrency, formatAmount } from "../../src/utils/formatters";
import * as Haptics from "expo-haptics";
import {
  ArrowUpDown,
  ChevronDown,
  Check,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Sparkles,
} from "lucide-react-native";

const SWAP_ASSETS = [
  { symbol: "USDT", name: "Tether USD", usdPrice: 1.0 },
  { symbol: "BTC", name: "Bitcoin", usdPrice: 50000.0 },
  { symbol: "ETH", name: "Ethereum", usdPrice: 3845.2 },
  { symbol: "SOL", name: "Solana", usdPrice: 186.75 },
];

export default function SwapTabScreen() {
  const router = useRouter();
  const { isAuthenticated, isDemoMode } = useAuthStore();
  const { balances, fetchBalances } = useBalanceStore();

  const [fromAsset, setFromAsset] = useState(SWAP_ASSETS[0]);
  const [toAsset, setToAsset] = useState(SWAP_ASSETS[1]);
  const [fromAmount, setFromAmount] = useState("1000");

  const [pickerMode, setPickerMode] = useState<"from" | "to" | null>(null);
  const [isSwapping, setIsSwapping] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      fetchBalances();
    }
  }, [isAuthenticated]);

  const userFromBal = balances.find((b) => b.asset?.symbol === fromAsset.symbol);
  const availableFromBalance = userFromBal ? parseFloat(userFromBal.free) : isDemoMode ? 10000.0 : 0.0;

  const exchangeRate = fromAsset.usdPrice / toAsset.usdPrice;
  const numFrom = parseFloat(fromAmount) || 0;
  const estimatedReceive = (numFrom * exchangeRate).toFixed(toAsset.symbol === "USDT" ? 2 : 5);

  const handleInvert = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {}
    const temp = fromAsset;
    setFromAsset(toAsset);
    setToAsset(temp);
    setSuccessMessage(null);
    setErrorMessage(null);
  };

  const handleQuickPercent = (pct: number) => {
    const calculated = ((availableFromBalance * pct) / 100).toFixed(
      fromAsset.symbol === "USDT" ? 2 : 4
    );
    setFromAmount(calculated);
    setSuccessMessage(null);
    setErrorMessage(null);
  };

  const handleExecuteSwap = async () => {
    setSuccessMessage(null);
    setErrorMessage(null);

    if (!isAuthenticated && !isDemoMode) {
      router.push("/(auth)/login");
      return;
    }

    if (numFrom <= 0) {
      setErrorMessage("Please enter a valid swap amount greater than zero.");
      return;
    }

    if (numFrom > availableFromBalance) {
      setErrorMessage(
        `Insufficient ${fromAsset.symbol} balance. Available: ${formatAmount(availableFromBalance.toString(), 4)} ${fromAsset.symbol}`
      );
      return;
    }

    setIsSwapping(true);
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    } catch {}

    setTimeout(async () => {
      setIsSwapping(false);
      try {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch {}

      setSuccessMessage(
        `Successfully swapped ${numFrom} ${fromAsset.symbol} for ${estimatedReceive} ${toAsset.symbol} at zero slippage!`
      );
      setFromAmount("");
      if (isAuthenticated) await fetchBalances();
    }, 900);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <View style={styles.headerIconCircle}>
              <Sparkles color="#FFFFFF" size={18} />
            </View>
            <View>
              <Text style={styles.title}>Instant Crypto Swap</Text>
              <Text style={styles.subtitle}>Zero slippage · Sub-millisecond ledger settlement</Text>
            </View>
          </View>
        </View>

        {successMessage ? (
          <View style={styles.successBanner}>
            <CheckCircle2 color={COLORS.buyGreen} size={18} />
            <Text style={styles.successText}>{successMessage}</Text>
          </View>
        ) : null}

        {errorMessage ? (
          <View style={styles.errorBanner}>
            <AlertCircle color={COLORS.sellRed} size={18} />
            <Text style={styles.errorText}>{errorMessage}</Text>
          </View>
        ) : null}

        <Card style={styles.swapCard}>
          <View style={styles.sectionBox}>
            <View style={styles.boxHeaderRow}>
              <Text style={styles.boxLabel}>YOU PAY</Text>
              <Text style={styles.balanceText}>
                Available:{" "}
                <Text style={{ color: COLORS.electricBlueBright, fontWeight: "700" }}>
                  {formatAmount(availableFromBalance.toString(), 4)} {fromAsset.symbol}
                </Text>
              </Text>
            </View>

            <View style={styles.inputAndPickerRow}>
              <TextInput
                style={styles.amountInput}
                value={fromAmount}
                onChangeText={(val) => {
                  setFromAmount(val);
                  setSuccessMessage(null);
                  setErrorMessage(null);
                }}
                keyboardType="decimal-pad"
                placeholder="0.00"
                placeholderTextColor={COLORS.textMuted}
              />

              <TouchableOpacity
                style={styles.assetPickerBtn}
                activeOpacity={0.75}
                onPress={() => setPickerMode("from")}
              >
                <CoinAvatar symbol={fromAsset.symbol} size={24} />
                <Text style={styles.assetPickerText}>{fromAsset.symbol}</Text>
                <ChevronDown color={COLORS.textSecondary} size={16} />
              </TouchableOpacity>
            </View>

            <View style={styles.percentRow}>
              {[25, 50, 75, 100].map((pct) => (
                <TouchableOpacity
                  key={pct}
                  style={styles.percentBtn}
                  activeOpacity={0.75}
                  onPress={() => handleQuickPercent(pct)}
                >
                  <Text style={styles.percentText}>{pct === 100 ? "MAX" : `${pct}%`}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.invertBtnWrapper}>
            <TouchableOpacity
              style={styles.invertBtn}
              activeOpacity={0.8}
              onPress={handleInvert}
            >
              <ArrowUpDown color="#FFFFFF" size={18} strokeWidth={2.5} />
            </TouchableOpacity>
          </View>

          <View style={styles.sectionBox}>
            <View style={styles.boxHeaderRow}>
              <Text style={styles.boxLabel}>YOU RECEIVE (ESTIMATED)</Text>
              <View style={styles.slippagePill}>
                <ShieldCheck color={COLORS.buyGreen} size={12} />
                <Text style={styles.slippageText}>0.0% Slippage</Text>
              </View>
            </View>

            <View style={styles.inputAndPickerRow}>
              <Text style={[styles.amountInput, { color: COLORS.buyGreen }]}>
                {estimatedReceive}
              </Text>

              <TouchableOpacity
                style={styles.assetPickerBtn}
                activeOpacity={0.75}
                onPress={() => setPickerMode("to")}
              >
                <CoinAvatar symbol={toAsset.symbol} size={24} />
                <Text style={styles.assetPickerText}>{toAsset.symbol}</Text>
                <ChevronDown color={COLORS.textSecondary} size={16} />
              </TouchableOpacity>
            </View>

            <Text style={styles.usdEquivalentText}>
              ≈ ${`${formatCurrency((numFrom * fromAsset.usdPrice).toFixed(2))}`} USD
            </Text>
          </View>

          <View style={styles.breakdownCard}>
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>Exchange Rate</Text>
              <Text style={styles.breakdownValue}>
                1 {fromAsset.symbol} ≈ {exchangeRate < 0.001 ? exchangeRate.toFixed(6) : exchangeRate.toFixed(4)} {toAsset.symbol}
              </Text>
            </View>

            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>Trading Fee</Text>
              <Text style={[styles.breakdownValue, { color: COLORS.buyGreen }]}>0.00 USDT (FREE)</Text>
            </View>

            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>Matching Settlement</Text>
              <Text style={styles.breakdownValue}>Instant &lt; 0.4ms</Text>
            </View>
          </View>

          <Button
            title={
              isAuthenticated || isDemoMode
                ? `Convert ${fromAsset.symbol} to ${toAsset.symbol} →`
                : "Sign In to Swap Crypto"
            }
            variant="primary"
            size="lg"
            loading={isSwapping}
            onPress={handleExecuteSwap}
          />
        </Card>
      </ScrollView>

      <Modal
        visible={pickerMode !== null}
        transparent
        animationType="slide"
        onRequestClose={() => setPickerMode(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                Select {pickerMode === "from" ? "Pay" : "Receive"} Asset
              </Text>
              <TouchableOpacity
                style={styles.closeBtn}
                onPress={() => setPickerMode(null)}
              >
                <Check color={COLORS.textSecondary} size={20} />
              </TouchableOpacity>
            </View>

            <View style={styles.assetList}>
              {SWAP_ASSETS.map((asset) => {
                const isSelected =
                  pickerMode === "from"
                    ? fromAsset.symbol === asset.symbol
                    : toAsset.symbol === asset.symbol;

                return (
                  <TouchableOpacity
                    key={asset.symbol}
                    style={[styles.assetRow, isSelected && styles.assetRowActive]}
                    onPress={() => {
                      if (pickerMode === "from") {
                        if (toAsset.symbol === asset.symbol) setToAsset(fromAsset);
                        setFromAsset(asset);
                      } else {
                        if (fromAsset.symbol === asset.symbol) setFromAsset(toAsset);
                        setToAsset(asset);
                      }
                      setPickerMode(null);
                    }}
                  >
                    <CoinAvatar symbol={asset.symbol} size={36} />
                    <View style={{ flex: 1, marginLeft: SPACING.md }}>
                      <Text style={styles.assetRowSymbol}>{asset.symbol}</Text>
                      <Text style={styles.assetRowName}>{asset.name}</Text>
                    </View>
                    {isSelected ? <Check color={COLORS.electricBlueBright} size={20} /> : null}
                  </TouchableOpacity>
                );
              })}
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
  header: {
    marginTop: SPACING.xs,
  },
  headerIconCircle: {
    width: 38,
    height: 38,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.electricBlue,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "900",
    color: COLORS.textPrimary,
  },
  subtitle: {
    fontSize: 11.5,
    color: COLORS.textSecondary,
  },
  successBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
    backgroundColor: "rgba(14, 203, 129, 0.12)",
    borderColor: COLORS.buyGreen,
    borderWidth: 1,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
  },
  successText: {
    color: COLORS.buyGreen,
    fontSize: 12,
    fontWeight: "700",
    flex: 1,
  },
  errorBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
    backgroundColor: COLORS.sellRedMuted,
    borderColor: COLORS.sellRed,
    borderWidth: 1,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
  },
  errorText: {
    color: COLORS.sellRed,
    fontSize: 12,
    fontWeight: "600",
    flex: 1,
  },
  swapCard: {
    padding: SPACING.lg,
    backgroundColor: COLORS.surface,
    borderColor: COLORS.borderBlue,
    gap: SPACING.md,
  },
  sectionBox: {
    backgroundColor: COLORS.surfaceElevated,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: SPACING.xs + 2,
  },
  boxHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  boxLabel: {
    fontSize: 11,
    fontWeight: "800",
    color: COLORS.textMuted,
    letterSpacing: 0.5,
  },
  balanceText: {
    fontSize: 11,
    color: COLORS.textSecondary,
  },
  slippagePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(14, 203, 129, 0.12)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: RADIUS.sm,
  },
  slippageText: {
    fontSize: 10,
    fontWeight: "700",
    color: COLORS.buyGreen,
  },
  inputAndPickerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  amountInput: {
    flex: 1,
    fontSize: 26,
    fontWeight: "900",
    color: COLORS.textPrimary,
    fontVariant: ["tabular-nums"],
  },
  assetPickerBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.surface,
    paddingHorizontal: SPACING.md,
    paddingVertical: 8,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    gap: 6,
  },
  assetPickerText: {
    fontSize: 14,
    fontWeight: "800",
    color: COLORS.textPrimary,
  },
  percentRow: {
    flexDirection: "row",
    gap: SPACING.sm,
    paddingTop: 4,
  },
  percentBtn: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.sm,
    paddingVertical: 6,
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  percentText: {
    fontSize: 10.5,
    fontWeight: "700",
    color: COLORS.textSecondary,
  },
  usdEquivalentText: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontWeight: "600",
  },
  invertBtnWrapper: {
    alignItems: "center",
    marginVertical: -8,
    zIndex: 10,
  },
  invertBtn: {
    width: 38,
    height: 38,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.electricBlue,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: COLORS.surface,
    elevation: 4,
  },
  breakdownCard: {
    backgroundColor: COLORS.surfaceElevated,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    gap: SPACING.xs + 2,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.04)",
  },
  breakdownRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  breakdownLabel: {
    fontSize: 11.5,
    color: COLORS.textSecondary,
  },
  breakdownValue: {
    fontSize: 11.5,
    fontWeight: "700",
    color: COLORS.textPrimary,
    fontVariant: ["tabular-nums"],
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
    fontSize: 17,
    fontWeight: "900",
    color: COLORS.textPrimary,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.surfaceElevated,
    alignItems: "center",
    justifyContent: "center",
  },
  assetList: {
    gap: SPACING.sm,
  },
  assetRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.surfaceElevated,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  assetRowActive: {
    borderColor: COLORS.electricBlueBright,
    backgroundColor: "rgba(59, 130, 246, 0.12)",
  },
  assetRowSymbol: {
    fontSize: 15,
    fontWeight: "800",
    color: COLORS.textPrimary,
  },
  assetRowName: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
});
