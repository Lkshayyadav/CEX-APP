import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from "react-native";
import { COLORS, RADIUS, SPACING } from "../../constants/theme";
import { Card } from "../common/Card";
import { Order } from "../../types";
import { formatCurrency, formatAmount, formatTime } from "../../utils/formatters";
import { useOrderStore } from "../../store/orderStore";
import { X, CheckCircle2, Clock, Ban } from "lucide-react-native";

interface OrderCardProps {
  order: Order;
}

export const OrderCard: React.FC<OrderCardProps> = ({ order }) => {
  const cancelOrder = useOrderStore((state) => state.cancelOrder);
  const [cancelling, setCancelling] = useState(false);

  const isBuy = order.side === "BUY";
  const isOpen = order.status === "OPEN" || order.status === "PARTIALLY_FILLED";
  const isFilled = order.status === "FILLED";
  const isCancelled = order.status === "CANCELLED";

  const totalQty = parseFloat(order.quantity) || 1;
  const filledQty = parseFloat(order.filledQuantity) || 0;
  const fillPct = Math.min((filledQty / totalQty) * 100, 100);

  const handleCancel = async () => {
    setCancelling(true);
    await cancelOrder(order.id);
    setCancelling(false);
  };

  const getStatusColor = () => {
    if (isOpen) return COLORS.electricBlueBright;
    if (isFilled) return COLORS.neonGreen;
    if (isCancelled) return COLORS.textMuted;
    return COLORS.sellRed;
  };

  return (
    <Card style={styles.card}>
      {/* Top Header */}
      <View style={styles.headerRow}>
        <View style={styles.sidePairGroup}>
          <View
            style={[
              styles.sideBadge,
              { backgroundColor: isBuy ? COLORS.buyGreenMuted : COLORS.sellRedMuted },
            ]}
          >
            <Text
              style={[
                styles.sideText,
                { color: isBuy ? COLORS.buyGreen : COLORS.sellRed },
              ]}
            >
              {order.side}
            </Text>
          </View>
          <Text style={styles.pairText}>{order.market?.symbol || "BTC/USDT"}</Text>
          <Text style={styles.typeText}>{order.type}</Text>
        </View>

        {/* Status Tag */}
        <View style={[styles.statusPill, { borderColor: getStatusColor() + "40" }]}>
          <Text style={[styles.statusText, { color: getStatusColor() }]}>
            {order.status}
          </Text>
        </View>
      </View>

      {/* Metrics Row */}
      <View style={styles.metricsGrid}>
        <View style={styles.metricItem}>
          <Text style={styles.metricKey}>Price</Text>
          <Text style={styles.metricVal}>
            {order.price ? `$${formatCurrency(order.price)}` : "Market"}
          </Text>
        </View>

        <View style={styles.metricItem}>
          <Text style={styles.metricKey}>Amount</Text>
          <Text style={styles.metricVal}>{formatAmount(order.quantity, 4)}</Text>
        </View>

        <View style={styles.metricItem}>
          <Text style={styles.metricKey}>Filled</Text>
          <Text style={styles.metricVal}>{fillPct.toFixed(1)}%</Text>
        </View>
      </View>

      {/* Fill Progress Bar */}
      {isOpen ? (
        <View style={styles.progressTrack}>
          <View
            style={[
              styles.progressBar,
              {
                width: `${fillPct}%`,
                backgroundColor: isBuy ? COLORS.buyGreen : COLORS.sellRed,
              },
            ]}
          />
        </View>
      ) : null}

      {/* Footer: Date & Cancel Action Button */}
      <View style={styles.footerRow}>
        <Text style={styles.dateText}>
          {new Date(order.createdAt).toLocaleDateString()} {formatTime(order.createdAt)}
        </Text>

        {isOpen ? (
          <TouchableOpacity
            style={styles.cancelBtn}
            onPress={handleCancel}
            disabled={cancelling}
            activeOpacity={0.75}
          >
            {cancelling ? (
              <ActivityIndicator size="small" color={COLORS.sellRed} />
            ) : (
              <>
                <X color={COLORS.sellRed} size={14} />
                <Text style={styles.cancelText}>Cancel Order</Text>
              </>
            )}
          </TouchableOpacity>
        ) : null}
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: SPACING.md + 2,
    backgroundColor: COLORS.surface,
    borderColor: COLORS.border,
    gap: SPACING.sm + 2,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sidePairGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
  },
  sideBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: RADIUS.sm,
  },
  sideText: {
    fontSize: 11,
    fontWeight: "900",
  },
  pairText: {
    fontSize: 15,
    fontWeight: "800",
    color: COLORS.textPrimary,
  },
  typeText: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontWeight: "600",
  },
  statusPill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: RADIUS.full,
    borderWidth: 1,
  },
  statusText: {
    fontSize: 10,
    fontWeight: "800",
  },
  metricsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: COLORS.surfaceElevated,
    padding: SPACING.sm + 2,
    borderRadius: RADIUS.md,
  },
  metricItem: {
    alignItems: "center",
    gap: 2,
  },
  metricKey: {
    fontSize: 10,
    color: COLORS.textMuted,
    fontWeight: "600",
  },
  metricVal: {
    fontSize: 13,
    fontWeight: "800",
    color: COLORS.textPrimary,
    fontVariant: ["tabular-nums"],
  },
  progressTrack: {
    height: 4,
    backgroundColor: COLORS.surfaceElevated,
    borderRadius: RADIUS.full,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    borderRadius: RADIUS.full,
  },
  footerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 2,
  },
  dateText: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontWeight: "500",
  },
  cancelBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.sellRedMuted,
    borderWidth: 1,
    borderColor: "rgba(246, 70, 93, 0.3)",
  },
  cancelText: {
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.sellRed,
  },
});
