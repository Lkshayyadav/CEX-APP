import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { COLORS, RADIUS, SPACING } from "../../constants/theme";
import { Card } from "../common/Card";
import { Button } from "../common/Button";
import { OrderSide, OrderType } from "../../types";
import { useAuthStore } from "../../store/authStore";
import { useOrderStore } from "../../store/orderStore";
import { useBalanceStore } from "../../store/balanceStore";
import { formatCurrency, formatAmount } from "../../utils/formatters";
import * as Haptics from "expo-haptics";
import { CheckCircle2, AlertCircle, Wallet } from "lucide-react-native";

interface OrderEntryFormProps {
  symbol: string;
  defaultPrice?: string;
  onSuccess?: () => void;
}

export const OrderEntryForm: React.FC<OrderEntryFormProps> = ({
  symbol,
  defaultPrice = "50000",
  onSuccess,
}) => {
  const { isAuthenticated, isDemoMode } = useAuthStore();
  const { placeOrder, isSubmitting, error, successMessage, clearFeedback } = useOrderStore();
  const { balances, fetchBalances } = useBalanceStore();

  const [base, quote] = symbol.replace("_", "/").split("/");

  // Form State
  const [side, setSide] = useState<OrderSide>("BUY");
  const [type, setType] = useState<OrderType>("LIMIT");
  const [price, setPrice] = useState(defaultPrice);
  const [quantity, setQuantity] = useState("");

  useEffect(() => {
    if (defaultPrice && !price) {
      setPrice(defaultPrice);
    }
  }, [defaultPrice]);

  useEffect(() => {
    clearFeedback();
  }, [symbol, side, type]);

  // Find user balance for base / quote
  const quoteBalanceObj = balances.find((b) => b.asset?.symbol?.toUpperCase() === (quote || "USDT").toUpperCase());
  const baseBalanceObj = balances.find((b) => b.asset?.symbol?.toUpperCase() === (base || "BTC").toUpperCase());

  const availableQuote = quoteBalanceObj ? parseFloat(quoteBalanceObj.free) : isDemoMode ? 10000.0 : 0;
  const availableBase = baseBalanceObj ? parseFloat(baseBalanceObj.free) : isDemoMode ? 0.5 : 0;
  const relevantBalance = side === "BUY" ? availableQuote : availableBase;
  const balanceSymbol = side === "BUY" ? (quote || "USDT") : (base || "BTC");

  // Calculate estimated total
  const priceNum = parseFloat(price) || parseFloat(defaultPrice) || 0;
  const qtyNum = parseFloat(quantity) || 0;
  const estTotal = type === "MARKET" ? qtyNum * (parseFloat(defaultPrice) || 0) : qtyNum * priceNum;

  const handlePercentage = (pct: number) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}

    if (relevantBalance <= 0) return;

    if (side === "BUY") {
      const budget = (availableQuote * pct) / 100;
      const effectivePrice = type === "MARKET" ? parseFloat(defaultPrice) || 1 : priceNum || 1;
      const calcQty = (budget / effectivePrice).toFixed(4);
      setQuantity(calcQty);
    } else {
      const calcQty = ((availableBase * pct) / 100).toFixed(4);
      setQuantity(calcQty);
    }
  };

  const handleSubmit = async () => {
    clearFeedback();
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {}

    if (!quantity || qtyNum <= 0) {
      return;
    }

    const payload = {
      marketSymbol: symbol,
      side,
      type,
      price: type === "LIMIT" ? price : undefined,
      quantity,
    };

    const ok = await placeOrder(payload);
    if (ok) {
      try {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch {}
      setQuantity("");
      fetchBalances();
      onSuccess?.();
    }
  };

  return (
    <Card style={styles.card}>
      {/* 1. Side Switcher (BUY / SELL) */}
      <View style={styles.sideSwitcher}>
        <TouchableOpacity
          style={[styles.sideBtn, side === "BUY" && styles.buyActive]}
          activeOpacity={0.8}
          onPress={() => setSide("BUY")}
        >
          <Text style={[styles.sideBtnText, side === "BUY" && styles.sideBtnTextActive]}>
            Buy {base}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.sideBtn, side === "SELL" && styles.sellActive]}
          activeOpacity={0.8}
          onPress={() => setSide("SELL")}
        >
          <Text style={[styles.sideBtnText, side === "SELL" && styles.sideBtnTextActive]}>
            Sell {base}
          </Text>
        </TouchableOpacity>
      </View>

      {/* 2. Type Selector (LIMIT / MARKET) & Available Balance */}
      <View style={styles.typeAndBalanceRow}>
        <View style={styles.typeTabs}>
          {(["LIMIT", "MARKET"] as OrderType[]).map((t) => (
            <TouchableOpacity
              key={t}
              style={[styles.typeTab, type === t && styles.typeTabActive]}
              onPress={() => setType(t)}
            >
              <Text style={[styles.typeTabText, type === t && styles.typeTabTextActive]}>
                {t}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.availBalanceRow}>
          <Wallet color={COLORS.textMuted} size={12} />
          <Text style={styles.availBalanceText}>
            Avail: <Text style={{ color: COLORS.textPrimary, fontWeight: "700" }}>{formatAmount(relevantBalance.toString(), 4)} {balanceSymbol}</Text>
          </Text>
        </View>
      </View>

      {/* Feedback Banners */}
      {successMessage ? (
        <View style={styles.successBanner}>
          <CheckCircle2 color={COLORS.buyGreen} size={16} />
          <Text style={styles.successText}>{successMessage}</Text>
        </View>
      ) : null}

      {error ? (
        <View style={styles.errorBanner}>
          <AlertCircle color={COLORS.sellRed} size={16} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}

      {/* 3. Price Input (Only for LIMIT orders) */}
      {type === "LIMIT" ? (
        <View style={styles.inputBlock}>
          <View style={styles.inputHeader}>
            <Text style={styles.inputLabel}>ORDER PRICE</Text>
            <Text style={styles.inputCurrency}>{quote || "USDT"}</Text>
          </View>
          <View style={styles.inputBox}>
            <TextInput
              style={styles.textInput}
              value={price}
              onChangeText={setPrice}
              keyboardType="decimal-pad"
              placeholder="0.00"
              placeholderTextColor={COLORS.textMuted}
            />
          </View>
        </View>
      ) : (
        <View style={styles.marketPriceNoticeBox}>
          <Text style={styles.marketPriceNoticeLabel}>ORDER PRICE</Text>
          <Text style={styles.marketPriceNoticeVal}>Best Market Price (Immediate Fill)</Text>
        </View>
      )}

      {/* 4. Quantity / Amount Input */}
      <View style={styles.inputBlock}>
        <View style={styles.inputHeader}>
          <Text style={styles.inputLabel}>AMOUNT</Text>
          <Text style={styles.inputCurrency}>{base || "BTC"}</Text>
        </View>
        <View style={styles.inputBox}>
          <TextInput
            style={styles.textInput}
            value={quantity}
            onChangeText={setQuantity}
            keyboardType="decimal-pad"
            placeholder="0.0000"
            placeholderTextColor={COLORS.textMuted}
          />
        </View>
      </View>

      {/* 5. Percentage Slider Quick Buttons (25%, 50%, 75%, 100%) */}
      <View style={styles.pctRow}>
        {[25, 50, 75, 100].map((pct) => (
          <TouchableOpacity
            key={pct}
            style={styles.pctBtn}
            activeOpacity={0.7}
            onPress={() => handlePercentage(pct)}
          >
            <Text style={styles.pctText}>{pct}%</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* 6. Estimated Total & Fee Info */}
      <View style={styles.summaryBox}>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Est. Order Value</Text>
          <Text style={styles.summaryVal}>
            ${formatCurrency(estTotal.toFixed(2))} {quote || "USDT"}
          </Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Trading Fee</Text>
          <Text style={styles.summaryFee}>0.10% Taker / 0.0% Maker</Text>
        </View>
      </View>

      {/* 7. Submit Action Button */}
      <Button
        title={
          isAuthenticated || isDemoMode
            ? `Place ${side === "BUY" ? "Buy" : "Sell"} ${type} Order`
            : "Sign In to Place Order"
        }
        variant={side === "BUY" ? "buy" : "sell"}
        size="lg"
        loading={isSubmitting}
        onPress={handleSubmit}
      />
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: SPACING.lg,
    backgroundColor: COLORS.surface,
    borderColor: "rgba(255, 255, 255, 0.08)",
    borderRadius: 20,
    gap: SPACING.md,
  },
  sideSwitcher: {
    flexDirection: "row",
    backgroundColor: COLORS.surfaceElevated,
    borderRadius: RADIUS.md,
    padding: 3,
    gap: 4,
  },
  sideBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: RADIUS.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  buyActive: {
    backgroundColor: "#10B981",
  },
  sellActive: {
    backgroundColor: "#EF4444",
  },
  sideBtnText: {
    fontSize: 13,
    fontWeight: "800",
    color: COLORS.textMuted,
  },
  sideBtnTextActive: {
    color: "#FFFFFF",
  },
  typeAndBalanceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 2,
  },
  typeTabs: {
    flexDirection: "row",
    gap: 8,
  },
  typeTab: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: RADIUS.sm,
  },
  typeTabActive: {
    backgroundColor: COLORS.surfaceElevated,
    borderWidth: 1,
    borderColor: COLORS.electricBlueBright,
  },
  typeTabText: {
    fontSize: 11.5,
    fontWeight: "700",
    color: COLORS.textMuted,
  },
  typeTabTextActive: {
    color: COLORS.textPrimary,
  },
  availBalanceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  availBalanceText: {
    fontSize: 11,
    color: COLORS.textMuted,
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
  inputBlock: {
    gap: 4,
  },
  inputHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  inputLabel: {
    fontSize: 10.5,
    fontWeight: "800",
    color: COLORS.textMuted,
    letterSpacing: 0.5,
  },
  inputCurrency: {
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.textMuted,
  },
  inputBox: {
    backgroundColor: COLORS.surfaceElevated,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
    paddingHorizontal: SPACING.md,
    height: 46,
    justifyContent: "center",
  },
  textInput: {
    color: COLORS.textPrimary,
    fontSize: 16,
    fontWeight: "800",
    fontVariant: ["tabular-nums"],
  },
  marketPriceNoticeBox: {
    backgroundColor: COLORS.surfaceElevated,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.06)",
    gap: 2,
  },
  marketPriceNoticeLabel: {
    fontSize: 10.5,
    fontWeight: "800",
    color: COLORS.textMuted,
    letterSpacing: 0.5,
  },
  marketPriceNoticeVal: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.textSecondary,
  },
  pctRow: {
    flexDirection: "row",
    gap: SPACING.sm,
  },
  pctBtn: {
    flex: 1,
    backgroundColor: COLORS.surfaceElevated,
    borderRadius: RADIUS.sm,
    paddingVertical: 7,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.06)",
  },
  pctText: {
    fontSize: 11.5,
    fontWeight: "700",
    color: COLORS.textSecondary,
  },
  summaryBox: {
    backgroundColor: COLORS.surfaceElevated,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    gap: 4,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.04)",
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  summaryLabel: {
    fontSize: 11.5,
    color: COLORS.textSecondary,
  },
  summaryVal: {
    fontSize: 12,
    fontWeight: "800",
    color: COLORS.textPrimary,
    fontVariant: ["tabular-nums"],
  },
  summaryFee: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontWeight: "600",
  },
});
