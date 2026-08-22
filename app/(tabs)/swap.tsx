import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS, RADIUS, SPACING } from "../../src/constants/theme";
import { Card } from "../../src/components/common/Card";
import { Button } from "../../src/components/common/Button";
import { CoinAvatar } from "../../src/components/common/CoinAvatar";
import { AuthRequiredGate } from "../../src/components/common/AuthRequiredGate";
import { useBalanceStore } from "../../src/store/balanceStore";
import { useAuthStore } from "../../src/store/authStore";
import { formatAmount } from "../../src/utils/formatters";
import * as Haptics from "expo-haptics";
import {
  ArrowDownUp,
  CheckCircle2,
  AlertCircle,
  Percent,
  Check,
  ChevronDown,
} from "lucide-react-native";

const SWAP_ASSETS = [
  { symbol: "USDT", name: "Tether USD", rateUsd: 1.0 },
  { symbol: "BTC", name: "Bitcoin", rateUsd: 97400.0 },
  { symbol: "ETH", name: "Ethereum", rateUsd: 2680.0 },
  { symbol: "SOL", name: "Solana", rateUsd: 198.0 },
];

export default function SwapScreen() {
  const { balances, fetchBalances } = useBalanceStore();
  const { isAuthenticated, isDemoMode } = useAuthStore();

  const [fromAsset, setFromAsset] = useState(SWAP_ASSETS[0]);
  const [toAsset, setToAsset] = useState(SWAP_ASSETS[1]);
  const [fromAmount, setFromAmount] = useState("");
  const [slippage, setSlippage] = useState("0.1");

  const [pickerMode, setPickerMode] = useState<"from" | "to" | null>(null);
  const [isSwapping, setIsSwapping] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchBalances();
  }, []);

  const fromBal = balances.find((b) => b.asset?.symbol?.toUpperCase() === fromAsset.symbol);
  const availFrom = fromBal ? parseFloat(fromBal.free) : 0;

  const exchangeRate = fromAsset.rateUsd / toAsset.rateUsd;
  const numFrom = parseFloat(fromAmount) || 0;
  const toAmountVal = numFrom * exchangeRate;
  const toAmountFormatted = toAmountVal > 0 ? toAmountVal.toFixed(toAsset.symbol === "USDT" ? 2 : 6) : "0.00";

  const handleInvertAssets = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
    const temp = fromAsset;
    setFromAsset(toAsset);
    setToAsset(temp);
  };

  const handleExecuteSwap = async () => {
    if (numFrom <= 0) {
      setErrorMessage("Enter an amount to swap");
      return;
    }
    if (numFrom > availFrom && isAuthenticated) {
      setErrorMessage(`Insufficient ${fromAsset.symbol} balance`);
      return;
    }

    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {}

    setIsSwapping(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    setTimeout(() => {
      setIsSwapping(false);
      setSuccessMessage(
        `Swapped ${fromAmount} ${fromAsset.symbol} for ${toAmountFormatted} ${toAsset.symbol}`
      );
      setFromAmount("");
      fetchBalances();
    }, 1000);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Instant Swap</Text>
          <Text style={styles.subtitle}>Zero-slippage guaranteed asset conversion</Text>
        </View>

        {successMessage ? (
          <View style={styles.successBanner}>
            <CheckCircle2 color={COLORS.buyGreen} size={16} />
            <Text style={styles.successText}>{successMessage}</Text>
          </View>
        ) : null}

        {errorMessage ? (
          <View style={styles.errorBanner}>
            <AlertCircle color={COLORS.sellRed} size={16} />
            <Text style={styles.errorText}>{errorMessage}</Text>
          </View>
        ) : null}

        {/* Main Swap Card or Auth Gate */}
        {!isAuthenticated && !isDemoMode ? (
          <AuthRequiredGate
            title="Sign In to Swap Assets"
            description="Sign in or register an account to execute instant multi-token swaps with zero slippage."
          />
        ) : (
          <Card style={styles.swapCard}>
            {/* You Pay Section */}
            <View style={styles.sectionBox}>
              <View style={styles.boxHeaderRow}>
                <Text style={styles.boxLabel}>YOU PAY</Text>
                <Text style={styles.balanceText}>
                  Avail: {formatAmount(availFrom.toString(), 4)} {fromAsset.symbol}
                </Text>
              </View>

              <View style={styles.inputAndPickerRow}>
                <TextInput
                  style={styles.amountInput}
                  value={fromAmount}
                  onChangeText={setFromAmount}
                  keyboardType="decimal-pad"
                  placeholder="0.00"
                  placeholderTextColor={COLORS.textMuted}
                />

                <TouchableOpacity
                  style={styles.assetPickerBtn}
                  onPress={() => setPickerMode("from")}
                >
                  <CoinAvatar symbol={fromAsset.symbol} size={24} />
                  <Text style={styles.assetPickerText}>{fromAsset.symbol}</Text>
                  <ChevronDown color={COLORS.textSecondary} size={16} />
                </TouchableOpacity>
              </View>

              {/* Quick Fill Chips */}
              <View style={styles.percentRow}>
                {[25, 50, 75, 100].map((pct) => (
                  <TouchableOpacity
                    key={pct}
                    style={styles.percentBtn}
                    onPress={() => {
                      if (availFrom > 0) {
                        setFromAmount(((availFrom * pct) / 100).toFixed(4));
                      }
                    }}
                  >
                    <Text style={styles.percentText}>{pct}%</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Invert Button */}
            <View style={styles.invertBtnWrapper}>
              <TouchableOpacity style={styles.invertBtn} onPress={handleInvertAssets}>
                <ArrowDownUp color="#FFFFFF" size={18} />
              </TouchableOpacity>
            </View>

            {/* You Receive Section */}
            <View style={styles.sectionBox}>
              <View style={styles.boxHeaderRow}>
                <Text style={styles.boxLabel}>YOU RECEIVE</Text>
                <View style={styles.slippagePill}>
                  <Percent color={COLORS.buyGreen} size={10} />
                  <Text style={styles.slippageText}>{slippage}%</Text>
                </View>
              </View>

              <View style={styles.inputAndPickerRow}>
                <Text style={styles.amountInput}>{toAmountFormatted}</Text>

                <TouchableOpacity
                  style={styles.assetPickerBtn}
                  onPress={() => setPickerMode("to")}
                >
                  <CoinAvatar symbol={toAsset.symbol} size={24} />
                  <Text style={styles.assetPickerText}>{toAsset.symbol}</Text>
                  <ChevronDown color={COLORS.textSecondary} size={16} />
                </TouchableOpacity>
              </View>
            </View>

            {/* Rate Breakdown */}
            <View style={styles.breakdownCard}>
              <View style={styles.breakdownRow}>
                <Text style={styles.breakdownLabel}>Exchange Rate</Text>
                <Text style={styles.breakdownValue}>
                  1 {fromAsset.symbol} ≈ {exchangeRate < 1 ? exchangeRate.toFixed(6) : exchangeRate.toFixed(2)} {toAsset.symbol}
                </Text>
              </View>
              <View style={styles.breakdownRow}>
                <Text style={styles.breakdownLabel}>Network Fee</Text>
                <Text style={[styles.breakdownValue, { color: COLORS.buyGreen }]}>$0.00 (Gasless)</Text>
              </View>
            </View>

            {/* Execute Swap Button */}
            <Button
              title={`Swap ${fromAsset.symbol} → ${toAsset.symbol}`}
              size="lg"
              variant="primary"
              loading={isSwapping}
              onPress={handleExecuteSwap}
            />
          </Card>
        )}
      </ScrollView>

      {/* Asset Selection Modal */}
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
                    {isSelected ? <Check color="#111827" size={20} /> : null}
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
  successBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
    backgroundColor: "rgba(16, 185, 129, 0.12)",
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
    backgroundColor: "#FFFFFF",
    borderColor: "rgba(0, 0, 0, 0.06)",
    borderRadius: 24,
    gap: SPACING.md,
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 14,
    elevation: 3,
  },
  sectionBox: {
    backgroundColor: "#F8FAFC",
    borderRadius: 18,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.05)",
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
    fontWeight: "600",
  },
  slippagePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(16, 185, 129, 0.12)",
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
    backgroundColor: "#FFFFFF",
    paddingHorizontal: SPACING.md,
    paddingVertical: 8,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.08)",
    gap: 6,
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
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
    backgroundColor: "#FFFFFF",
    borderRadius: RADIUS.sm,
    paddingVertical: 6,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.06)",
  },
  percentText: {
    fontSize: 10.5,
    fontWeight: "700",
    color: COLORS.textSecondary,
  },
  invertBtnWrapper: {
    alignItems: "center",
    marginVertical: -10,
    zIndex: 10,
  },
  invertBtn: {
    width: 38,
    height: 38,
    borderRadius: RADIUS.full,
    backgroundColor: "#111827",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: "#FFFFFF",
    elevation: 4,
  },
  breakdownCard: {
    backgroundColor: "#F8FAFC",
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    gap: 4,
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.04)",
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
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.06)",
  },
  assetRowActive: {
    borderColor: "#111827",
    backgroundColor: "#F1F5F9",
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
