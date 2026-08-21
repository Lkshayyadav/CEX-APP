import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { COLORS, RADIUS, SPACING, SHADOWS } from "../../constants/theme";
import { Button } from "../common/Button";
import { Card } from "../common/Card";
import { CoinAvatar } from "../common/CoinAvatar";
import { useBalanceStore } from "../../store/balanceStore";
import { X, CheckCircle2, AlertCircle, Plus, Zap } from "lucide-react-native";

interface DepositModalProps {
  visible: boolean;
  onClose: () => void;
}

const DEPOSIT_ASSETS = [
  { symbol: "USDT", name: "Tether USD", defaultAmt: "1000.00" },
  { symbol: "BTC", name: "Bitcoin", defaultAmt: "0.1000" },
  { symbol: "ETH", name: "Ethereum", defaultAmt: "1.0000" },
  { symbol: "SOL", name: "Solana", defaultAmt: "10.0000" },
];

const QUICK_AMOUNTS: Record<string, string[]> = {
  USDT: ["100", "500", "1000", "5000"],
  BTC: ["0.01", "0.05", "0.1", "0.5"],
  ETH: ["0.1", "0.5", "1.0", "5.0"],
  SOL: ["1", "5", "10", "50"],
};

export const DepositModal: React.FC<DepositModalProps> = ({ visible, onClose }) => {
  const { depositFunds, isDepositing, error, depositSuccess, clearDepositStatus } =
    useBalanceStore();

  const [selectedAsset, setSelectedAsset] = useState("USDT");
  const [amount, setAmount] = useState("1000.00");

  const handleDeposit = async () => {
    if (!amount || parseFloat(amount) <= 0) return;
    const success = await depositFunds({
      assetSymbol: selectedAsset,
      amount: amount.trim(),
    });

    if (success) {
      setTimeout(() => {
        clearDepositStatus();
        onClose();
      }, 1500);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: SPACING.sm }}>
                <View style={styles.iconCircle}>
                  <Zap color="#FFFFFF" size={18} />
                </View>
                <View>
                  <Text style={styles.modalTitle}>Deposit Simulator</Text>
                  <Text style={styles.modalSub}>Instant credit of test assets into your ledger</Text>
                </View>
              </View>

              <TouchableOpacity
                style={styles.closeBtn}
                onPress={() => {
                  clearDepositStatus();
                  onClose();
                }}
              >
                <X color={COLORS.textSecondary} size={20} />
              </TouchableOpacity>
            </View>

            {depositSuccess ? (
              <View style={styles.successBox}>
                <CheckCircle2 color={COLORS.buyGreen} size={18} />
                <Text style={styles.successText}>{depositSuccess}</Text>
              </View>
            ) : null}

            {error ? (
              <View style={styles.errorBox}>
                <AlertCircle color={COLORS.sellRed} size={18} />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            <Text style={styles.sectionLabel}>SELECT TARGET ASSET</Text>
            <View style={styles.assetsRow}>
              {DEPOSIT_ASSETS.map((asset) => (
                <TouchableOpacity
                  key={asset.symbol}
                  style={[
                    styles.assetPill,
                    selectedAsset === asset.symbol && styles.assetPillActive,
                  ]}
                  activeOpacity={0.75}
                  onPress={() => {
                    setSelectedAsset(asset.symbol);
                    setAmount(asset.defaultAmt);
                    clearDepositStatus();
                  }}
                >
                  <CoinAvatar symbol={asset.symbol} size={20} />
                  <Text
                    style={[
                      styles.assetText,
                      selectedAsset === asset.symbol && styles.assetTextActive,
                    ]}
                  >
                    {asset.symbol}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.sectionLabel}>CREDIT AMOUNT</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.amountInput}
                value={amount}
                onChangeText={setAmount}
                keyboardType="decimal-pad"
                placeholder="0.00"
                placeholderTextColor={COLORS.textMuted}
              />
              <Text style={styles.currencyBadge}>{selectedAsset}</Text>
            </View>

            <View style={styles.quickAmountsRow}>
              {(QUICK_AMOUNTS[selectedAsset] || []).map((amt) => (
                <TouchableOpacity
                  key={amt}
                  style={[styles.quickAmtBtn, amount === amt && styles.quickAmtBtnActive]}
                  onPress={() => setAmount(amt)}
                >
                  <Text
                    style={[
                      styles.quickAmtText,
                      amount === amt && styles.quickAmtTextActive,
                    ]}
                  >
                    +{amt}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Button
              title={`Submit Simulated Deposit (${amount} ${selectedAsset})`}
              variant="primary"
              size="lg"
              loading={isDepositing}
              style={{ marginTop: SPACING.sm }}
              onPress={handleDeposit}
            />
          </View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
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
    marginBottom: 2,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.full,
    backgroundColor: "#F97316",
    alignItems: "center",
    justifyContent: "center",
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: "900",
    color: COLORS.textPrimary,
  },
  modalSub: {
    fontSize: 11,
    color: COLORS.textSecondary,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.surfaceElevated,
    alignItems: "center",
    justifyContent: "center",
  },
  successBox: {
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
  errorBox: {
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
  sectionLabel: {
    fontSize: 11,
    fontWeight: "800",
    color: COLORS.textMuted,
    letterSpacing: 0.5,
    marginTop: 2,
  },
  assetsRow: {
    flexDirection: "row",
    gap: SPACING.xs + 2,
  },
  assetPill: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: COLORS.surfaceElevated,
    borderRadius: RADIUS.md,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  assetPillActive: {
    backgroundColor: COLORS.electricBlue,
    borderColor: COLORS.electricBlueBright,
  },
  assetText: {
    fontSize: 12,
    fontWeight: "800",
    color: COLORS.textSecondary,
  },
  assetTextActive: {
    color: "#FFFFFF",
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.surfaceElevated,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: SPACING.md,
    height: 48,
  },
  amountInput: {
    flex: 1,
    fontSize: 17,
    fontWeight: "800",
    color: COLORS.textPrimary,
    fontVariant: ["tabular-nums"],
  },
  currencyBadge: {
    fontSize: 12,
    fontWeight: "800",
    color: COLORS.electricBlueBright,
  },
  quickAmountsRow: {
    flexDirection: "row",
    gap: SPACING.sm,
  },
  quickAmtBtn: {
    flex: 1,
    backgroundColor: COLORS.surfaceElevated,
    borderRadius: RADIUS.sm,
    paddingVertical: 7,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  quickAmtBtnActive: {
    borderColor: COLORS.buyGreen,
    backgroundColor: "rgba(14, 203, 129, 0.12)",
  },
  quickAmtText: {
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.textSecondary,
  },
  quickAmtTextActive: {
    color: COLORS.buyGreen,
  },
});
