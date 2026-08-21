import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
} from "react-native";
import { COLORS, RADIUS, SPACING, SHADOWS } from "../../constants/theme";
import { Button } from "../common/Button";
import { Card } from "../common/Card";
import { OrderSide, OrderType } from "../../types";
import { useOrderStore } from "../../store/orderStore";
import { useAuthStore } from "../../store/authStore";
import { useWebSocketStream } from "../../hooks/useWebSocket";
import { formatCurrency } from "../../utils/formatters";
import { useRouter } from "expo-router";
import { ArrowRight, CheckCircle2, AlertCircle, Zap } from "lucide-react-native";

interface OrderEntryFormProps {
  symbol: string; // e.g. "BTC/USDT"
  defaultPrice?: string;
  onSuccess?: () => void;
}

export const OrderEntryForm: React.FC<OrderEntryFormProps> = ({
  symbol,
  defaultPrice = "50000",
  onSuccess,
}) => {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const { placeOrder, isSubmitting, error, successMessage, clearFeedback } = useOrderStore();

  const [side, setSide] = useState<OrderSide>("BUY");
  const [type, setType] = useState<OrderType>("LIMIT");
  const [price, setPrice] = useState("50000");
  const [quantity, setQuantity] = useState("0.10");

  const [base, quote] = symbol.split("/");
  const cleanSymbol = symbol.replace("/", "_").toUpperCase();

  // Listen to order matches
  useWebSocketStream(`order:${cleanSymbol}`, (event: any) => {
    if (event?.type === "ORDER_MATCHED" && onSuccess) {
      onSuccess();
    }
  });

  const handlePercentage = (pct: number) => {
    const defaultBase = side === "BUY" ? 0.5 : 1.0;
    const computed = (defaultBase * (pct / 100)).toFixed(3);
    setQuantity(computed);
  };

  const handleSubmit = async () => {
    clearFeedback();

    if (!isAuthenticated) {
      router.push("/(auth)/login");
      return;
    }

    const cleanPrice = type === "LIMIT" ? price.trim() : undefined;
    const cleanQty = quantity.trim();

    if (type === "LIMIT" && (!cleanPrice || parseFloat(cleanPrice) <= 0)) {
      Alert.alert("Invalid Price", "Please enter a valid positive price.");
      return;
    }

    if (!cleanQty || parseFloat(cleanQty) <= 0) {
      Alert.alert("Invalid Quantity", "Please enter a valid amount.");
      return;
    }

    const success = await placeOrder({
      marketSymbol: symbol,
      side,
      type,
      price: cleanPrice,
      quantity: cleanQty,
    });

    if (success && onSuccess) {
      onSuccess();
    }
  };

  const estTotal =
    type === "LIMIT" && price && quantity
      ? (parseFloat(price || "0") * parseFloat(quantity || "0")).toFixed(2)
      : null;

  return (
    <Card style={styles.container}>
      {/* Header Bar matching Web: Execute Order (0.0% Maker / 0.1% Taker) */}
      <View style={styles.headerBar}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
          <Zap color={COLORS.electricBlueBright} size={15} />
          <Text style={styles.headerTitle}>Execute Order</Text>
        </View>
        <Text style={styles.feeBadge}>0.0% Maker / 0.1% Taker</Text>
      </View>

      {/* BUY / SELL Switcher Tabs */}
      <View style={styles.sideSwitcher}>
        <TouchableOpacity
          style={[styles.sideBtn, side === "BUY" && styles.buyActive]}
          activeOpacity={0.8}
          onPress={() => {
            setSide("BUY");
            clearFeedback();
          }}
        >
          <Text style={[styles.sideBtnText, side === "BUY" && styles.sideBtnTextActive]}>
            BUY {base}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.sideBtn, side === "SELL" && styles.sellActive]}
          activeOpacity={0.8}
          onPress={() => {
            setSide("SELL");
            clearFeedback();
          }}
        >
          <Text style={[styles.sideBtnText, side === "SELL" && styles.sideBtnTextActive]}>
            SELL {base}
          </Text>
        </TouchableOpacity>
      </View>

      {/* LIMIT / MARKET Order Type Tabs */}
      <View style={styles.typeSwitcher}>
        {(["LIMIT", "MARKET"] as OrderType[]).map((t) => (
          <TouchableOpacity
            key={t}
            style={[styles.typeBtn, type === t && styles.typeBtnActive]}
            onPress={() => setType(t)}
            activeOpacity={0.7}
          >
            <Text style={[styles.typeBtnText, type === t && styles.typeBtnTextActive]}>
              {t}
            </Text>
          </TouchableOpacity>
        ))}
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

      {/* Price Input (for LIMIT orders) */}
      {type === "LIMIT" ? (
        <View style={styles.inputGroup}>
          <View style={styles.inputLabelRow}>
            <Text style={styles.inputLabel}>PRICE</Text>
            <Text style={styles.inputCurrency}>{quote}</Text>
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
      ) : null}

      {/* Amount / Quantity Input */}
      <View style={styles.inputGroup}>
        <View style={styles.inputLabelRow}>
          <Text style={styles.inputLabel}>AMOUNT</Text>
          <Text style={styles.inputCurrency}>{base}</Text>
        </View>
        <View style={styles.inputBox}>
          <TextInput
            style={styles.textInput}
            value={quantity}
            onChangeText={setQuantity}
            keyboardType="decimal-pad"
            placeholder="0.000"
            placeholderTextColor={COLORS.textMuted}
          />
        </View>
      </View>

      {/* Quick Percentage Buttons (25%, 50%, 75%, 100%) */}
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

      {/* Estimated Order Total */}
      {estTotal ? (
        <View style={styles.estValueRow}>
          <Text style={styles.estLabel}>Est. order value</Text>
          <Text style={styles.estVal}>
            ${`${formatCurrency(estTotal)}`} {quote}
          </Text>
        </View>
      ) : null}

      {/* Submit Button */}
      <Button
        title={
          isAuthenticated
            ? `Place ${side} Order →`
            : "Sign In to Place Live Order"
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
  container: {
    padding: SPACING.lg,
    backgroundColor: COLORS.surface,
    gap: SPACING.md,
  },
  headerBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: SPACING.xs,
  },
  headerTitle: {
    fontSize: 14,
    fontWeight: "900",
    color: COLORS.textPrimary,
  },
  feeBadge: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontWeight: "600",
  },
  sideSwitcher: {
    flexDirection: "row",
    backgroundColor: COLORS.surfaceElevated,
    borderRadius: RADIUS.lg,
    padding: 3,
    gap: 4,
  },
  sideBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: RADIUS.md,
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
    color: COLORS.textSecondary,
  },
  sideBtnTextActive: {
    color: "#FFFFFF",
  },
  typeSwitcher: {
    flexDirection: "row",
    gap: SPACING.md,
    paddingBottom: 2,
  },
  typeBtn: {
    paddingBottom: 4,
  },
  typeBtnActive: {
    borderBottomWidth: 2,
    borderBottomColor: COLORS.electricBlueBright,
  },
  typeBtnText: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.textMuted,
  },
  typeBtnTextActive: {
    color: COLORS.textPrimary,
  },
  successBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.xs + 2,
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
    gap: SPACING.xs + 2,
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
  inputGroup: {
    gap: 4,
  },
  inputLabelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  inputLabel: {
    fontSize: 11,
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
    borderColor: COLORS.border,
    paddingHorizontal: SPACING.md,
    height: 44,
    justifyContent: "center",
  },
  textInput: {
    color: COLORS.textPrimary,
    fontSize: 15,
    fontWeight: "700",
    fontVariant: ["tabular-nums"],
  },
  pctRow: {
    flexDirection: "row",
    gap: SPACING.sm,
  },
  pctBtn: {
    flex: 1,
    backgroundColor: COLORS.surfaceElevated,
    borderRadius: RADIUS.sm,
    paddingVertical: 6,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  pctText: {
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.textSecondary,
  },
  estValueRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 2,
  },
  estLabel: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontWeight: "600",
  },
  estVal: {
    fontSize: 12,
    fontWeight: "800",
    color: COLORS.textPrimary,
  },
});
